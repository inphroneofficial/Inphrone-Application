import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Cleanup attempt without authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verify the user's token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      console.error('Invalid token for cleanup attempt:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Verify admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error(`Non-admin user ${user.id} attempted cleanup-all-data`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.id} starting complete data cleanup...`);

    // Delete all data from tables in correct order (respecting foreign keys)
    const tables = [
      'opinion_views',
      'opinion_upvotes',
      'insight_ripples',
      'time_capsules',
      'notifications',
      'user_badges',
      'user_streaks',
      'user_avatars',
      'rewards',
      'coupon_shares',
      'coupon_analytics',
      'coupon_wishlist',
      'coupon_recommendations',
      'merchant_favorites',
      'coupons',
      'user_activity_logs',
      'weekly_wisdom_reports',
      'wave_participants',
      'referrals',
      'reviews',
      'email_digest_preferences',
      'inphrosync_responses',
      'cultural_energy_map',
      'global_insight_waves',
      'opinions',
      'audience_profiles',
      'creator_profiles',
      'studio_profiles',
      'ott_profiles',
      'tv_profiles',
      'gaming_profiles',
      'music_profiles',
      'deleted_accounts_backup',
      'deleted_accounts_log',
      'pending_account_deletions',
      'account_deletion_attempts',
    ];

    let totalDeleted = 0;

    for (const table of tables) {
      try {
        const { error, count } = await supabaseClient
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
        } else {
          const deleted = count || 0;
          totalDeleted += deleted;
          console.log(`Deleted ${deleted} rows from ${table}`);
        }
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err);
      }
    }

    console.log(`Admin ${user.id} completed cleanup. Total rows deleted: ${totalDeleted}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalDeleted,
        message: 'All user data deleted successfully',
        deletedBy: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
