import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { AuthCookieStorage } from "./AuthCookieStorage.util";

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const Supabase: SupabaseClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: AuthCookieStorage
        }
    }
);