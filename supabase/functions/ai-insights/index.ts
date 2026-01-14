import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { user_id, insight_type } = await req.json();

    if (!user_id) {
      throw new Error('User ID is required');
    }

    console.log('=== AI INSIGHTS DEBUG ===');
    console.log('User ID:', user_id);
    console.log('Insight Type:', insight_type);

    // Fetch user's opinions with detailed preferences - get more for better analysis
    const { data: opinions, error: opinionsError } = await supabaseClient
      .from('opinions')
      .select('*, categories(name, id)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (opinionsError) {
      console.error('Error fetching opinions:', opinionsError);
      throw opinionsError;
    }

    console.log('User opinions count:', opinions?.length || 0);

    // Fetch user's InphroSync responses for behavior analysis
    const { data: inphrosyncResponses } = await supabaseClient
      .from('inphrosync_responses')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(100);

    console.log('InphroSync responses count:', inphrosyncResponses?.length || 0);

    // Fetch user profile for demographic context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .maybeSingle();

    console.log('User profile:', profile?.user_type, profile?.country, profile?.age_group);

    // Fetch user's audience profile if they're an audience user
    const { data: audienceProfile } = await supabaseClient
      .from('audience_profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Fetch user activity patterns
    const { data: activityLogs } = await supabaseClient
      .from('user_activity_logs')
      .select('page_name, duration_seconds, session_start')
      .eq('user_id', user_id)
      .not('duration_seconds', 'is', null)
      .gt('duration_seconds', 0)
      .order('session_start', { ascending: false })
      .limit(200);

    // Fetch user's streak and engagement data
    const { data: streakData } = await supabaseClient
      .from('user_streaks')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Fetch user badges for achievement context
    const { data: badges } = await supabaseClient
      .from('user_badges')
      .select('badge_type, badge_name, earned_at')
      .eq('user_id', user_id);

    // Fetch upvotes given and received for engagement analysis
    const { data: upvotesGiven } = await supabaseClient
      .from('opinion_upvotes')
      .select('opinion_id, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get opinion IDs to check upvotes received
    const opinionIds = opinions?.map(o => o.id) || [];
    let upvotesReceived = 0;
    if (opinionIds.length > 0) {
      const { count } = await supabaseClient
        .from('opinion_upvotes')
        .select('id', { count: 'exact', head: true })
        .in('opinion_id', opinionIds);
      upvotesReceived = count || 0;
    }

    // Extract detailed preferences from opinions with richer analysis
    const extractedPreferences = opinions?.map((o: any) => ({
      category: o.categories?.name,
      categoryId: o.categories?.id,
      genre: o.genre,
      contentType: o.content_type,
      title: o.title,
      wouldPay: o.would_pay,
      preferences: o.preferences,
      whyExcited: o.why_excited,
      description: o.description?.substring(0, 300),
      estimatedBudget: o.estimated_budget,
      targetAudience: o.target_audience,
      similarContent: o.similar_content,
      createdAt: o.created_at,
    })) || [];

    // Analyze mood patterns from InphroSync
    const moodAnalysis = inphrosyncResponses?.reduce((acc: any, r: any) => {
      if (r.question_type === 'mood') {
        acc.moods = acc.moods || {};
        acc.moods[r.selected_option] = (acc.moods[r.selected_option] || 0) + 1;
      }
      if (r.question_type === 'device') {
        acc.devices = acc.devices || {};
        acc.devices[r.selected_option] = (acc.devices[r.selected_option] || 0) + 1;
      }
      if (r.question_type === 'app' || r.question_type === 'platform') {
        acc.apps = acc.apps || {};
        acc.apps[r.selected_option] = (acc.apps[r.selected_option] || 0) + 1;
      }
      if (r.question_type === 'time') {
        acc.times = acc.times || {};
        acc.times[r.selected_option] = (acc.times[r.selected_option] || 0) + 1;
      }
      return acc;
    }, {});

    // Analyze activity patterns (time of day, most active pages)
    const activityPatterns = activityLogs?.reduce((acc: any, log: any) => {
      const page = log.page_name || 'unknown';
      acc.pages = acc.pages || {};
      acc.pages[page] = (acc.pages[page] || 0) + (log.duration_seconds || 0);
      
      if (log.session_start) {
        const hour = new Date(log.session_start).getHours();
        acc.hours = acc.hours || {};
        acc.hours[hour] = (acc.hours[hour] || 0) + 1;
      }
      return acc;
    }, {});

    // Determine peak activity time
    const peakHour = activityPatterns?.hours 
      ? Object.entries(activityPatterns.hours).sort((a: any, b: any) => b[1] - a[1])[0]?.[0]
      : null;
    
    const getTimeOfDay = (hour: number) => {
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 21) return 'evening';
      return 'night';
    };

    // Calculate engagement score with more factors
    const engagementFactors = {
      opinions: Math.min(40, (opinions?.length || 0) * 2),
      inphrosync: Math.min(20, (inphrosyncResponses?.length || 0)),
      streak: Math.min(20, (streakData?.current_streak_weeks || 0) * 5),
      badges: Math.min(10, (badges?.length || 0) * 2),
      upvotes: Math.min(10, (upvotesReceived || 0)),
    };
    const engagementScore = Object.values(engagementFactors).reduce((a, b) => a + b, 0);

    // Analyze genre and category frequency
    const genreFrequency: Record<string, number> = {};
    const categoryFrequency: Record<string, number> = {};
    const contentTypeFrequency: Record<string, number> = {};
    
    extractedPreferences.forEach(p => {
      if (p.genre) genreFrequency[p.genre] = (genreFrequency[p.genre] || 0) + 1;
      if (p.category) categoryFrequency[p.category] = (categoryFrequency[p.category] || 0) + 1;
      if (p.contentType) contentTypeFrequency[p.contentType] = (contentTypeFrequency[p.contentType] || 0) + 1;
    });

    const sortedGenres = Object.entries(genreFrequency).sort((a, b) => b[1] - a[1]);
    const sortedCategories = Object.entries(categoryFrequency).sort((a, b) => b[1] - a[1]);
    const sortedContentTypes = Object.entries(contentTypeFrequency).sort((a, b) => b[1] - a[1]);

    // Build rich user context
    const userContext = {
      // Demographics
      userId: user_id,
      userType: profile?.user_type || 'audience',
      country: profile?.country || 'India',
      city: profile?.city || 'Unknown',
      ageGroup: profile?.age_group || 'Unknown',
      gender: profile?.gender || 'Not specified',
      
      // Activity metrics
      opinionsCount: opinions?.length || 0,
      inphrosyncParticipation: inphrosyncResponses?.length || 0,
      engagementScore,
      engagementBreakdown: engagementFactors,
      currentStreak: streakData?.current_streak_weeks || 0,
      longestStreak: streakData?.longest_streak_weeks || 0,
      badgesEarned: badges?.length || 0,
      badgeTypes: badges?.map(b => b.badge_name) || [],
      
      // Content preferences (ranked by frequency)
      topCategories: sortedCategories.slice(0, 5).map(([name, count]) => ({ name, count })),
      topGenres: sortedGenres.slice(0, 5).map(([name, count]) => ({ name, count })),
      topContentTypes: sortedContentTypes.slice(0, 3).map(([name, count]) => ({ name, count })),
      
      // All categories and genres for variety analysis
      uniqueCategories: Object.keys(categoryFrequency).length,
      uniqueGenres: Object.keys(genreFrequency).length,
      
      // Behavioral patterns
      moodPatterns: moodAnalysis?.moods || {},
      devicePreferences: moodAnalysis?.devices || {},
      appPreferences: moodAnalysis?.apps || {},
      timePreferences: moodAnalysis?.times || {},
      
      // Activity patterns
      peakActivityTime: peakHour ? getTimeOfDay(parseInt(peakHour)) : 'varied',
      mostActivePages: activityPatterns?.pages 
        ? Object.entries(activityPatterns.pages).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).map(([p]) => p)
        : [],
      
      // Audience-specific preferences
      entertainmentPreferences: audienceProfile?.entertainment_preferences || [],
      favoritePlatforms: audienceProfile?.favorite_platforms || [],
      genreInterests: audienceProfile?.genre_interests || [],
      contentFrequency: audienceProfile?.content_frequency || 'Unknown',
      preferredDevices: audienceProfile?.preferred_devices || [],
      
      // Willingness to pay analysis
      willingnessToPay: extractedPreferences.filter(p => p.wouldPay === true).length,
      totalRatedOpinions: extractedPreferences.filter(p => p.wouldPay !== null).length,
      paymentWillingnessRate: extractedPreferences.filter(p => p.wouldPay !== null).length > 0
        ? Math.round((extractedPreferences.filter(p => p.wouldPay === true).length / extractedPreferences.filter(p => p.wouldPay !== null).length) * 100)
        : 0,
      
      // Sample of what excites them (rich context)
      excitementFactors: extractedPreferences.slice(0, 5).map(p => ({
        title: p.title,
        reason: p.whyExcited?.substring(0, 150),
        category: p.category,
        genre: p.genre,
      })).filter(p => p.reason),
      
      // Social engagement
      upvotesGiven: upvotesGiven?.length || 0,
      upvotesReceived,
      
      // Recent activity context
      recentOpinions: extractedPreferences.slice(0, 5).map(p => ({
        title: p.title,
        category: p.category,
        genre: p.genre,
      })),
    };

    console.log('User context built:', {
      topCategories: userContext.topCategories,
      topGenres: userContext.topGenres,
      engagementScore: userContext.engagementScore,
      uniqueGenres: userContext.uniqueGenres,
    });

    let systemPrompt = '';
    let userPrompt = '';

    switch (insight_type) {
      case 'recommendations':
        systemPrompt = `You are Inphrone's AI entertainment analyst. Your job is to provide HIGHLY PERSONALIZED, SPECIFIC content recommendations.

IMPORTANT RULES:
1. Be SPECIFIC - recommend actual content titles, franchises, or creators that match their taste
2. Use their ACTUAL data - reference their genres, moods, and viewing patterns
3. Consider their LOCATION (${userContext.country}) for regional content availability
4. Match recommendations to their AGE GROUP (${userContext.ageGroup}) appropriately
5. Include a MIX of categories they already like AND one discovery recommendation
6. Keep reasons CONCISE but PERSONALIZED (reference their specific preferences)

Format: JSON with { recommendations: [{ title: string, reason: string, category: string }], summary: string }`;
        
        userPrompt = `Generate 5 SPECIFIC entertainment recommendations for this user:

=== USER PROFILE ===
Location: ${userContext.city}, ${userContext.country}
Age: ${userContext.ageGroup}
Engagement: ${userContext.engagementScore}/100

=== THEIR TOP PREFERENCES (by frequency) ===
Categories: ${userContext.topCategories.map(c => `${c.name}(${c.count})`).join(', ') || 'Exploring'}
Genres: ${userContext.topGenres.map(g => `${g.name}(${g.count})`).join(', ') || 'Diverse'}
Content Types: ${userContext.topContentTypes.map(c => `${c.name}(${c.count})`).join(', ') || 'Various'}

=== CONSUMPTION PATTERNS ===
Preferred Mood: ${Object.entries(userContext.moodPatterns).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([k, v]) => `${k}`).join(', ') || 'Varied'}
Peak Activity: ${userContext.peakActivityTime}
Devices: ${Object.keys(userContext.devicePreferences).slice(0, 2).join(', ') || userContext.preferredDevices.slice(0, 2).join(', ') || 'Multi-device'}
Platforms: ${userContext.favoritePlatforms.slice(0, 3).join(', ') || Object.keys(userContext.appPreferences).slice(0, 3).join(', ') || 'Various'}

=== WHAT EXCITES THEM ===
${userContext.excitementFactors.slice(0, 3).map((e, i) => `${i + 1}. "${e.title}" (${e.category}/${e.genre}): "${e.reason}"`).join('\n') || 'Exploring new content'}

=== ENGAGEMENT STYLE ===
Willing to Pay: ${userContext.paymentWillingnessRate}% of rated content
Content Frequency: ${userContext.contentFrequency}
Variety Explorer: ${userContext.uniqueGenres > 3 ? 'Yes - enjoys diverse genres' : 'No - prefers familiar genres'}

Provide 4 recommendations matching their taste + 1 discovery recommendation for something new they might enjoy.`;
        break;

      case 'taste_profile':
        systemPrompt = `You are Inphrone's entertainment personality analyst. Create UNIQUE, MEMORABLE taste profiles.

RULES:
1. Give them a CREATIVE, MEMORABLE title (like "Midnight Thriller Maven" or "Family Comedy Curator")
2. The title should reflect their ACTUAL viewing patterns and preferences
3. Identify 4-5 SPECIFIC traits based on their data
4. Include a personality insight that feels personal
5. Be POSITIVE and CELEBRATORY of their unique taste

Format: JSON with { profileTitle: string, description: string, topTraits: string[], matchingPersonality: string }`;
        
        userPrompt = `Create a UNIQUE entertainment personality profile:

=== USER DATA ===
${userContext.opinionsCount} opinions across ${userContext.uniqueCategories} categories and ${userContext.uniqueGenres} genres
Top Categories: ${userContext.topCategories.slice(0, 3).map(c => c.name).join(', ')}
Top Genres: ${userContext.topGenres.slice(0, 4).map(g => g.name).join(', ')}
From: ${userContext.city}, ${userContext.country}
Age: ${userContext.ageGroup}

=== VIEWING BEHAVIOR ===
Peak Time: ${userContext.peakActivityTime}
Mood Patterns: ${Object.entries(userContext.moodPatterns).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(', ') || 'Varied'}
Device Preference: ${Object.entries(userContext.devicePreferences).sort((a: any, b: any) => b[1] - a[1]).slice(0, 1).map(([k]) => k).join('') || 'Multi-device'}
Favorite Platforms: ${userContext.favoritePlatforms.slice(0, 3).join(', ') || Object.keys(userContext.appPreferences).slice(0, 3).join(', ') || 'Various'}

=== ENGAGEMENT STYLE ===
Streak: ${userContext.currentStreak} weeks (longest: ${userContext.longestStreak})
Badges: ${userContext.badgeTypes.slice(0, 3).join(', ') || 'Earning soon'}
Willingness to Pay: ${userContext.paymentWillingnessRate}%
Social: ${userContext.upvotesGiven} upvotes given, ${userContext.upvotesReceived} received

=== CONTENT INTERESTS ===
${userContext.excitementFactors.slice(0, 2).map(e => `"${e.title}": "${e.reason?.substring(0, 80)}..."`).join('\n') || 'Exploring diverse content'}

Create a memorable personality title and profile that celebrates their unique entertainment taste!`;
        break;

      case 'trending':
        systemPrompt = `You are Inphrone's trends analyst. Identify trends RELEVANT to this specific user's interests.

RULES:
1. Focus on trends in their TOP CATEGORIES and GENRES
2. Consider their LOCATION (${userContext.country}) for regional trends
3. Match their AGE GROUP (${userContext.ageGroup}) for relevant trends
4. Include momentum indicators: Rising, Hot, Viral, Emerging
5. Explain WHY each trend matters for THEM specifically

Format: JSON with { trends: [{ topic: string, insight: string, momentum: string }], overview: string }`;
        
        userPrompt = `Find 5 entertainment trends relevant to this user:

=== USER INTERESTS ===
Top Categories: ${userContext.topCategories.slice(0, 3).map(c => c.name).join(', ')}
Top Genres: ${userContext.topGenres.slice(0, 4).map(g => g.name).join(', ')}
Content Types: ${userContext.topContentTypes.map(c => c.name).join(', ') || 'Various'}

=== DEMOGRAPHICS ===
Location: ${userContext.city}, ${userContext.country}
Age: ${userContext.ageGroup}
Platforms: ${userContext.favoritePlatforms.slice(0, 3).join(', ') || Object.keys(userContext.appPreferences).slice(0, 3).join(', ') || 'Various'}

=== THEIR TASTE SIGNALS ===
Moods: ${Object.entries(userContext.moodPatterns).sort((a: any, b: any) => b[1] - a[1]).slice(0, 2).map(([k]) => k).join(', ') || 'Varied'}
Recent interests: ${userContext.recentOpinions.slice(0, 3).map(o => `${o.title} (${o.genre})`).join(', ') || 'Exploring'}

Find trends in ${userContext.country} that match their interests in ${userContext.topCategories.slice(0, 2).map(c => c.name).join(' and ')}.
Rate each trend's momentum: Rising (growing), Hot (popular now), Viral (exploding), Emerging (early stage).`;
        break;

      default:
        systemPrompt = `You are an entertainment insights AI. Provide helpful, personalized insights.`;
        userPrompt = `Analyze this user's entertainment profile and provide insights:
Categories: ${userContext.topCategories.map(c => c.name).join(', ')}
Genres: ${userContext.topGenres.map(g => g.name).join(', ')}
Activity: ${userContext.opinionsCount} opinions, ${userContext.engagementScore} engagement score`;
    }

    // Define response schema for structured output
    const getResponseSchema = (type: string) => {
      switch (type) {
        case 'recommendations':
          return {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Specific content title or franchise name" },
                    reason: { type: "string", description: "Personalized reason referencing user's preferences" },
                    category: { type: "string", description: "Content category" }
                  },
                  required: ["title", "reason", "category"]
                },
                minItems: 5,
                maxItems: 5
              },
              summary: { type: "string", description: "Brief personalized summary of recommendation strategy" }
            },
            required: ["recommendations", "summary"]
          };
        case 'taste_profile':
          return {
            type: "object",
            properties: {
              profileTitle: { type: "string", description: "Creative, memorable title for their entertainment personality" },
              description: { type: "string", description: "Personalized description of their viewing style" },
              topTraits: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 5, description: "Key personality traits" },
              matchingPersonality: { type: "string", description: "A quote or insight about their entertainment philosophy" }
            },
            required: ["profileTitle", "description", "topTraits", "matchingPersonality"]
          };
        case 'trending':
          return {
            type: "object",
            properties: {
              trends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string", description: "Trend topic or title" },
                    insight: { type: "string", description: "Why this trend matters for this user" },
                    momentum: { type: "string", enum: ["Rising", "Hot", "Viral", "Emerging"], description: "Current momentum" }
                  },
                  required: ["topic", "insight", "momentum"]
                },
                minItems: 5,
                maxItems: 5
              },
              overview: { type: "string", description: "Brief overview of trends relevant to user" }
            },
            required: ["trends", "overview"]
          };
        default:
          return null;
      }
    };

    const schema = getResponseSchema(insight_type);

    // Build request body with optional tool calling for structured output
    const requestBody: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    };

    // Use tool calling for structured output
    if (schema) {
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: `generate_${insight_type}`,
            description: `Generate ${insight_type} insights for the user`,
            parameters: schema
          }
        }
      ];
      requestBody.tool_choice = { type: "function", function: { name: `generate_${insight_type}` } };
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Please try again in a few minutes." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "AI service temporarily unavailable. Please try again later." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error("Failed to generate insights. Please try again.");
    }

    const aiResponse = await response.json();
    
    // Extract content from tool call response or regular message
    let parsedContent;
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function?.arguments) {
      try {
        parsedContent = JSON.parse(toolCall.function.arguments);
        console.log('Parsed from tool call, keys:', Object.keys(parsedContent));
      } catch (parseErr) {
        console.error('Failed to parse tool call arguments:', parseErr);
        parsedContent = { text: toolCall.function.arguments };
      }
    } else {
      const content = aiResponse.choices?.[0]?.message?.content || '';
      console.log('AI response received, length:', content.length);

      // Try to parse as JSON, fallback to text
      try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : content;
        parsedContent = JSON.parse(jsonStr);
      } catch {
        parsedContent = { text: content };
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        insight_type,
        data: parsedContent,
        context: {
          opinionsCount: userContext.opinionsCount,
          topCategories: userContext.topCategories.slice(0, 3).map(c => c.name),
          engagementScore: userContext.engagementScore,
          location: `${userContext.city}, ${userContext.country}`,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in ai-insights:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
