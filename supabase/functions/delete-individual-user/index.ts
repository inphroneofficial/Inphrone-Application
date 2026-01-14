import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header to verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    // Verify the caller is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: callerUser }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !callerUser) {
      throw new Error('Invalid authorization token')
    }

    // Check if caller has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .single()

    if (roleError || !roleData) {
      throw new Error('User not allowed')
    }

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    // Prevent admin from deleting themselves
    if (userId === callerUser.id) {
      throw new Error('Cannot delete your own admin account')
    }

    console.log('Admin', callerUser.id, 'deleting user data for:', userId)

    // Get user info before deletion for logging
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, user_type')
      .eq('id', userId)
      .single()

    // Get all opinions by this user
    const { data: opinions } = await supabaseClient
      .from('opinions')
      .select('id')
      .eq('user_id', userId)

    const opinionIds = opinions?.map(o => o.id) || []

    // Delete in proper order to respect foreign key constraints
    
    // 1. Delete opinion-related data
    if (opinionIds.length > 0) {
      await supabaseClient.from('opinion_views').delete().in('opinion_id', opinionIds)
      await supabaseClient.from('opinion_upvotes').delete().in('opinion_id', opinionIds)
      await supabaseClient.from('insight_ripples').delete().in('opinion_id', opinionIds)
      await supabaseClient.from('time_capsules').delete().in('opinion_id', opinionIds)
    }

    // 2. Delete user's own upvotes and views
    await supabaseClient.from('opinion_upvotes').delete().eq('user_id', userId)
    await supabaseClient.from('opinion_views').delete().eq('viewer_id', userId)
    
    // 3. Delete user's opinions
    await supabaseClient.from('opinions').delete().eq('user_id', userId)
    
    // 4. Delete user-specific data
    await supabaseClient.from('notifications').delete().eq('user_id', userId)
    await supabaseClient.from('user_badges').delete().eq('user_id', userId)
    await supabaseClient.from('user_streaks').delete().eq('user_id', userId)
    await supabaseClient.from('user_avatars').delete().eq('user_id', userId)
    await supabaseClient.from('rewards').delete().eq('user_id', userId)
    await supabaseClient.from('coupons').delete().eq('user_id', userId)
    await supabaseClient.from('coupon_analytics').delete().eq('user_id', userId)
    await supabaseClient.from('user_activity_logs').delete().eq('user_id', userId)
    await supabaseClient.from('weekly_wisdom_reports').delete().eq('user_id', userId)
    await supabaseClient.from('wave_participants').delete().eq('user_id', userId)
    await supabaseClient.from('inphrosync_responses').delete().eq('user_id', userId)
    await supabaseClient.from('merchant_favorites').delete().eq('user_id', userId)
    await supabaseClient.from('coupon_wishlist').delete().eq('user_id', userId)
    await supabaseClient.from('referrals').delete().eq('referrer_id', userId)
    await supabaseClient.from('reviews').delete().eq('user_id', userId)
    await supabaseClient.from('email_digest_preferences').delete().eq('user_id', userId)
    await supabaseClient.from('coupon_recommendations').delete().eq('user_id', userId)
    await supabaseClient.from('coupon_shares').delete().eq('shared_by', userId)
    await supabaseClient.from('pending_account_deletions').delete().eq('user_id', userId)
    await supabaseClient.from('account_deletion_attempts').delete().eq('user_id', userId)

    // 5. Delete profile-specific tables
    await supabaseClient.from('audience_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('creator_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('studio_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('ott_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('tv_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('gaming_profiles').delete().eq('user_id', userId)
    await supabaseClient.from('music_profiles').delete().eq('user_id', userId)

    // 6. Delete user roles (if any non-admin roles)
    await supabaseClient.from('user_roles').delete().eq('user_id', userId)

    // 7. Delete main profile
    await supabaseClient.from('profiles').delete().eq('id', userId)

    // 8. Delete auth user using admin API
    const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('Auth deletion error:', authDeleteError)
      // Don't throw - user data is already deleted from public tables
    }

    // Log the deletion
    await supabaseClient.from('deleted_accounts_log').insert({
      user_id: userId,
      email: profile?.email,
      user_type: profile?.user_type
    })

    console.log('User deleted successfully:', userId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User and all associated data deleted successfully',
        deletedUser: {
          userId,
          email: profile?.email,
          userType: profile?.user_type
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in delete-individual-user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})