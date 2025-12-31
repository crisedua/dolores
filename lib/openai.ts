import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true // NOT RECOMMENDED for production, but using here for MVP/server mix check
});

// Helper for structured extraction
export async function analyzeProblem(content: string) {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("No OpenAI Key provided, returning mock data.");
        return mockAnalysis();
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert product analyst specialized in Micro-SaaS and B2B Software opportunities.
                    Your goal is to identify lucrative problems in online discussions that can be solved with software.
                    Follow these strict rules:
                    1. Focus ONLY on problems solvable by SaaS, automation, or digital tools.
                    2. Ignore complaints about physical products, politics, or general life advice.
                    3. Look for "spreadsheet fatigue", "manual data entry", "fragmented workflows", or "expensive enterprise tools".
                    
                    Extract at least 10 distinct, high-value problems mentioned in the text.
                    For each problem, estimate:
                    - frequency (1-10): How often it appears?
                    - intensity (1-10): How painful is it?
                    - solvability (1-10): Technical feasibility?
                    - monetizability (1-10): Willingness to pay?
                    
                    Output valid JSON matching this structure:
                    {
                      "problems": [
                        {
                          "id": "string",
                          "rank": number,
                          "description": "Clear 1-sentence problem statement",
                          "signalScore": number (1-10),
                          "metrics": { "frequency": number, "intensity": number, "solvability": number, "monetizability": number },
                          "recommendation": "Specific actionable next step",
                          "frequency": number (1-100, mapped from frequency * 10),
                          "economicIntent": number (1-100, mapped from monetizability * 10),
                          "trend": "GROWING" | "STABLE" | "DECLINING",
                          "competition": "HIGH" | "MED" | "LOW",
                          "sources": [ { "url": "string", "title": "string", "snippet": "string" } ],
                          "quotes": [ "string" ],
                          "existingSolutions": [ "string" ],
                          "gaps": [ "string" ]
                        }
                      ]
                    }`
                },
                {
                    role: "user",
                    content: `Analyze this raw discussion content and extract problem signals. Ignore noise/ads. Content: ${content.substring(0, 20000)}`
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(completion.choices[0].message.content || "{}");
    } catch (e) {
        console.error("OpenAI Error", e);
        return mockAnalysis();
    }
}

function mockAnalysis() {
    return {
        problems: [
            {
                id: "p1",
                rank: 1,
                description: "Identifying and implementing the correct AI tools for small business productivity is difficult and overwhelming.",
                signalScore: 8.5,
                metrics: {
                    frequency: 9,
                    intensity: 8,
                    solvability: 8,
                    monetizability: 9
                },
                recommendation: "Develop a niche AI consultancy or a 'done-for-you' implementation kit specifically targeting common SMB workflows (e.g., invoicing, scheduling) to replace manual research.",

                // Keep backward compatible fields for matrix if needed, or map them
                frequency: 90, // mapped from 9
                economicIntent: 90, // mapped from monetizability
                trend: "GROWING",
                competition: "MED"
            },
            {
                id: "p2",
                rank: 2,
                description: "Remote teams struggle to maintain consistent culture and connection without intrusive monitoring tools.",
                signalScore: 7.2,
                metrics: {
                    frequency: 7,
                    intensity: 6,
                    solvability: 9,
                    monetizability: 7
                },
                recommendation: "Build a 'culture-first' async update tool that focuses on mood sharing and wins rather than hours logged.",

                frequency: 70,
                economicIntent: 70,
                trend: "STABLE",
                competition: "HIGH"
            }
        ]
    };
}
