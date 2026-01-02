/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Import the granular agentic functions
import { planResearch, extractSignals, synthesizePatterns } from '@/lib/openai';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

// Server-side Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hardcoded Pro users (same as frontend for consistency)
const PRO_USER_EMAILS = ['ed@eduardoescalante.com', 'ed@acme.com', 'sicruzat1954@gmail.com'];

import { translations } from '@/lib/translations';

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();
    const { query, lang = 'es' } = await req.json();
    const t = (translations as any)[lang] || translations.es;

    // --- SERVER-SIDE USAGE ENFORCEMENT ---
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let userEmail: string | null = null;

    // Try to get user from auth header or cookies
    const supabaseAuthToken = req.cookies.get('sb-access-token')?.value ||
        authHeader?.replace('Bearer ', '');

    if (supabaseAuthToken) {
        const { data: { user } } = await supabase.auth.getUser(supabaseAuthToken);
        if (user) {
            userId = user.id;
            userEmail = user.email || null;
        }
    }

    // Check if user is a Pro user (hardcoded list or DB)
    let isProUser = false;
    if (userEmail && PRO_USER_EMAILS.includes(userEmail)) {
        isProUser = true;
        console.log(`[API] Pro user detected (hardcoded): ${userEmail}`);
    } else if (userId) {
        // Check subscription in database
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan_type, status')
            .eq('user_id', userId)
            .single();

        if (sub?.plan_type === 'pro' && sub?.status === 'active') {
            isProUser = true;
            console.log(`[API] Pro user detected (database): ${userId}`);
        }
    }

    // Enforce limit for free users
    if (!isProUser && userId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usage } = await supabase
            .from('usage_tracking')
            .select('search_count')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        const searchCount = usage?.search_count || 0;
        if (searchCount >= 1) { // Limit is 1 search for free users
            console.log(`[API] ❌ User ${userId} blocked: ${searchCount}/1 searches used`);
            return new Response(
                JSON.stringify({ error: t.upgradeModal.limitReached }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Increment usage for free users BEFORE the search
    if (!isProUser && userId) {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: existing } = await supabase
            .from('usage_tracking')
            .select('search_count')
            .eq('user_id', userId)
            .eq('month_year', currentMonth)
            .single();

        if (existing) {
            await supabase
                .from('usage_tracking')
                .update({ search_count: existing.search_count + 1, updated_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('month_year', currentMonth);
        } else {
            await supabase
                .from('usage_tracking')
                .insert({ user_id: userId, month_year: currentMonth, search_count: 1 });
        }
        console.log(`[API] Usage incremented for user ${userId}`);
    }
    // --- END SERVER-SIDE USAGE ENFORCEMENT ---

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (step: string, status: 'active' | 'completed' = 'active') => {
                const data = JSON.stringify({ type: 'progress', step, status });
                controller.enqueue(encoder.encode(data + '\n'));
            };

            const sendError = (error: string) => {
                const data = JSON.stringify({ type: 'error', error });
                controller.enqueue(encoder.encode(data + '\n'));
                controller.close();
            };

            try {
                console.log(`[API] Received query: "${query}" (lang: ${lang})`);

                const hasPerplexity = !!process.env.PERPLEXITY_API_KEY;

                if (hasPerplexity) {
                    const { perplexitySearch } = await import('@/lib/perplexity');

                    sendUpdate(t.search.initializing, 'completed');
                    const researchLabel = `${t.search.analyzingWeb} "${query}"...`;
                    sendUpdate(researchLabel, 'active');

                    console.log(`[API] Starting Perplexity search for: ${query}`);

                    const heartbeat = setInterval(() => {
                        sendUpdate(researchLabel, 'active');
                    }, 10000);

                    try {
                        const result = await perplexitySearch(query);
                        clearInterval(heartbeat);

                        sendUpdate(researchLabel, 'completed');
                        sendUpdate(t.search.analysisComplete, 'completed');

                        const finalPayload = JSON.stringify({ type: 'result', data: result });
                        controller.enqueue(encoder.encode(finalPayload + '\n'));
                        controller.close();
                        return;
                    } catch (err: any) {
                        clearInterval(heartbeat);
                        throw err;
                    }

                } else {
                    // --------------------------------------------------------------------------
                    // PATH B: MANUAL REDDIT PIPELINE (Fallback)
                    // --------------------------------------------------------------------------

                    // STEP 1: RESEARCH STRATEGY (Agentic Planner)
                    // --------------------------------------------------------------------------
                    sendUpdate(`${t.search.initializing} agentic strategy...`, 'active');
                    const researchPlan = await planResearch(query); // Returns array of queries
                    console.log("[DEBUG] Research Plan Generated:", researchPlan);
                    // sendUpdate(`[DEBUG] Planner output: ${JSON.stringify(researchPlan)}`, 'completed');

                    sendUpdate(`${t.search.analyzingWeb} (reddit)...`, 'active');

                    // execute searches in parallel for the generated queries
                    const searchPromises = researchPlan.map(async (subQuery: string) => {
                        try {
                            console.log(`[DEBUG] Searching Reddit: "${subQuery}"`);
                            const { searchReddit, getRedditComments } = await import('@/lib/reddit');

                            // Ensure we target reddit specifically
                            const redditQuery = subQuery.toLowerCase().includes('reddit') ? subQuery : `${subQuery} reddit`;

                            const redditPosts = await searchReddit(redditQuery, 10);

                            // Fetch comments for the top 3 posts in each sub-query to get deep discussion data
                            const mappedResults = await Promise.all(redditPosts.map(async (p: any, idx: number) => {
                                let content = p.selftext ? `${p.title}\n\n${p.selftext}` : p.title;

                                if (idx < 3 && p.num_comments > 0) {
                                    const comments = await getRedditComments(p.url, 25);
                                    if (comments.length > 0) {
                                        const commentText = comments.map((c: any) => `[Comment by ${c.author}]: ${c.body}`).join("\n");
                                        content += `\n\n--- TOP COMMENTS ---\n${commentText}`;
                                    }
                                }

                                return {
                                    url: p.url,
                                    title: p.title,
                                    content: content,
                                    snippet: p.title
                                };
                            }));

                            return { query: subQuery, results: mappedResults, success: true };
                        } catch (err: any) {
                            console.error(`[DEBUG] Reddit search failed for "${subQuery}":`, err.message);
                            return { query: subQuery, results: [], success: false, error: err.message };
                        }
                    });

                    const searchResults = await Promise.all(searchPromises);

                    let allSearchResults: any[] = [];
                    searchResults.forEach(res => {
                        if (res.results.length > 0) {
                            allSearchResults.push(...res.results);
                        }
                    });

                    console.log(`[DEBUG] Total raw results: ${allSearchResults.length}`);

                    // Deduplicate by URL
                    let uniqueResults = Array.from(new Map(allSearchResults.map(item => [item.url, item])).values());

                    // FALLBACK: Hacker News Search (Last Resort)
                    if (uniqueResults.length === 0) {
                        sendUpdate("Trying backup sources...", 'active');
                        try {
                            const encodedQuery = encodeURIComponent(query);
                            // HN Algolia is public and reliable
                            const hnUrl = `https://hn.algolia.com/api/v1/search?query=${encodedQuery}&tags=story`;

                            const hnRes = await Promise.race([
                                fetch(hnUrl).then(r => r.json()),
                                new Promise((_, reject) => setTimeout(() => reject(new Error("HN Search Timeout")), 10000))
                            ]) as any;

                            if (hnRes.hits && hnRes.hits.length > 0) {
                                // Take top 5 stories
                                const hnResults = hnRes.hits.slice(0, 5).map((hit: any) => ({
                                    url: `https://news.ycombinator.com/item?id=${hit.objectID}`,
                                    title: hit.title || "HN Discussion",
                                    content: `${hit.title}. ${hit.story_text || ""}`,
                                    snippet: hit.title
                                }));
                                uniqueResults.push(...hnResults);
                            }
                        } catch (e: any) {
                            console.error("HN fallback failed", e);
                        }
                    }

                    if (uniqueResults.length === 0) {
                        sendError(t.search.noResults);
                        return;
                    }

                    // --------------------------------------------------------------------------
                    // STEP 3: ANALYST SYNTHESIS (Market Research Analyst)
                    // --------------------------------------------------------------------------

                    const combinedMarkdown = uniqueResults.map((r: any) => `
                        Source: ${r.url}
                        Title: ${r.title}
                        Content: ${(r.markdown || r.content || '').substring(0, 10000)}
                    `).join("\n\n");

                    sendUpdate(t.search.analysisComplete, 'active');

                    const result = await synthesizePatterns(combinedMarkdown);

                    sendUpdate(t.search.analysisComplete, 'completed');

                    // Final Result
                    const finalPayload = JSON.stringify({ type: 'result', data: result });
                    controller.enqueue(encoder.encode(finalPayload + '\n'));
                    controller.close();
                }

            } catch (error: any) {
                console.error("[API] Discovery Error:", error);
                sendError("Failed to process discovery: " + error.message);
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
