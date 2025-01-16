<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const formData = ref({
  influencerName: '',
  platform: 'Instagram',
  claimText: '',
  sourceUrl: '',
  datePosted: new Date().toISOString().split('T')[0],
  category: 'Nutrition',
  evidenceLevel: 'pending'
})

const loading = ref(false)
const error = ref(null)
const success = ref(false)

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

const evidenceLevels = [
  { value: 'verified', label: 'Verified', color: '#10B981' },
  { value: 'pending', label: 'Pending Review', color: '#F59E0B' },
  { value: 'unverified', label: 'Unverified', color: '#EF4444' }
]

const submitClaim = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: supabaseError } = await supabase
      .from('health_claims')
      .insert([
        {
          influencer_name: formData.value.influencerName,
          platform: formData.value.platform,
          claim_text: formData.value.claimText,
          source_url: formData.value.sourceUrl,
          date_posted: formData.value.datePosted,
          category: formData.value.category,
          evidence_level: formData.value.evidenceLevel,
          created_at: new Date().toISOString()
        }
      ])

    if (supabaseError) throw supabaseError

    success.value = true
    resetForm()
    
  } catch (err) {
    error.value = err.message
    console.error('Error submitting claim:', err)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    influencerName: '',
    platform: 'Instagram',
    claimText: '',
    sourceUrl: '',
    datePosted: new Date().toISOString().split('T')[0],
    category: 'Nutrition',
    evidenceLevel: 'pending'
  }
  setTimeout(() => {
    success.value = false
  }, 3000)
}
</script>

<template>
  <div class="add-claim-container">
    <div class="form-header">
      <h2>Add New Health Claim</h2>
      <p class="subtitle">Submit a health claim made by an influencer for verification</p>
    </div>

    <form @submit.prevent="submitClaim" class="claim-form">
      <div class="form-grid">
        <!-- Influencer Information -->
        <div class="form-section">
          <h3>Influencer Details</h3>
          <div class="input-group">
            <label for="influencerName">Influencer Name</label>
            <input 
              id="influencerName"
              v-model="formData.influencerName"
              type="text"
              required
              placeholder="@username or full name"
            >
          </div>

          <div class="input-group">
            <label for="platform">Platform</label>
            <select 
              id="platform"
              v-model="formData.platform"
              required
            >
              <option 
                v-for="platform in platforms" 
                :key="platform.value"
                :value="platform.value"
              >
                {{ platform.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Claim Details -->
        <div class="form-section">
          <h3>Claim Information</h3>
          <div class="input-group">
            <label for="claimText">Claim Text</label>
            <textarea 
              id="claimText"
              v-model="formData.claimText"
              required
              placeholder="Enter the health claim exactly as stated"
              rows="4"
            ></textarea>
          </div>

          <div class="input-group">
            <label for="category">Category</label>
            <select 
              id="category"
              v-model="formData.category"
              required
            >
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

        <!-- Source & Verification -->
        <div class="form-section">
          <h3>Source & Verification</h3>
          <div class="input-group">
            <label for="sourceUrl">Source URL</label>
            <input 
              id="sourceUrl"
              v-model="formData.sourceUrl"
              type="url"
              placeholder="Link to the original post"
            >
          </div>

          <div class="input-group">
            <label for="datePosted">Date Posted</label>
            <input 
              id="datePosted"
              v-model="formData.datePosted"
              type="date"
              required
            >
          </div>

          <div class="input-group">
            <label for="evidenceLevel">Evidence Level</label>
            <select 
              id="evidenceLevel"
              v-model="formData.evidenceLevel"
              required
            >
              <option 
                v-for="level in evidenceLevels" 
                :key="level.value"
                :value="level.value"
              >
                {{ level.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Messages -->
      <div class="form-messages">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-if="success" class="success-message">
          Claim submitted successfully!
        </div>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="loading"
          class="submit-button"
        >
          {{ loading ? 'Submitting...' : 'Submit Claim' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.add-claim-container {
  background: #1a1c23;
  border-radius: 12px;
  padding: 2rem;
  color: #e2e8f0;
  max-width: 1200px;
  margin: 0 auto;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
}

.form-header h2 {
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

.claim-form {
  background: #2d3748;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.form-section {
  background: rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  border-radius: 8px;
}

.form-section h3 {
  color: #ffffff;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #4a5568;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  color: #e2e8f0;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #4a5568;
  border-radius: 6px;
  background: #1a1c23;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-messages {
  margin-bottom: 1.5rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #ef4444;
  margin-bottom: 1rem;
}

.success-message {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #10b981;
  margin-bottom: 1rem;
}

.form-actions {
  text-align: center;
}

.submit-button {
  background: #60a5fa;
  color: #ffffff;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: #3b82f6;
}

.submit-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .add-claim-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1rem;
  }
}
</style>
