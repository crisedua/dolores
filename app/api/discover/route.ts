/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { analyzeProblem } from '@/lib/openai';

export const maxDuration = 60; // Allow longer timeouts for scraping

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        console.log(`[API] Received query: "${query}"`);

        // 1. Search for real discussions using Firecrawl
        const { searchDiscussions } = await import('@/lib/firecrawl');
        console.log('[API] Starting Firecrawl search...');
        const searchResults = await searchDiscussions(query);
        console.log(`[API] Firecrawl returned ${searchResults.length} results`);

        let contextContent = "";

        if (searchResults.length > 0) {
            contextContent = searchResults.map((r: any) => `
                Source: ${r.url}
                Title: ${r.title}
                Content: ${r.content || r.snippet}
            `).join("\n\n");
            console.log(`[API] Context length: ${contextContent.length} characters`);
        } else {
            // Fallback if search fails
            console.warn("[API] No search results found, falling back to AI knowledge base.");
            contextContent = `No direct live discussions found for ${query}. Analyze based on general knowledge of this domain.`;
        }

        // 2. Analyze the content with OpenAI
        console.log('[API] Sending to OpenAI for analysis...');
        const result = await analyzeProblem(contextContent);
        console.log(`[API] OpenAI returned ${result.problems?.length || 0} problems`);

        return NextResponse.json(result);

    } catch (error) {
        console.error("[API] Discovery Error:", error);
        return NextResponse.json({ error: "Failed to process discovery" }, { status: 500 });
    }
}
