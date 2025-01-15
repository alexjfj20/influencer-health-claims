<script setup>
import { ref, onMounted } from 'vue'
import { useCookies } from 'vue3-cookies'

const { cookies } = useCookies()
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark-theme')
  cookies.set('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const theme = cookies.get('theme')
  isDark.value = theme === 'dark'
  if (isDark.value) {
    document.documentElement.classList.add('dark-theme')
  }
})
</script>

<template>
  <button @click="toggleTheme" class="theme-switcher" :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
    <svg v-if="isDark" class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg v-else class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<style scoped>
.theme-switcher {
  background: transparent;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.theme-switcher:hover {
  background-color: var(--hover-color);
  transform: scale(1.1);
}

.theme-switcher:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2px;
  transition: all 0.3s ease;
}

.sun {
  animation: rotate-in 0.5s ease-out;
}

.moon {
  animation: slide-in 0.5s ease-out;
}

@keyframes rotate-in {
  from {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0) scale(1);
    opacity: 1;
  }
}

@keyframes slide-in {
  from {
    transform: translateY(-20px) scale(0);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
