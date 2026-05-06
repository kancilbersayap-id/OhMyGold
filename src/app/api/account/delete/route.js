import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getActionSupabase } from '@/utils/supabase-server';

export async function POST(request) {
  const supabase = await getActionSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { email } = await request.json().catch(() => ({}));
  if (!email || email.trim().toLowerCase() !== (user.email || '').toLowerCase()) {
    return NextResponse.json({ error: 'Email does not match' }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_ADMIN_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
