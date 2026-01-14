import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface DigestData {
  userId: string;
  email: string;
  userName: string;
  userType: string;
  topOpinions: any[];
  totalOpinions: number;
  newInsights: number;
  streakDays: number;
  inphroSyncCompleted: boolean;
}

const generateEngagementEmailHtml = (data: DigestData): string => {
  const isAudience = data.userType === 'audience';
  
  const streakSection = data.streakDays > 0 ? `
    <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: #fff; margin: 0 0 10px 0;">🔥 ${data.streakDays} Day Streak!</h3>
      <p style="color: rgba(255,255,255,0.9); margin: 0;">Don't break your streak! Complete today's InphroSync.</p>
    </div>
  ` : `
    <div style="background: linear-gradient(135deg, #6B46C1 0%, #9F7AEA 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: #fff; margin: 0 0 10px 0;">⚡ Start Your Streak Today!</h3>
      <p style="color: rgba(255,255,255,0.9); margin: 0;">Answer daily InphroSync questions and build your streak!</p>
    </div>
  `;

  const opinionSection = isAudience ? `
    <div style="background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #E9D5FF;">
      <h3 style="color: #333; margin-top: 0;">🎬 New Week, New Opinions!</h3>
      <p style="color: #555; line-height: 1.6;">
        A new week has started! You have <strong>6 fresh categories</strong> waiting for your voice:
      </p>
      <ul style="color: #555; padding-left: 20px; margin: 15px 0;">
        <li>🎬 Movies & Films</li>
        <li>📺 TV Shows & OTT</li>
        <li>🎵 Music</li>
        <li>🎮 Gaming</li>
        <li>📱 Social Media</li>
        <li>▶️ YouTube</li>
      </ul>
      <p style="color: #555;">
        ${data.totalOpinions > 0 
          ? `You've shared <strong>${data.totalOpinions} opinions</strong> so far. Keep it going!` 
          : `You haven't shared any opinions yet this week. Start shaping entertainment now!`}
      </p>
    </div>
  ` : `
    <div style="background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0; border: 2px solid #BEE3F8;">
      <h3 style="color: #333; margin-top: 0;">📊 Fresh Insights Await!</h3>
      <p style="color: #555; line-height: 1.6;">
        New week means fresh audience opinions to discover! See what entertainment content people are craving.
      </p>
      <p style="color: #555;">
        <strong>${data.newInsights} new insights</strong> were generated this week.
      </p>
    </div>
  `;

  const inphroSyncReminder = !data.inphroSyncCompleted ? `
    <div style="background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
      <h3 style="color: #fff; margin: 0 0 10px 0;">⚡ Complete Today's InphroSync!</h3>
      <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0;">Quick daily question to sync with entertainment trends</p>
      <a href="https://inphrone.com/inphrosync" style="display: inline-block; padding: 12px 24px; background: #fff; color: #0EA5E9; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Answer Now →
      </a>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 10px 0;">🎯 Weekly Entertainment Update</h1>
          <p style="color: rgba(255,255,255,0.8); font-size: 16px; margin: 0;">Hi ${data.userName}! Here's what's happening</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          
          ${streakSection}
          
          ${opinionSection}
          
          ${inphroSyncReminder}
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://inphrone.com/dashboard" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff; font-weight: 600; text-decoration: none; border-radius: 12px; font-size: 16px; box-shadow: 0 4px 15px rgba(117, 16, 6, 0.3);">
              Open INPHRONE →
            </a>
          </div>
          
          <!-- Motivation -->
          <div style="background: #FEF3C7; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="color: #92400E; margin: 0; font-style: italic;">
              💡 <strong>Did you know?</strong> Your opinions directly influence what entertainment gets created next. Every voice matters!
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
            You're receiving this because you're part of INPHRONE. 
            <a href="https://inphrone.com/profile" style="color: #751006;">Manage preferences</a>
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Sending weekly engagement emails...');

    // Get all users (not just those with preferences - send to everyone by default)
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, settings');

    if (profileError) throw profileError;

    console.log(`Found ${profiles?.length || 0} users`);

    let emailsSent = 0;
    let emailsFailed = 0;
    let emailsSkipped = 0;

    for (const profile of profiles || []) {
      try {
        const settings = profile.settings as any;
        
        // Skip if email notifications are disabled
        if (settings?.email_notifications === false) {
          console.log(`Email notifications disabled for user ${profile.id}, skipping...`);
          emailsSkipped++;
          continue;
        }

        const userId = profile.id;
        const email = profile.email;
        const userName = profile.full_name || 'Entertainment Enthusiast';
        const userType = profile.user_type || 'audience';

        // Get user's streak info
        const { data: streakData } = await supabase
          .from('user_streaks')
          .select('inphrosync_streak_days, inphrosync_last_participation')
          .eq('user_id', userId)
          .single();

        const streakDays = streakData?.inphrosync_streak_days || 0;
        
        // Check if InphroSync completed today
        const today = new Date().toISOString().split('T')[0];
        const lastParticipation = streakData?.inphrosync_last_participation?.split('T')[0];
        const inphroSyncCompleted = lastParticipation === today;

        // Get opinions count this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: opinions, count: opinionsCount } = await supabase
          .from('opinions')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', oneWeekAgo.toISOString())
          .order('upvotes', { ascending: false })
          .limit(5);

        // Get insights count
        const { count: insightsCount } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', oneWeekAgo.toISOString());

        const digestData: DigestData = {
          userId,
          email,
          userName,
          userType,
          topOpinions: opinions || [],
          totalOpinions: opinionsCount || 0,
          newInsights: insightsCount || 0,
          streakDays,
          inphroSyncCompleted
        };

        // Send email via Resend
        if (RESEND_API_KEY) {
          const emailHtml = generateEngagementEmailHtml(digestData);
          
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'INPHRONE <onboarding@resend.dev>',
              to: [email],
              subject: `🎯 ${userName}, your weekly entertainment update is here!`,
              html: emailHtml,
            }),
          });

          if (emailResponse.ok) {
            console.log(`Weekly digest sent to ${email}`);
            emailsSent++;
            
            // Create in-app notification too
            await supabase.from('notifications').insert({
              user_id: userId,
              title: '📬 Weekly Update',
              message: 'Check your email for your weekly entertainment digest! Don\'t forget to share opinions and complete InphroSync.',
              type: 'weekly_start',
              action_url: '/dashboard'
            });
          } else {
            const error = await emailResponse.text();
            console.error(`Failed to send digest to ${email}:`, error);
            emailsFailed++;
          }
        } else {
          console.error('RESEND_API_KEY not configured');
          emailsFailed++;
        }
      } catch (userError) {
        console.error(`Error processing digest for user:`, userError);
        emailsFailed++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${profiles?.length || 0} users`,
        emailsSent,
        emailsFailed,
        emailsSkipped
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-weekly-digest:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});