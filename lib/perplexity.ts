/* eslint-disable @typescript-eslint/no-explicit-any */

export async function perplexitySearch(topic: string) {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
        throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
    }

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
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        return JSON.parse(content);
    } catch (e) {
        console.error("Failed to parse Perplexity JSON:", content);
        throw new Error("Perplexity returned invalid JSON format");
    }
}
