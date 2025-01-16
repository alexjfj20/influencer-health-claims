import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Faltan las variables de entorno de Supabase:', {
        url: supabaseUrl ? 'configurada' : 'no configurada',
        key: supabaseAnonKey ? 'configurada' : 'no configurada'
    })
    throw new Error('Faltan variables de entorno de Supabase')
}

// Crear una única instancia del cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage: window.localStorage
    }
})

export { supabase }
