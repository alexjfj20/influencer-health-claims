<script setup>
import { ref } from 'vue'
import { supabase } from '../../../services/supabaseClient'

const formData = ref({
  username: '',
  platform: 'instagram',
  fullName: '',
  claimText: '',
  sourceUrl: '',
  postedDate: ''
})

const platforms = ['instagram', 'tiktok', 'youtube', 'twitter']
const loading = ref(false)
const error = ref(null)
const success = ref(false)

const resetForm = () => {
  formData.value = {
    username: '',
    platform: 'instagram',
    fullName: '',
    claimText: '',
    sourceUrl: '',
    postedDate: ''
  }
  error.value = null
  success.value = false
}

const submitForm = async () => {
  try {
    loading.value = true
    error.value = null
    success.value = false

    // Validaciones
    if (!formData.value.username || !formData.value.claimText) {
      throw new Error('Por favor completa los campos requeridos')
    }

    // 1. Crear o actualizar el influencer
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .upsert({
        username: formData.value.username.toLowerCase(),
        platform: formData.value.platform,
        full_name: formData.value.fullName || null
      })
      .select()
      .single()

    if (influencerError) throw influencerError

    // 2. Crear el health claim
    const { data: claim, error: claimError } = await supabase
      .from('health_claims')
      .insert({
        influencer_id: influencer.id,
        claim_text: formData.value.claimText,
        source_url: formData.value.sourceUrl || null,
        posted_date: formData.value.postedDate || null
      })
      .select()
      .single()

    if (claimError) throw claimError

    success.value = true
    resetForm()
  } catch (err) {
    error.value = err.message
    console.error('Error al enviar el formulario:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-container">
    <h2>Add New Health Claim</h2>

    <form @submit.prevent="submitForm" class="claim-form">
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        ¡Claim agregado exitosamente!
      </div>

      <!-- Sección del Influencer -->
      <div class="form-section">
        <h3>Información del Influencer</h3>
        
        <div class="form-group">
          <label for="username">Username *</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="@username"
          >
        </div>

        <div class="form-group">
          <label for="platform">Platform *</label>
          <select id="platform" v-model="formData.platform" required>
            <option v-for="platform in platforms" :key="platform" :value="platform">
              {{ platform.charAt(0).toUpperCase() + platform.slice(1) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="fullName">Nombre Completo</label>
          <input
            id="fullName"
            v-model="formData.fullName"
            type="text"
            placeholder="Nombre completo del influencer"
          >
        </div>
      </div>

      <!-- Sección del Claim -->
      <div class="form-section">
        <h3>Información del Claim</h3>

        <div class="form-group">
          <label for="claimText">Claim Text *</label>
          <textarea
            id="claimText"
            v-model="formData.claimText"
            required
            rows="4"
            placeholder="Escribe aquí el claim de salud..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="sourceUrl">URL de la Fuente</label>
          <input
            id="sourceUrl"
            v-model="formData.sourceUrl"
            type="url"
            placeholder="https://..."
          >
        </div>

        <div class="form-group">
          <label for="postedDate">Fecha de Publicación</label>
          <input
            id="postedDate"
            v-model="formData.postedDate"
            type="datetime-local"
          >
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          @click="resetForm"
          class="secondary-button"
          :disabled="loading"
        >
          Limpiar
        </button>
        <button 
          type="submit"
          class="primary-button"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Guardar Claim' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
  font-size: 2rem;
}

.claim-form {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-section h3 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.primary-button,
.secondary-button {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: var(--primary-color-dark);
}

.secondary-button {
  background-color: white;
  color: var(--text-color);
  border: 1px solid #e5e7eb;
}

.secondary-button:hover {
  background-color: #f9fafb;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message,
.success-message {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  text-align: center;
}

.error-message {
  background-color: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }

  .claim-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
