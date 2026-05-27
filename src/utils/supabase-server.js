/**
 * Server-side Supabase client factories.
 *
 * Two variants:
 *
 * getServerSupabase()
 *   - For use in Server Components (pages, layouts).
 *   - Reads cookies for session verification.
 *   - Does NOT write cookies — page renders cannot set headers after
 *     streaming has started, but the proxy already handles token
 *     rotation so this is safe for read-only page use.
 *
 * getActionSupabase()
 *   - For use in Server Actions (mutations).
 *   - Reads AND writes cookies so refreshed auth tokens are persisted.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() ?? [];
        },
        setAll() {
          // No-op: token rotation is handled by proxy for page renders.
        },
      },
    }
  );
}

export async function getActionSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() ?? [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set?.(name, value, options);
            });
          } catch {
            // Cookie writes may fail during static rendering; safe to ignore.
          }
        },
      },
    }
  );
}
