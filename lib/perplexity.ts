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
                    - Busca en Reddit, foros, Hacker News y redes sociales.
                    - Busca frustraciones específicas, soluciones alternativas y declaraciones del tipo "Ojalá hubiera una manera de...".
                    - Encuentra al menos 10-15 puntos de dolor distintos y granulares.
                    
                    CRÍTICO: DEBES responder ÚNICAMENTE con un objeto JSON válido en ESPAÑOL. Sin otro texto.
                    
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
                                    "Cita directa o ejemplo parafraseado específico de un usuario (en español)",
                                    "Otro ejemplo específico (en español)..."
                                ],
                                "recommendation": "Breve idea de solución MVP (en español)"
                            }
                        ]
                    }`
                },
                {
                    role: "user",
                    content: `Tema: ${topic}`
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

        const content = data.choices[0].message.content;
        console.log('[Perplexity] Content preview:', content.substring(0, 200));

        try {
            const parsed = JSON.parse(content);
            console.log('[Perplexity] Successfully parsed JSON with', parsed.problems?.length || 0, 'problems');
            return parsed;
        } catch (e) {
            console.error("[Perplexity] Failed to parse JSON:", content);
            throw new Error("Perplexity returned invalid JSON format");
        }
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
