/* eslint-disable @typescript-eslint/no-explicit-any */
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY || ""
});

export const firecrawl = app;

export async function searchDiscussions(query: string) {
    try {
        console.log(`[Firecrawl] Searching for: "${query}"`);

        // Use Firecrawl's SEARCH method instead of scraping search result pages manually.
        // This is much more reliable as Firecrawl handles the search logic.

        try {
            // Force search on Reddit
            const searchResponse = await app.search(`${query} site:reddit.com`, {
                limit: 5,
                scrapeOptions: {
                    formats: ['markdown']
                }
            });

            // Firecrawl search response structure
            const rawResponse = searchResponse as any;

            if (rawResponse && rawResponse.success && rawResponse.data) {
                console.log(`[Firecrawl] Search successful. Found ${rawResponse.data.length} results.`);
                return rawResponse.data.map((item: any) => ({
                    url: item.url,
                    title: item.title || 'Discussion',
                    content: item.markdown || item.content || '',
                    snippet: (item.markdown || item.content || '').substring(0, 500)
                }));
            }
        } catch (searchError) {
            console.error(`[Firecrawl] Search API Error:`, searchError);
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
