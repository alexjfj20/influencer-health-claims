<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../../services/supabaseClient'

const influencers = ref([])
const loading = ref(true)
const error = ref(null)

const fetchInfluencers = async () => {
  try {
    loading.value = true
    const { data, error: supabaseError } = await supabase
      .from('influencers')
      .select('*')
      .order('trust_score', { ascending: false })
      .limit(10)

    if (supabaseError) throw supabaseError

    influencers.value = data
  } catch (err) {
    error.value = err.message
    console.error('Error al cargar influencers:', err)
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
  fetchInfluencers()
})
</script>

<template>
  <div class="leaderboard">
    <div class="leaderboard-header">
      <h2>Influencer Trust Leaderboard</h2>
      <p class="subtitle">Real-time rankings of health influencers based on scientific accuracy, credibility, and transparency.</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <span class="stat-value">{{ formatNumber(influencers.length) }}</span>
        <span class="stat-label">Active Influencers</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ formatNumber(influencers.reduce((sum, inf) => sum + inf.total_claims, 0)) }}</span>
        <span class="stat-label">Claims Verified</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ (influencers.reduce((sum, inf) => sum + inf.trust_score, 0) / influencers.length || 0).toFixed(1) }}%</span>
        <span class="stat-label">Average Trust Score</span>
      </div>
    </div>

    <div class="leaderboard-table">
      <div class="table-header">
        <div class="rank">Rank</div>
        <div class="influencer">Influencer</div>
        <div class="category">Category</div>
        <div class="trust-score">Trust Score</div>
        <div class="trend">Trend</div>
        <div class="followers">Followers</div>
        <div class="claims">Verified Claims</div>
      </div>

      <div v-if="loading" class="loading">
        Loading leaderboard...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div v-for="(influencer, index) in influencers" 
             :key="influencer.id" 
             class="table-row"
        >
          <div class="rank">#{{ index + 1 }}</div>
          <div class="influencer">
            <img :src="influencer.profile_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.username}`" 
                 :alt="influencer.full_name" 
                 class="avatar"
                 @error="e => e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${influencer.username}`"
            >
            <div class="influencer-info">
              <span class="name">{{ influencer.full_name || influencer.username }}</span>
              <span class="platform">{{ influencer.platform }}</span>
            </div>
          </div>
          <div class="category">{{ influencer.category || 'General' }}</div>
          <div class="trust-score">
            <div class="score-bar">
              <div class="score-fill" :style="{ width: `${influencer.trust_score}%` }"></div>
            </div>
            <span>{{ Math.round(influencer.trust_score) }}%</span>
          </div>
          <div class="trend">
            <span class="trend-up">↑</span>
          </div>
          <div class="followers">{{ formatNumber(influencer.follower_count) }}</div>
          <div class="claims">{{ influencer.verified_claims }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.leaderboard {
  background: #1a1c23;
  border-radius: 12px;
  padding: 2rem;
  color: #e2e8f0;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 2rem;
}

.leaderboard-header h2 {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.9rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
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

.leaderboard-table {
  background: #2d3748;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr 0.5fr 1fr 1fr;
  padding: 1rem;
  background: #4a5568;
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr 0.5fr 1fr 1fr;
  padding: 1rem;
  align-items: center;
  border-bottom: 1px solid #4a5568;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #3d4655;
}

.rank {
  font-weight: 600;
  color: #fff;
}

.influencer {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4a5568;
  object-fit: cover;
  border: 2px solid #2d3748;
}

.influencer-info {
  display: flex;
  flex-direction: column;
}

.name {
  color: #fff;
  font-weight: 500;
}

.platform {
  color: #94a3b8;
  font-size: 0.75rem;
}

.category {
  color: #94a3b8;
}

.trust-score {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-bar {
  flex: 1;
  height: 6px;
  background: #4a5568;
  border-radius: 3px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: #10b981;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.trend {
  color: #10b981;
  font-weight: bold;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.followers, .claims {
  color: #e2e8f0;
}

.loading, .error {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

@media (max-width: 1024px) {
  .leaderboard {
    padding: 1rem;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .table-header, .table-row {
    grid-template-columns: 0.5fr 2fr 1fr 1fr;
  }

  .trend, .followers, .claims {
    display: none;
  }
}
</style>
