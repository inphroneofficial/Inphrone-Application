import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageSquare,
  BarChart3,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { allowedCategoryNames } from "@/lib/contentFilters";

interface StatsData {
  totalOpinions: number;
  totalUpvotes: number;
  totalUsers: number;
  activeUsers: number;
  categoriesStats: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  topOpinions: Array<{
    title: string;
    upvotes: number;
    category: string;
    author: string;
  }>;
  contentTypes: Record<string, number>;
  demographics: {
    ageGroups: Record<string, number>;
    genderDistribution: Record<string, number>;
    locationStats: Record<string, number>;
  };
  userBreakdown?: {
    audience?: number;
    creator?: number;
    studio?: number;
    production?: number;
    ott?: number;
    tv?: number;
    gaming?: number;
    music?: number;
  };
}

const Stats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalOpinions: 0,
    totalUpvotes: 0,
    totalUsers: 0,
    activeUsers: 0,
    categoriesStats: [],
    topOpinions: [],
    contentTypes: {},
    demographics: {
      ageGroups: {},
      genderDistribution: {},
      locationStats: {}
    }
  });

  useEffect(() => {
    const initStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to view stats");
        navigate("/auth");
        return;
      }

      // Start time tracking
      const { data: logData } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: session.user.id,
          page_name: 'stats',
          session_start: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (logData) {
        setSessionLogId(logData.id);
      }

      await fetchStats();
    };

    initStats();

    // Cleanup
    return () => {
      if (sessionLogId) {
        const endTracking = async () => {
          const { data: log } = await supabase
            .from('user_activity_logs')
            .select('session_start')
            .eq('id', sessionLogId)
            .single();
          
          if (log) {
            const sessionEnd = new Date();
            const sessionStart = new Date(log.session_start);
            const durationSeconds = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
            
            await supabase
              .from('user_activity_logs')
              .update({
                session_end: sessionEnd.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq('id', sessionLogId);
          }
        };
        endTracking();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view stats");
      navigate("/auth");
      return;
    }

    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      // Identify current user type and (optional) creator type
      const { data: { session } } = await supabase.auth.getSession();
      let userType: "audience" | "creator" | "studio" | "production" | "ott" = "audience";
      let creatorType: string | null = null;
      if (session?.user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", session.user.id)
          .maybeSingle();
        if (prof?.user_type) userType = prof.user_type as any;
        if (userType === "creator") {
          const { data: cprof } = await supabase
            .from("creator_profiles")
            .select("creator_type")
            .eq("user_id", session.user.id)
            .maybeSingle();
          creatorType = cprof?.creator_type ?? null;
        }
      }

      // Fetch all opinions
      const { data: opinions, error: opinionsError } = await supabase
        .from("opinions")
        .select("*")
        .order('upvotes', { ascending: false });

      if (opinionsError) throw opinionsError;

      // Fetch categories
      const { data: categories } = await supabase
        .from("categories")
        .select("*");

      // Fetch profiles with full details for demographics
      const userIds = [...new Set(opinions?.map(o => o.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, date_of_birth, gender, state_region")
        .in("id", userIds);

      // Create lookup maps
      const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);

      // Apply role-based category visibility
      const allowedNames = allowedCategoryNames(userType as any, creatorType);
      const allowedIds = new Set((categories || []).filter(c => allowedNames.includes(c.name)).map(c => c.id));
      const filteredOpinions = (opinions || []).filter(o => allowedIds.has(o.category_id));
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Calculate stats
      const totalOpinions = filteredOpinions.length || 0;
      const totalUpvotes = filteredOpinions.reduce((sum, o) => sum + (o.upvotes || 0), 0) || 0;

      // Count unique users
      const uniqueUsers = new Set(filteredOpinions.map(o => o.user_id)).size;

      // Count total signups (secure via RPC to bypass RLS)
      const { data: counts, error: countsError } = await supabase.rpc('get_user_counts');
      if (countsError) throw countsError;
      const totalSignups = counts?.[0]?.total_users || 0;

      // Calculate demographics
      const ageGroups: Record<string, number> = {};
      const genderDistribution: Record<string, number> = {};
      const locationStats: Record<string, number> = {};

      profiles?.forEach(profile => {
        // Calculate age from date_of_birth
        const dob = profile.date_of_birth;
        if (dob) {
          const birthDate = new Date(dob);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          const ageGroup = age < 18 ? "Under 18" : age < 25 ? "18-24" : age < 35 ? "25-34" : age < 45 ? "35-44" : age < 55 ? "45-54" : "55+";
          ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + 1;
        }

        // Gender distribution
        const gender = profile.gender || "Not specified";
        genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;

        // Location stats (by state/region)
        const location = profile.state_region || "Unknown";
        locationStats[location] = (locationStats[location] || 0) + 1;
      });

      // Group by categories
      const categoryStatsMap = new Map<string, { count: number; color: string }>();
      filteredOpinions.forEach(o => {
        const cat = categoryMap.get(o.category_id);
        const catName = cat?.name || "Unknown";
        const catColor = cat?.color || "text-gray-500";
        const existing = categoryStatsMap.get(catName) || { count: 0, color: catColor };
        categoryStatsMap.set(catName, { count: existing.count + 1, color: catColor });
      });

      const categoriesStats = Array.from(categoryStatsMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.count - a.count);

      // Top opinions
      const topOpinions = filteredOpinions
        ?.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 5)
        .map(o => {
          const cat = categoryMap.get(o.category_id);
          const profile = profileMap.get(o.user_id);
          return {
            title: o.title,
            upvotes: o.upvotes || 0,
            category: cat?.name || "Unknown",
            author: profile?.full_name || "Anonymous"
          };
        }) || [];

      // Content types distribution
      const contentTypes: Record<string, number> = {};
      filteredOpinions.forEach(o => {
        const type = o.content_type || "Unknown";
        contentTypes[type] = (contentTypes[type] || 0) + 1;
      });

      setStats({
        totalOpinions,
        totalUpvotes,
        totalUsers: totalSignups || 0,
        activeUsers: uniqueUsers,
        categoriesStats,
        topOpinions,
        contentTypes,
        demographics: {
          ageGroups,
          genderDistribution,
          locationStats
        },
        userBreakdown: counts ? {
          audience: counts[0].audience,
          creator: counts[0].creator,
          studio: counts[0].studio,
          production: counts[0].production,
          ott: counts[0].ott,
          tv: counts[0].tv,
          gaming: counts[0].gaming,
          music: counts[0].music,
        } : undefined
      });

      setLoading(false);
    } catch (error: any) {
      toast.error("Failed to load stats");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-primary">
          <TrendingUp className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Community Insights
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time stats from our creative community
              </p>
            </div>
            <Badge className="gradient-primary text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Live Stats
            </Badge>
          </div>

          {/* Overview Cards */}
          <div className="grid md:grid-cols-4 gap-6 animate-slide-up">
            <Card className="shadow-elegant hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary/10 to-accent/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Signups
                </CardTitle>
                <Users className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Audience: {stats.userBreakdown?.audience ?? 0} · Creators: {stats.userBreakdown?.creator ?? 0} · Studios: {stats.userBreakdown?.studio ?? 0} · TV: {stats.userBreakdown?.tv ?? 0} · Gaming: {stats.userBreakdown?.gaming ?? 0} · Music: {stats.userBreakdown?.music ?? 0}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Contributors
                </CardTitle>
                <Users className="w-5 h-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.activeUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Users with opinions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-accent/10 to-pink-500/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Opinions
                </CardTitle>
                <MessageSquare className="w-5 h-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{stats.totalOpinions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Shared insights
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Upvotes
                </CardTitle>
                <Heart className="w-5 h-5 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{stats.totalUpvotes}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Community validation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demographics Section */}
          <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
            {/* Age Distribution */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.demographics.ageGroups)
                    .sort(([, a], [, b]) => b - a)
                    .map(([age, count], index) => (
                      <div key={age} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{age}</span>
                          <span className="text-sm text-muted-foreground">{count} users</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${(count / stats.totalUsers) * 100}%`,
                              animationDelay: `${index * 0.1}s`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.demographics.genderDistribution)
                    .sort(([, a], [, b]) => b - a)
                    .map(([gender, count], index) => (
                      <div key={gender} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm capitalize">{gender}</span>
                          <span className="text-sm text-muted-foreground">{count} users</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${(count / stats.totalUsers) * 100}%`,
                              animationDelay: `${index * 0.1}s`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.demographics.locationStats)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([location, count], index) => (
                      <div key={location} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{location}</span>
                          <span className="text-sm text-muted-foreground">{count} users</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${(count / stats.totalUsers) * 100}%`,
                              animationDelay: `${index * 0.1}s`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Distribution */}
          <Card className="shadow-elegant animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Categories Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categoriesStats.map((cat, index) => (
                  <div key={cat.category} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${cat.color}`}>{cat.category}</span>
                      <span className="text-sm text-muted-foreground">{cat.count} opinions</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 gradient-primary rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(cat.count / stats.totalOpinions) * 100}%`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Opinions */}
          <Card className="shadow-elegant animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Opinions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topOpinions.map((opinion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all hover:scale-102 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{opinion.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {opinion.author} • {opinion.category}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      <Heart className="w-3 h-3 mr-1" />
                      {opinion.upvotes}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Types */}
          <Card className="shadow-elegant animate-fade-in">
            <CardHeader>
              <CardTitle>Content Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.contentTypes).map(([type, count], index) => (
                  <Badge
                    key={type}
                    className="px-4 py-2 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {type.replace(/_/g, ' ')}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;
