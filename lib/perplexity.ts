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
                                    { "text": "Cita directa en INGLÉS del usuario original", "url": "https://reddit.com/r/example/comments/abc123" },
                                    { "text": "Otra cita en INGLÉS...", "url": "https://reddit.com/r/example/comments/def456" }
                                ],
                                "recommendation": "Idea de solución MVP específica y accionable. Debe incluir: (1) Qué producto/servicio crear, (2) Cómo resuelve el problema específico, (3) Propuesta de valor clara. Ejemplo: 'Crear una plataforma SaaS con checklist automatizado de cumplimiento GDPR que mapea automáticamente datos sensibles y genera reportes de auditoría en un clic.' Máximo 2-3 oraciones en español."
                            }
                        ]
                    }
                    
                    IMPORTANTE: Cada cita debe incluir:
                    - "text": La cita exacta del usuario (en el idioma original, preferiblemente inglés)
                    - "url": El enlace directo al post o comentario de Reddit/foro donde apareció la cita
                    
                    Si no tienes la URL exacta para una cita, omítela de la lista de quotes.`
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
