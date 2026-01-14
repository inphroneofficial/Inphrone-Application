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
    console.log('Soft delete account function called');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const serviceSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userErr } = await serviceSupabase.auth.getUser(token);
    
    if (userErr || !user) {
      console.error('User verification failed:', userErr);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    console.log('Processing soft delete for user:', user.id);

    // Check if already pending deletion
    const { data: existing } = await serviceSupabase
      .from('pending_account_deletions')
      .select('*')
      .eq('user_id', user.id)
      .is('restored_at', null)
      .single();

    if (existing) {
      console.log('Account already pending deletion');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Account already scheduled for deletion',
        permanent_deletion_date: existing.permanent_deletion_date
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get user profile
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('full_name, email, user_type')
      .eq('id', user.id)
      .single();

    // Calculate permanent deletion date (30 days from now)
    const permanentDeletionDate = new Date();
    permanentDeletionDate.setDate(permanentDeletionDate.getDate() + 30);

    // Create pending deletion record
    const { error: pendingError } = await serviceSupabase
      .from('pending_account_deletions')
      .insert({
        user_id: user.id,
        email: profile?.email || user.email || 'unknown',
        full_name: profile?.full_name || null,
        user_type: profile?.user_type || null,
        permanent_deletion_date: permanentDeletionDate.toISOString(),
      });

    if (pendingError) {
      console.error('Error creating pending deletion:', pendingError);
      return new Response(JSON.stringify({ error: 'Failed to schedule account deletion' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Account scheduled for deletion on:', permanentDeletionDate);

    // Sign out the user
    await serviceSupabase.auth.admin.signOut(user.id);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account scheduled for deletion. You have 30 days to restore it.',
      permanent_deletion_date: permanentDeletionDate.toISOString()
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (e) {
    console.error('Soft delete error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
