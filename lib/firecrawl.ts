/* eslint-disable @typescript-eslint/no-explicit-any */
import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY || "fc-e928be9cd75c41c2b42912e37210c1a1"
});

export const firecrawl = app;

export async function searchDiscussions(query: string) {
    try {
        console.log(`[Firecrawl] Searching for: "${query}"`);

        // Generate search URLs for Reddit and HN
        const searchQuery = encodeURIComponent(query);
        const urls = [
            `https://www.reddit.com/search/?q=${searchQuery}&sort=relevance&t=month`,
            `https://hn.algolia.com/?q=${searchQuery}&sort=byPopularity&type=story`
        ];

        console.log(`[Firecrawl] Scraping URLs:`, urls);

        // Scrape the search result pages
        const results = [];
        for (const url of urls) {
            try {
                const response = await app.scrape(url, {
                    formats: ['markdown']
                });

                if (response && response.success && response.markdown) {
                    results.push({
                        url: url,
                        title: url.includes('reddit') ? 'Reddit Search Results' : 'Hacker News Search Results',
                        content: response.markdown,
                        snippet: response.markdown.substring(0, 500)
                    });
                    console.log(`[Firecrawl] Successfully scraped ${url}`);
                }
            } catch (scrapeError) {
                console.error(`[Firecrawl] Error scraping ${url}:`, scrapeError);
            }
        }

        console.log(`[Firecrawl] Total results: ${results.length}`);
        return results;
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
