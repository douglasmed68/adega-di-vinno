import { createClient } from '@supabase/supabase-js';

console.log("[SUPABASE] Tentando inicializar o cliente Supabase...");
console.log("URL:", import.meta.env.VITE_SUPABASE_URL ? "Carregada" : "Usando fallback");
console.log("KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Carregada" : "Usando fallback");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrpgfcqsswnglkmqdmuv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycGdmY3Fzc3duZ2xrbXFkbXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzA3OTMsImV4cCI6MjA3Njg0Njc5M30.xFtbf2GzKF9dIuRCCZYukA0dHg7LpWbjrjXryhUrA7s';

let supabaseClient;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log("[SUPABASE] Cliente Supabase inicializado com sucesso.");
} catch (e) {
  console.error("[SUPABASE] ERRO CRÍTICO na inicialização do cliente Supabase:", e);
  // Atribui um objeto mock para evitar que o aplicativo trave em caso de falha
  supabaseClient = {
    from: () => ({
      select: () => ({ data: [], error: { message: "Supabase client failed to initialize." } }),
      insert: () => ({ data: [], error: { message: "Supabase client failed to initialize." } }),
      update: () => ({ data: [], error: { message: "Supabase client failed to initialize." } }),
      delete: () => ({ data: [], error: { message: "Supabase client failed to initialize." } }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
  };
}

export const supabase = supabaseClient;

