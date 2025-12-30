import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lasbbckyspigcxsivmmo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IUVBBWGi4Cdc3F6elj-4sQ_CbFTJSh_'
export const supabase = createClient(supabaseUrl, supabaseKey)
