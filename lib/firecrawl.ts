/* eslint-disable @typescript-eslint/no-explicit-any */
import FirecrawlApp from '@mendable/firecrawl-js';

const apiKey = process.env.FIRECRAWL_API_KEY || "";

// Log API key status at startup (masked for security)
console.log(`[Firecrawl] API Key status: ${apiKey ? `SET (${apiKey.substring(0, 8)}...)` : "⚠️ MISSING! Set FIRECRAWL_API_KEY in .env.local"}`);

const app = new FirecrawlApp({ apiKey });

export const firecrawl = app;

export async function searchDiscussions(query: string) {
    try {
        console.log(`[Firecrawl] Searching for: "${query}"`);

        // Use Firecrawl's SEARCH method instead of scraping search result pages manually.
        // This is much more reliable as Firecrawl handles the search logic.

        try {
            // Strategy 1: Search API with "reddit" keyword (Broader than site: operator)
            console.log("[Firecrawl] Attempting Search API...");
            const searchResponse = await app.search(`${query} reddit`, {
                limit: 5,
                scrapeOptions: { formats: ['markdown'] }
            });
            const searchResults = (searchResponse as any).data || [];

            if (searchResults.length > 0) {
                console.log(`[Firecrawl] Search API found ${searchResults.length} results.`);
                return searchResults.map((item: any) => ({
                    url: item.url,
                    title: item.title || 'Discussion',
                    content: item.markdown || item.content || '',
                    snippet: (item.markdown || item.content || '').substring(0, 500)
                }));
            }
        } catch (e: any) {
            console.error("[Firecrawl] Search API failed with error:");
            console.error("  - Message:", e?.message);
            console.error("  - Status:", e?.response?.status || e?.statusCode || "unknown");
            console.error("  - Response:", JSON.stringify(e?.response?.data || e?.body || e, null, 2));
            console.warn("[Firecrawl] Trying fallback...");
        }

        // Strategy 2: Fallback to scraping Reddit Search Page directly
        // (This was working before, so good backup)
        console.log("[Firecrawl] Triggering Fallback Scrape...");
        try {
            const redditUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=link`;
            const scrapeRes = await app.scrape(redditUrl, { formats: ['markdown'] });
            const raw = scrapeRes as any;

            if (raw && raw.success && raw.markdown) {
                console.log("[Firecrawl] Fallback Scrape Successful");
                return [{
                    url: redditUrl,
                    title: 'Reddit Search Results (Fallback)',
                    content: raw.markdown,
                    snippet: raw.markdown.substring(0, 500)
                }];
            }
        } catch (fallbackError: any) {
            console.error("[Firecrawl] Fallback failed:");
            console.error("  - Message:", fallbackError?.message);
            console.error("  - Status:", fallbackError?.response?.status || fallbackError?.statusCode || "unknown");
            console.error("  - Response:", JSON.stringify(fallbackError?.response?.data || fallbackError?.body || fallbackError, null, 2));
        }

        return [];


    } catch (error) {
        console.error("[Firecrawl] Search Error:", error);
        return [];
    }
}

export async function scrapeDiscussions(urls: string[]) {
    try {
        const promises = urls.map(url => app.scrape(url, { formats: ['markdown'] }));
        const results = await Promise.all(promises);

        return results
            .filter((r: any) => r.success)
            .map((r: any) => r.markdown || r.content || r.data || {});
    } catch (error) {
        console.error("Firecrawl Error:", error);
        return [];
    }
}
