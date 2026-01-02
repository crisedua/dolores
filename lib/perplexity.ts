/* eslint-disable @typescript-eslint/no-explicit-any */

export async function perplexitySearch(topic: string) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
    }

    console.log('[Perplexity] Starting search for:', topic);
    console.log('[Perplexity] API Key preview:', `${apiKey.substring(0, 8)}...`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.error('[Perplexity] Request timed out after 90 seconds');
        controller.abort();
    }, 90000);

    try {
        const requestBody = {
            model: "sonar-pro",
            messages: [
                {
                    role: "system",
                    content: `Eres un Analista de Investigación de Mercado experto. Tu objetivo es encontrar quejas de clientes de alto interés, puntos de dolor y necesidades no satisfechas para un tema dado.
                    
                    INSTRUCCIONES DE BÚSQUEDA:
                    - PRIMERO: Si el tema está en español, tradúcelo mentalmente al inglés para buscar.
                    - Busca en Reddit, foros, Hacker News y redes sociales EN INGLÉS (hay más contenido).
                    - Busca frustraciones específicas, soluciones alternativas y declaraciones del tipo "I wish there was a way to...".
                    - Encuentra al menos 10-15 puntos de dolor distintos y granulares.
                    
                    CRÍTICO: Tu respuesta DEBE estar COMPLETAMENTE EN ESPAÑOL, pero busca contenido en inglés.
                    DEBES responder ÚNICAMENTE con un objeto JSON válido en ESPAÑOL. Sin otro texto.
                    
                    FORMATO DE SALIDA (SOLO JSON EN ESPAÑOL):
                    {
                        "problems": [
                            {
                                "id": "id-unico-en-kebab-case",
                                "rank": 1,
                                "type": "problem",
                                "title": "Título corto y contundente (3-6 palabras en español)",
                                "description": "2-3 oraciones explicando la frustración específica del usuario en detalle (en español)",
                                "signalScore": 9,
                                "metrics": {
                                    "frequency": 8,
                                    "intensity": 9,
                                    "solvability": 7,
                                    "monetizability": 6
                                },
                                "quotes": [
                                    "Cita directa en INGLÉS del usuario original",
                                    "Otra cita en INGLÉS..."
                                ],
                                "recommendation": "Breve idea de solución MVP (en español)"
                            }
                        ]
                    }`
                },
                {
                    role: "user",
                    content: `Tema a investigar: ${topic}

Si el tema está en español, tradúcelo al inglés para buscar contenido (hay más discusiones en inglés en Reddit/foros). Luego presenta todos tus hallazgos en español, excepto las citas originales que deben permanecer en inglés.`
                }
            ]
        };

        console.log('[Perplexity] Sending request...');

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('[Perplexity] Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Perplexity] API error response:', errorText);
            throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('[Perplexity] Response received, parsing content...');

        let content = data.choices[0].message.content;
        console.log('[Perplexity] Raw content preview:', content.substring(0, 300));

        // Multi-strategy JSON extraction
        const parseStrategies = [
            // Strategy 1: Direct parse
            () => {
                console.log('[Perplexity] Strategy 1: Direct parse');
                return JSON.parse(content);
            },

            // Strategy 2: Remove markdown code blocks
            () => {
                console.log('[Perplexity] Strategy 2: Remove markdown blocks');
                let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
                return JSON.parse(cleaned);
            },

            // Strategy 3: Extract JSON with greedy regex
            () => {
                console.log('[Perplexity] Strategy 3: Greedy regex extraction');
                const match = content.match(/\{[\s\S]*\}/);
                if (!match) throw new Error('No JSON found');
                return JSON.parse(match[0]);
            },

            // Strategy 4: Extract JSON with non-greedy regex
            () => {
                console.log('[Perplexity] Strategy 4: Non-greedy regex');
                const match = content.match(/\{[\s\S]*?\}\s*$/);
                if (!match) throw new Error('No JSON found');
                return JSON.parse(match[0]);
            },

            // Strategy 5: Find first { and last }
            () => {
                console.log('[Perplexity] Strategy 5: Bracket boundaries');
                const firstBrace = content.indexOf('{');
                const lastBrace = content.lastIndexOf('}');
                if (firstBrace === -1 || lastBrace === -1) throw new Error('No JSON boundaries');
                const extracted = content.substring(firstBrace, lastBrace + 1);
                return JSON.parse(extracted);
            }
        ];

        // Try each strategy
        for (let i = 0; i < parseStrategies.length; i++) {
            try {
                const parsed = parseStrategies[i]();
                console.log(`[Perplexity] ✓ Strategy ${i + 1} succeeded! Found ${parsed.problems?.length || 0} problems`);
                return parsed;
            } catch (e: any) {
                console.log(`[Perplexity] ✗ Strategy ${i + 1} failed:`, e.message);
            }
        }

        // All strategies failed
        console.error('[Perplexity] ❌ All parsing strategies failed!');
        console.error('[Perplexity] Response length:', content.length);
        console.error('[Perplexity] First 500 chars:', content.substring(0, 500));
        console.error('[Perplexity] Last 500 chars:', content.substring(Math.max(0, content.length - 500)));
        console.error('[Perplexity] Full content:', content);
        throw new Error(`Perplexity returned invalid JSON format. Response length: ${content.length} chars. See server logs for full response.`);
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error('[Perplexity] Request aborted due to timeout');
            throw new Error('Perplexity API request timed out after 90 seconds');
        }

        console.error('[Perplexity] Unexpected error:', error);
        throw error;
    }
}
