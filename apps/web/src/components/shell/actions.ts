'use server';

/**
 * Sign out, from the drawer's member panel. The live theme's drawer sent a
 * DELETE to Ghost's /members/api/session and reloaded; this ends the Supabase
 * session through the same cookie-writing client every other auth call here
 * uses (lib/supabase/server.ts), which a Server Action is allowed to do.
 *
 * revalidatePath('/', 'layout') drops the client's cached copy of the root
 * layout, so the header re-renders signed out instead of showing the old
 * session until the next full load.
 */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/');
}
