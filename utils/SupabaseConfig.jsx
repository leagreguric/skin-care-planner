
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'


EXPO_PUBLIC_SUPABASE_URL='https://poecjvgcivamjqvtubtv.supabase.co'
EXPO_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZWNqdmdjaXZhbWpxdnR1YnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM5OTYzMDcsImV4cCI6MjAzOTU3MjMwN30.jNXnphdQAEAExGQ1b9HPOiSTmyrHxYCnbdiKk-IRML4'



export const supabase = createClient(
 EXPO_PUBLIC_SUPABASE_URL || "",
EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
        
  

