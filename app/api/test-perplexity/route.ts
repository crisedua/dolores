/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'PERPLEXITY_API_KEY not configured' }, { status: 500 });
    }

    const topic = req.nextUrl.searchParams.get('topic') || 'SaaS compliance';

    try {
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
                        content: "Return a simple JSON object with 2 test problems. Format: { \"problems\": [{ \"id\": \"test1\", \"title\": \"Test\" }] }. Only return raw JSON, no markdown."
                    },
                    {
                        role: "user",
                        content: `Topic: ${topic}`
                    }
                ]
            })
        });

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || 'No content';

        // Try to parse
        let parseResult = 'Not attempted';
        let parsed = null;

        try {
            parsed = JSON.parse(rawContent);
            parseResult = 'Direct parse succeeded';
        } catch (e: any) {
            parseResult = `Direct parse failed: ${e.message}`;

            // Try bracket extraction
            const firstBrace = rawContent.indexOf('{');
            const lastBrace = rawContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const extracted = rawContent.substring(firstBrace, lastBrace + 1);
                try {
                    parsed = JSON.parse(extracted);
                    parseResult = 'Bracket extraction succeeded';
                } catch (e2: any) {
                    parseResult = `Both methods failed. Bracket extraction error: ${e2.message}`;
                }
            }
        }

        return NextResponse.json({
            apiKeyPreview: `${apiKey.substring(0, 8)}...`,
            responseStatus: response.status,
            rawContentType: typeof rawContent,
            rawContentLength: rawContent.length,
            rawContentPreview: rawContent.substring(0, 500),
            rawContentFull: rawContent,
            parseResult,
            parsedData: parsed
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
