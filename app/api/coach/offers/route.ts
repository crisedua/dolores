import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { SYSTEM_PROMPT_OFFERS } from '@/lib/coachPrompts';
import { OfferBundleSchema } from '@/lib/schemas';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { selectedProblem, userContext } = await req.json();

        const problemContext = `
PROBLEM CONTEXT:
Title: ${selectedProblem.problem_title}
Core Pain: ${selectedProblem.core_pain}
Who has it: ${selectedProblem.who_has_it}
Financial Impact: ${selectedProblem.financial_impact}
Market Scope: ${selectedProblem.market_scope}

USER CONTEXT:
Language inputs: ${JSON.stringify(userContext || {})}
`;

        const completion = await openai.beta.chat.completions.parse({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT_OFFERS },
                { role: 'user', content: `Generate an OfferBundle for this problem:\n\n${problemContext}` }
            ],
            response_format: zodResponseFormat(OfferBundleSchema, "offer_bundle"),
            temperature: 0.7,
        });

        const offerBundle = completion.choices[0].message.parsed;

        if (!offerBundle) {
            throw new Error("Failed to parse offer bundle");
        }

        return NextResponse.json(offerBundle);

    } catch (error) {
        console.error('Offers API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
