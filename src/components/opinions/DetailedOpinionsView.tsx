import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Calendar, User as UserIcon, MapPin, Eye } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OpinionFilters } from "./OpinionFilters";
import { getCurrentWeekRangeUTC } from "@/lib/week";

interface Opinion {
  id: string;
  user_id: string;
  created_at: string;
  content_type: string;
  preferences: any;
  would_pay: boolean | null;
  upvotes: number;
  comments?: string | null;
  user?: {
    full_name?: string;
    gender?: string;
    age_group?: string;
    country?: string;
    city?: string;
    state_region?: string;
  };
}

interface DetailedOpinionsViewProps {
  opinions: Opinion[];
  categoryName?: string;
}

export function DetailedOpinionsView({ opinions, categoryName }: DetailedOpinionsViewProps) {
  const [opinionViewers, setOpinionViewers] = useState<Record<string, any[]>>({});
  const [loadingViewers, setLoadingViewers] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState({
    ageGroup: "all",
    gender: "all",
    country: "all",
    city: "all",
    dateRange: "all",
    sortBy: "newest"
  });

  // Extract unique filter options from opinions - improved to handle all data sources
  const filterOptions = useMemo(() => {
    const ageGroups = new Set<string>();
    const genders = new Set<string>();
    const countries = new Set<string>();
    const cities = new Set<string>();

    opinions.forEach(opinion => {
      // Try user object first (from join), then preferences as fallback
      const gender = opinion.user?.gender;
      const age = opinion.user?.age_group;
      const country = opinion.user?.country;
      const city = opinion.user?.city;

      if (gender) genders.add(gender);
      if (age) ageGroups.add(age);
      if (country) countries.add(country);
      if (city) cities.add(city);
    });

    return {
      ageGroups: Array.from(ageGroups).sort(),
      genders: Array.from(genders).sort(),
      countries: Array.from(countries).sort(),
      cities: Array.from(cities).sort()
    };
  }, [opinions]);

  // Filter and sort opinions - improved filtering logic
  const filteredOpinions = useMemo(() => {
    const now = new Date();
    const { start: weekStart, end: weekEnd } = getCurrentWeekRangeUTC(now);
    let filtered = opinions.filter(opinion => {
      const age = opinion.user?.age_group;
      const gender = opinion.user?.gender;
      const country = opinion.user?.country;
      const city = opinion.user?.city;
      
      if (filters.ageGroup !== "all" && age !== filters.ageGroup) return false;
      if (filters.gender !== "all" && gender !== filters.gender) return false;
      if (filters.country !== "all" && country !== filters.country) return false;
      if (filters.city !== "all" && city !== filters.city) return false;

      if (filters.dateRange && filters.dateRange !== "all") {
        const createdAt = new Date(opinion.created_at);
        if (filters.dateRange === "today") {
          const today = new Date();
          if (createdAt.toDateString() !== today.toDateString()) return false;
        } else if (filters.dateRange === "this_week") {
          if (createdAt < weekStart || createdAt >= weekEnd) return false;
        } else if (filters.dateRange === "last_7_days") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (createdAt < sevenDaysAgo) return false;
        } else if (filters.dateRange === "last_30_days") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (createdAt < thirtyDaysAgo) return false;
        }
      }
      return true;
    });

    // Sort
    if (filters.sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (filters.sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (filters.sortBy === "most_upvotes") {
      filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }

    return filtered;
  }, [opinions, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreferencesSummary = (prefs: any) => {
    if (!prefs) return [];
    const summary: Array<{ key: string; value: string }> = [];
    
    Object.entries(prefs).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        summary.push({ key, value: value.join(', ') });
      } else if (value) {
        summary.push({ key, value: String(value) });
      }
    });
    
    return summary;
  };

  const fetchViewersForOpinion = async (opinionId: string) => {
    if (opinionViewers[opinionId]) return;
    
    setLoadingViewers(prev => ({ ...prev, [opinionId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('opinion_views')
        .select(`
          viewer_id,
          viewed_at,
          profiles:viewer_id (
            full_name,
            user_type
          )
        `)
        .eq('opinion_id', opinionId)
        .order('viewed_at', { ascending: false });

      if (!error && data) {
        setOpinionViewers(prev => ({ ...prev, [opinionId]: data }));
      }
    } catch (error) {
      console.error('Error fetching viewers:', error);
    } finally {
      setLoadingViewers(prev => ({ ...prev, [opinionId]: false }));
    }
  };

  useEffect(() => {
    const trackView = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || filteredOpinions.length === 0) return;

      // Get user type - only creators/studios/etc track views
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();

      if (!profile || profile.user_type === 'audience') return;

      const visibleOpinions = filteredOpinions.slice(0, 10);
      
      for (const opinion of visibleOpinions) {
        if (opinion.user_id !== user.id) {
          try {
            await supabase
              .from('opinion_views')
              .insert({
                opinion_id: opinion.id,
                viewer_id: user.id
              });
          } catch (error) {
            // Ignore duplicate view errors
          }
        }
      }
    };

    trackView();
  }, [filteredOpinions]);

  if (opinions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-md border-border">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No opinions submitted yet for this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <OpinionFilters
        filters={filters}
        onChange={setFilters}
        availableOptions={filterOptions}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          {categoryName || 'Category'} Opinions
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-base px-4 py-2">
            {filteredOpinions.length} of {opinions.length}
          </Badge>
        </div>
      </div>
      
      {filteredOpinions.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No opinions match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-6">
            {filteredOpinions.map((opinion, idx) => (
            <Card key={opinion.id} className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
                        A
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">Audience Member</span>
                         <span className="text-xs text-muted-foreground">
                          {opinion.user?.gender || 'Not Specified'} • {opinion.user?.age_group || 'Not Specified'}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {opinion.user?.city || 'Not Specified'}, {opinion.user?.country || 'Not Specified'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-sm">
                        Opinion #{idx + 1}
                      </Badge>
                      {opinion.would_pay && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          💰 Willing to Pay
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {opinion.content_type || 'Opinion'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(opinion.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
                <CardContent className="space-y-5">
                
                {/* User Demographics */}
                {opinion.user && (
                  <div className="flex flex-wrap gap-2">
                    {opinion.user.full_name && (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 font-semibold">
                        <UserIcon className="w-3 h-3 mr-1" />
                        {opinion.user.full_name}
                      </Badge>
                    )}
                    {opinion.user.gender && (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                        {opinion.user.gender}
                      </Badge>
                    )}
                    {opinion.user.age_group && (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                        {opinion.user.age_group}
                      </Badge>
                    )}
                    {opinion.user.country && (
                      <Badge variant="outline" className="bg-primary/5 border-primary/20">
                        <MapPin className="w-3 h-3 mr-1" />
                        {opinion.user.country}
                        {opinion.user.state_region && `, ${opinion.user.state_region}`}
                        {opinion.user.city && `, ${opinion.user.city}`}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Preferences */}
                {getPreferencesSummary(opinion.preferences).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-primary" />
                      Preferences & Details:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getPreferencesSummary(opinion.preferences).map((pref, i) => (
                        <div key={i} className="bg-muted/50 rounded-lg p-3 border border-border">
                          <span className="text-xs text-primary font-semibold capitalize block mb-1.5">
                            {pref.key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <p className="text-sm leading-relaxed">{pref.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {opinion.comments && (
                  <>
                    <Separator className="bg-border" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Additional Thoughts:
                      </h4>
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                        <p className="text-sm leading-relaxed italic">
                          "{opinion.comments}"
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}