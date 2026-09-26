import { createSupabaseContext } from '@supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './types'

export type HirayaSupabaseServerContext = {
  supabase: SupabaseClient<Database>
  supabaseAdmin: SupabaseClient<Database>
  userClaims: unknown
  jwtClaims: unknown
  authMode: string
  authKeyName?: string
}

/**
 * Creates a request-scoped Supabase server context.
 *
 * Use this only from server-side code. The user-scoped client respects RLS;
 * the admin client bypasses RLS and must never be exposed to the browser.
 */
export async function createHirayaSupabaseServerContext(request: Request) {
  const { data, error } = await createSupabaseContext(request, { auth: 'user' })

  if (error) {
    throw new Error(`Supabase authentication failed: ${error.message}`)
  }

  return data as HirayaSupabaseServerContext
}
