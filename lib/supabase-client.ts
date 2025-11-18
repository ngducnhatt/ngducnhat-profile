import { SupabaseClient, createClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const getSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        throw new Error(
            'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
        )
    }

    if (!client) {
        client = createClient(url, anonKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: true,
                autoRefreshToken: true,
            },
        })
    }

    return client
}
