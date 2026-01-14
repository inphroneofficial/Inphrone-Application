import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "Inphrone <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'welcome' | 'password_reset' | 'verification' | 'opinion_liked' | 'streak_achievement' | 'badge_earned' | 'inphrosync_reminder' | 'weekly_digest' | 'milestone' | 'industry_recognition' | 'broadcast';
  to: string;
  name?: string;
  data?: Record<string, any>;
}

const getEmailTemplate = (type: string, name: string, data: Record<string, any> = {}) => {
  // Professional email header with logo for better deliverability and branding
  const logoUrl = "https://inphrone.com/inphrone-logo.jpg";
  
  const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
  `;
  
  const buttonStyles = `
    display: inline-block;
    margin: 24px 0;
    padding: 16px 36px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 12px;
    font-size: 16px;
  `;

  // Professional header with logo - helps avoid spam filters
  const emailHeader = `
    <div style="text-align: center; padding: 24px 20px; background: #1F0021;">
      <img src="${logoUrl}" alt="Inphrone" width="180" height="auto" style="max-width: 180px; height: auto;" />
    </div>
  `;

  // Professional footer - required for anti-spam compliance
  const emailFooter = `
    <div style="background: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <img src="${logoUrl}" alt="Inphrone" width="100" height="auto" style="max-width: 100px; height: auto; margin-bottom: 12px;" />
      <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 8px 0;">
        Inphrone - People-Powered Entertainment Intelligence<br/>
        © ${new Date().getFullYear()} Inphrone. All rights reserved.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        You're receiving this because you have an Inphrone account.<br/>
        <a href="https://inphrone.com/profile" style="color: #751006; text-decoration: underline;">Manage email preferences</a> | 
        <a href="https://inphrone.com/privacy-policy" style="color: #751006; text-decoration: underline;">Privacy Policy</a>
      </p>
      <p style="color: #d1d5db; font-size: 10px; margin: 12px 0 0 0;">
        Inphrone Technologies | inphrone@gmail.com
      </p>
    </div>
  `;

  const templates: Record<string, { subject: string; html: string }> = {
    welcome: {
      subject: "Welcome to Inphrone - Your Voice Shapes Entertainment!",
      html: `
        <div style="${baseStyles} background: #ffffff; border-radius: 0; overflow: hidden; border: 1px solid #e5e7eb;">
          ${emailHeader}
          <div style="background: linear-gradient(180deg, #1F0021 0%, #2C0F12 100%); padding: 50px 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 32px; margin-bottom: 16px; font-weight: 700;">Welcome to Inphrone!</h1>
            <p style="color: #e0e0e0; font-size: 18px; line-height: 1.7; margin-bottom: 8px;">Hi ${name},</p>
            <p style="color: #d0d0d0; font-size: 16px; line-height: 1.7; margin-bottom: 24px;">
              You've joined the world's first people-powered entertainment intelligence platform where 
              <strong style="color: #fff;">your opinions shape what gets created next</strong>.
            </p>
            <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #fff; margin-bottom: 16px;">Get Started:</h3>
              <p style="color: #d0d0d0; font-size: 14px; line-height: 1.8; text-align: left;">
                <strong>Share Opinions</strong> - Tell us what entertainment you want to see<br/>
                <strong>InphroSync Daily</strong> - Quick daily questions to shape content<br/>
                <strong>Earn Badges</strong> - Build your wisdom profile<br/>
                <strong>Build Streaks</strong> - Consistent voices get heard more
              </p>
            </div>
            <a href="https://inphrone.com/dashboard" style="${buttonStyles} background: #ffffff; color: #1F0021;">
              Start Sharing Your Voice
            </a>
          </div>
          ${emailFooter}
        </div>
      `
    },
    password_reset: {
      subject: "🔐 Reset Your Inphrone Password",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">🔐</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">Password Reset</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              We received a request to reset your password. Click below to create a new one:
            </p>
            <div style="text-align: center;">
              <a href="${data.resetLink || '#'}" style="${buttonStyles} background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 14px; text-align: center;">
              This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `
    },
    verification: {
      subject: "✉️ Verify Your Inphrone Email",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">✉️</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">Verify Your Email</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              One quick step to start shaping entertainment with your voice:
            </p>
            <div style="text-align: center;">
              <a href="${data.verifyLink || '#'}" style="${buttonStyles} background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff;">
                Verify Email Address
              </a>
            </div>
          </div>
        </div>
      `
    },
    opinion_liked: {
      subject: "💜 Your Opinion is Resonating!",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">💜</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">Your Voice Matters!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              <strong>${data.likerName || 'Someone'}</strong>${data.likerType && data.likerType !== 'audience' ? ` (${data.likerType})` : ''} 
              loved your opinion:
            </p>
            <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <p style="color: #333; font-size: 16px; font-style: italic; margin: 0;">
                "${data.opinionTitle || 'Your opinion'}"
              </p>
            </div>
            <p style="color: #555; font-size: 15px; line-height: 1.7;">
              Your insights are shaping what entertainment gets created. Keep sharing your voice!
            </p>
            <div style="text-align: center;">
              <a href="https://inphrone.com/insights" style="${buttonStyles} background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #ffffff;">
                View Your Impact →
              </a>
            </div>
          </div>
        </div>
      `
    },
    industry_recognition: {
      subject: "⭐ Industry Professional Noticed Your Opinion!",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">⭐</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">Industry Recognition!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              Big news! <strong>${data.likerName || 'An industry professional'}</strong> from the 
              <strong>${data.likerType || 'entertainment industry'}</strong> liked your opinion!
            </p>
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #333; font-size: 16px; font-style: italic; margin: 0;">
                "${data.opinionTitle || 'Your opinion'}"
              </p>
            </div>
            <p style="color: #555; font-size: 15px; line-height: 1.7;">
              This means decision-makers are seeing your perspective. Your voice is directly influencing entertainment!
            </p>
            <div style="text-align: center;">
              <a href="https://inphrone.com/insights" style="${buttonStyles} background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #ffffff;">
                See Your Influence →
              </a>
            </div>
          </div>
        </div>
      `
    },
    streak_achievement: {
      subject: `🔥 ${data.streakCount || ''} Week Streak! You're On Fire!`,
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 50px; text-align: center;">
            <span style="font-size: 64px;">🔥</span>
            <h1 style="color: #ffffff; font-size: 36px; margin: 16px 0 0 0;">${data.streakCount || ''} Week Streak!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              Amazing! You've maintained a <strong>${data.streakCount || ''}-week streak</strong> on Inphrone. 
              Your consistent voice is making waves in entertainment insights!
            </p>
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fecaca 100%); border-radius: 12px; padding: 24px; margin: 20px 0; text-align: center;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                🏆 You're in the top <strong>${Math.max(5, 100 - (data.streakCount || 1) * 5)}%</strong> of consistent voices!
              </p>
            </div>
            <p style="color: #555; font-size: 15px; line-height: 1.7;">
              Keep the momentum going - every week you participate, your influence grows!
            </p>
            <div style="text-align: center;">
              <a href="https://inphrone.com/profile" style="${buttonStyles} background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #ffffff;">
                View Your Profile →
              </a>
            </div>
          </div>
        </div>
      `
    },
    badge_earned: {
      subject: `🏆 New Badge: ${data.badgeName || 'Achievement Unlocked'}!`,
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 50px; text-align: center;">
            <span style="font-size: 64px;">🏆</span>
            <h1 style="color: #ffffff; font-size: 32px; margin: 16px 0 0 0;">${data.badgeName || 'New Badge'}!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              Congratulations! You've earned a new wisdom badge:
            </p>
            <div style="background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%); border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center;">
              <p style="font-size: 40px; margin: 0 0 12px 0;">🏆</p>
              <h3 style="color: #5b21b6; margin: 0 0 8px 0;">${data.badgeName || 'Wisdom Badge'}</h3>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">${data.badgeDescription || 'Your entertainment wisdom is recognized!'}</p>
            </div>
            <div style="text-align: center;">
              <a href="https://inphrone.com/profile" style="${buttonStyles} background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff;">
                View All Badges →
              </a>
            </div>
          </div>
        </div>
      `
    },
    inphrosync_reminder: {
      subject: "✨ Your Daily Voice Awaits - InphroSync",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">✨</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">InphroSync Daily</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              ${data.currentStreak ? `🔥 You have a <strong>${data.currentStreak}-day streak</strong>! Don't let it end.` : 'New daily questions are waiting for your voice!'}
            </p>
            <div style="background: linear-gradient(135deg, #cffafe 0%, #dbeafe 100%); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="color: #0e7490; font-size: 15px; margin: 0;">
                🎯 Quick 30-second questions<br/>
                📊 Your answers shape entertainment trends<br/>
                🏆 Build streaks for greater influence
              </p>
            </div>
            <div style="text-align: center;">
              <a href="https://inphrone.com/inphrosync" style="${buttonStyles} background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff;">
                Share Your Voice →
              </a>
            </div>
          </div>
        </div>
      `
    },
    milestone: {
      subject: `🎉 Milestone Reached: ${data.milestone || 'Achievement'}!`,
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px; text-align: center;">
            <span style="font-size: 64px;">🎉</span>
            <h1 style="color: #ffffff; font-size: 32px; margin: 16px 0 0 0;">Milestone!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              ${data.message || 'You\'ve reached an amazing milestone on Inphrone!'}
            </p>
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 16px; padding: 24px; margin: 20px 0; text-align: center;">
              <p style="font-size: 40px; margin: 0 0 8px 0;">${data.emoji || '🏅'}</p>
              <h3 style="color: #065f46; margin: 0;">${data.milestone || 'Milestone Achieved'}</h3>
            </div>
            <div style="text-align: center;">
              <a href="https://inphrone.com/profile" style="${buttonStyles} background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff;">
                View Profile →
              </a>
            </div>
          </div>
        </div>
      `
    },
    weekly_digest: {
      subject: "📊 Your Weekly Entertainment Impact Report",
      html: `
        <div style="${baseStyles} background: #f8f9fa; border-radius: 20px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px; text-align: center;">
            <span style="font-size: 48px;">📊</span>
            <h1 style="color: #ffffff; font-size: 28px; margin: 16px 0 0 0;">Your Weekly Impact</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7;">
              Here's how your voice shaped entertainment this week:
            </p>
            <div style="background: #fff; border-radius: 12px; padding: 24px; margin: 20px 0; border: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-around; text-align: center;">
                <div>
                  <p style="font-size: 28px; font-weight: bold; color: #1F0021; margin: 0;">${data.opinionsCount || 0}</p>
                  <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Opinions</p>
                </div>
                <div>
                  <p style="font-size: 28px; font-weight: bold; color: #1F0021; margin: 0;">${data.likesReceived || 0}</p>
                  <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">Likes</p>
                </div>
                <div>
                  <p style="font-size: 28px; font-weight: bold; color: #1F0021; margin: 0;">${data.inphrosyncCount || 0}</p>
                  <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">InphroSync</p>
                </div>
              </div>
            </div>
            <div style="text-align: center;">
              <a href="https://inphrone.com/profile" style="${buttonStyles} background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff;">
                See Full Stats →
              </a>
            </div>
          </div>
        </div>
      `
    },
    broadcast: {
      subject: data.title || "Message from Inphrone",
      html: `
        <div style="${baseStyles} background: #ffffff; border: 1px solid #e5e7eb; overflow: hidden;">
          ${emailHeader}
          <div style="background: linear-gradient(135deg, #1F0021 0%, #751006 100%); padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; margin: 0;">${data.title || 'Announcement'}</h1>
          </div>
          <div style="padding: 40px; background: #ffffff;">
            <p style="color: #333; font-size: 16px;">Hi ${name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
              ${data.message || ''}
            </p>
            ${data.actionUrl ? `
            <div style="text-align: center;">
              <a href="${data.actionUrl}" style="${buttonStyles} background: linear-gradient(135deg, #1F0021 0%, #751006 100%); color: #ffffff;">
                Learn More
              </a>
            </div>
            ` : ''}
          </div>
          ${emailFooter}
        </div>
      `
    }
  };

  return templates[type] || templates.welcome;
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification-email function invoked");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, to, name, data }: EmailRequest = body;

    console.log(`Processing ${type} email request to ${to}`);
    console.log("Request body:", JSON.stringify(body, null, 2));

    if (!to || !type) {
      console.error("Missing required fields - to:", to, "type:", type);
      throw new Error("Missing required fields: to, type");
    }

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured in environment");
      throw new Error("RESEND_API_KEY not configured. Please add it in project secrets.");
    }

    console.log("RESEND_API_KEY is configured, length:", RESEND_API_KEY.length);

    const template = getEmailTemplate(type, name || 'User', data || {});
    console.log("Using template:", type, "Subject:", template.subject);

    console.log("Sending email via Resend API...");
    console.log("Using FROM address:", RESEND_FROM);
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: template.subject,
        html: template.html,
        // Anti-spam headers for better deliverability
        headers: {
          'List-Unsubscribe': '<https://inphrone.com/profile>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'X-Entity-Ref-ID': `inphrone-${type}-${Date.now()}`,
        },
        tags: [
          { name: 'email_type', value: type },
          { name: 'source', value: 'inphrone' }
        ]
      }),
    });

    const responseText = await emailResponse.text();
    console.log("Resend API response status:", emailResponse.status);
    console.log("Resend API response:", responseText);

    if (!emailResponse.ok) {
      console.error(`Resend API error (${emailResponse.status}): ${responseText}`);
      throw new Error(`Failed to send email: ${responseText}`);
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }
    
    console.log("Email sent successfully! ID:", result.id || result);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email:", error.message);
    console.error("Full error:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
