import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft,
  TrendingUp,
  Heart,
  MessageSquare,
  Clock,
  Plus,
  History
} from "lucide-react";
import { OpinionSubmissionDialog } from "@/components/opinions/OpinionSubmissionDialog";
import { DetailedOpinionsView } from "@/components/opinions/DetailedOpinionsView";
import { AudienceOpinionsView } from "@/components/opinions/AudienceOpinionsView";
import { WeeklyContentTypeAnalytics } from "@/components/opinions/WeeklyContentTypeAnalytics";
import { DemographicAnalytics } from "@/components/opinions/DemographicAnalytics";
import { RewardCouponDialog } from "@/components/rewards/RewardCouponDialog";
import { CategoryOpinionFilters } from "@/components/opinions/CategoryOpinionFilters";
import { allowedCategoryNames } from "@/lib/contentFilters";
import { getDaysUntilNextMondayUTC, getCurrentWeekRangeUTC } from "@/lib/week";
import { useOpinionViewTracking } from "@/hooks/useOpinionViewTracking";
import { usePageTimeTracking } from "@/hooks/usePageTimeTracking";

interface Opinion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content_type: string;
  genre: string | null;
  upvotes: number;
  created_at: string;
  preferences?: any;
  would_pay?: boolean | null;
  comments?: string | null;
  profiles: {
    full_name: string;
  } | null;
  user?: {
    full_name?: string;
    gender?: string;
    age_group?: string;
    country?: string;
    city?: string;
    state_region?: string;
  };
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [pastOpinions, setPastOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userType, setUserType] = useState<"audience" | "creator" | "studio" | "production" | "ott">("audience");
  const [creatorType, setCreatorType] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(true);
  const [daysUntilNext, setDaysUntilNext] = useState(0);
  const [daysLeftInWeek, setDaysLeftInWeek] = useState(0);
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);
  const [canSubmitOpinion, setCanSubmitOpinion] = useState(true);
  const [nextOpinionDate, setNextOpinionDate] = useState<string>("");
  const [likeRefreshTrigger, setLikeRefreshTrigger] = useState(0);
  
  // Filtering state
  const [sortBy, setSortBy] = useState<string>("popular"); // Default to sorting by likes
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Page time tracking
  const _trackingId = usePageTimeTracking(`category_detail:${id}`, userId || null);

  // Track opinion views for creators/studios
  useOpinionViewTracking([...opinions, ...pastOpinions].map(o => o.id));

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        // Time tracking handled by hook (usePageTimeTracking)
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast.error("Failed to load profile");
          navigate("/dashboard");
          return;
        }

        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
          return;
        }

        await checkUserType();
        await fetchData();
        await checkSubmissionEligibility();
        setDaysLeftInWeek(getDaysUntilNextMondayUTC());
      } catch (error: any) {
        console.error("Category detail initialization error:", error);
        toast.error("Failed to load page. Please try again.");
        navigate("/dashboard");
      }
    })();

    // Set up interval to check for weekly reset every minute
    const weekCheckInterval = setInterval(() => {
      const newDaysLeft = getDaysUntilNextMondayUTC();
      if (newDaysLeft > daysLeftInWeek) {
        // Week has reset! Refresh data
        setDaysLeftInWeek(newDaysLeft);
        checkSubmissionEligibility();
        fetchData();
        toast.success("🎉 New week started! You can submit a new opinion now.");
      } else {
        setDaysLeftInWeek(newDaysLeft);
      }
    }, 60000); // Check every minute

    // Cleanup
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
    };
  }, [id]);

  const checkSubmissionEligibility = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !id) return;

    // Check last submission for this category
    const { data: lastOpinion } = await supabase
      .from("opinions")
      .select("created_at")
      .eq("user_id", user.id)
      .eq("category_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastOpinion) {
      const daysSince = (Date.now() - new Date(lastOpinion.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const daysLeft = Math.max(0, Math.ceil(7 - daysSince));
      setCanSubmit(daysSince >= 7);
      setDaysUntilNext(daysLeft);
    } else {
      setCanSubmit(true);
      setDaysUntilNext(0);
    }
  };

  const checkUserType = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserType(profile.user_type as any);
        if (profile.user_type === "creator") {
          const { data: cprof } = await supabase
            .from("creator_profiles")
            .select("creator_type")
            .eq("user_id", user.id)
            .maybeSingle();
          setCreatorType(cprof?.creator_type ?? null);
        }
      }
    }
  };

  const fetchData = async () => {
    try {
      // Fetch category
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (categoryError) throw categoryError;

      // Derive user type locally to avoid stale state usage
      const { data: { user } } = await supabase.auth.getUser();
      let userTypeLocal: string | null = null;
      let creatorTypeLocal: string | null = null;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        userTypeLocal = profile?.user_type || null;
        if (userTypeLocal === "creator") {
          const { data: cprof } = await supabase
            .from("creator_profiles")
            .select("creator_type")
            .eq("user_id", user.id)
            .maybeSingle();
          creatorTypeLocal = cprof?.creator_type ?? null;
        }
        // reflect in state for UI elsewhere
        if (userTypeLocal) setUserType(userTypeLocal as any);
        if (creatorTypeLocal) setCreatorType(creatorTypeLocal);
      }

      // Guard: restrict viewing based on role rules
      const allowed = allowedCategoryNames((userTypeLocal as any) || (userType as any), creatorTypeLocal || creatorType);
      if (!allowed.includes(categoryData.name)) {
        toast.error("This category is not available for your account");
        navigate("/dashboard");
        return;
      }

      setCategory(categoryData);

      // Check if audience can submit opinion this week
      if (userTypeLocal === "audience") {
        if (user) {
          const now = new Date();
          const { start: weekStart, end: weekEnd } = getCurrentWeekRangeUTC(now);
          
          const { data: thisWeekOpinions } = await supabase
            .from("opinions")
            .select("id, created_at")
            .eq("user_id", user.id)
            .eq("category_id", id)
            .gte("created_at", weekStart.toISOString())
            .lt("created_at", weekEnd.toISOString());

          const hasOpinionThisWeek = (thisWeekOpinions?.length || 0) > 0;
          setCanSubmitOpinion(!hasOpinionThisWeek);

          if (hasOpinionThisWeek) {
            const nextMonday = weekEnd;
            const options: Intl.DateTimeFormatOptions = { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            };
            setNextOpinionDate(nextMonday.toLocaleDateString('en-US', options) + " UTC");
          }
        }
      }

      // Fetch opinions based on user type
      let opinionsQuery = supabase
        .from("opinions")
        .select("*")
        .eq("category_id", id)
        .order('upvotes', { ascending: false });
      
      // Audience can now view all opinions in this category (past/current separated below)
      
      const { data: opinionsData, error: opinionsError } = await opinionsQuery
        .order("created_at", { ascending: false });

      if (opinionsError) throw opinionsError;

      // Fetch user profiles for the opinions
      if (opinionsData && opinionsData.length > 0) {
        const userIds = [...new Set(opinionsData.map(o => o.user_id))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, gender, age_group, country, city, state_region")
          .in("id", userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        // Separate current week and past opinions
        const now = new Date();
        const { start: weekStart } = getCurrentWeekRangeUTC(now);
        
        const currentWeekOpinions: Opinion[] = [];
        const previousOpinions: Opinion[] = [];
        
        opinionsData.forEach(opinion => {
          const userProfile = profilesMap.get(opinion.user_id);
          const prefs = (opinion as any).preferences || {};
          const enrichedOpinion = {
            ...opinion,
            profiles: userProfile ? { full_name: userProfile.full_name } : { full_name: "Anonymous User" },
            user: {
              full_name: userProfile?.full_name || "Anonymous User",
              gender: userProfile?.gender || prefs.gender,
              age_group: userProfile?.age_group || prefs.age_group,
              country: userProfile?.country || prefs.country,
              city: userProfile?.city || prefs.city,
              state_region: userProfile?.state_region || prefs.state || prefs.state_region,
            }
          };
          
          // Check if opinion is from current week
          const opinionDate = new Date(opinion.created_at);
          if (opinionDate >= weekStart) {
            currentWeekOpinions.push(enrichedOpinion as any);
          } else {
            previousOpinions.push(enrichedOpinion as any);
          }
        });
        
        setOpinions(currentWeekOpinions);
        setPastOpinions(previousOpinions.length > 0 ? previousOpinions : []);
      } else {
        setOpinions([]);
      }

      // Realtime subscription temporarily disabled to improve performance and avoid duplicate channels
      // Consider re-enabling with a single, top-level subscription if needed
    } catch (error: any) {
      toast.error("Failed to load category data");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOpinions = (opinionsList: Opinion[]) => {
    let filtered = [...opinionsList];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query) ||
        o.content_type.toLowerCase().includes(query) ||
        (o.genre && o.genre.toLowerCase().includes(query))
      );
    }

    // Apply content type filter
    if (contentTypeFilter !== "all") {
      filtered = filtered.filter(o => o.content_type === contentTypeFilter);
    }

    // Apply genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter(o => o.genre === genreFilter);
    }

    // Apply sorting
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "popular") {
      filtered.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    return filtered;
  };

  const handleUpvote = async (opinionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to like");
        return;
      }

      // Check both current and past opinions
      const opinion = opinions.find(o => o.id === opinionId) || pastOpinions.find(o => o.id === opinionId);
      if (!opinion) return;

      // Check if user already upvoted
      const { data: existingUpvote } = await supabase
        .from("opinion_upvotes")
        .select("id")
        .eq("opinion_id", opinionId)
        .eq("user_id", user.id)
        .single();

      if (existingUpvote) {
        // Get the upvote details
        const { data: upvoteData } = await supabase
          .from("opinion_upvotes")
          .select("is_upvote")
          .eq("opinion_id", opinionId)
          .eq("user_id", user.id)
          .single();
        
        // Remove upvote/like - trigger automatically decrements count
        await supabase
          .from("opinion_upvotes")
          .delete()
          .eq("opinion_id", opinionId)
          .eq("user_id", user.id);

        // Update in both lists
        setOpinions(opinions.map(o => 
          o.id === opinionId ? { ...o, upvotes: Math.max(0, o.upvotes - 1) } : o
        ));
        setPastOpinions(pastOpinions.map(o => 
          o.id === opinionId ? { ...o, upvotes: Math.max(0, o.upvotes - 1) } : o
        ));

        toast.success("Like removed");
      } else {
        // Add upvote/like - trigger automatically increments count
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();
        
        const isAudience = profile?.user_type === 'audience';
        
        await supabase
          .from("opinion_upvotes")
          .insert({ 
            opinion_id: opinionId, 
            user_id: user.id,
            user_type: profile?.user_type || null,
            is_upvote: isAudience // Track type internally but ALL likes count the same
          });

        // Update in both lists
        setOpinions(opinions.map(o => 
          o.id === opinionId ? { ...o, upvotes: o.upvotes + 1 } : o
        ));
        setPastOpinions(pastOpinions.map(o => 
          o.id === opinionId ? { ...o, upvotes: o.upvotes + 1 } : o
        ));

        toast.success("Liked!");
      }
      
      // Trigger refresh of like states in child component
      setLikeRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      toast.error("Failed to like");
    }
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Category not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header */}
      <header className="border-b sticky top-16 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {userType === "audience" && (
              <>
                {canSubmitOpinion ? (
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="gradient-primary text-white border-0 shadow-elegant hover:shadow-xl transition-all hover-scale-102"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Share Opinion
                  </Button>
                ) : (
                  <div className="flex flex-col items-end gap-1 px-4 py-2 border-2 border-primary/30 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Next opinion day:</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{nextOpinionDate}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Category Header */}
          <div className="space-y-4 animate-fade-in">
            <Badge className="gradient-primary text-white border-0">
              {category.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">{category.description}</h1>
            <p className="text-lg text-muted-foreground">
              {userType === "creator" 
                ? "Explore what audiences want to see in this category"
                : "Share your vision and help shape the future of " + category.name.toLowerCase()}
            </p>
          </div>

          {/* Weekly Countdown - Shows days remaining in current calendar week */}
          {daysLeftInWeek > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20 animate-fade-in">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-bold text-primary">{daysLeftInWeek}</span> {daysLeftInWeek === 1 ? 'day' : 'days'} left this week
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Week resets every Monday at 00:00 UTC
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Stats - Current Week Only */}
          <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
            <Card className="p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week's Opinions</span>
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold mt-2">{opinions.length}</p>
            </Card>
            <Card className="p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week's Likes</span>
                <Heart className="w-4 h-4 text-accent" />
              </div>
              <p className="text-2xl font-bold mt-2">
                {opinions.reduce((sum, o) => sum + o.upvotes, 0)}
              </p>
            </Card>
            <Card className="p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trending This Week</span>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold mt-2">
                {opinions.filter(o => o.upvotes > 5).length}
              </p>
            </Card>
          </div>

          {/* Weekly Content Type Analytics - Only for non-audience users */}
          {userType !== "audience" && opinions.length > 0 && (
            <WeeklyContentTypeAnalytics 
              opinions={opinions as any}
              categoryName={category.name}
            />
          )}

          {/* Demographic Analytics for all users */}
          {opinions.length > 0 && category && (
            <DemographicAnalytics 
              categoryId={category.id}
              categoryName={category.name}
            />
          )}

          {/* Opinions List - Current Week */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {userType === "audience" ? "All Opinions This Week" : "Current Week Opinions"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {userType === "audience" 
                    ? "Opinions from all audience members this week"
                    : "Latest opinions from the current week"}
                </p>
              </div>
            </div>
            
            {/* Filtering */}
            {opinions.length > 0 && (
              <CategoryOpinionFilters
                sortBy={sortBy}
                onSortChange={setSortBy}
                contentTypeFilter={contentTypeFilter}
                onContentTypeChange={setContentTypeFilter}
                genreFilter={genreFilter}
                onGenreChange={setGenreFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                contentTypes={[...new Set(opinions.map(o => o.content_type).filter(Boolean))]}
                genres={[...new Set(opinions.map(o => o.genre).filter(Boolean))]}
              />
            )}
            
            {opinions.length === 0 ? (
              <Card className="p-12 text-center shadow-card">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No opinions this week</h3>
                <p className="text-muted-foreground mb-6">
                  {userType === "creator" || userType === "studio" || userType === "production" || userType === "ott"
                    ? "No audience opinions available yet for this week."
                    : "Share your first opinion this week!"}
                </p>
                {userType === "audience" && (
                  <>
                    {canSubmitOpinion ? (
                      <Button
                        onClick={() => setDialogOpen(true)}
                        className="gradient-primary text-white border-0"
                      >
                        Share Opinion
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          Next opinion: {nextOpinionDate}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Weekly limit helps keep insights fresh and diverse
                        </p>
                      </div>
                    )}
                  </>
                )}
              </Card>
            ) : (
              <>
                <AudienceOpinionsView 
                  opinions={filterAndSortOpinions(opinions) as any}
                  categoryName={category.name}
                  currentUserId={userId}
                  showLikeButton={userType !== "audience"}
                  userType={userType}
                  onLike={handleUpvote}
                  refreshTrigger={likeRefreshTrigger}
                />
              </>
            )}
          </div>

          {/* Past Opinions Section */}
          {pastOpinions.length > 0 && (
            <div className="space-y-4 pt-8 border-t">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-muted-foreground" />
                <div>
                  <h2 className="text-2xl font-semibold">Past Opinions</h2>
                  <p className="text-muted-foreground text-sm">
                    Opinions from previous weeks
                  </p>
                </div>
              </div>
              
              {userType === "audience" ? (
                <AudienceOpinionsView 
                  opinions={pastOpinions as any}
                  categoryName={category.name}
                  currentUserId={userId}
                  showLikeButton={false}
                  userType={userType}
                  onLike={handleUpvote}
                  refreshTrigger={likeRefreshTrigger}
                />
              ) : (
                <DetailedOpinionsView 
                  opinions={pastOpinions as any}
                  categoryName={category.name}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Opinion Submission Dialog */}
      {userType === "audience" && (
        <>
          <OpinionSubmissionDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            categoryId={category.id}
            categoryName={category.name}
            onSuccess={() => {
              // Refresh submission eligibility and show reward dialog
              checkSubmissionEligibility();
              fetchData();
              setTimeout(() => setRewardDialogOpen(true), 300);
            }}
          />
          <RewardCouponDialog
            open={rewardDialogOpen}
            onOpenChange={setRewardDialogOpen}
            userId={userId}
          />
        </>
      )}
    </div>
  );
};

export default CategoryDetail;