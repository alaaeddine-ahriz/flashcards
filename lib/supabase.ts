import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Create a Supabase client for browser/client components
 * Note: Using untyped client to avoid build-time type inference issues
 * when env vars aren't available. Type safety is handled in services.
 */
export function createClient() {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client for server-side operations
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export function createServerClient() {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

