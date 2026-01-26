import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  TrendingUp, 
  Award, 
  LogOut,
  Film,
  Music,
  Tv,
  Youtube,
  Gamepad2,
  Sparkles,
  Share2,
  User as UserIcon,
  Clock,
  Gift,
  Smartphone
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ShareButton } from "@/components/ShareButton";
import { User } from "@supabase/supabase-js";
import { allowedCategoryNames } from "@/lib/contentFilters";
import { getDaysUntilNextMondayUTC } from "@/lib/week";
import { ProfileActivityAnalysis } from "@/components/profile/ProfileActivityAnalysis";
import { useRealtimeLikeNotifications } from "@/hooks/useRealtimeLikeNotifications";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import { useEnhancedNotifications } from "@/hooks/useEnhancedNotifications";
import { AIInsightsCard } from "@/components/insights/AIInsightsCard";
import { SectionTransition } from "@/components/PageTransition";
// Tour is now handled globally by SpotlightTourProvider
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { UserLeaderboard } from "@/components/dashboard/UserLeaderboard";
import { TrendingTopics } from "@/components/dashboard/TrendingTopics";
import { EmailVerificationBanner } from "@/components/common/EmailVerificationBanner";
import { NonAudienceDashboard } from "@/components/dashboard/NonAudienceDashboard";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryWithStats extends Category {
  lastSubmission?: Date;
  submissionCount: number;
  canSubmit: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<"audience" | "creator" | "studio" | "ott" | "tv" | "gaming" | "music" | "developer">("audience");
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [stats, setStats] = useState({
    opinions: 0,
    rewards: 0,
    level: 1,
    totalLikes: 0,
    likesGiven: 0,
    activeContributors: 0
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const daysLeftInWeek = getDaysUntilNextMondayUTC();
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);

  // Real-time like notifications
  useRealtimeLikeNotifications(user?.id || null);
  
  // Enhanced notifications
  useEnhancedNotifications(user?.id || null);
  
  // Keep-alive mechanism
  useKeepAlive();

  useEffect(() => {
    let opinionsChannel: any = null;
    let upvotesChannel: any = null;
    
    const initDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (!session) {
          setLoading(false);
          navigate("/auth");
          return;
        }

        // Start time tracking
        const { data: logData } = await supabase
          .from('user_activity_logs')
          .insert({
            user_id: session.user.id,
            page_name: 'dashboard',
            session_start: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (logData) {
          setSessionLogId(logData.id);
        }

        // Check if onboarding is complete and get user type
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed, user_type, settings, full_name, profile_picture")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          console.error("Profile fetch error:", profileError);
          toast.error("Failed to load profile. Please try refreshing.");
          setLoading(false);
          return;
        }

        if (!profile.onboarding_completed) {
          navigate("/onboarding");
          return;
        }

        // Only show tour for first-time users who haven't completed onboarding tour
        // Do NOT auto-show for existing users who already completed the tour
        const settings = profile.settings as { tour_completed?: boolean } | null;
        // Tour is only shown via settings dialog for existing users, not auto-shown

        setUserType(profile.user_type as "audience" | "creator" | "studio" | "ott" | "tv" | "gaming" | "music" | "developer");
        setUserName(profile.full_name || "");
        setUserAvatar(profile.profile_picture || null);
      
      // Fetch categories
      let { data: categoriesData } = await supabase
        .from("categories")
        .select("*");

      // If non-audience, filter categories by role rules
      if (profile.user_type !== "audience") {
        let creatorType: string | null = null;
        if (profile.user_type === "creator") {
          const { data: cprof } = await supabase
            .from("creator_profiles")
            .select("creator_type")
            .eq("user_id", session.user.id)
            .maybeSingle();
          creatorType = cprof?.creator_type ?? null;
        }
        const allowed = allowedCategoryNames(profile.user_type as any, creatorType);
        categoriesData = (categoriesData || []).filter(cat => allowed.includes(cat.name));
      }
      
      // Fetch total registered users using RPC to bypass RLS
      const { data: userCounts } = await supabase.rpc('get_user_counts');
      setTotalUsers(userCounts?.[0]?.total_users || 0);

      // Fetch user stats and category submission status
      if (profile.user_type === "audience") {
        const { data: opinionsData } = await supabase
          .from("opinions")
          .select("id, category_id, created_at, upvotes")
          .eq("user_id", session.user.id);
        
        const { data: rewardsData } = await supabase
          .from("rewards")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        // Calculate total likes given by user
        const { data: upvotesData } = await supabase
          .from("opinion_upvotes")
          .select("id")
          .eq("user_id", session.user.id);

        // Calculate total likes received - count ALL likes from opinion_upvotes table
        let totalLikes = 0;
        const myOpinionIds = (opinionsData || []).map(o => o.id);
        if (myOpinionIds.length > 0) {
          const { data: allLikes } = await supabase
            .from('opinion_upvotes')
            .select('id', { count: 'exact' })
            .in('opinion_id', myOpinionIds);
          // Count ALL likes (both audience upvotes and non-audience likes)
          totalLikes = allLikes?.length || 0;
        }

        setStats({
          opinions: opinionsData?.length || 0,
          rewards: rewardsData?.points || 0,
          level: rewardsData?.level || 1,
          totalLikes,
          likesGiven: upvotesData?.length || 0,
          activeContributors: 0
        });

        // Process categories with submission stats
        if (categoriesData) {
          const categoriesWithStats: CategoryWithStats[] = categoriesData.map(category => {
            const categoryOpinions = opinionsData?.filter(op => op.category_id === category.id) || [];
            const lastOpinion = categoryOpinions.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            
            let canSubmit = true;
            if (lastOpinion) {
              const daysSinceLastSubmission = (Date.now() - new Date(lastOpinion.created_at).getTime()) / (1000 * 60 * 60 * 24);
              canSubmit = daysSinceLastSubmission >= 7;
            }

            return {
              ...category,
              lastSubmission: lastOpinion ? new Date(lastOpinion.created_at) : undefined,
              submissionCount: categoryOpinions.length,
              canSubmit
            };
          });
          setCategories(categoriesWithStats);
        }
      } else {
        // For creators/studios: fetch insights stats
        const { data: allOpinions } = await supabase
          .from("opinions")
          .select("id, user_id, upvotes");

        // Count unique users who gave upvotes (active contributors)
        const { data: allUpvotes } = await supabase
          .from("opinion_upvotes")
          .select("user_id");
        
        const uniqueContributors = new Set(allUpvotes?.map(u => u.user_id) || []).size;
        
        setStats({
          opinions: allOpinions?.length || 0,
          rewards: 0,
          level: 1,
          totalLikes: 0,
          likesGiven: 0,
          activeContributors: uniqueContributors
        });

        // For non-audience users, filter categories already applied above and mark as view-only
        const categoriesWithStats: CategoryWithStats[] = (categoriesData || []).map(cat => ({
          ...cat,
          submissionCount: 0,
          canSubmit: false
        }));
        setCategories(categoriesWithStats);
      }
      
      // Set up realtime subscription for opinions
      opinionsChannel = supabase
        .channel('dashboard-opinions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'opinions', filter: `user_id=eq.${session.user.id}` },
          () => {
            // Refetch data when opinions change
            fetchUserData(session.user.id);
          }
        )
        .subscribe();
      
      // Set up realtime subscription for upvotes
      upvotesChannel = supabase
        .channel('dashboard-upvotes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'opinion_upvotes' },
          () => {
            // Refetch data when upvotes change
            fetchUserData(session.user.id);
          }
        )
        .subscribe();
      
      setLoading(false);
    } catch (error: any) {
      console.error("Dashboard initialization error:", error);
      toast.error("Failed to load dashboard. Please refresh the page.");
      setLoading(false);
    }
    };

    initDashboard();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Check onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, user_type")
        .eq("id", session.user.id)
        .single();

      if (!profile?.onboarding_completed) {
        navigate("/onboarding");
        return;
      }

      setUserType(profile.user_type as "audience" | "creator" | "studio" | "ott" | "tv" | "gaming" | "music" | "developer");
    });

    // Set up interval to check for weekly reset every minute
    const weekCheckInterval = setInterval(async () => {
      const newDaysLeft = getDaysUntilNextMondayUTC();
      // If days increased, it means we crossed into a new week
      if (newDaysLeft === 7) {
        // Week just reset, refresh user data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetchUserData(user.id);
          toast.success("🎉 New week started! You can submit new opinions now.");
        }
      }
    }, 60000); // Check every minute

    // Cleanup - end time tracking on unmount and unsubscribe from realtime
    return () => {
      clearInterval(weekCheckInterval);
      
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
      
      // Cleanup realtime subscription
      if (opinionsChannel) {
        supabase.removeChannel(opinionsChannel);
      }
      if (upvotesChannel) {
        supabase.removeChannel(upvotesChannel);
      }
      
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    const { data: opinionsData } = await supabase
      .from("opinions")
      .select("id, category_id, created_at, upvotes")
      .eq("user_id", userId);
    
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*");

    if (opinionsData && categoriesData) {
      // Calculate total likes received - count ALL likes from opinion_upvotes table
      let totalLikes = 0;
      const myOpinionIds = (opinionsData || []).map(o => o.id);
      if (myOpinionIds.length > 0) {
        const { data: allLikes } = await supabase
          .from('opinion_upvotes')
          .select('id', { count: 'exact' })
          .in('opinion_id', myOpinionIds);
        totalLikes = allLikes?.length || 0;
      }
      
      const categoriesWithStats: CategoryWithStats[] = categoriesData.map(category => {
        const categoryOpinions = opinionsData.filter(op => op.category_id === category.id);
        const lastOpinion = categoryOpinions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        
        let canSubmit = true;
        if (lastOpinion) {
          const daysSinceLastSubmission = (Date.now() - new Date(lastOpinion.created_at).getTime()) / (1000 * 60 * 60 * 24);
          canSubmit = daysSinceLastSubmission >= 7;
        }

        return {
          ...category,
          lastSubmission: lastOpinion ? new Date(lastOpinion.created_at) : undefined,
          submissionCount: categoryOpinions.length,
          canSubmit
        };
      });

      setCategories(categoriesWithStats);
      setStats(prev => ({
        ...prev,
        opinions: opinionsData.length,
        totalLikes
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  const iconMap: Record<string, any> = {
    Film,
    Music,
    Tv,
    Youtube,
    Gamepad2,
    Share2,
    Smartphone
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-primary">
          <TrendingUp className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Email Verification Banner */}
      <EmailVerificationBanner />
      
      <Navbar />
      
      {/* Enhanced Header with Glassmorphism */}
      <header className="sticky top-16 z-40 backdrop-blur-xl bg-background/95 border-b border-border/50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                      {userAvatar ? (
                        <img 
                          src={userAvatar} 
                          alt={userName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg md:text-xl font-bold text-primary">
                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                </div>
                <div className="relative">
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {userName || "Welcome"}
                  </h1>
                </div>
                <Badge className={`${
                  userType === "creator" ? "bg-accent text-accent-foreground" : 
                  userType === "studio" ? "bg-success text-success-foreground" :
                  userType === "ott" ? "bg-primary text-primary-foreground" :
                  userType === "tv" ? "bg-accent text-accent-foreground" :
                  userType === "gaming" ? "bg-destructive text-destructive-foreground" :
                  userType === "music" ? "bg-accent text-accent-foreground" :
                  userType === "developer" ? "bg-blue-600 text-white" :
                  "bg-primary text-primary-foreground"
                } border-0 shadow-md`}>
                  {userType === "creator" ? "✨ Creator" : 
                   userType === "studio" ? "🎬 Studio" :
                   userType === "ott" ? "📺 OTT" :
                   userType === "tv" ? "📡 TV Network" :
                   userType === "gaming" ? "🎮 Game Dev" :
                   userType === "music" ? "🎵 Music" :
                   userType === "developer" ? "💻 App Developer" :
                   "🎬 Audience"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShareButton />
                {userType === "audience" && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate("/my-coupons")}
                    className="hover-scale-102 hover-lift gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="hidden sm:inline">My Coupons</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="hover-scale-102 hover-lift gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="border-destructive/50 hover:bg-destructive/10 hover-scale-102 gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          {/* Enhanced Welcome Section with Animation */}
          <SectionTransition>
            <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 shadow-elegant">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
              
              <div className="relative z-10 space-y-4">
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Welcome back! 👋
                </h2>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
                  {userType === "audience" 
                    ? "🎬 Share your voice and help shape the future of entertainment globally"
                    : "✨ Explore deep audience insights and discover what your audience craves next"}
                </p>
              </div>
            </div>
          </SectionTransition>

          {/* Non-Audience Dashboard - Show analytics for creators/studios/etc */}
          {userType !== "audience" && user && (
            <SectionTransition delay={0.1}>
              <NonAudienceDashboard userType={userType} userId={user.id} />
            </SectionTransition>
          )}

          {/* Stats Cards - Audience Only */}
          {userType === "audience" && (
          <SectionTransition delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* Audience Stats with Enhanced Design */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 p-4 md:p-6 animate-bounce-in hover-scale-105 hover-lift transition-all duration-300 shadow-elegant" style={{ animationDelay: '0.1s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">📝 Opinions Shared</span>
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse-glow" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stats.opinions}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {stats.opinions === 0 ? "✨ Start exploring" : "🎯 Keep sharing!"}
                    </p>
                  </div>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-2 border-primary/20 p-4 md:p-6 animate-bounce-in hover-scale-105 hover-lift transition-all duration-300 shadow-elegant" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">🎁 Rewards</span>
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse-glow" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {stats.rewards}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">✨ Points earned</p>
                  </div>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 p-4 md:p-6 animate-bounce-in hover-scale-105 hover-lift transition-all duration-300 shadow-elegant" style={{ animationDelay: '0.2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-medium text-muted-foreground">❤️ Likes Received</span>
                      <Award className="w-5 h-5 md:w-6 md:h-6 text-accent animate-pulse-glow" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                      {stats.totalLikes}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">🔥 Total appreciation</p>
                  </div>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary border-2 border-white/20 p-4 md:p-6 animate-bounce-in hover-scale-105 hover-lift transition-all duration-300 shadow-elegant" style={{ animationDelay: '0.4s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm font-semibold text-white">🌍 Total Users</span>
                      <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse-glow" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                    <p className="text-xs font-medium text-white/90">👥 Registered</p>
                  </div>
                </Card>
            </div>
          </SectionTransition>
          )}

          {/* Categories */}
          <SectionTransition delay={0.15}>
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">
                {userType === "audience" ? "Share Your Voice" : "Explore Categories"}
              </h3>
              <p className="text-muted-foreground">
                {userType === "audience"
                  ? "Share your opinions - only you see your submissions here. View all opinions with insights in the Insights section"
                  : "View detailed insights and demographics from real audience opinions"
                }
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const IconComponent = iconMap[category.icon] || Sparkles;
                const categoryStats = category as CategoryWithStats;
                // Calendar-based days left in the current week (Mon-Sun)
                const daysUntilNext = daysLeftInWeek;

                return (
                  <Card
                    key={category.id}
                    onClick={() => navigate(`/category/${category.id}`)}
                    className={`
                      premium-card p-6 transition-all duration-300 cursor-pointer
                      group animate-bounce-in relative
                    `}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {categoryStats.submissionCount > 0 && (
                      <Badge className="absolute top-2 right-2 text-xs gradient-accent text-white border-0 animate-shimmer">
                        {categoryStats.submissionCount}
                      </Badge>
                    )}
                      <div className="space-y-3 text-center">
                        <div className={`
                          w-12 h-12 mx-auto rounded-xl bg-gradient-to-br 
                          ${categoryStats.canSubmit ? 'from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20' : 'from-muted/50 to-muted/30'}
                          transition-all flex items-center justify-center
                        `}>
                          <IconComponent className={`w-6 h-6 ${category.color}`} />
                        </div>
                        <p className="font-medium text-sm">{category.name}</p>
                        {userType === "audience" ? (
                          categoryStats.canSubmit ? (
                            <Badge className="text-xs bg-primary text-primary-foreground border-0">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-muted text-muted-foreground">
                              Given – {categoryStats.lastSubmission?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="text-xs border-accent text-accent">
                            View Insights
                          </Badge>
                        )}
                        {userType === "audience" && categoryStats.canSubmit && (
                          <p className="text-xs text-muted-foreground">
                            {daysLeftInWeek} {daysLeftInWeek === 1 ? 'day' : 'days'} left this week
                          </p>
                        )}
                      </div>
                  </Card>
                );
              })}
            </div>
          </div>
          </SectionTransition>

          {/* Trending Topics */}
          <SectionTransition delay={0.2}>
            <TrendingTopics />
          </SectionTransition>

          {/* Activity Feed & Leaderboard - Audience Only */}
          {userType === "audience" && (
            <SectionTransition delay={0.25}>
              <div className="grid md:grid-cols-2 gap-6">
                <ActivityFeed userId={user?.id} limit={8} />
                <UserLeaderboard currentUserId={user?.id} limit={10} />
              </div>
            </SectionTransition>
          )}

          {/* AI-Powered Insights */}
          <SectionTransition delay={0.3}>
            {user && userType === "audience" && (
              <AIInsightsCard userId={user.id} />
            )}
          </SectionTransition>

          {/* User Activity Analysis Widget - Audience Only */}
          {userType === "audience" && (
            <SectionTransition delay={0.35}>
              <ProfileActivityAnalysis />
            </SectionTransition>
          )}

          {/* CTA Card */}
          <SectionTransition delay={0.3}>
            <Card className="p-8 md:p-12 gradient-hero border-2 border-primary/20 shadow-elegant premium-card">
              <div className="text-center space-y-6">
                <div className="inline-block">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse-glow mx-auto mb-4" />
                </div>
                <h3 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                  {userType === "creator" 
                    ? "🎬 Ready to discover what audiences want?"
                    : "🌟 Ready to shape the future of entertainment?"}
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                  {userType === "creator"
                    ? "Access real-time insights and trend data to make informed creative decisions 📊✨"
                    : "Your voice matters. Share your preferences and earn rewards while influencing what gets made next 🎯💡"}
                </p>
                <Button 
                  onClick={() => categories.length > 0 && navigate(`/category/${categories[0].id}`)}
                  className="gradient-primary text-white border-0 shadow-elegant hover:shadow-xl transition-all hover-scale-105 text-lg px-8 py-6 rounded-xl"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-pulse-glow" />
                  {userType === "creator" ? "🚀 Explore Insights" : "🎨 Get Started"}
                </Button>
              </div>
            </Card>
          </SectionTransition>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
};

export default Dashboard;