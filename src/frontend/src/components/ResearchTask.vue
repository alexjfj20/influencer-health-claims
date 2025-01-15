<script setup>
import { ref, computed } from 'vue'
import { supabase } from '../../../services/supabaseClient'
import { useI18n } from 'vue-i18n'

const API_URL = 'http://localhost:3001';

const { t } = useI18n()

const influencerUsername = ref('')
const timeRange = ref('last_month')
const includeAnalysis = ref(true)
const selectedPlatforms = ref(['Instagram', 'TikTok', 'YouTube'])
const isLoading = ref(false)
const researchResults = ref(null)
const error = ref(null)

const timeRangeOptions = [
  { value: 'last_week', label: t('research.timeRange.lastWeek') },
  { value: 'last_month', label: t('research.timeRange.lastMonth') },
  { value: 'last_3months', label: t('research.timeRange.last3Months') },
  { value: 'all_time', label: t('research.timeRange.allTime') }
]

const platformOptions = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter' }
]

const scientificSources = [
  { id: 'pubmed', name: 'PubMed Central' },
  { id: 'nejm', name: 'New England Journal of Medicine' },
  { id: 'nature', name: 'Nature' },
  { id: 'science', name: 'Science' },
  { id: 'lancet', name: 'The Lancet' }
]

const isValid = computed(() => {
  return influencerUsername.value.trim() !== '' && selectedPlatforms.value.length > 0
})

const startResearch = async () => {
  if (!isValid.value) return;
  
  try {
    console.log('Iniciando investigación para:', influencerUsername.value);
    isLoading.value = true;
    error.value = null;
    
    // 1. Buscar información del influencer
    const influencerData = await fetchInfluencerData();
    console.log('Datos del influencer obtenidos:', influencerData);
    
    // 2. Recopilar claims recientes
    const claims = await fetchRecentClaims();
    console.log('Claims recopilados:', claims);
    
    // 3. Analizar claims con GROQ
    console.log('Iniciando análisis de claims con GROQ');
    const analyzedClaims = await Promise.all(
      claims.map(async claim => {
        try {
          console.log('Analizando claim:', claim.text);
          const response = await fetch(`${API_URL}/api/analysis/claim`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              claimText: claim.text,
              influencerId: influencerData.id
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al analizar claim');
          }
          
          const result = await response.json();
          console.log('Resultado del análisis:', result);
          return {
            ...claim,
            analysis: result.analysis
          };
        } catch (err) {
          console.error('Error al analizar claim:', err);
          throw new Error(`Error al analizar claim: ${err.message}`);
        }
      })
    );
    
    // 4. Analizar perfil completo del influencer
    console.log('Analizando perfil completo del influencer');
    const influencerResponse = await fetch(`${API_URL}/api/analysis/influencer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: influencerUsername.value,
        platform: selectedPlatforms.value[0],
        posts: claims
      })
    });
    
    if (!influencerResponse.ok) {
      const errorData = await influencerResponse.json();
      throw new Error(errorData.error || 'Error al analizar influencer');
    }
    
    const influencerAnalysis = await influencerResponse.json();
    console.log('Análisis del influencer completado:', influencerAnalysis);
    
    // 5. Actualizar resultados
    researchResults.value = {
      influencer: {
        ...influencerData,
        analysis: influencerAnalysis
      },
      claims: analyzedClaims,
      metrics: {
        trustScore: influencerAnalysis.analysis.evidenceBasedScore,
        verifiedClaims: analyzedClaims.filter(c => c.analysis.truthScore >= 70).length,
        totalClaims: analyzedClaims.length,
        averageAccuracy: analyzedClaims.reduce((acc, c) => acc + c.analysis.truthScore, 0) / analyzedClaims.length
      }
    };
    
    console.log('Investigación completada:', researchResults.value);
    
  } catch (err) {
    error.value = err.message;
    console.error('Error en la investigación:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchInfluencerData = async () => {
  try {
    // Limpiar el nombre de usuario (quitar @)
    const cleanUsername = influencerUsername.value.replace('@', '');
    console.log('Buscando datos para:', cleanUsername);
    
    // Primero buscar en nuestra base de datos
    const { data: existingInfluencer, error: dbError } = await supabase
      .from('influencers')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Error de base de datos:', dbError);
      throw dbError;
    }

    if (existingInfluencer) {
      console.log('Influencer encontrado en DB:', existingInfluencer);
      return existingInfluencer;
    }

    console.log('Influencer no encontrado, creando nuevo registro');
    // Si no existe, crear un nuevo registro
    const newInfluencer = {
      username: cleanUsername,
      platform: selectedPlatforms.value[0],
      full_name: cleanUsername,
      created_at: new Date().toISOString(),
      trust_score: 0,
      total_claims: 0
    };

    const { data: insertedInfluencer, error: insertError } = await supabase
      .from('influencers')
      .insert([newInfluencer])
      .select()
      .single();

    if (insertError) {
      console.error('Error al insertar:', insertError);
      throw insertError;
    }

    console.log('Nuevo influencer creado:', insertedInfluencer);
    return insertedInfluencer;

  } catch (error) {
    console.error('Error al buscar/crear influencer:', error);
    if (error.code === 'PGRST116') {
      // Intentar crear nuevo registro si no se encuentra
      return await createNewInfluencer();
    }
    throw new Error(`Error al obtener datos del influencer: ${error.message}`);
  }
};

const createNewInfluencer = async () => {
  const cleanUsername = influencerUsername.value.replace('@', '');
  const newInfluencer = {
    username: cleanUsername,
    platform: selectedPlatforms.value[0],
    full_name: cleanUsername,
    created_at: new Date().toISOString(),
    trust_score: 0,
    total_claims: 0
  };

  const { data, error } = await supabase
    .from('influencers')
    .insert([newInfluencer])
    .select()
    .single();

  if (error) {
    console.error('Error al crear nuevo influencer:', error);
    throw error;
  }

  return data;
};

const fetchRecentClaims = async () => {
  try {
    // Simular obtención de claims recientes
    // En una implementación real, esto vendría de la API de la red social
    const mockClaims = [
      {
        text: "Los suplementos de colágeno mejoran la piel y el cabello",
        url: "https://instagram.com/p/example1",
        date: new Date().toISOString()
      },
      {
        text: "El té verde acelera el metabolismo",
        url: "https://instagram.com/p/example2",
        date: new Date().toISOString()
      },
      {
        text: "La vitamina C fortalece el sistema inmune",
        url: "https://instagram.com/p/example3",
        date: new Date().toISOString()
      }
    ];

    console.log('Claims obtenidos:', mockClaims);
    return mockClaims;
  } catch (error) {
    console.error('Error al obtener claims:', error);
    throw new Error(`Error al obtener claims recientes: ${error.message}`);
  }
};

const saveResults = async (influencer, claims, metrics) => {
  // Guardar en Supabase
  const { data, error } = await supabase
    .from('influencers')
    .upsert([
      {
        username: influencer.username,
        platform: influencer.platforms[0],
        follower_count: influencer.followerCount,
        trust_score: metrics.trustScore,
        verified_claims: metrics.verifiedClaims,
        total_claims: metrics.totalClaims
      }
    ])
    
  if (error) throw error
  return data
}
</script>

<template>
  <div class="research-task">
    <div class="research-header">
      <h2>{{ t('research.title') }}</h2>
      <p class="subtitle">{{ t('research.subtitle') }}</p>
    </div>

    <div class="research-form">
      <div class="form-group">
        <label>{{ t('research.influencerUsername') }}</label>
        <input 
          v-model="influencerUsername"
          type="text"
          :placeholder="t('research.searchPlaceholder')"
          :disabled="isLoading"
        >
      </div>

      <div class="form-group">
        <label>{{ t('research.platforms') }}</label>
        <div class="platforms-grid">
          <label 
            v-for="platform in platformOptions" 
            :key="platform.value"
            class="platform-option"
          >
            <input
              type="checkbox"
              v-model="selectedPlatforms"
              :value="platform.value"
              :disabled="isLoading"
            >
            <span>{{ platform.label }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label>{{ t('research.timeRange') }}</label>
        <select 
          v-model="timeRange"
          :disabled="isLoading"
        >
          <option 
            v-for="option in timeRangeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input 
            type="checkbox"
            v-model="includeAnalysis"
            :disabled="isLoading"
          >
          <span>{{ t('research.includeAnalysis') }}</span>
        </label>
      </div>

      <div class="scientific-sources">
        <h3>{{ t('research.scientificSources') }}</h3>
        <div class="sources-grid">
          <div 
            v-for="source in scientificSources"
            :key="source.id"
            class="source-item"
          >
            <span class="source-name">{{ source.name }}</span>
            <span class="source-status">{{ t('research.sourceStatus') }}</span>
          </div>
        </div>
      </div>

      <button 
        @click="startResearch"
        :disabled="!isValid || isLoading"
        class="start-research-btn"
      >
        <span v-if="!isLoading">{{ t('research.startButton') }}</span>
        <span v-else>{{ t('common.loading') }}</span>
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ t('common.error') }}: {{ error }}
    </div>

    <div v-if="isLoading" class="research-progress">
      <div class="progress-steps">
        <div class="step">
          <span class="step-number">1</span>
          <span class="step-label">{{ t('research.step1') }}</span>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <span class="step-label">{{ t('research.step2') }}</span>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <span class="step-label">{{ t('research.step3') }}</span>
        </div>
        <div class="step">
          <span class="step-number">4</span>
          <span class="step-label">{{ t('research.step4') }}</span>
        </div>
      </div>
    </div>

    <div v-if="researchResults" class="research-results">
      <h3>{{ t('research.results.title') }}</h3>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <span class="metric-value">{{ (researchResults.metrics?.trustScore || 0).toFixed(1) }}%</span>
          <span class="metric-label">{{ t('research.results.trustScore') }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ researchResults.metrics?.verifiedClaims || 0 }}</span>
          <span class="metric-label">{{ t('research.results.verifiedClaims') }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ (researchResults.metrics?.averageAccuracy || 0).toFixed(1) }}%</span>
          <span class="metric-label">{{ t('research.results.averageAccuracy') }}</span>
        </div>
      </div>

      <div class="claims-list">
        <h4>{{ t('research.results.claims') }}</h4>
        <div 
          v-for="(claim, index) in researchResults.claims"
          :key="index"
          class="claim-item"
        >
          <div class="claim-content">
            <p class="claim-text">{{ claim.text }}</p>
            <a :href="claim.url" target="_blank" class="claim-source">{{ t('research.results.claimSource') }}</a>
          </div>
          <div class="claim-verification">
            <span 
              :class="['verification-status', claim.analysis.truthScore >= 70 ? 'verified' : 'unverified']"
            >
              {{ claim.analysis.truthScore >= 70 ? t('research.results.verified') : t('research.results.unverified') }}
            </span>
            <div class="evidence-bar">
              <div 
                class="evidence-fill"
                :style="{ width: `${claim.analysis.truthScore}%` }"
              ></div>
            </div>
            <span class="evidence-score">
              {{ claim.analysis.truthScore.toFixed(1) }}% {{ t('research.results.evidence') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.research-task {
  background: #1a1c23;
  border-radius: 12px;
  padding: 2rem;
  color: #e2e8f0;
}

.research-header {
  text-align: center;
  margin-bottom: 2rem;
}

.research-header h2 {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.research-form {
  background: #2d3748;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #e2e8f0;
  font-weight: 500;
}

input[type="text"],
select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #4a5568;
  background: #1a202c;
  color: #e2e8f0;
  font-size: 1rem;
}

input[type="text"]:focus,
select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.platforms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.platform-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.scientific-sources {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #4a5568;
}

.scientific-sources h3 {
  color: #e2e8f0;
  margin-bottom: 1rem;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.source-item {
  background: #1a202c;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.source-status {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.start-research-btn {
  width: 100%;
  padding: 1rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-research-btn:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.start-research-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.research-progress {
  margin: 2rem 0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 2rem 0;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: #4a5568;
  z-index: 1;
}

.step {
  position: relative;
  z-index: 2;
  background: #1a1c23;
  padding: 0 1rem;
  text-align: center;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  margin: 0 auto 0.5rem;
}

.step-label {
  font-size: 0.875rem;
  color: #94a3b8;
}

.research-results {
  margin-top: 2rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.metric-card {
  background: #2d3748;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.metric-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.claims-list {
  margin-top: 2rem;
}

.claim-item {
  background: #2d3748;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.claim-content {
  margin-bottom: 1rem;
}

.claim-text {
  color: #e2e8f0;
  margin-bottom: 0.5rem;
}

.claim-source {
  color: var(--primary-color);
  font-size: 0.875rem;
  text-decoration: none;
}

.claim-verification {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.verification-status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.verification-status.verified {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.verification-status.unverified {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.evidence-bar {
  flex: 1;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.evidence-fill {
  height: 100%;
  background: var(--primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.evidence-score {
  font-size: 0.875rem;
  color: #94a3b8;
  min-width: 100px;
  text-align: right;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .research-task {
    padding: 1rem;
  }

  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }

  .progress-steps::before {
    display: none;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .claim-verification {
    flex-direction: column;
    align-items: flex-start;
  }

  .evidence-score {
    text-align: left;
  }
}
</style>
