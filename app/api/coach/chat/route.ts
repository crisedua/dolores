import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SYSTEM_PROMPT_COACH } from '@/lib/coachPrompts';
import { SelectedProblem } from '@/lib/schemas';

// Initialize OpenAI
// Note: In Next.js edge/serverless, ensure process.env.OPENAI_API_KEY is available
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs'; // Using nodejs for better compatibility with streaming libs if needed, though edge is also fine usually

export async function POST(req: NextRequest) {
    try {
        const { messages, selectedProblem, userContext } = await req.json();

        // 1. Construct System Context
        const problemContext = `
CONTEXTO DEL PROBLEMA SELECCIONADO:
Título: ${selectedProblem.problem_title}
Dolor principal: ${selectedProblem.core_pain}
Quién lo tiene (Persona): ${selectedProblem.who_has_it}
Evidencia Económica: ${selectedProblem.financial_impact}
Pruebas/Citas: ${selectedProblem.evidence_summary}

CONTEXTO DEL USUARIO:
Idioma: ${userContext?.language || 'es'}
${userContext?.skills ? `Habilidades: ${userContext.skills}` : ''}
${userContext?.access ? `Acceso a mercado: ${userContext.access}` : ''}
`;

        const fullSystemSystem = `${SYSTEM_PROMPT_COACH}\n\n${problemContext}`;

        // 2. Stream from OpenAI
        const stream = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: fullSystemSystem },
                ...messages
            ],
            stream: true,
            temperature: 0.7,
        });

        // 3. Create SSE Stream Response
        const encoder = new TextEncoder();

        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            // Send data as a JSON string prefixed with "data: "
                            const data = JSON.stringify({ content });
                            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                        }
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            },
        });

        return new NextResponse(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('Coach API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
