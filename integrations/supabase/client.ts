import { createClient } from '@supabase/supabase-js'

// Supabase is used in this project for:
// 1. User authentication (sign up, sign in, sign out, session management)
// 2. Storing and managing Spotify access/refresh tokens in the 'user_spotify_tokens' table
//
// Supabase is not currently used for general app data (e.g., playlists, conversions), but could be extended for that purpose.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only throw error if we're on the client side and variables are missing
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create client with fallback values for server-side rendering
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
) 