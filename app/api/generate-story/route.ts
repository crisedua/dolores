

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

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
      You are an expert editor. You have been given the raw text of a business success story.
      
      CRITICAL INSTRUCTION: The FIRST LINE of the input text is the LICENSE/TITLE of the article. 
      1. Use this EXACT first line as the "title". Do not change it.
      2. Extract the "revenue" (e.g. "$40k/Month", "$1M ARR") specifically from this title if present. If not in the title, look for it in the first paragraph.
      
      Please extract:
      1. Title: The exact first line of the text.
      2. Revenue: Short string indicating how much they make (e.g. "$5k/mo", "$1M/year"). If unknown, use "N/A".
      3. Startup Costs: Approximate cost to start the business (e.g. "$100", "$2k"). If not found, use "N/A".
      4. Website: The URL of the business or application mentioned in the text (e.g. "https://saas.com"). If not found, use "N/A".
      5. Summary: A concise summary IN SPANISH (2-3 sentences max) of the business and how they achieved success.
      6. Steps: A list of "Key Takeaways" or "Growth Tactics" IN SPANISH (array of strings, max 5 items).
      
      Input Text:
      "${articleText.substring(0, 15000)}"

      Return JSON format:
      {
        "title": "...",
        "revenue": "...",
        "startup_costs": "...",
        "website": "...",
        "summary": "...",
        "steps": ["Paso 1...", "Paso 2..."]
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

        // Use Service Role Key to bypass RLS policies
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing. Please add it to your environment variables to bypass RLS.");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Save to Supabase using admin client
        const { data: insertData, error } = await supabaseAdmin
            .from('success_stories')
            .insert([
                {
                    title: data.title,
                    revenue: data.revenue || null,
                    startup_costs: data.startup_costs || null,
                    summary: data.summary,
                    steps: data.steps,
                    article_content: articleText,
                    website_url: websiteUrl || (data.website !== 'N/A' ? data.website : null)
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
