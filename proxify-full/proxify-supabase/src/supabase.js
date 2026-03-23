import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sgpgkkgepkecnjqefzaz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNncGdra2dlcGtlY25qcWVmemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDgwNDEsImV4cCI6MjA4OTgyNDA0MX0.3W33F5n3KfujV_7pTbBBWP8nFXREtYXv2SkxC-zN-Jk'

if (!globalThis._supabase) {
    globalThis._supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export const supabase = globalThis._supabase