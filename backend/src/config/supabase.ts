import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qctbsypnsjaqfsbegoma.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdGJzeXBuc2phcWZzYmVnb21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODQ4OTgsImV4cCI6MjA4OTg2MDg5OH0.qESjY90tAKau54GOrthQ_CPw70jHdlQQRJw5008k3Qs';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdGJzeXBuc2phcWZzYmVnb21hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI4NDg5OCwiZXhwIjoyMDg5ODYwODk4fQ.qESjY90tAKau54GOrthQ_CPw70jHdlQQRJw5008k3Qs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
