import { createRouter, createWebHistory } from 'vue-router'
import InfluencerLeaderboard from '../components/InfluencerLeaderboard.vue'
import ResearchTask from '../components/ResearchTask.vue'
import InfluencerList from '../components/InfluencerList.vue'
import HealthClaimForm from '../components/HealthClaimForm.vue'

const routes = [
  {
    path: '/',
    name: 'leaderboard',
    component: InfluencerLeaderboard
  },
  {
    path: '/research',
    name: 'research',
    component: ResearchTask
  },
  {
    path: '/list',
    name: 'list',
    component: InfluencerList
  },
  {
    path: '/add',
    name: 'add',
    component: HealthClaimForm
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
