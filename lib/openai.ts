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
Turn the user's topic into specific search queries that will uncover "problems", "workarounds", and "pain points" on Reddit and forums.

RULES:
1. Generate 6 distinct search queries.
2. Queries must be short (2-5 words) and natural.
3. INCLUDE words like "reddit", "forum", "vs", "alternatives", "problems".
4. Target: Reddit (Specific community discussions).
5. Use format: "topic reddit", "topic problems reddit", "topic alternatives reddit".

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
    const fallback = [
      `${topic} reddit`,
      `${topic} problems reddit`,
      `${topic} reddit alternatives`,
      `${topic} complaints`,
      `${topic} issues forum`,
      `why I hate ${topic} reddit`
    ];
    return (data.queries && data.queries.length > 0) ? data.queries : fallback;
  } catch (e) {
    console.error("Plan Research Error", e);
    return [`${topic} reddit`, `${topic} problems`];
  }
}

/* -------------------------------------------------------------------------- */
/*                     PROMPT C: MARKET RESEARCH ANALYST                      */
/* -------------------------------------------------------------------------- */
export async function synthesizePatterns(content: string) {
  // If no content, return mock
  if (!content || content.length < 100) return mockAnalysis();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Market Research Analyst specializing in analyzing conversational data to identify pain points, frustrations, and unmet needs expressed by real users.
Your expertise is in distilling lengthy Reddit threads into clear, actionable insights while preserving the authentic language users employ to describe their problems.

YOUR MISSION:
Identify EVERY distinct pain point, problem, and frustration mentioned by users.
Extract and organize these pain points into granular categories.
For each pain point, include all direct quotes from users that best illustrate this specific problem.

VOLUME REQUIREMENT: 
- Aim for MINIMUM 12-15 distinct pain points if data supports it. 
- DO NOT generalize or bucket into 3-4 groups. I want to see the long tail of friction.
- Even minor or niche problems are valuable if they are recurring.

ANALYSIS CRITERIA:
INCLUDE:
- Specific problems users are experiencing
- Frustrations with existing solutions
- Unmet needs and desires
- Workarounds users have created
- Specific usage scenarios where problems occur
- Emotional impact of problems

DO NOT INCLUDE:
- General discussion not related to problems
- Simple questions asking for advice
- Generic complaints without details
- Positive experiences (unless contrasting)

CRITICAL OUTPUT INSTRUCTION:
You must output your analysis in specific JSON format for our dashboard. Do NOT produce a markdown report.
Map your "Pain Point Analysis" to the following schema:
- Heading -> title (This should be a punchy 1-sentence headline)
- Summary -> description (The UI uses this field as the MAIN HEADING, so make it descriptive)
- Direct Quotes -> evidence (array of objects with "text" and "url" fields)
- Priority Ranking -> signalScore (1-10)
- Frequency/Intensity -> metrics (1-10)

IMPORTANT: For each quote you extract, you MUST identify which source URL it came from.
Each quote must be an object with:
- "text": The actual quote text
- "url": The source URL where this quote appeared

JSON OUTPUT STRUCTURE:
{
  "problems": [
    {
      "rank": 1,
      "id": "kebab-case-title",
      "type": "problem",
      "title": "Short Heading",
      "description": "The detailed heading that appears on the card",
      "signalScore": 9, 
      "metrics": {
        "frequency": 8, 
        "intensity": 9, 
        "solvability": 7, 
        "monetizability": 6 
      },
      "evidence": [
        { "text": "Quote text from a user...", "url": "https://reddit.com/..." },
        { "text": "Another quote...", "url": "https://reddit.com/..." }
      ],
      "recommendation": "Specific, actionable MVP solution idea. Must include: (1) What product/service to build, (2) How it solves this specific problem, (3) Clear value proposition. Example: 'Build a SaaS platform with automated GDPR compliance checklists that auto-maps sensitive data and generates one-click audit reports.' 2-3 sentences max."
    }
  ]
}`
        },
        {
          role: "user",
          content: `Analyze these Reddit/Forum conversations:\n\n${content.substring(0, 150000)}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7
    });

    const data = JSON.parse(response.choices[0].message.content || "{}");
    const problems = data.problems || [];

    // Ensure strictly match TS interface
    const mappedProblems = problems.map((p: any, i: number) => ({
      id: p.id || `problem-${i}`,
      rank: i + 1,
      type: 'problem',
      title: p.title || "Untitled Pain Point",
      description: p.description || p.title || "No description", // Mapping for UI compatibility
      signalScore: p.signalScore || 5,
      metrics: {
        frequency: p.metrics?.frequency || 5,
        intensity: p.metrics?.intensity || 5,
        solvability: p.metrics?.solvability || 5,
        monetizability: p.metrics?.monetizability || 5
      },
      quotes: p.evidence || [], // Map schema 'evidence' to UI 'quotes'
      recommendation: p.recommendation || "Investigate further"
    }));

    return { problems: mappedProblems };

  } catch (e) {
    console.error("Synthesis Error", e);
    return mockAnalysis();
  }
}

/* -------------------------------------------------------------------------- */
/*                     HELPER: MOCK DATA                                      */
/* -------------------------------------------------------------------------- */
function mockAnalysis() {
  return {
    problems: [
      {
        id: 'mock-error',
        rank: 1,
        type: 'problem',
        title: 'Analysis Failed',
        description: 'We could not identify patterns in the retrieved data. Please try a different topic.',
        signalScore: 1,
        metrics: { frequency: 1, intensity: 1, solvability: 1, monetizability: 1 },
        quotes: [],
        recommendation: 'Try broadening your search terms.'
      }
    ]
  };
}

/* -------------------------------------------------------------------------- */
/*                     PROMPT B: EXTRACTION AGENT (Deprecated)                */
/* -------------------------------------------------------------------------- */
export async function extractSignals(content: string) {
  return [];
}
