import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

interface ProblemData {
    description: string;
    persona?: string;
    urgencySignals?: string;
    mvpIdeas?: string[];
    existingSolutions?: Array<{ name: string; complaint: string }>;
}

export async function POST(request: NextRequest) {
    try {
        const body: ProblemData = await request.json();
        const { description, persona, urgencySignals, mvpIdeas, existingSolutions } = body;

        if (!description) {
            return NextResponse.json({ error: 'Problem description is required' }, { status: 400 });
        }

        // Build context from problem data
        const targetUser = persona || 'target users';
        const problem = description;
        const urgency = urgencySignals || '';
        const existingToolsContext = existingSolutions?.map(s => `${s.name}: ${s.complaint}`).join(', ') || '';
        const mvpContext = mvpIdeas?.slice(0, 2).join('; ') || '';

        const systemPrompt = `You are an expert at creating prompts for no-code AI prototype builders.
Your job is to generate copy-paste prompts that users can directly paste into no-code tools to create validation prototypes.

RULES:
1. Each prompt must be specific to the problem and target user provided
2. Focus ONLY on validation - request a very simple prototype or landing page
3. Include ONE validation signal (email capture, button click, or interest form)
4. Keep prompts clear, actionable, and under 300 words each
5. State explicitly: "This is a prototype for validation, not a full product"
6. Do NOT include generic placeholders - use the actual problem/user data provided

OUTPUT FORMAT (JSON):
{
  "lovable": "Full prompt for Lovable...",
  "bolt": "Full prompt for Bolt.new...", 
  "antigravity": "Full prompt for Antigravity..."
}

Tool-specific guidance:
- Lovable: Great for landing pages and simple forms. Emphasize visual design.
- Bolt.new: Fast prototyping. Emphasize speed and simplicity.
- Antigravity: AI-powered development. Emphasize intelligent features.`;

        const userPrompt = `Generate 3 prototype prompts for these no-code AI tools: Lovable, Bolt.new, and Antigravity.

PROBLEM TO SOLVE:
${problem}

TARGET USER:
${targetUser}

${urgency ? `URGENCY SIGNALS: ${urgency}` : ''}

${existingToolsContext ? `CURRENT SOLUTIONS THEY HATE: ${existingToolsContext}` : ''}

${mvpContext ? `MVP IDEAS TO CONSIDER: ${mvpContext}` : ''}

Generate one prompt per tool, each tailored to that tool's strengths. All prompts should create a simple validation prototype for this specific problem.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 2000,
            temperature: 0.7
        });

        const content = response.choices[0].message.content;

        console.log('[generate-prompts] OpenAI Response received. Length:', content?.length);

        if (!content) {
            console.error('[generate-prompts] Empty response from OpenAI');
            throw new Error('No response from OpenAI');
        }

        let prompts;
        try {
            prompts = JSON.parse(content);
        } catch (e) {
            console.error('[generate-prompts] JSON Parse Error:', e, 'Content:', content);
            throw new Error('Invalid JSON response from OpenAI');
        }

        return NextResponse.json({
            success: true,
            prompts: {
                lovable: prompts.lovable || '',
                bolt: prompts.bolt || '',
                antigravity: prompts.antigravity || ''
            }
        });

    } catch (error: any) {
        console.error('[generate-prompts] Critical Error:', error);
        console.error('[generate-prompts] API Key present:', !!process.env.OPENAI_API_KEY);

        return NextResponse.json(
            {
                error: 'Failed to generate prompts',
                details: error.message || 'Unknown error',
                // Only send specific details in dev/admin context if needed
                debug: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            },
            { status: 500 }
        );
    }
}
