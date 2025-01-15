import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import VueCookies from 'vue3-cookies'
import { router } from './router'
import './assets/themes.css'

const app = createApp(App)
app.use(i18n)
app.use(VueCookies)
app.use(router)
app.mount('#app')
