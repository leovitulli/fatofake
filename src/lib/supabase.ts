import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ebarklhztoerbfjvpnqb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXJrbGh6dG9lcmJmanZwbnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTI4ODAsImV4cCI6MjEwODI4ODg4MH0.eu69Na6jAHe4Arew1vxAdX7Kg5ynWJ54OBUwexEcG08';

// Cliente público para queries no navegador e client components
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente administrativo para operações server-side protegidas (seeding, sincronização)
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXJrbGh6dG9lcmJmanZwbnFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjcxMjg4MCwiZXhwIjoyMTA4Mjg4ODgwfQ.xZenTBy2LXsYbDG8QeC-j23BRAOFBi_8ayMZDlAVGRE';
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
