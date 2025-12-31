import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true
});

/* -------------------------------------------------------------------------- */
/*                                1. PLAN RESEARCH                            */
/* -------------------------------------------------------------------------- */
export async function planResearch(topic: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a research strategist. Your goal is to generate search queries that will find people complaining about a topic.
                    
                    IMPORTANT RULES:
                    - DO NOT use "site:" operators (they don't work with our search API)
                    - DO NOT use boolean operators like "OR" or "AND"
                    - Generate 3 SIMPLE, natural language search queries
                    - Focus on finding complaints, struggles, pain points, or workarounds
                    - Include words like "reddit", "forum", "discussion" naturally in the query text
                    
                    Example good queries:
                    - "AI tools frustrating reddit"
                    - "problems with project management software"
                    - "why I hate CRM systems discussion"
                    
                    Output JSON: { "queries": ["query1", "query2", "query3"] }`
                },
                { role: "user", content: `Topic: ${topic}` }
            ],
            response_format: { type: "json_object" }
        });
        const data = JSON.parse(response.choices[0].message.content || "{}");
        return data.queries || [`${topic} reddit complaints`, `${topic} problems`, `${topic} alternatives`];
    } catch (e) {
        console.error("Plan Research Error", e);
        return [`${topic} reddit`, `${topic} issues`];
    }
}

/* -------------------------------------------------------------------------- */
/*                                2. EXTRACT SIGNALS                          */
/* -------------------------------------------------------------------------- */
export async function extractSignals(content: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a data miner. Extract every distinct user complaint, struggle, desire, or workaround from the text.
                    Ignore generic marketing or happy path comments.
                    
                    Output JSON: { 
                        "signals": [ 
                            { "quote": "exact text from user", "context": "1-sentence context", "source_url": "url_if_available" } 
                        ] 
                    }`
                },
                { role: "user", content: `Extract signals from: ${content.substring(0, 15000)}` }
            ],
            response_format: { type: "json_object" }
        });
        const data = JSON.parse(response.choices[0].message.content || "{}");
        return data.signals || [];
    } catch (e) {
        console.error("Extract Signals Error", e);
        return [];
    }
}

/* -------------------------------------------------------------------------- */
/*                          3. SYNTHESIZE & SCORE (Cluster + Brief)           */
/* -------------------------------------------------------------------------- */
export async function synthesizePatterns(signals: any[]) {
    if (!signals || signals.length === 0) return mockAnalysis();

    try {
        const signalsText = JSON.stringify(signals.slice(0, 50)); // Limit to avoid context overflow

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert SaaS Product Analyst. 
                    1. Group the provided "Complaint Signals" into distinct high-value "Problem Patterns".
                    2. STRICTLY Focus on problems solvable by Micro-SaaS or B2B Software.
                    3. Score each pattern based on Intensity, Frequency, Solvability, Monetizability.
                    4. Cite specific quotes/sources from the input signals as evidence. Do NOT hallucinate evidence.
                    
                    Rubric:
                    - Frequency (1-10): How many signals belong to this pattern?
                    - Intensity (1-10): How emotional/painful is the language?
                    - Solvability (1-10): Can software automate this?
                    - Monetizability (1-10): Is this a business problem with budget?

                    Output JSON:
                    {
                      "problems": [
                        {
                          "id": "string",
                          "rank": number,
                          "description": "Clear problem statement",
                          "signalScore": number (1-10),
                          "metrics": { "frequency": number, "intensity": number, "solvability": number, "monetizability": number },
                          "recommendation": "Specific Micro-SaaS idea to solve this",
                          "sources": [ { "url": "string", "title": "string", "snippet": "string" } ],
                          "quotes": [ "string (verbatim from signals)" ],
                          "existingSolutions": [ "string" ],
                          "gaps": [ "string" ]
                        }
                      ]
                    }`
                },
                { role: "user", content: `Analyze these signals: ${signalsText}` }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || "{}");
    } catch (e) {
        console.error("Synthesize Error", e);
        return mockAnalysis();
    }
}

// Kept for fallback/error handling
function mockAnalysis() {
    return { problems: [] };
}
