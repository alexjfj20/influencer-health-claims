import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltan las variables de entorno de Supabase:', {
        url: supabaseUrl ? 'configurada' : 'no configurada',
        key: supabaseAnonKey ? 'configurada' : 'no configurada'
    })
}

// Usando la versión global de Supabase cargada desde el CDN
export const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)
