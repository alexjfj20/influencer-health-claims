-- Insertar datos de ejemplo para influencers
INSERT INTO public.influencers 
(username, platform, full_name, profile_image_url, follower_count, trust_score, verified_claims, total_claims, category)
VALUES
-- Influencers de Alta Confianza
('dr.mark.health', 'Instagram', 'Dr. Mark Johnson', 
'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
1200000, 92.5, 156, 170, 'Medicina'),
('nutrismith', 'YouTube', 'Sarah Smith, RD', 
'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop',
890000, 89.7, 203, 230, 'Nutrición'),
('dr.emma.science', 'Instagram', 'Dr. Emma Williams', 
'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
450000, 88.2, 98, 110, 'Medicina Deportiva'),
('healthcoach_mike', 'TikTok', 'Michael Brown', 
'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
2100000, 87.5, 145, 165, 'Fitness'),
('dr.nutrition.laura', 'Instagram', 'Laura García, PhD', 
'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
780000, 86.9, 167, 190, 'Nutrición'),

-- Influencers de Confianza Media
('fitness_pro_alex', 'YouTube', 'Alex Martinez', 
'https://images.unsplash.com/photo-1583468982228-19f19164aee3?w=400&h=400&fit=crop',
1500000, 75.8, 89, 120, 'Fitness'),
('wellness.maria', 'Instagram', 'María Rodríguez', 
'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
920000, 72.4, 78, 110, 'Bienestar'),
('health.tips.jenny', 'TikTok', 'Jennifer Wilson', 
'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop',
1800000, 68.9, 92, 140, 'Salud General'),
('coach.david.fit', 'Instagram', 'David Anderson', 
'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
650000, 65.3, 45, 75, 'Fitness'),
('natural.healing.ana', 'YouTube', 'Ana López', 
'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&h=400&fit=crop',
430000, 62.7, 56, 95, 'Medicina Natural');

-- Insertar algunos claims de ejemplo
INSERT INTO public.health_claims 
(influencer_id, claim_text, source_url, posted_date, trust_score, scientific_accuracy)
VALUES
-- Claims del Dr. Mark Johnson
((SELECT id FROM public.influencers WHERE username = 'dr.mark.health'),
'Un estudio reciente en el New England Journal of Medicine muestra que 30 minutos de ejercicio diario reduce el riesgo de enfermedades cardíacas en un 45%',
'https://example.com/study1',
'2024-12-15',
94.5,
92.0),

-- Claims de Sarah Smith
((SELECT id FROM public.influencers WHERE username = 'nutrismith'),
'La incorporación de proteínas vegetales puede reducir el riesgo de enfermedades cardiovasculares según estudios recientes',
'https://example.com/study2',
'2024-12-20',
91.2,
89.5),

-- Claims de Dr. Emma Williams
((SELECT id FROM public.influencers WHERE username = 'dr.emma.science'),
'El entrenamiento de fuerza dos veces por semana puede aumentar la densidad ósea en mujeres posmenopáusicas',
'https://example.com/study3',
'2024-12-25',
88.7,
87.3);

-- Insertar verificaciones de claims
INSERT INTO public.claim_verifications 
(claim_id, verification_status, confidence_score, verification_notes, scientific_sources)
VALUES
-- Verificación del claim del Dr. Mark
((SELECT id FROM public.health_claims WHERE influencer_id = (SELECT id FROM public.influencers WHERE username = 'dr.mark.health') LIMIT 1),
'Verificado',
0.95,
'Claim respaldado por múltiples estudios científicos y meta-análisis recientes',
'{"sources": ["New England Journal of Medicine 2024", "American Heart Association Guidelines 2024"]}'),

-- Verificación del claim de Sarah Smith
((SELECT id FROM public.health_claims WHERE influencer_id = (SELECT id FROM public.influencers WHERE username = 'nutrismith') LIMIT 1),
'Verificado',
0.92,
'Conclusiones respaldadas por estudios longitudinales y revisiones sistemáticas',
'{"sources": ["American Journal of Clinical Nutrition 2024", "European Heart Journal 2024"]}'),

-- Verificación del claim de Dr. Emma
((SELECT id FROM public.health_claims WHERE influencer_id = (SELECT id FROM public.influencers WHERE username = 'dr.emma.science') LIMIT 1),
'Verificado',
0.89,
'Evidencia respaldada por estudios clínicos controlados',
'{"sources": ["Journal of Bone and Mineral Research 2024", "Osteoporosis International 2024"]}');
