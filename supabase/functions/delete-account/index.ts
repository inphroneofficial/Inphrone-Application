import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Delete account function called');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create service role client for privileged operations
    const serviceSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Get user from the request's JWT
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Use service role to get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await serviceSupabase.auth.getUser(token);
    console.log('User lookup result:', { userId: user?.id, error: userErr?.message });
    
    if (userErr || !user) {
      console.error('User verification failed:', userErr);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userErr?.message }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Starting deletion process for user:', user.id);

    // Log deletion attempt
    const { error: attemptLogError } = await serviceSupabase.from('account_deletion_attempts').insert({
      user_id: user.id,
      attempted_at: new Date().toISOString(),
      success: false
    });
    if (attemptLogError) console.error('Error logging attempt:', attemptLogError);

    // Fetch profile for backup logging
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('full_name, email, city, state_region, country, user_type')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    console.log('Profile fetched:', { email: profile?.email, userType: profile?.user_type });

    // Backup user data before deletion
    if (profile) {
      const { error: backupError } = await serviceSupabase.from('deleted_accounts_backup').insert({
        user_id: user.id,
        full_name: profile.full_name || null,
        email: profile.email,
        city: profile.city || null,
        state_region: profile.state_region || null,
        country: profile.country || null,
        user_type: profile.user_type || null,
      });
      if (backupError) console.error('Error backing up profile:', backupError);
    }

    // Gather user's opinions for dependent deletes
    const { data: ops, error: opsError } = await serviceSupabase
      .from('opinions')
      .select('id')
      .eq('user_id', user.id);
    
    if (opsError) {
      console.error('Error fetching opinions:', opsError);
    }
    
    const opinionIds = (ops || []).map((o: any) => o.id);
    console.log('Found opinions to delete:', opinionIds.length);

    // Log deletion BEFORE removing data
    const { error: logError } = await serviceSupabase.from('deleted_accounts_log').insert({
      user_id: user.id,
      email: profile?.email,
      user_type: profile?.user_type || null,
    });
    if (logError) console.error('Error logging deletion:', logError);

    // Helper to delete with error logging
    const safeDelete = async (table: string, match: Record<string, any>) => {
      try {
        console.log(`Deleting from ${table}`);
        const { error, count } = await serviceSupabase.from(table).delete().match(match);
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        } else {
          console.log(`Deleted from ${table}: ${count} rows`);
        }
      } catch (e) {
        console.error(`Exception deleting from ${table}:`, e);
      }
    };
    const safeDeleteIn = async (table: string, column: string, values: any[]) => {
      if (!values.length) {
        console.log(`Skipping ${table} - no values to delete`);
        return;
      }
      try {
        console.log(`Deleting from ${table} where ${column} in ${values.length} values`);
        const { error, count } = await serviceSupabase.from(table).delete().in(column, values);
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        } else {
          console.log(`Deleted from ${table}: ${count} rows`);
        }
      } catch (e) {
        console.error(`Exception deleting from ${table}:`, e);
      }
    };

    // Dependent tables (both authored and referencing opinions)
    await safeDeleteIn('opinion_views', 'opinion_id', opinionIds);
    await safeDelete('opinion_views', { viewer_id: user.id });
    await safeDeleteIn('opinion_upvotes', 'opinion_id', opinionIds);
    await safeDelete('opinion_upvotes', { user_id: user.id });
    await safeDeleteIn('insight_ripples', 'opinion_id', opinionIds);
    await safeDeleteIn('time_capsules', 'opinion_id', opinionIds);
    await safeDelete('time_capsules', { user_id: user.id });
    await safeDelete('notifications', { user_id: user.id });
    await safeDelete('user_badges', { user_id: user.id });
    await safeDelete('user_streaks', { user_id: user.id });
    await safeDelete('user_avatars', { user_id: user.id });
    await safeDelete('rewards', { user_id: user.id });
    await safeDelete('coupons', { user_id: user.id });
    await safeDelete('user_activity_logs', { user_id: user.id });
    await safeDelete('weekly_wisdom_reports', { user_id: user.id });
    await safeDelete('wave_participants', { user_id: user.id });

    // Profile type tables
    await safeDelete('audience_profiles', { user_id: user.id });
    await safeDelete('creator_profiles', { user_id: user.id });
    await safeDelete('studio_profiles', { user_id: user.id });
    await safeDelete('ott_profiles', { user_id: user.id });
    await safeDelete('tv_profiles', { user_id: user.id });
    await safeDelete('gaming_profiles', { user_id: user.id });
    await safeDelete('music_profiles', { user_id: user.id });
    await safeDelete('referrals', { referrer_id: user.id });
    await safeDelete('referrals', { referred_user_id: user.id });
    await safeDelete('email_digest_preferences', { user_id: user.id });
    await safeDelete('reviews', { user_id: user.id });

    // Finally, authored opinions and profile
    await safeDelete('opinions', { user_id: user.id });
    await safeDelete('profiles', { id: user.id });

    console.log('All data deleted, removing auth user');
    
    // Remove auth user completely using service role client
    const { error: delErr } = await serviceSupabase.auth.admin.deleteUser(user.id, true);
    if (delErr) {
      console.error('Failed to delete auth user:', delErr);
      return new Response(JSON.stringify({ error: 'Failed to completely remove account', details: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Auth user deleted successfully');

    // Mark deletion attempt as successful
    const { error: updateError } = await serviceSupabase.from('account_deletion_attempts')
      .update({ success: true })
      .eq('user_id', user.id)
      .gte('attempted_at', new Date(Date.now() - 60000).toISOString());
    
    if (updateError) console.error('Error updating attempt status:', updateError);

    console.log('Account deletion completed successfully');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('delete-account error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
