<script setup>
import { useI18n } from 'vue-i18n'
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <nav class="nav-menu">
        <router-link 
          to="/" 
          class="nav-link"
          active-class="active"
        >
          {{ t('nav.leaderboard') }}
        </router-link>
        <router-link 
          to="/research" 
          class="nav-link"
          active-class="active"
        >
          {{ t('nav.research') }}
        </router-link>
        <router-link 
          to="/list" 
          class="nav-link"
          active-class="active"
        >
          {{ t('nav.list') }}
        </router-link>
        <router-link 
          to="/add" 
          class="nav-link"
          active-class="active"
        >
          {{ t('nav.add') }}
        </router-link>
      </nav>
      <div class="settings-menu">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #10b981;
  --primary-color-dark: #059669;
  --primary-color-rgb: 16, 185, 129;
  --secondary-color: #4a5568;
  --text-color: #e2e8f0;
  --border-radius: 0.5rem;
  --max-width: 1200px;
  --background-color: #111827;
  --card-background: #1f2937;
  --border-color: #374151;
  --hover-color: #374151;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
               "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  color: var(--text-color);
  background-color: var(--background-color);
}

.app-container {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-header {
  background-color: var(--card-background);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.nav-menu {
  display: flex;
  gap: 1rem;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: var(--hover-color);
}

.nav-link.active {
  color: var(--primary-color);
  background-color: var(--primary-color-light);
  font-weight: 500;
}

.settings-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    padding: 1rem;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav-link {
    font-size: 0.9rem;
    padding: 0.4rem 0.8rem;
  }

  .settings-menu {
    margin-top: 1rem;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
