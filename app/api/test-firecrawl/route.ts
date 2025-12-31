import { NextResponse } from 'next/server';

export const maxDuration = 10; // Keep short to test quickly
export const dynamic = 'force-dynamic';

export async function GET() {
    const startTime = Date.now();

    // Check if API key exists
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
        return NextResponse.json({
            success: false,
            error: "FIRECRAWL_API_KEY is not set in environment variables",
            debug: {
                envKeys: Object.keys(process.env).filter(k => k.includes('FIRECRAWL') || k.includes('OPENAI')),
                timeMs: Date.now() - startTime
            }
        }, { status: 500 });
    }

    try {
        // Dynamic import to test module resolution
        const FirecrawlApp = (await import('@mendable/firecrawl-js')).default;
        const app = new FirecrawlApp({ apiKey });

        // Simple search test
        const result = await app.search("test query", { limit: 1 });

        return NextResponse.json({
            success: true,
            apiKeyPresent: true,
            apiKeyPrefix: apiKey.substring(0, 8) + "...",
            searchResult: result,
            timeMs: Date.now() - startTime
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            apiKeyPresent: !!apiKey,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : null,
            error: error.message,
            errorType: error.constructor.name,
            stack: error.stack?.split('\n').slice(0, 5),
            timeMs: Date.now() - startTime
        }, { status: 500 });
    }
}
