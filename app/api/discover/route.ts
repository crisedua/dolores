/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { analyzeProblem } from '@/lib/openai';

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

                // Step 1: Strategy
                sendUpdate(`Generating research strategy for "${query}"...`, 'completed');

                // Step 2: Firecrawl Search
                sendUpdate(`Expanding search to Reddit and Hacker News...`, 'active');

                // Dynamic import to avoid cold start issues affecting stream start
                const { searchDiscussions } = await import('@/lib/firecrawl');
                const searchResults = await searchDiscussions(query);

                sendUpdate(`Found ${searchResults.length} relevant discussions across 2 platforms`, 'completed');

                let contextContent = "";

                if (searchResults.length > 0) {
                    sendUpdate(`Extracting insights from ${searchResults.length} unique sources...`, 'active');

                    contextContent = searchResults.map((r: any) => `
                        Source: ${r.url}
                        Title: ${r.title}
                        Content: ${r.content || r.snippet}
                    `).join("\n\n");

                    // Simulate a tiny delay for "reading" feel (optional, but nice for UX)
                    await new Promise(r => setTimeout(r, 800));
                    sendUpdate(`Processed ${contextContent.length} characters of raw user context`, 'completed');

                } else {
                    sendUpdate("No direct matches, falling back to knowledge base analysis...", 'active');
                    console.warn("[API] No search results found.");
                    contextContent = `No direct live discussions found for ${query}. Analyze based on general knowledge.`;
                    await new Promise(r => setTimeout(r, 1000));
                }

                // Step 3: Analysis
                sendUpdate("Analysing raw web data for recurring frustrations...", 'active');
                const result = await analyzeProblem(contextContent);

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
