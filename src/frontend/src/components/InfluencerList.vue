<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const influencers = ref([])
const loading = ref(true)
const error = ref(null)

// Filtros
const searchQuery = ref('')
const platformFilter = ref('all')
const categoryFilter = ref('all')

const platforms = [
  { value: 'Instagram', label: 'Instagram', color: '#E1306C' },
  { value: 'Twitter', label: 'Twitter', color: '#1DA1F2' },
  { value: 'TikTok', label: 'TikTok', color: '#000000' },
  { value: 'YouTube', label: 'YouTube', color: '#FF0000' }
]

const categories = [
  { value: 'Nutrition', label: 'Nutrition & Diet' },
  { value: 'Fitness', label: 'Fitness & Exercise' },
  { value: 'Mental', label: 'Mental Health' },
  { value: 'Supplements', label: 'Supplements & Vitamins' },
  { value: 'Alternative', label: 'Alternative Medicine' },
  { value: 'Medical', label: 'Medical Advice' }
]

// Datos de ejemplo
const mockInfluencers = [
  {
    id: 1,
    username: '@healthexpert',
    full_name: 'Dr. Health Expert',
    platform: 'Instagram',
    category: 'Nutrition',
    follower_count: 150000,
    trust_score: 85,
    verified_claims: 45,
    total_claims: 50,
    profile_image: null,
    bio: 'Board-certified nutritionist sharing evidence-based health advice'
  },
  {
    id: 2,
    username: '@fitnesspro',
    full_name: 'Fitness Coach Pro',
    platform: 'Twitter',
    category: 'Fitness',
    follower_count: 250000,
    trust_score: 92,
    verified_claims: 78,
    total_claims: 85,
    profile_image: null,
    bio: 'Certified personal trainer | Sports nutritionist | Helping you achieve your fitness goals'
  },
  {
    id: 3,
    username: '@wellnessguru',
    full_name: 'Wellness Guru',
    platform: 'Instagram',
    category: 'Alternative',
    follower_count: 180000,
    trust_score: 78,
    verified_claims: 34,
    total_claims: 45,
    profile_image: null,
    bio: 'Holistic wellness expert | Natural healing advocate | Mindful living'
  }
]

const filteredInfluencers = computed(() => {
  return influencers.value
    .filter(influencer => {
      const matchesSearch = 
        influencer.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        influencer.full_name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesPlatform = platformFilter.value === 'all' || influencer.platform === platformFilter.value
      const matchesCategory = categoryFilter.value === 'all' || influencer.category === categoryFilter.value
      return matchesSearch && matchesPlatform && matchesCategory
    })
    .sort((a, b) => b.trust_score - a.trust_score)
})

const fetchInfluencers = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Usar datos de ejemplo por ahora
    influencers.value = mockInfluencers
    console.log('Influencers loaded:', influencers.value)
    
  } catch (err) {
    error.value = err.message
    console.error('Error loading influencers:', err)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num
}

onMounted(() => {
  console.log('InfluencerList component mounted')
  fetchInfluencers()
})
</script>

<template>
  <div class="influencers-container">
    <div class="header">
      <h2>Influencer Directory</h2>
      <p class="subtitle">Browse and analyze health & wellness influencers</p>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Search by name or username..."
          class="search-input"
        >
      </div>

      <div class="filter-controls">
        <select v-model="platformFilter" class="filter-select">
          <option value="all">All Platforms</option>
          <option 
            v-for="platform in platforms" 
            :key="platform.value" 
            :value="platform.value"
          >
            {{ platform.label }}
          </option>
        </select>

        <select v-model="categoryFilter" class="filter-select">
          <option value="all">All Categories</option>
          <option 
            v-for="category in categories" 
            :key="category.value" 
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ formatNumber(influencers.length) }}</span>
        <span class="stat-label">Total Influencers</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ formatNumber(influencers.reduce((sum, inf) => sum + inf.follower_count, 0)) }}</span>
        <span class="stat-label">Total Reach</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ (influencers.reduce((sum, inf) => sum + inf.trust_score, 0) / (influencers.length || 1)).toFixed(1) }}%</span>
        <span class="stat-label">Avg Trust Score</span>
      </div>
    </div>

    <div class="influencers-grid">
      <div v-if="loading" class="loading">
        Loading influencers...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div v-for="influencer in filteredInfluencers" 
             :key="influencer.id" 
             class="influencer-card"
        >
          <div class="card-header">
            <img 
              :src="influencer.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.username}`" 
              :alt="influencer.full_name"
              class="profile-image"
            >
            <div class="platform-badge" :style="{ background: platforms.find(p => p.value === influencer.platform)?.color }">
              {{ influencer.platform }}
            </div>
          </div>

          <div class="card-content">
            <h3 class="influencer-name">{{ influencer.full_name }}</h3>
            <p class="username">{{ influencer.username }}</p>
            <p class="bio">{{ influencer.bio }}</p>

            <div class="metrics">
              <div class="metric">
                <span class="metric-value">{{ formatNumber(influencer.follower_count) }}</span>
                <span class="metric-label">Followers</span>
              </div>
              <div class="metric">
                <span class="metric-value">{{ influencer.trust_score }}%</span>
                <span class="metric-label">Trust Score</span>
              </div>
              <div class="metric">
                <span class="metric-value">{{ influencer.verified_claims }}/{{ influencer.total_claims }}</span>
                <span class="metric-label">Verified Claims</span>
              </div>
            </div>

            <div class="category-tag">
              {{ influencer.category }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.influencers-container {
  background: #1a1c23;
  border-radius: 12px;
  padding: 2rem;
  color: #e2e8f0;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
}

.header h2 {
  font-size: 2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.subtitle {
  color: #e2e8f0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.filters-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #2d3748;
  padding: 1.5rem;
  border-radius: 8px;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 6px;
  background: #1a1c23;
  color: #ffffff;
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 6px;
  background: #1a1c23;
  color: #ffffff;
  font-size: 1rem;
  min-width: 150px;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat {
  background: #2d3748;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.influencers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.influencer-card {
  background: #2d3748;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  position: relative;
  padding: 1.5rem;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
  text-align: center;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.platform-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
}

.card-content {
  padding: 1.5rem;
}

.influencer-name {
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.username {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.bio {
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.metric {
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
}

.metric-label {
  font-size: 0.75rem;
  color: #94a3b8;
}

.category-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #4a5568;
  color: #ffffff;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.loading, .error {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #94a3b8;
  font-size: 1.1rem;
}

.error {
  color: #ef4444;
}

@media (max-width: 768px) {
  .influencers-container {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-controls {
    flex-direction: column;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .influencers-grid {
    grid-template-columns: 1fr;
  }
}
</style>
