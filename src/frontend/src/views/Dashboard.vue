<template>
  <div class="dashboard">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4">
        <h1 class="text-3xl font-bold text-gray-900">Influencer Health Claims Dashboard</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search for an influencer..."
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="searchInfluencer"
        />
      </div>

      <!-- Results Section -->
      <div v-if="currentInfluencer" class="bg-white shadow rounded-lg p-6">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold">{{ currentInfluencer.username }}</h2>
          <p class="text-gray-600">{{ currentInfluencer.platform }} • {{ currentInfluencer.follower_count }} followers</p>
        </div>

        <!-- Claims List -->
        <div class="space-y-4">
          <div v-for="claim in claims" :key="claim.id" class="border rounded-lg p-4">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-lg">{{ claim.claim_text }}</p>
                <p class="text-sm text-gray-500 mt-1">Posted: {{ formatDate(claim.posted_date) }}</p>
              </div>
              <div class="ml-4">
                <span
                  :class="getVerificationStatusClass(claim.verification_status)"
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                >
                  {{ claim.verification_status }}
                </span>
              </div>
            </div>
            <div v-if="claim.verification_notes" class="mt-2 text-sm text-gray-600">
              {{ claim.verification_notes }}
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
  name: 'Dashboard',
  setup() {
    const searchQuery = ref('');
    const currentInfluencer = ref(null);
    const claims = ref([]);
    const loading = ref(false);

    const searchInfluencer = async () => {
      if (!searchQuery.value) return;
      
      loading.value = true;
      try {
        const influencerResponse = await axios.get(`/api/influencers/${searchQuery.value}`);
        currentInfluencer.value = influencerResponse.data;

        const claimsResponse = await axios.get(`/api/influencers/${searchQuery.value}/claims`);
        claims.value = claimsResponse.data;
      } catch (error) {
        console.error('Error fetching data:', error);
        // TODO: Add error handling UI
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString();
    };

    const getVerificationStatusClass = (status) => {
      const classes = {
        verified: 'bg-green-100 text-green-800',
        false: 'bg-red-100 text-red-800',
        misleading: 'bg-yellow-100 text-yellow-800',
        unverified: 'bg-gray-100 text-gray-800'
      };
      return classes[status] || classes.unverified;
    };

    return {
      searchQuery,
      currentInfluencer,
      claims,
      loading,
      searchInfluencer,
      formatDate,
      getVerificationStatusClass
    };
  }
};
</script>
