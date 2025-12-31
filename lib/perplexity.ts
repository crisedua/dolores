/* eslint-disable @typescript-eslint/no-explicit-any */

export async function perplexitySearch(topic: string) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "sonar-pro",
            messages: [
                {
                    role: "system",
                    content: `You are an expert Market Research Analyst. Your goal is to find high-intent customer complaints, pain points, and unmet needs for a given topic.
                    
                    SEARCH INSTRUCTIONS:
                    - Search Reddit, forums, Hacker News, and social media.
                    - Look for specific frustrations, workarounds, and "I wish there was a way to..." statements.
                    - Find at least 10-15 distinct, granular pain points.
                    
                    CRITICAL: You MUST respond with a valid JSON object only. No other text.
                    
                    OUTPUT FORMAT (JSON ONLY):
                    {
                        "problems": [
                            {
                                "id": "kebab-case-unique-id",
                                "rank": 1,
                                "type": "problem",
                                "title": "Short, punchy heading (3-6 words)",
                                "description": "2-3 sentences explaining the specific user frustration in detail",
                                "signalScore": 9,
                                "metrics": {
                                    "frequency": 8,
                                    "intensity": 9,
                                    "solvability": 7,
                                    "monetizability": 6
                                },
                                "quotes": [
                                    "Direct quote or paraphrased specific example from a user",
                                    "Another specific example..."
                                ],
                                "recommendation": "Brief MVP solution idea"
                            }
                        ]
                    }`
                },
                {
                    role: "user",
                    content: `Topic: ${topic}`
                }
            ]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse Perplexity JSON:", content);
        throw new Error("Perplexity returned invalid JSON format");
    }
}
