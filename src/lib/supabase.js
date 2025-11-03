import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrpgfcqsswnglkmqdmuv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycGdmY3Fzc3duZ2xrbXFkbXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzA3OTMsImV4cCI6MjA3Njg0Njc3M30.xFtbf2GzKF9dIuRCCZYukA0dHg7LpWbjrjXryhUrA7s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

