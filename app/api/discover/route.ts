/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
// Import the granular agentic functions
import { planResearch, extractSignals, synthesizePatterns } from '@/lib/openai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();

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
                const { query } = await req.json();
                console.log(`[API] Received query: "${query}"`);

                // --------------------------------------------------------------------------
                // STEP 1: RESEARCH STRATEGY (Agentic Planner)
                // --------------------------------------------------------------------------
                sendUpdate(`Generating research strategy for "${query}"...`, 'active');
                const researchPlan = await planResearch(query); // Returns array of queries
                console.log("[DEBUG] Research Plan Generated:", researchPlan);
                sendUpdate(`[DEBUG] Planner output: ${JSON.stringify(researchPlan)}`, 'completed');

                // --------------------------------------------------------------------------
                // STEP 2: MULTI-SOURCE SEARCH (Firecrawl)
                // --------------------------------------------------------------------------
                sendUpdate(`Scraping with ${researchPlan.length} agents...`, 'active');

                // Dynamic import
                const { firecrawl } = await import('@/lib/firecrawl');

                // execute searches in parallel for the generated queries
                // Execute searches in parallel to save time (Netlify Function Timeout is 10s)
                const searchPromises = researchPlan.map(async (subQuery: string) => {
                    try {
                        console.log(`[DEBUG] Searching: "${subQuery}"`);
                        // Set a strict 5s timeout for each search to avoid hanging
                        const searchRes = await Promise.race([
                            firecrawl.search(subQuery, { limit: 5, scrapeOptions: { formats: ['markdown'] } }),
                            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
                        ]);

                        const resData = (searchRes as any).data || [];
                        return { query: subQuery, results: resData, success: (searchRes as any).success };
                    } catch (err: any) {
                        console.error(`[DEBUG] Search failed for "${subQuery}":`, err.message);
                        return { query: subQuery, results: [], success: false, error: err.message };
                    }
                });

                sendUpdate(`Searching parallel (${researchPlan.length} queries)...`, 'active');
                const searchResults = await Promise.all(searchPromises);

                let allSearchResults: any[] = [];
                searchResults.forEach(res => {
                    if (res.results.length > 0) {
                        allSearchResults.push(...res.results);
                        sendUpdate(`[DEBUG] Found ${res.results.length} for "${res.query}"`, 'active');
                    }
                });

                console.log(`[DEBUG] Total raw results: ${allSearchResults.length}`);

                // Deduplicate by URL
                let uniqueResults = Array.from(new Map(allSearchResults.map(item => [item.url, item])).values());

                // FALLBACK 1: Broad Search API
                if (uniqueResults.length === 0) {
                    sendUpdate("[FALLBACK] 0 results. Trying broad search...", 'active');
                    console.log("[DEBUG] Triggering broad search fallback...");
                    try {
                        const broadQuery = `${query} reddit discussion`;
                        // TIMEOUT PROTECTION: 10s
                        const fallbackRes = await Promise.race([
                            firecrawl.search(broadQuery, { limit: 5, scrapeOptions: { formats: ['markdown'] } }),
                            new Promise((_, reject) => setTimeout(() => reject(new Error("Broad Search Timeout")), 10000))
                        ]);

                        const fallbackData = (fallbackRes as any).data || [];
                        if (fallbackData.length > 0) {
                            uniqueResults = fallbackData;
                            sendUpdate(`[FALLBACK] Found ${fallbackData.length} results via broad search.`, 'completed');
                        }
                    } catch (e: any) {
                        console.error("Broad fallback failed", e);
                        sendUpdate(`[FALLBACK] Broad search failed: ${e.message}`, 'active');
                    }
                }

                // FALLBACK 2: Hacker News Search (Last Resort)
                // Reddit is blocked by Firecrawl. Use HN Algolia search instead.
                if (uniqueResults.length === 0) {
                    sendUpdate("[LAST RESORT] Trying Hacker News search...", 'active');
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
                            sendUpdate(`[LAST RESORT] Found ${hnResults.length} Hacker News discussions.`, 'completed');
                        }
                    } catch (e: any) {
                        console.error("HN fallback failed", e);
                        sendUpdate(`[LAST RESORT] HN search failed: ${e.message}`, 'active');
                    }
                }

                if (uniqueResults.length === 0) {
                    sendError("No relevant discussions found. Try a broader topic.");
                    return;
                }

                sendUpdate(`Found ${uniqueResults.length} unique discussion threads`, 'completed');

                // --------------------------------------------------------------------------
                // STEP 3: SIGNAL EXTRACTION (Data Mining Agent)
                // --------------------------------------------------------------------------
                sendUpdate(`Extracting raw complaint signals from ${uniqueResults.length} threads...`, 'active');

                // Combine content for extraction (chunk processing if needed, but for MVP send top 20k chars)
                const combinedMarkdown = uniqueResults.map((r: any) => `
                    Source: ${r.url}
                    Title: ${r.title}
                    Content: ${(r.markdown || r.content || '').substring(0, 3000)}
                `).join("\n\n");

                const signals = await extractSignals(combinedMarkdown);
                sendUpdate(`Identified ${signals.length} distinct pain points & workarounds`, 'completed');

                // --------------------------------------------------------------------------
                // STEP 4: SYNTHESIS & SCORE (Analyst Agent)
                // --------------------------------------------------------------------------
                sendUpdate("Clustering patterns, scoring intensity, and generating briefs...", 'active');
                const result = await synthesizePatterns(signals);

                // Final Result
                const finalPayload = JSON.stringify({ type: 'result', data: result });
                controller.enqueue(encoder.encode(finalPayload + '\n'));
                controller.close();

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
