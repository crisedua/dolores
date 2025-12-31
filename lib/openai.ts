import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true
});

/* -------------------------------------------------------------------------- */
/*                     PROMPT A: RESEARCH PLANNER                             */
/* -------------------------------------------------------------------------- */
export async function planResearch(topic: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Research Strategist. Your goal is to plan a search strategy to find high-intent customer complaints.

OBJECTIVE:
Turn the user's topic into specific search queries that will uncover "problems", "workarounds", and "pain points" on tech forums and communities.

RULES:
1. Generate 4 distinct search queries.
2. Queries must be short (2-5 words) and natural.
3. INCLUDE words like "hacker news", "stackoverflow", "forum", "vs", "alternatives", "problems", "issues".
4. Target: Hacker News, StackOverflow, Product Hunt, IndieHackers, general tech forums.
5. AVOID: "reddit" (blocked), boolean operators, "site:" operators.
6. Focus on finding *discussions* not marketing pages.

JSON OUTPUT FORMAT:
{
  "queries": ["query1", "query2", ...]
}`
        },
        { role: "user", content: `Topic: ${topic}` }
      ],
      response_format: { type: "json_object" }
    });
    const data = JSON.parse(response.choices[0].message.content || "{}");
    // Fallback queries if empty - use sources Firecrawl supports
    const fallback = [`${topic} hacker news`, `${topic} problems stackoverflow`, `${topic} alternatives`, `${topic} issues forum`];
    return (data.queries && data.queries.length > 0) ? data.queries : fallback;
  } catch (e) {
    console.error("Plan Research Error", e);
    return [`${topic} hacker news`, `${topic} problems`];
  }
}

/* -------------------------------------------------------------------------- */
/*                     PROMPT B: EXTRACTION AGENT                             */
/* -------------------------------------------------------------------------- */
export async function extractSignals(content: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Data Miner. Your job is to extract raw "Complaint Signals" from the provided forum discussions.

DEFINITION of SIGNAL:
A specific problem, pain point, struggle, expensive workaround, or unmet desire expressed by a user.
IGNORE: Generic praise, marketing copy, or off-topic chatter.

RULES:
1. Extract verbatim quotes where possible.
2. Context must explain *why* it's a problem in 1 sentence.
3. If no signals are found, return empty list.

JSON OUTPUT FORMAT:
{
  "signals": [
    { 
      "quote": "I spend 3 hours a day copying data manually...", 
      "context": "User complaining about lack of integration", 
      "source_url": "URL where this came from (if available in text)" 
    }
  ]
}`
        },
        { role: "user", content: `Extract signals from this raw text (max 20k chars): \n\n${content.substring(0, 20000)}` }
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
/*               PROMPT C/D/E: SYNTHESIS, SCORING & BRIEF                     */
/* -------------------------------------------------------------------------- */
export async function synthesizePatterns(signals: any[]) {
  if (!signals || signals.length === 0) return { problems: [] };

  try {
    // We combine Clustering, Scoring, and Briefing into one call to save time/tokens
    const signalsText = JSON.stringify(signals.slice(0, 60));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Senior Product Manager. Your goal is to Identify, Score, and Brief the top opportunities.

INPUT:
A list of raw "Complaint Signals" from a specific market.

TASK 1: CLUSTERING (Prompt C)
Group signals into specific "Problem Patterns".
- A pattern must represent a solved problem (e.g., "Users hate manual data entry")
- Merge duplicates.

TASK 2: SCORING (Prompt D)
Score each pattern (1-10 points per dimension for UI compatibility):
1. PAIN (Intensity): How angry/desperate are they? (1=Mild, 10=Furious)
2. FREQUENCY: How common is this complaint in the dataset? (1=Rare, 10=Constant)
3. WILLINGNESS TO PAY (Monetizability): Is this a business problem? (1=Hobby, 10=Enterprise)
4. SOLVABILITY: Can an MVP solve this? (1=Hard, 10=Easy)
5. RECURRENCE: Is this a recurring task? (Optional internal score)

JSON OUTPUT FORMAT:
{
  "problems": [
    {
      "id": "unique_id",
      "rank": 1,
      "description": "2-sentence problem definition",
      "signalScore": 8.5,
      "metrics": { "frequency": 8, "intensity": 9, "solvability": 7, "monetizability": 10 },
      "recommendation": "Specific Micro-SaaS idea...",
      "brief": { ... },
      "signal_class": "High Signal" | "Noise",
      "brief": {
        "solution_idea": "...",
        "validation_steps": ["..."],
        "gaps_in_market": "..."
      },
      "evidence": [
        { "quote": "...", "source_url": "..." }
      ]
    }
  ]
}`
        },
        { role: "user", content: `Analyze these signals and produce the PRD data: ${signalsText}` }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (e) {
    console.error("Synthesize Error", e);
    return { problems: [] };
  }
}
