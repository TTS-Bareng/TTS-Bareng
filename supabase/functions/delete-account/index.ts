import { createDeleteAccountHandler } from './handler.ts';

Deno.serve(createDeleteAccountHandler({
  supabaseUrl: Deno.env.get('SUPABASE_URL') ?? '',
  anonKey: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  appleClientId: 'com.syntheticae.ttsbareng',
  appleTeamId: Deno.env.get('APPLE_TEAM_ID') ?? '',
  appleKeyId: Deno.env.get('APPLE_KEY_ID') ?? '',
  applePrivateKey: Deno.env.get('APPLE_PRIVATE_KEY') ?? '',
}));
