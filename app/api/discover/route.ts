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
                sendUpdate(`Strategy: Searching for ${researchPlan.slice(0, 2).join(", ")}...`, 'completed');

                // --------------------------------------------------------------------------
                // STEP 2: MULTI-SOURCE SEARCH (Firecrawl)
                // --------------------------------------------------------------------------
                sendUpdate(`Scraping Reddit & HN with ${researchPlan.length} agents...`, 'active');

                // Dynamic import
                const { scrapeDiscussions } = await import('@/lib/firecrawl');
                const { firecrawl } = await import('@/lib/firecrawl');

                // execute searches in parallel for the generated queries
                let allSearchResults: any[] = [];
                for (const subQuery of researchPlan) {
                    try {
                        // Search "subQuery site:reddit.com" etc.
                        const searchRes = await firecrawl.search(subQuery, { limit: 2, scrapeOptions: { formats: ['markdown'] } });
                        if ((searchRes as any).success && (searchRes as any).data) {
                            allSearchResults = [...allSearchResults, ...(searchRes as any).data];
                        }
                    } catch (err) {
                        console.error("Sub-search failed", err);
                    }
                }

                // Deduplicate by URL
                let uniqueResults = Array.from(new Map(allSearchResults.map(item => [item.url, item])).values());

                // FALLBACK STRATEGY: If API search fails, try scraping Reddit Search page directly
                if (uniqueResults.length === 0) {
                    sendUpdate("Primary search yielded no results, attempting fallback scrape...", 'active');

                    // Construct a direct Reddit search URL based on the original query
                    const fallbackQuery = encodeURIComponent(query);
                    const fallbackUrl = `https://www.reddit.com/search/?q=${fallbackQuery}&type=link`;

                    try {
                        const { firecrawl } = await import('@/lib/firecrawl');
                        const scrapeRes = await firecrawl.scrape(fallbackUrl, { formats: ['markdown'] });
                        const raw = scrapeRes as any;

                        if (raw.success && raw.markdown) {
                            uniqueResults.push({
                                url: fallbackUrl,
                                title: 'Reddit Search Results (Fallback)',
                                content: raw.markdown,
                                snippet: raw.markdown.substring(0, 500)
                            });
                        }
                    } catch (fallbackErr) {
                        console.error("Fallback scrape failed", fallbackErr);
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
