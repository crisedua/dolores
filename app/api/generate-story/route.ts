

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    // Debug object to collect info
    const debug: any = {
        step: 'init',
        timestamp: new Date().toISOString(),
    };

    try {
        debug.step = 'parsing_request';
        const { articleText, websiteUrl } = await request.json();
        debug.hasArticleText = !!articleText;
        debug.articleTextLength = articleText?.length || 0;

        if (!articleText) {
            return NextResponse.json({ success: false, error: 'Article text is required', debug }, { status: 400 });
        }

        debug.step = 'checking_api_key';
        // Try the new variable first to bypass caching issues
        const apiKey = process.env.MY_OPENAI_KEY || process.env.OPENAI_API_KEY;

        // Debug: Collect key info (only first/last few chars for security)
        debug.usingNewVar = !!process.env.MY_OPENAI_KEY;
        debug.apiKeyExists = !!apiKey;
        debug.apiKeyLength = apiKey?.length || 0;
        debug.apiKeyPrefix = apiKey?.substring(0, 8) || 'none';
        debug.apiKeySuffix = apiKey?.substring(apiKey.length - 4) || 'none';

        console.log('[DEBUG] API Key info:', debug);

        if (!apiKey) {
            return NextResponse.json({
                success: false,
                error: 'OpenAI API key not configured on server',
                debug
            }, { status: 500 });
        }

        if (apiKey.length < 20) {
            return NextResponse.json({
                success: false,
                error: `API key seems invalid (length: ${apiKey.length})`,
                debug
            }, { status: 500 });
        }

        debug.step = 'creating_openai_client';
        const openai = new OpenAI({
            apiKey: apiKey.trim(),
        });

        const prompt = `
      You are an expert editor. You have been given the raw text of a business success story or article.
      Your goal is to extract structured information from it for a "Success Story" card.

      Please extract:
      1. A catchy Title (if not explicitly clear, generate one based on the content).
      2. A concise Summary (2-3 sentences max).
      3. A list of "Steps" or "Key Takeways" (an array of strings, max 5 items).
      
      Input Text:
      "${articleText.substring(0, 15000)}"

      Return JSON format:
      {
        "title": "...",
        "summary": "...",
        "steps": ["Step 1...", "Step 2..."]
      }
    `;

        debug.step = 'calling_openai';
        console.log('[DEBUG] About to call OpenAI...');

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that extracts structured data from text." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        debug.step = 'openai_success';
        debug.openaiModel = response.model;
        console.log('[DEBUG] OpenAI call successful');

        const content = response.choices[0].message.content;
        if (!content) {
            return NextResponse.json({ success: false, error: 'No content generated', debug }, { status: 500 });
        }

        debug.step = 'parsing_response';
        const data = JSON.parse(content);

        debug.step = 'saving_to_supabase';
        // Save to Supabase
        const { data: insertData, error } = await supabase
            .from('success_stories')
            .insert([
                {
                    title: data.title,
                    summary: data.summary,
                    steps: data.steps,
                    article_content: articleText,
                    website_url: websiteUrl
                }
            ])
            .select();

        if (error) {
            debug.step = 'supabase_error';
            debug.supabaseError = error.message;
            console.error("Supabase Error:", error);
            return NextResponse.json({ success: false, error: error.message, debug }, { status: 500 });
        }

        debug.step = 'complete';
        return NextResponse.json({ success: true, data: insertData[0] });

    } catch (error: any) {
        debug.step = 'caught_error';
        debug.errorName = error?.name;
        debug.errorMessage = error?.message;
        debug.errorStatus = error?.status;
        debug.errorType = error?.type;
        debug.openaiError = error?.error;

        console.error("[DEBUG] Generate Story API Error:", JSON.stringify(debug, null, 2));
        console.error("[DEBUG] Full error:", error);

        // Return the full error message from OpenAI with debug info
        const errorMessage = error?.error?.message || error?.message || "Unknown error";
        const keyInfo = debug?.apiKeySuffix ? ` (Key ends with: ${debug.apiKeySuffix})` : '';

        return NextResponse.json({
            success: false,
            error: `${errorMessage}${keyInfo}`,
            debug
        }, { status: 500 });
    }
}
