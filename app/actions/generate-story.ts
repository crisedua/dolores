'use server'

import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function generateAndSaveStory(articleText: string, websiteUrl: string) {
    try {
        if (!articleText) {
            return { success: false, error: 'Article text is required' };
        }

        // 1. Process with OpenAI
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
        if (!content) throw new Error("No content generated");

        const data = JSON.parse(content);

        // 2. Save to Supabase
        // Note: In server actions we can use the admin client if we had one, 
        // but here we are using the standard client. 
        // Ideally, we should check if the user is authenticated/admin before this.

        // For now, simpler implementation:
        const { data: insertData, error } = await supabase
            .from('success_stories')
            .insert([
                {
                    title: data.title,
                    summary: data.summary,
                    steps: data.steps, // JSONB
                    article_content: articleText,
                    website_url: websiteUrl
                }
            ])
            .select();

        if (error) {
            console.error("Supabase Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data: insertData[0] };

    } catch (error) {
        console.error("Generate Story Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}
