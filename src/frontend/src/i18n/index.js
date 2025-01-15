import { createI18n } from 'vue-i18n'
import en from './en'
import es from './es'
import pt from './pt'
import fr from './fr'

const messages = {
  en,
  es,
  pt,
  fr
}

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages
})
