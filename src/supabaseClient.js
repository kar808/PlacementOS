import { createClient } from "@supabase/supabase-js";

// ==============================================================================
// SUPABASE CONFIGURATION
// Replace the values below with your actual Supabase Project URL and Public Key.
// ==============================================================================
const RAW_SUPABASE_URL = "https://hujnifwdndiyhuiiuool.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_HXTG3pl8jmOcixhUrxAFyg_QRuQYR0z";

// Sanitize URL to extract base Supabase origin (e.g. https://xxx.supabase.co)
// @supabase/supabase-js requires the base URL without /rest/v1 path
const SUPABASE_URL = "https://hujnifwdndiyhuiiuool.supabase.co/rest/v1/";

// Initialize and export the Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
