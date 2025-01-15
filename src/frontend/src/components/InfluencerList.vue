<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../../services/supabaseClient'

const claims = ref([])
const loading = ref(true)
const error = ref(null)
const testStatus = ref('')

// Filtros
const searchQuery = ref('')
const platformFilter = ref('all')
const statusFilter = ref('all')
const platforms = ref(['instagram', 'tiktok', 'youtube', 'twitter'])
const statuses = ref(['pending', 'verified', 'false', 'misleading'])

// Ordenamiento
const sortBy = ref('date') // 'date' o 'status'
const sortOrder = ref('desc') // 'asc' o 'desc'

const filteredClaims = computed(() => {
  return claims.value
    .filter(claim => {
      const matchesSearch = claim.claim_text.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          claim.influencer_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesPlatform = platformFilter.value === 'all' || claim.platform === platformFilter.value
      const matchesStatus = statusFilter.value === 'all' || claim.verification_status === statusFilter.value
      return matchesSearch && matchesPlatform && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy.value === 'date') {
        return sortOrder.value === 'desc' 
          ? new Date(b.created_at) - new Date(a.created_at)
          : new Date(a.created_at) - new Date(b.created_at)
      } else {
        return sortOrder.value === 'desc'
          ? b.verification_status.localeCompare(a.verification_status)
          : a.verification_status.localeCompare(b.verification_status)
      }
    })
})

const fetchClaims = async () => {
  try {
    loading.value = true
    const { data, error: supabaseError } = await supabase
      .from('health_claims')
      .select(`
        *,
        influencers:influencer_id (username, full_name, platform),
        claim_verifications (verification_status, verification_notes, confidence_score)
      `)
      .order('created_at', { ascending: false })

    if (supabaseError) {
      error.value = `Error al cargar las reclamaciones: ${supabaseError.message}`
      console.error('Error detallado:', supabaseError)
      return
    }

    if (data && data.length > 0) {
      claims.value = data.map(claim => ({
        id: claim.id,
        influencer_name: claim.influencers?.full_name || claim.influencers?.username || 'Unknown',
        platform: claim.influencers?.platform || 'Unknown',
        claim_text: claim.claim_text,
        source_url: claim.source_url,
        verification_status: claim.claim_verifications?.[0]?.verification_status || 'pending',
        verification_notes: claim.claim_verifications?.[0]?.verification_notes || '',
        confidence_score: claim.claim_verifications?.[0]?.confidence_score || 0,
        created_at: claim.created_at
      }))
      testStatus.value = '✅ Conexión exitosa: Base de datos funcionando correctamente'
    } else {
      claims.value = []
      testStatus.value = '✅ Conexión exitosa: No hay reclamaciones todavía'
    }
  } catch (err) {
    error.value = `Error al cargar las reclamaciones: ${err.message}`
    console.error('Error detallado:', err)
    testStatus.value = '❌ Error al cargar los datos'
  } finally {
    loading.value = false
  }
}

const deleteClaim = async (claimId) => {
  try {
    const { error: deleteError } = await supabase
      .from('health_claims')
      .delete()
      .eq('id', claimId)

    if (deleteError) throw deleteError

    claims.value = claims.value.filter(claim => claim.id !== claimId)
  } catch (err) {
    console.error('Error al eliminar:', err)
    alert('Error al eliminar la reclamación')
  }
}

onMounted(() => {
  fetchClaims()
})
</script>

<template>
  <div class="claims-container">
    <h2>Health Claims</h2>
    
    <div v-if="testStatus" :class="['test-status', testStatus.includes('✅') ? 'success' : 'error']">
      {{ testStatus }}
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Buscar por influencer o contenido..."
          class="search-input"
        >
      </div>

      <div class="filter-controls">
        <select v-model="platformFilter" class="filter-select">
          <option value="all">Todas las plataformas</option>
          <option v-for="platform in platforms" :key="platform" :value="platform">
            {{ platform.charAt(0).toUpperCase() + platform.slice(1) }}
          </option>
        </select>

        <select v-model="statusFilter" class="filter-select">
          <option value="all">Todos los estados</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="date">Ordenar por fecha</option>
          <option value="status">Ordenar por estado</option>
        </select>

        <button 
          @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
          class="sort-button"
        >
          {{ sortOrder === 'asc' ? '↑' : '↓' }}
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Cargando reclamaciones...</p>
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="claims.length === 0" class="no-claims">
      No health claims found. Add some claims to get started!
    </div>
    
    <div v-else class="claims-grid">
      <div v-for="claim in filteredClaims" :key="claim.id" class="claim-card">
        <div class="claim-header">
          <div class="influencer-info">
            <h3>{{ claim.influencer_name }}</h3>
            <span class="platform-badge">{{ claim.platform }}</span>
          </div>
          <button @click="deleteClaim(claim.id)" class="delete-button">
            ×
          </button>
        </div>
        
        <div class="claim-content">
          <p class="claim-text">{{ claim.claim_text }}</p>
          <a v-if="claim.source_url" :href="claim.source_url" target="_blank" class="source-link">
            Ver fuente original
          </a>
          
          <div class="verification-info">
            <div :class="['verification-status', claim.verification_status]">
              {{ claim.verification_status }}
              <span v-if="claim.confidence_score" class="confidence-score">
                ({{ Math.round(claim.confidence_score * 100) }}% confianza)
              </span>
            </div>
            <p v-if="claim.verification_notes" class="verification-notes">
              {{ claim.verification_notes }}
            </p>
          </div>

          <div class="claim-meta">
            <span class="claim-date">
              {{ new Date(claim.created_at).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.claims-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
}

.filters-section {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background-color: white;
  min-width: 150px;
}

.sort-button {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background-color: white;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.claims-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.claim-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.claim-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.claim-header {
  padding: 1rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.influencer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.influencer-info h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.platform-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.delete-button {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius);
  transition: background-color 0.2s;
}

.delete-button:hover {
  background-color: #fee2e2;
}

.claim-content {
  padding: 1rem;
}

.claim-text {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-color);
}

.source-link {
  display: inline-block;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.source-link:hover {
  text-decoration: underline;
}

.verification-info {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8fafc;
  border-radius: var(--border-radius);
}

.verification-status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  text-transform: capitalize;
  margin-bottom: 0.5rem;
}

.confidence-score {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.8;
}

.verification-notes {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.verification-status.verified {
  background-color: #d1fae5;
  color: #065f46;
}

.verification-status.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.verification-status.false {
  background-color: #fee2e2;
  color: #991b1b;
}

.verification-status.misleading {
  background-color: #fde68a;
  color: #92400e;
}

.claim-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.claim-date {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .claims-container {
    padding: 1rem;
  }

  .filter-controls {
    flex-direction: column;
  }

  .filter-select, .sort-button {
    width: 100%;
  }
}
</style>
