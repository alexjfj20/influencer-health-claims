<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const claims = ref([])
const loading = ref(true)
const error = ref(null)

const mockClaims = [
  {
    id: 1,
    influencer_name: "Dr. Health Expert",
    platform: "Instagram",
    claim_text: "Green tea boosts metabolism by 4% and increases fat burning by up to 17%",
    verification_status: "Verified",
    confidence: 85,
    date: "2025-01-15",
    source_url: "https://example.com/study1",
    evidence: "Multiple clinical studies support this claim with minor variations in exact percentages."
  },
  {
    id: 2,
    influencer_name: "Fitness Coach Pro",
    platform: "Twitter",
    claim_text: "Intermittent fasting can reduce insulin resistance and lower the risk of type 2 diabetes",
    verification_status: "Pending",
    confidence: 75,
    date: "2025-01-14",
    source_url: "https://example.com/study2",
    evidence: "Preliminary research shows promising results, but more long-term studies are needed."
  },
  {
    id: 3,
    influencer_name: "Wellness Guru",
    platform: "Instagram",
    claim_text: "Drinking lemon water first thing in the morning detoxifies your liver",
    verification_status: "Unverified",
    confidence: 30,
    date: "2025-01-13",
    source_url: "https://example.com/study3",
    evidence: "No scientific evidence supports this specific claim about liver detoxification."
  }
]

const fetchClaims = async () => {
  try {
    loading.value = true
    claims.value = mockClaims
    console.log('Claims loaded:', claims.value)
  } catch (err) {
    error.value = err.message
    console.error('Error loading claims:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusColor = (status) => {
  const colors = {
    'Verified': '#10B981',
    'Pending': '#F59E0B',
    'Unverified': '#EF4444'
  }
  return colors[status] || '#94A3B8'
}

const getPlatformColor = (platform) => {
  const colors = {
    'Twitter': '#1DA1F2',
    'Instagram': '#E1306C',
    'TikTok': '#000000',
    'YouTube': '#FF0000'
  }
  return colors[platform] || '#94A3B8'
}

onMounted(() => {
  console.log('ResearchTask component mounted')
  fetchClaims()
})
</script>

<template>
  <div class="research-container">
    <div class="header">
      <h2>Health Claims Research</h2>
      <p class="subtitle">Analyzing and verifying health claims from social media influencers</p>
    </div>

    <div class="stats-bar">
      <div class="stat">
        <span class="stat-value">{{ claims.length }}</span>
        <span class="stat-label">Active Claims</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ claims.filter(c => c.verification_status === 'Verified').length }}</span>
        <span class="stat-label">Verified</span>
      </div>
      <div class="stat">
        <span class="stat-value">{{ claims.filter(c => c.verification_status === 'Pending').length }}</span>
        <span class="stat-label">Pending</span>
      </div>
    </div>

    <div class="claims-grid">
      <div v-if="loading" class="loading">
        Loading claims...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <template v-else>
        <div v-for="claim in claims" 
             :key="claim.id" 
             class="claim-card"
        >
          <div class="claim-header" :style="{ background: `linear-gradient(to right, ${getPlatformColor(claim.platform)}22, ${getPlatformColor(claim.platform)}11)` }">
            <div class="platform-badge" :style="{ background: getPlatformColor(claim.platform) }">
              {{ claim.platform }}
            </div>
            <div class="influencer-name">{{ claim.influencer_name }}</div>
          </div>
          
          <div class="claim-content">
            <p class="claim-text">{{ claim.claim_text }}</p>
            
            <div class="verification-section">
              <div class="verification-status" 
                   :style="{ background: `${getStatusColor(claim.verification_status)}22`, 
                           borderColor: getStatusColor(claim.verification_status) }">
                <span class="status-badge" :style="{ background: getStatusColor(claim.verification_status) }">
                  {{ claim.verification_status }}
                </span>
                <span v-if="claim.confidence" class="confidence">
                  {{ claim.confidence }}% Confidence
                </span>
              </div>
            </div>
            
            <div class="evidence-section">
              <p class="evidence-text">{{ claim.evidence }}</p>
            </div>
            
            <div class="claim-footer">
              <span class="date">{{ formatDate(claim.date) }}</span>
              <a v-if="claim.source_url" 
                 :href="claim.source_url" 
                 target="_blank" 
                 class="source-link">
                View Source
              </a>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.research-container {
  background: #1a1c23;
  border-radius: 12px;
  padding: 2rem;
  color: #e2e8f0;
  min-height: 100vh;
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

.claims-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.claim-card {
  background: #2d3748;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.claim-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
}

.platform-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
}

.influencer-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.claim-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.claim-text {
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.verification-section {
  margin: 1rem 0;
}

.verification-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
}

.confidence {
  color: #e2e8f0;
  font-size: 0.875rem;
}

.evidence-section {
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.evidence-text {
  color: #e2e8f0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.claim-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.date {
  color: #94a3b8;
  font-size: 0.875rem;
}

.source-link {
  color: #60a5fa;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.source-link:hover {
  text-decoration: underline;
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
  .research-container {
    padding: 1rem;
  }

  .stats-bar {
    grid-template-columns: 1fr;
  }

  .claims-grid {
    grid-template-columns: 1fr;
  }

  .claim-card {
    margin-bottom: 1rem;
  }
}
</style>
