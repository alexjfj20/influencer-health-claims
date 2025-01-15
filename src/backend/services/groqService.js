const axios = require('axios');
require('dotenv').config();

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY no está configurada en las variables de entorno');
        }
        console.log('GROQ Service inicializado');
        
        this.baseURL = 'https://api.groq.com/openai/v1';
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async analyzeClaim(claimText) {
        try {
            console.log('Analizando claim con GROQ:', claimText);
            const prompt = `
                Analiza la siguiente afirmación de salud y proporciona un análisis detallado.
                
                Afirmación: "${claimText}"
                
                Proporciona tu análisis en el siguiente formato JSON:
                {
                    "truthScore": number (0-100),
                    "category": string (e.g., "Nutrición", "Ejercicio", "Bienestar"),
                    "risks": string[],
                    "verificationSteps": string[],
                    "requiredReferences": string[],
                    "analysis": string
                }
            `;

            const response = await this.client.post('/chat/completions', {
                model: "mixtral-8x7b-32768",
                messages: [
                    {
                        role: "system",
                        content: "Eres un experto en verificación de afirmaciones de salud. Tu trabajo es analizar claims y determinar su veracidad basándote en evidencia científica. Siempre respondes en formato JSON válido."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                top_p: 1,
                stream: false
            });

            console.log('Respuesta de GROQ:', response.data);

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('Respuesta inválida de GROQ');
            }

            const result = this.parseResponse(response.data.choices[0].message.content);
            console.log('Análisis parseado:', result);
            return result;

        } catch (error) {
            console.error('Error en GROQ service:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(`Error de GROQ API: ${error.response.data.error || error.message}`);
            }
            throw new Error(`Error al analizar con GROQ: ${error.message}`);
        }
    }

    async analyzeInfluencer(posts) {
        try {
            console.log('Analizando influencer con GROQ. Posts:', posts);
            const prompt = `
                Analiza los siguientes posts de un influencer de salud y proporciona un análisis detallado.
                
                Posts: ${JSON.stringify(posts)}
                
                Proporciona tu análisis en el siguiente formato JSON:
                {
                    "evidenceBasedScore": number (0-100),
                    "mainTopics": string[],
                    "riskLevel": string ("low", "medium", "high"),
                    "recommendations": string[],
                    "analysis": string
                }
            `;

            const response = await this.client.post('/chat/completions', {
                model: "mixtral-8x7b-32768",
                messages: [
                    {
                        role: "system",
                        content: "Eres un experto en análisis de contenido de salud en redes sociales. Tu trabajo es evaluar la calidad y veracidad del contenido compartido por influencers. Siempre respondes en formato JSON válido."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
                top_p: 1,
                stream: false
            });

            console.log('Respuesta de GROQ para influencer:', response.data);

            if (!response.data || !response.data.choices || !response.data.choices[0]) {
                throw new Error('Respuesta inválida de GROQ');
            }

            const result = this.parseResponse(response.data.choices[0].message.content);
            console.log('Análisis de influencer parseado:', result);
            return result;

        } catch (error) {
            console.error('Error en GROQ service (influencer):', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                throw new Error(`Error de GROQ API: ${error.response.data.error || error.message}`);
            }
            throw new Error(`Error al analizar influencer con GROQ: ${error.message}`);
        }
    }

    parseResponse(content) {
        try {
            console.log('Parseando respuesta:', content);
            let jsonContent = content;
            
            // Si la respuesta está envuelta en comillas o tiene caracteres especiales
            if (typeof content === 'string') {
                // Limpiar el string antes de parsearlo
                jsonContent = content.replace(/[\n\r]/g, ' ').trim();
                // Si empieza con ``` y termina con ```, remover esos caracteres
                if (jsonContent.startsWith('```json')) {
                    jsonContent = jsonContent.substring(7, jsonContent.length - 3);
                } else if (jsonContent.startsWith('```')) {
                    jsonContent = jsonContent.substring(3, jsonContent.length - 3);
                }
            }

            const parsed = JSON.parse(jsonContent);
            console.log('Respuesta parseada:', parsed);
            return parsed;
        } catch (error) {
            console.error('Error al parsear respuesta:', error);
            console.error('Contenido que causó el error:', content);
            throw new Error(`Error al parsear respuesta de GROQ: ${error.message}`);
        }
    }
}

module.exports = new GroqService();
