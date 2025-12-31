/* -------------------------------------------------------------------------- */
/*                     REDDIT DIRECT JSON ACCESS                              */
/* -------------------------------------------------------------------------- */

/**
 * Search Reddit using the public JSON endpoint.
 * No API key required - just append .json to Reddit URLs.
 * 
 * @param query - Search term
 * @param limit - Max results (default 10)
 * @returns Array of Reddit posts with title, url, selftext, and score
 */
export async function searchReddit(query: string, limit: number = 10) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://www.reddit.com/search.json?q=${encodedQuery}&sort=relevance&limit=${limit}&type=link`;

        console.log(`[Reddit] Searching: "${query}"`);

        const response = await fetch(url, {
            headers: {
                // Reddit requires a User-Agent or it blocks requests
                'User-Agent': 'Mozilla/5.0 (compatible; DoloresBot/1.0; +https://dolores.app)'
            }
        });

        if (!response.ok) {
            console.error(`[Reddit] HTTP Error: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!data.data || !data.data.children) {
            console.warn("[Reddit] No results structure found");
            return [];
        }

        const posts = data.data.children.map((child: any) => ({
            id: child.data.id,
            title: child.data.title,
            url: `https://www.reddit.com${child.data.permalink}`,
            selftext: child.data.selftext || "",
            subreddit: child.data.subreddit,
            score: child.data.score,
            num_comments: child.data.num_comments,
            created_utc: child.data.created_utc
        }));

        console.log(`[Reddit] Found ${posts.length} posts`);
        return posts;

    } catch (error) {
        console.error("[Reddit] Search error:", error);
        return [];
    }
}

/**
 * Get comments from a Reddit post
 * 
 * @param postUrl - Full Reddit post URL
 * @returns Array of top-level comments with body text
 */
export async function getRedditComments(postUrl: string, limit: number = 20) {
    try {
        // Convert Reddit URL to JSON endpoint
        const jsonUrl = postUrl.replace(/\/$/, '') + '.json?limit=' + limit;

        console.log(`[Reddit] Fetching comments from: ${jsonUrl}`);

        const response = await fetch(jsonUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DoloresBot/1.0; +https://dolores.app)'
            }
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();

        // Reddit returns [post, comments] array
        if (!Array.isArray(data) || data.length < 2) {
            return [];
        }

        const commentsData = data[1].data.children;
        const comments = commentsData
            .filter((c: any) => c.kind === 't1') // t1 = comment
            .map((c: any) => ({
                body: c.data.body,
                score: c.data.score,
                author: c.data.author
            }));

        return comments;

    } catch (error) {
        console.error("[Reddit] Comments error:", error);
        return [];
    }
}
