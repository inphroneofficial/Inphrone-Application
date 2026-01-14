import { createClient } from "npm:@supabase/supabase-js@2.58.0";

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
      console.error('Delete auth users attempt without authorization header');
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
      console.error('Invalid token for delete auth users attempt:', authError?.message);
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
      console.error(`Non-admin user ${user.id} attempted delete-all-auth-users`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${user.id} starting auth user deletion...`);

    // Get all auth users
    const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers();
    if (listError) throw listError;

    console.log(`Found ${users?.length || 0} auth users to delete`);

    // Delete each user (except the current admin to prevent self-lockout)
    let deleted = 0;
    let skipped = 0;
    for (const authUser of users || []) {
      // Skip the current admin user to prevent self-lockout
      if (authUser.id === user.id) {
        console.log(`Skipping current admin user ${authUser.id}`);
        skipped++;
        continue;
      }
      
      const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(authUser.id);
      if (deleteError) {
        console.error(`Failed to delete user ${authUser.id}:`, deleteError);
      } else {
        deleted++;
      }
    }

    console.log(`Admin ${user.id} completed. Deleted ${deleted} auth users, skipped ${skipped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deleted, 
        skipped,
        total: users?.length || 0,
        deletedBy: user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting auth users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
