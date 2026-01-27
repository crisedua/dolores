'use server'

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { articleText, websiteUrl } = await request.json();

        if (!articleText) {
            return NextResponse.json({ success: false, error: 'Article text is required' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        // Debug: Log key info (only first few chars for security)
        console.log('API Key exists:', !!apiKey);
        console.log('API Key starts with:', apiKey?.substring(0, 10));
        console.log('API Key length:', apiKey?.length);

        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
        }

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

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are a helpful assistant that extracts structured data from text." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) {
            return NextResponse.json({ success: false, error: 'No content generated' }, { status: 500 });
        }

        const data = JSON.parse(content);

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
            console.error("Supabase Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: insertData[0] });

    } catch (error) {
        console.error("Generate Story API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
