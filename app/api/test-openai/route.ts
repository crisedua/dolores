import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
    const apiKey = process.env.MY_OPENAI_KEY || process.env.OPENAI_API_KEY;

    const diagnostics = {
        keyExists: !!apiKey,
        keyLength: apiKey?.length || 0,
        keyPrefix: apiKey?.substring(0, 8) || 'N/A',
        keySuffix: apiKey?.slice(-4) || 'N/A',
        hasWhitespace: apiKey !== apiKey?.trim(),
        hasNewline: apiKey?.includes('\n') || apiKey?.includes('\r'),
    };

    // Try to make a simple API call
    try {
        const openai = new OpenAI({
            apiKey: apiKey?.trim() || '',
        });

        const response = await openai.models.list();

        return NextResponse.json({
            status: 'success',
            message: 'API key is valid!',
            diagnostics,
            modelsCount: response.data.length
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            errorType: error.constructor.name,
            diagnostics
        }, { status: 500 });
    }
}
