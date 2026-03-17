import { createClient } from '@supabase/supabase-js';

// Substitua essas variáveis de ambiente pelas suas credenciais do Supabase
// Em produção, use variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_DO_SUPABASE';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANONA_DO_SUPABASE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
