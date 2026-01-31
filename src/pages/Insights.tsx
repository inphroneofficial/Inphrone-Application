import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { InsightsFilters } from "@/components/InsightsFilters";
import { GlobalInsightsOverview } from "@/components/insights/GlobalInsightsOverview";
import { CategoryInsightsDashboard } from "@/components/insights/CategoryInsightsDashboard";
import { EnhancedOpinionCards } from "@/components/insights/EnhancedOpinionCards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getCurrentWeekRangeUTC } from "@/lib/week";
import { usePageTimeTracking } from "@/hooks/usePageTimeTracking";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Sparkles,
  Globe,
  TrendingUp,
  Film,
  Music2,
  Monitor,
  Video,
  Gamepad2,
  Share2,
  History,
  Smartphone
} from "lucide-react";
import { LiveIntelligencePulse } from "@/components/common/LiveIntelligencePulse";
import { AISummary } from "@/components/common/AISummary";

interface CategoryData {
  id: string;
  name: string;
  count: number;
  percentage: number;
  icon: any;
  color: string;
}

interface OpinionWithProfile {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  why_excited: string;
  genre?: string;
  content_type: string;
  preferences: any;
  would_pay: boolean | null;
  upvotes: number;
  comments?: string | null;
  category_id: string;
  user: {
    full_name?: string;
    gender?: string;
    age_group?: string;
    country?: string;
    city?: string;
    state_region?: string;
  };
}

interface CategoryInsights {
  genres: Array<{ name: string; count: number; percentage: number }>;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
  preferences: Record<string, any>;
  opinions: OpinionWithProfile[];
  totalOpinions: number;
}

const CATEGORY_THEMES: Record<string, {
  gradient: string;
  bgGradient: string;
  icon: any;
  colors: string[];
  mood: string;
}> = {
  Film: {
    gradient: "from-amber-600 via-orange-500 to-amber-600",
    bgGradient: "from-amber-950/50 via-orange-950/50 to-amber-950/50",
    icon: Film,
    colors: ['#f59e0b', '#f97316', '#fb923c', '#fdba74', '#fcd34d'],
    mood: "cinematic"
  },
  Music: {
    gradient: "from-purple-600 via-pink-500 to-purple-600",
    bgGradient: "from-purple-950/50 via-pink-950/50 to-purple-950/50",
    icon: Music2,
    colors: ['#a855f7', '#ec4899', '#d946ef', '#f0abfc', '#e879f9'],
    mood: "rhythmic"
  },
  OTT: {
    gradient: "from-red-600 via-rose-500 to-red-600",
    bgGradient: "from-red-950/50 via-rose-950/50 to-red-950/50",
    icon: Monitor,
    colors: ['#dc2626', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    mood: "sleek"
  },
  TV: {
    gradient: "from-blue-600 via-cyan-500 to-blue-600",
    bgGradient: "from-blue-950/50 via-cyan-950/50 to-blue-950/50",
    icon: Monitor,
    colors: ['#2563eb', '#06b6d4', '#0ea5e9', '#38bdf8', '#7dd3fc'],
    mood: "broadcast"
  },
  YouTube: {
    gradient: "from-red-600 via-orange-500 to-red-600",
    bgGradient: "from-red-950/50 via-orange-950/50 to-red-950/50",
    icon: Video,
    colors: ['#dc2626', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
    mood: "energetic"
  },
  Gaming: {
    gradient: "from-green-600 via-emerald-500 to-green-600",
    bgGradient: "from-green-950/50 via-emerald-950/50 to-green-950/50",
    icon: Gamepad2,
    colors: ['#16a34a', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    mood: "futuristic"
  },
  "Social Media": {
    gradient: "from-cyan-600 via-blue-500 to-cyan-600",
    bgGradient: "from-cyan-950/50 via-blue-950/50 to-cyan-950/50",
    icon: Share2,
    colors: ['#0891b2', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    mood: "fluid"
  },
  "App Development": {
    gradient: "from-indigo-600 via-violet-500 to-indigo-600",
    bgGradient: "from-indigo-950/50 via-violet-950/50 to-indigo-950/50",
    icon: Smartphone,
    colors: ['#4f46e5', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    mood: "innovative"
  }
};

const Insights = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"global" | "category">("global");
  const [selectedCategory, setSelectedCategory] = useState<string>("Film");
  const [globalData, setGlobalData] = useState<CategoryData[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsights | null>(null);
  const [totalContributors, setTotalContributors] = useState(0);
  const [totalUpvotes, setTotalUpvotes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userCounts, setUserCounts] = useState({
    audience: 0,
    creator: 0,
    studio: 0,
    production: 0,
    ott: 0,
    tv: 0,
    gaming: 0,
    music: 0,
    developer: 0
  });
  const [pastOpinions, setPastOpinions] = useState<OpinionWithProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("audience");
  const [showInlineLoading, setShowInlineLoading] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    country: "all",
    city: "all",
    ageGroup: "all",
    gender: "all",
    state: "all",
    contentType: "all",
    category: "all"
  });

  // Available filter options
  const [availableOptions, setAvailableOptions] = useState({
    countries: [] as string[],
    cities: [] as string[],
    ageGroups: [] as string[],
    genders: [] as string[],
    states: [] as string[],
    contentTypes: [] as string[],
    categories: [] as string[]
  });

  // Sort option for opinions
  const [sortBy, setSortBy] = useState("recent");

  // Page time tracking
  const _track = usePageTimeTracking('insights', currentUserId);

  const [sessionLogId, setSessionLogId] = useState<string | null>(null);

  useEffect(() => {
    const initInsights = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(session.user.id);

      // Fetch user type
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();
      
      if (profile) {
        setUserType(profile.user_type);
      }

      // Time tracking handled by hook (usePageTimeTracking)

      await checkAuthAndFetchInsights();
      await fetchPastOpinions(session.user.id);
    };

    initInsights();

    // Cleanup handled by hook
  }, []);

  useEffect(() => {
    checkAuthAndFetchInsights(true);
    if (currentUserId) {
      fetchPastOpinions(currentUserId);
    }
  }, [viewMode, selectedCategory]);

  // Lighter refresh on filter changes (no full-screen loader)
  useEffect(() => {
    if (viewMode === "category") {
      fetchCategoryInsights(false);
    }
  }, [filters]);

  const checkAuthAndFetchInsights = async (showFullLoading: boolean = true) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view insights");
      navigate("/auth");
      return;
    }

    if (viewMode === "global") {
      await fetchGlobalInsights();
    } else {
      await fetchCategoryInsights(showFullLoading);
    }
  };

  // Realtime updates: refresh insights on new opinions or upvotes (no full-screen loading)
  useEffect(() => {
    const channel = supabase
      .channel('insights-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opinions' },
        () => {
          if (viewMode === "category") {
            fetchCategoryInsights(false); // Use inline loading for realtime updates
          } else {
            fetchGlobalInsights();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'opinion_upvotes' },
        () => {
          if (viewMode === "category") {
            fetchCategoryInsights(false); // Use inline loading for realtime updates
          } else {
            fetchGlobalInsights();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewMode, selectedCategory, filters]);

  const fetchGlobalInsights = async () => {
    try {
      setLoading(true);

      // Get current week range
      const { start: weekStart } = getCurrentWeekRangeUTC();

      // Fetch only current week opinions
      const { data: opinions } = await supabase
        .from("opinions")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .order('upvotes', { ascending: false });
        
      const { data: categories } = await supabase.from("categories").select("*");
      
      // Get total users count with breakdown
      const { data: userCounts } = await supabase.rpc('get_user_counts');
      const counts = userCounts?.[0] || {
        total_users: 0,
        audience: 0,
        creator: 0,
        studio: 0,
        production: 0,
        ott: 0,
        tv: 0,
        gaming: 0,
        music: 0,
        developer: 0
      };
      
      setTotalUsers(counts.total_users || 0);
      setUserCounts({
        audience: counts.audience || 0,
        creator: counts.creator || 0,
        studio: counts.studio || 0,
        production: counts.production || 0,
        ott: counts.ott || 0,
        tv: counts.tv || 0,
        gaming: counts.gaming || 0,
        music: counts.music || 0,
        developer: counts.developer || 0
      });
      
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);
      const categoryIcons: any = {
        Film: Film,
        Music: Music2,
        OTT: Monitor,
        TV: Monitor,
        YouTube: Video,
        Gaming: Gamepad2,
        "Social Media": Share2,
        "App Development": Smartphone
      };

      // Calculate category distribution
      const categoryCounts: Record<string, number> = {};
      opinions?.forEach(o => {
        const catName = categoryMap.get(o.category_id);
        if (catName) {
          categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
        }
      });

      const totalOpinions = opinions?.length || 0;
      
      // Only create category data if there are opinions
      const categoryData = totalOpinions > 0 ? Object.entries(categoryCounts)
        .map(([name, count]) => ({
          id: name,
          name,
          count,
          percentage: Math.round((count / totalOpinions) * 100),
          icon: categoryIcons[name] || Sparkles,
          color: CATEGORY_THEMES[name as keyof typeof CATEGORY_THEMES]?.colors[0] || '#8b5cf6'
        }))
        .sort((a, b) => b.count - a.count) : [];

      setGlobalData(categoryData);

      // Calculate unique contributors
      const uniqueUsers = new Set(opinions?.map(o => o.user_id));
      setTotalContributors(uniqueUsers.size);

      // Calculate total upvotes
      const totalVotes = opinions?.reduce((sum, o) => sum + (o.upvotes || 0), 0) || 0;
      setTotalUpvotes(totalVotes);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching global insights:", error);
      toast.error("Failed to load insights");
      setLoading(false);
    }
  };

  const fetchPastOpinions = async (userId: string) => {
    try {
      const { start: currentWeekStart } = getCurrentWeekRangeUTC();

      // Determine scope for global view
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .single();
      const userType = profile?.user_type;

      // Base: opinions before current week
      let base = supabase
        .from("opinions")
        .select("id, created_at, title, why_excited, genre, content_type, preferences, would_pay, upvotes, comments, category_id, user_id")
        .lt("created_at", currentWeekStart.toISOString())
        .order("created_at", { ascending: false });

      // Category deep dive: all past opinions in selected category
      if (viewMode === "category" && selectedCategory) {
        const { data: categories } = await supabase.from("categories").select("id,name");
        const categoryId = categories?.find(c => c.name?.toLowerCase() === selectedCategory.toLowerCase())?.id;
        if (categoryId) base = base.eq("category_id", categoryId);
      } else {
      // All users see all past opinions in global view
      }

      const { data: opinionsData, error } = await base;
      if (error) throw error;

      if (!opinionsData || opinionsData.length === 0) {
        setPastOpinions([]);
        return;
      }

      // Fetch profiles for the listed user_ids
      const userIds = Array.from(new Set(opinionsData.map((o: any) => o.user_id)));
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, gender, age_group, country, city, state_region")
        .in("id", userIds);
      const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));

      const formatted: OpinionWithProfile[] = opinionsData.map((o: any) => ({
        id: o.id,
        user_id: o.user_id,
        created_at: o.created_at,
        title: o.title || o.preferences?.title || o.content_type || "Opinion",
        why_excited: o.why_excited || o.description || "",
        genre: o.genre || o.preferences?.genre || undefined,
        content_type: o.content_type || "general",
        preferences: o.preferences || {},
        would_pay: o.would_pay,
        upvotes: o.upvotes || 0,
        comments: o.comments,
        category_id: o.category_id,
        user: {
          full_name: profileMap.get(o.user_id)?.full_name || "Anonymous User",
          gender: profileMap.get(o.user_id)?.gender,
          age_group: profileMap.get(o.user_id)?.age_group,
          country: profileMap.get(o.user_id)?.country,
          city: profileMap.get(o.user_id)?.city,
          state_region: profileMap.get(o.user_id)?.state_region,
        }
      }));
      setPastOpinions(formatted);
    } catch (error) {
      console.error("Error fetching past opinions:", error);
      setPastOpinions([]);
    }
  };

  const fetchCategoryInsights = async (showFullLoading: boolean = true) => {
    try {
      if (showFullLoading) {
        setLoading(true);
        setShowInlineLoading(false);
      } else {
        setShowInlineLoading(true);
      }

      // Get current week range
      const { start: weekStart } = getCurrentWeekRangeUTC();

      // Fetch only current week opinions
      const { data: opinions } = await supabase
        .from("opinions")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .order('upvotes', { ascending: false });
        
      const { data: categories } = await supabase.from("categories").select("*");
      
      // Get category ID for selected category
      const categoryId = categories?.find(c => c.name?.toLowerCase() === selectedCategory.toLowerCase())?.id;
      
      // Filter opinions by selected category ONLY
      const categoryOpinions = opinions?.filter(o => o.category_id === categoryId) || [];
      
      console.log(`Fetching insights for ${selectedCategory}, found ${categoryOpinions.length} opinions`);

      const userIds = [...new Set(categoryOpinions.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || []);

      // Extract available filter options from ALL profiles (not just current category)
      const { data: allProfiles } = await supabase.from("profiles").select("*");
      const uniqueCountries = [...new Set(allProfiles?.map(p => p.country).filter(Boolean))] as string[];
      const uniqueStates = [...new Set(allProfiles?.map(p => p.state_region).filter(Boolean))] as string[];
      const uniqueCities = [...new Set(allProfiles?.map(p => p.city).filter(Boolean))] as string[];
      const uniqueAgeGroups = [...new Set(allProfiles?.map(p => p.age_group).filter(Boolean))] as string[];
      const uniqueGenders = [...new Set(allProfiles?.map(p => p.gender).filter(Boolean))] as string[];
      const uniqueContentTypes = [...new Set(categoryOpinions.map(o => o.content_type).filter(Boolean))] as string[];
      const categoryNames = categories?.map(c => c.name) || [];
      
      setAvailableOptions({
        countries: uniqueCountries.sort(),
        cities: uniqueCities.sort(),
        ageGroups: uniqueAgeGroups.sort(),
        genders: uniqueGenders.sort(),
        states: uniqueStates.sort(),
        contentTypes: uniqueContentTypes.sort(),
        categories: categoryNames.sort()
      });

      // Process genres FROM FILTERED OPINIONS (respect active filters)
      // First, enrich category opinions with profile data
      const opinionsWithProfiles: OpinionWithProfile[] = categoryOpinions.map(o => {
        const profile = profileMap.get(o.user_id);
        const prefs = (o.preferences as any) || {};
        return {
          id: o.id,
          user_id: o.user_id,
          created_at: o.created_at,
          title: o.title || prefs.title || o.content_type || "Opinion",
          why_excited: o.why_excited || o.description || "",
          genre: o.genre || prefs.genre || undefined,
          content_type: o.content_type || "general",
          preferences: o.preferences || {},
          would_pay: o.would_pay,
          upvotes: o.upvotes || 0,
          comments: o.comments,
          category_id: o.category_id,
          user: {
            full_name: profile?.full_name || "Anonymous User",
            gender: profile?.gender || prefs.gender || "Not Specified",
            age_group: profile?.age_group || prefs.age_group || "Not Specified",
            country: profile?.country || prefs.country || "Not Specified",
            city: profile?.city || prefs.city || "Not Specified",
            state_region: profile?.state_region || prefs.state_region || "Not Specified"
          }
        };
      });

      // Apply user filters on top of category filter
      const filteredOpinionsWithProfiles = opinionsWithProfiles.filter(o => {
        if (filters.country && filters.country !== "all" && o.user.country !== filters.country) return false;
        if (filters.state && filters.state !== "all" && o.user.state_region !== filters.state) return false;
        if (filters.city && filters.city !== "all" && o.user.city !== filters.city) return false;
        if (filters.ageGroup && filters.ageGroup !== "all" && o.user.age_group !== filters.ageGroup) return false;
        if (filters.gender && filters.gender !== "all" && o.user.gender !== filters.gender) return false;
        if (filters.contentType && filters.contentType !== "all" && o.content_type !== filters.contentType) return false;
        return true;
      });

      console.log(`After filters: ${filteredOpinionsWithProfiles.length} opinions`);

      // Genres based on FILTERED opinions - including appTypes for App Development
      const genreCount: Record<string, number> = {};
      filteredOpinionsWithProfiles.forEach(o => {
        const prefs = (o.preferences as any) || {};
        
        // Direct genre field
        const direct = (Array.isArray(o.genre) ? o.genre : [o.genre]).filter(Boolean) as string[];
        direct.forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; });
        
        // Genre from preferences
        if (prefs?.genre) {
          const genres = Array.isArray(prefs.genre) ? prefs.genre : [prefs.genre];
          genres.forEach((g: string) => { if (g) genreCount[g] = (genreCount[g] || 0) + 1; });
        }
        
        // App Types for App Development category (treated as genres)
        if (prefs?.appTypes) {
          const appTypes = Array.isArray(prefs.appTypes) ? prefs.appTypes : [prefs.appTypes];
          appTypes.forEach((appType: string) => { 
            if (appType) genreCount[appType] = (genreCount[appType] || 0) + 1; 
          });
        }
        
        // Also check for appType singular
        if (prefs?.appType) {
          const appTypes = Array.isArray(prefs.appType) ? prefs.appType : [prefs.appType];
          appTypes.forEach((appType: string) => { 
            if (appType) genreCount[appType] = (genreCount[appType] || 0) + 1; 
          });
        }
      });

      // Calculate total genre mentions for proper percentage (sums to 100%)
      const totalGenreMentions = Object.values(genreCount).reduce((sum, count) => sum + count, 0) || 1;
      const genres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalGenreMentions) * 100) }));

      // Demographics (FILTERED) – remove "Not specified" when there are specified values
      const ageGroups: Record<string, number> = {};
      const genderDist: Record<string, number> = {};
      const locations: Record<string, number> = {};

      filteredOpinionsWithProfiles.forEach(o => {
        const prefs = (o.preferences as any) || {};
        const age = o.user.age_group || prefs.age_group || 'Not specified';
        const gender = o.user.gender || prefs.gender || 'Not specified';
        const country = o.user.country || prefs.country || 'Not specified';
        ageGroups[age] = (ageGroups[age] || 0) + 1;
        genderDist[gender] = (genderDist[gender] || 0) + 1;
        locations[country] = (locations[country] || 0) + 1;
      });

      // Helper to strip "Not specified" when others exist
      const scrub = (obj: Record<string, number>) => {
        const entries = Object.entries(obj);
        const hasSpecified = entries.some(([k]) => k && k.toLowerCase() !== 'not specified');
        if (!hasSpecified) return obj;
        const cleaned: Record<string, number> = {};
        entries.forEach(([k, v]) => { if ((k || '').toLowerCase() !== 'not specified') cleaned[k] = v; });
        return cleaned;
      };

      const cleanedAge = scrub(ageGroups);
      const cleanedGender = scrub(genderDist);
      const cleanedLocations = scrub(locations);

      // Use demographics calculated from current week's filtered opinions ONLY
      // Don't use RPC function as it includes all-time data, not just current week
      const currentWeekDemographics = {
        age: Object.keys(cleanedAge).length > 0 ? cleanedAge : {},
        gender: Object.keys(cleanedGender).length > 0 ? cleanedGender : {},
        locations: Object.keys(cleanedLocations).length > 0 ? cleanedLocations : {}
      };

      setCategoryInsights({
        genres,
        demographics: currentWeekDemographics,
        preferences: {},
        opinions: filteredOpinionsWithProfiles,
        totalOpinions: filteredOpinionsWithProfiles.length
      });

      if (showFullLoading) setLoading(false); else setShowInlineLoading(false);
    } catch (error) {
      console.error("Error fetching insights:", error);
      toast.error("Failed to load insights");
      if (showFullLoading) setLoading(false); else setShowInlineLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Sparkles className="w-16 h-16 text-primary mx-auto" />
          </div>
          <p className="text-lg text-foreground/70 animate-pulse">Loading insights...</p>
        </div>
      </div>
    );
  }

  const theme = CATEGORY_THEMES[selectedCategory] || CATEGORY_THEMES["Film"];

  return (
    <div className="min-h-screen bg-background pt-16 relative overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.02)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      
      <Navbar />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Live Intelligence Pulse */}
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <LiveIntelligencePulse />
          </div>
          
          {/* AI Summary for SEO */}
          <AISummary 
            summary="Inphrone Insights provides real-time entertainment intelligence across 8 categories: Film, Music, OTT, TV, YouTube, Gaming, Social Media, and App Development. View global trends, demographic analytics, and community opinions powered by authentic audience voices."
          />
          
          {/* Futuristic Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="relative">
              {/* Hero content */}
              <div className="text-center space-y-6 py-8 md:py-12">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/80 backdrop-blur-xl border border-primary/20 shadow-2xl"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold tracking-wide">LIVE INTELLIGENCE DASHBOARD</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
                >
                  <span className="block text-foreground">Global</span>
                  <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                    Insights
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Real-time analytics powered by <span className="text-primary font-semibold">authentic voices</span> shaping the future of entertainment
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Premium View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
              <CardContent className="relative pt-6 pb-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <motion.button
                    onClick={() => setViewMode("global")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                      viewMode === "global" 
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-2xl" 
                        : "bg-background/50 hover:bg-background/80 border border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <span>Global Overview</span>
                    </div>
                    {viewMode === "global" && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent -z-10"
                      />
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setViewMode("category")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300 ${
                      viewMode === "category" 
                        ? "bg-gradient-to-r from-primary to-accent text-white shadow-2xl" 
                        : "bg-background/50 hover:bg-background/80 border border-border/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5" />
                      <span>Category Deep Dive</span>
                    </div>
                    {viewMode === "category" && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary to-accent -z-10"
                      />
                    )}
                  </motion.button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Global Overview Mode */}
          {viewMode === "global" && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              {globalData.length === 0 ? (
                <Card className="border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl p-12">
                  <div className="text-center space-y-6">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                    >
                      <Sparkles className="w-12 h-12 text-primary" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black">No Latest Opinions</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        There are no opinions for this week yet. Check back later or be the first to share your thoughts!
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate("/dashboard")}
                      className="bg-gradient-to-r from-primary to-accent text-white border-0 px-8 py-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                    >
                      Share Your Opinion
                    </Button>
                  </div>
                </Card>
              ) : (
                <GlobalInsightsOverview
                  categories={globalData}
                  totalOpinions={globalData.reduce((sum, cat) => sum + cat.count, 0)}
                  totalContributors={totalContributors}
                  totalUpvotes={totalUpvotes}
                  totalUsers={totalUsers}
                  userCounts={userCounts}
                />
              )}
            </motion.div>
          )}

          {/* Category Deep Dive Mode */}
          {viewMode === "category" && categoryInsights && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-8"
            >
              {/* Premium Category Selector */}
              <Card className="border-0 bg-card/50 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
                <CardContent className="relative pt-8 pb-8">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {Object.keys(CATEGORY_THEMES).map((cat, index) => {
                      const catTheme = CATEGORY_THEMES[cat];
                      const Icon = catTheme.icon;
                      const isSelected = selectedCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                            isSelected 
                              ? `bg-gradient-to-r ${catTheme.gradient} text-white shadow-2xl` 
                              : 'bg-background/50 hover:bg-background/80 border border-border/50 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span>{cat}</span>
                          </div>
                          {isSelected && (
                            <motion.div
                              layoutId="categoryIndicator"
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/50"
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Tabs defaultValue="current" className="space-y-8">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="current">Current Opinions</TabsTrigger>
                  <TabsTrigger value="past" className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Past Opinions
                  </TabsTrigger>
                </TabsList>
                {showInlineLoading && (
                  <p className="text-center text-sm text-muted-foreground animate-pulse">Updating insights…</p>
                )}

                <TabsContent value="current" className="space-y-8">
                  <InsightsFilters 
                    filters={filters}
                    onChange={setFilters}
                    availableOptions={availableOptions}
                  />

                  {/* Category Dashboard - Show demographics for all users */}
                  <CategoryInsightsDashboard
                    insights={categoryInsights}
                    categoryName={selectedCategory}
                    theme={theme}
                    userType={userType}
                    showDemographics={true}
                  />

                  {/* Opinion Cards - No like button in Insights for anyone */}
                  {categoryInsights.opinions.length > 0 ? (
                    <EnhancedOpinionCards
                      opinions={categoryInsights.opinions}
                      categoryIcon={theme.icon}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      showLikeButton={false}
                      currentUserId={currentUserId}
                      userType={userType}
                    />
                  ) : (
                    <Card className="glass-card border-2 text-center py-12">
                      <CardContent>
                        <theme.icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No opinions found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your filters to see more results for {selectedCategory}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                    {viewMode === "category" ? (
                      <>
                        <History className="w-6 h-6 text-primary" />
                        Past Opinions
                      </>
                    ) : (
                      <>
                        <History className="w-6 h-6 text-primary" />
                        Your Past Opinions
                      </>
                    )}
                    </h3>
                    <p className="text-muted-foreground">
                      {viewMode === "category" ? `All past opinions in ${selectedCategory}` : "Opinions from previous weeks"}
                    </p>
                  </div>
                  
                  {pastOpinions.length > 0 ? (
                    <EnhancedOpinionCards
                      opinions={pastOpinions}
                      categoryIcon={theme.icon}
                      sortBy={sortBy}
                      onSortChange={setSortBy}
                      showLikeButton={false}
                      currentUserId={currentUserId}
                      userType={userType}
                    />
                  ) : (
                    <Card className="p-12 text-center">
                      <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg text-muted-foreground">No past opinions yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-2">
                        {viewMode === "category" 
                          ? `Past opinions for ${selectedCategory} will appear here`
                          : "Your opinions from previous weeks will appear here"}
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
