const groqService = require('../services/groqService');
const { supabase } = require('../services/supabaseClient');

class AnalysisController {
    async analyzeClaim(req, res) {
        try {
            console.log('Analizando claim:', req.body);
            const { claimText } = req.body;

            if (!claimText) {
                return res.status(400).json({ error: 'El texto del claim es requerido' });
            }

            // Analizar el claim con GROQ
            console.log('Llamando a GROQ para análisis de claim:', claimText);
            const analysis = await groqService.analyzeClaim(claimText);
            console.log('Respuesta de GROQ:', analysis);

            // Si no hay influencerId, solo devolver el análisis
            if (!req.body.influencerId) {
                console.log('No hay influencerId, devolviendo solo análisis');
                return res.json({ success: true, analysis });
            }

            // Guardar el análisis en la base de datos
            console.log('Guardando análisis en Supabase');
            const { data: claimData, error: claimError } = await supabase
                .from('health_claims')
                .insert([
                    {
                        influencer_id: req.body.influencerId,
                        claim_text: claimText,
                        trust_score: analysis.truthScore || 0,
                        scientific_accuracy: analysis.truthScore || 0,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (claimError) {
                console.error('Error al guardar claim:', claimError);
                return res.json({ 
                    success: true, 
                    analysis,
                    warning: 'Error al guardar en base de datos: ' + claimError.message
                });
            }

            console.log('Claim guardado:', claimData);

            // Guardar la verificación detallada
            const verificationData = {
                claim_id: claimData.id,
                verification_status: analysis.truthScore >= 70 ? 'verified' : 'unverified',
                confidence_score: (analysis.truthScore || 0) / 100,
                verification_notes: JSON.stringify(analysis.verificationSteps || []),
                scientific_sources: {
                    required: analysis.requiredReferences || [],
                    category: analysis.category || 'Unknown',
                    risks: analysis.risks || []
                }
            };

            const { error: verificationError } = await supabase
                .from('claim_verifications')
                .insert([verificationData]);

            if (verificationError) {
                console.error('Error al guardar verificación:', verificationError);
                return res.json({ 
                    success: true, 
                    analysis,
                    claim: claimData,
                    warning: 'Error al guardar verificación: ' + verificationError.message
                });
            }

            console.log('Análisis completado exitosamente');
            res.json({
                success: true,
                analysis,
                claim: claimData
            });
        } catch (error) {
            console.error('Error en el análisis:', error);
            console.error('Stack trace:', error.stack);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            res.status(500).json({ 
                error: 'Error al analizar el claim',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                groqError: error.response ? error.response.data : undefined
            });
        }
    }

    async analyzeInfluencer(req, res) {
        try {
            console.log('Analizando influencer:', req.body);
            const { username, platform, posts } = req.body;

            if (!username || !platform || !posts) {
                return res.status(400).json({ error: 'Username, platform y posts son requeridos' });
            }

            // Analizar el influencer con GROQ
            console.log('Llamando a GROQ para análisis de influencer');
            const analysis = await groqService.analyzeInfluencer(posts);
            console.log('Respuesta de GROQ:', analysis);

            // Actualizar o crear el influencer en la base de datos
            console.log('Actualizando datos en Supabase');
            const { data: influencerData, error: updateError } = await supabase
                .from('influencers')
                .upsert([
                    {
                        username: username.replace('@', ''),
                        platform,
                        trust_score: analysis.evidenceBasedScore || 0,
                        updated_at: new Date().toISOString()
                    }
                ])
                .select();

            if (updateError) {
                console.error('Error al actualizar en Supabase:', updateError);
                return res.json({ 
                    success: true, 
                    analysis,
                    warning: 'Error al actualizar en base de datos: ' + updateError.message
                });
            }

            console.log('Influencer actualizado:', influencerData);
            res.json({
                success: true,
                analysis,
                influencer: influencerData[0]
            });
        } catch (error) {
            console.error('Error en el análisis del influencer:', error);
            console.error('Stack trace:', error.stack);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            res.status(500).json({ 
                error: 'Error al analizar el influencer',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                groqError: error.response ? error.response.data : undefined
            });
        }
    }
}

module.exports = new AnalysisController();
