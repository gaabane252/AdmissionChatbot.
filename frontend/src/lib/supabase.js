import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ppgkeiwxnjnjzacyhdog.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZ2tlaXd4bmpuanphY3loZG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTc3NzUsImV4cCI6MjEwMjI5Mzc3NX0.oug1soLLTBoshX7_Z8ENae1_-DLwEsbd-FyW6dCqw04';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
