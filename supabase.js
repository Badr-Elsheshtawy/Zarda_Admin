import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lasbbckyspigcxsivmmo.supabase.co'
const supabaseKey = 'sb_publishable_IUVBBWGi4Cdc3F6elj-4sQ_CbFTJSh_'
export const supabase = createClient(supabaseUrl, supabaseKey)