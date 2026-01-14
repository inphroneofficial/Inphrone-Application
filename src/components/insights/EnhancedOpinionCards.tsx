import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Clock, 
  MapPin, 
  User, 
  TrendingUp,
  Sparkles,
  DollarSign,
  Users,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOpinionViewTracking } from "@/hooks/useOpinionViewTracking";

interface OpinionWithProfile {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  why_excited: string;
  genre?: string;
  content_type: string;
  would_pay: boolean | null;
  upvotes: number;
  preferences?: any;
  comments?: string | null;
  category_id: string;
  user: {
    full_name?: string;
    gender?: string;
    age_group?: string;
    country?: string;
    city?: string;
  };
}

interface OpinionCardsProps {
  opinions: OpinionWithProfile[];
  categoryIcon?: any;
  sortBy: string;
  onSortChange: (value: string) => void;
  showLikeButton?: boolean;
  currentUserId?: string | null;
  userType?: string;
}

export function EnhancedOpinionCards({ opinions, categoryIcon: CategoryIcon, sortBy, onSortChange, showLikeButton = true, currentUserId: propUserId = null, userType: propUserType = 'audience' }: OpinionCardsProps) {
  const [upvoteBreakdowns, setUpvoteBreakdowns] = useState<Record<string, any>>({});
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(propUserId);
  const [userType, setUserType] = useState<string>(propUserType);

  // Track opinion views for creators/studios
  useOpinionViewTracking(opinions.map(o => o.id));

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Fetch user's upvotes
        const { data: upvotes } = await supabase
          .from("opinion_upvotes")
          .select("opinion_id")
          .eq("user_id", user.id);
        
        if (upvotes) {
          setUserUpvotes(new Set(upvotes.map(u => u.opinion_id)));
        }

        // Get user type to show appropriate button text
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
        }
      }
    };
    
    initUser();
  }, [opinions]);

  useEffect(() => {
    const fetchUpvoteBreakdowns = async () => {
      const breakdowns: Record<string, any> = {};
      for (const opinion of opinions) {
        const { data } = await supabase.rpc('get_opinion_upvote_breakdown', {
          opinion_uuid: opinion.id
        });
        if (data) {
          breakdowns[opinion.id] = data;
        }
      }
      setUpvoteBreakdowns(breakdowns);
    };

    if (opinions.length > 0) {
      fetchUpvoteBreakdowns();
    }
  }, [opinions]);

  const handleUpvote = async (opinionId: string) => {
    if (!currentUserId) {
      toast.error("Please sign in to like");
      return;
    }

    try {
      const hasUpvoted = userUpvotes.has(opinionId);

      if (hasUpvoted) {
        // Remove upvote/like
        await supabase
          .from("opinion_upvotes")
          .delete()
          .eq("opinion_id", opinionId)
          .eq("user_id", currentUserId);

        // Decrement count for ALL likes (both audience and non-audience)
        await supabase.rpc("decrement_opinion_upvotes", { opinion_id: opinionId });

        setUserUpvotes(prev => {
          const newSet = new Set(prev);
          newSet.delete(opinionId);
          return newSet;
        });

        toast.success("Like removed");
      } else {
        // Add upvote/like
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", currentUserId)
          .single();

        const isAudience = profile?.user_type === 'audience';

        await supabase.from("opinion_upvotes").insert({
          opinion_id: opinionId,
          user_id: currentUserId,
          user_type: profile?.user_type || null,
          is_upvote: isAudience // Track type internally but ALL likes count the same
        });

        // Increment count for ALL likes (both audience and non-audience)
        await supabase.rpc("increment_opinion_upvotes", { opinion_id: opinionId });

        setUserUpvotes(prev => new Set([...prev, opinionId]));

        toast.success("Liked!");
      }

      // Refresh upvote breakdown
      const { data } = await supabase.rpc('get_opinion_upvote_breakdown', {
        opinion_uuid: opinionId
      });
      if (data) {
        setUpvoteBreakdowns(prev => ({ ...prev, [opinionId]: data }));
      }
    } catch (error: any) {
      toast.error("Failed to update like");
    }
  };

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "popular", label: "Most Liked" },
    { value: "trending", label: "Trending" }
  ];

  // Sort opinions based on selected option
  const sortedOpinions = [...opinions].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.upvotes - a.upvotes;
      case "trending":
        const scoreA = a.upvotes / (Math.max(1, (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)));
        const scoreB = b.upvotes / (Math.max(1, (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)));
        return scoreB - scoreA;
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Group opinions by most common preferences (genre and key preference fields)
  const preferencesSummary: Record<string, number> = {};
  opinions.forEach(op => {
    const prefs: any = op.preferences || {};
    if (op.genre) {
      preferencesSummary[op.genre] = (preferencesSummary[op.genre] || 0) + 1;
    }
    // Handle various preference types from different categories
    const arrayFields = ['videoType', 'contentType', 'platform', 'theme', 'tone', 'genre', 'gameType', 'musicGenre'];
    arrayFields.forEach(field => {
      if (Array.isArray(prefs[field])) {
        prefs[field].forEach((t: string) => {
          if (t && typeof t === 'string') {
            preferencesSummary[t] = (preferencesSummary[t] || 0) + 1;
          }
        });
      }
    });
    // Handle single value preference fields
    const singleFields = ['duration', 'engagement', 'activeTime'];
    singleFields.forEach(field => {
      if (prefs[field] && typeof prefs[field] === 'string') {
        preferencesSummary[prefs[field]] = (preferencesSummary[prefs[field]] || 0) + 1;
      }
    });
  });

  const topPreferences = Object.entries(preferencesSummary)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {topPreferences.length > 0 && (
        <Card className="glass-card border-2 border-primary/30">
          <CardHeader>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Preferences Summary
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topPreferences.map(([pref, count], index) => {
                const percentage = Math.round((count / opinions.length) * 100);
                return (
                  <motion.div
                    key={pref}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-semibold text-sm sm:text-base truncate flex-1" title={pref}>{pref}</span>
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl sm:text-3xl font-bold text-primary">{percentage}%</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">({count})</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            All Opinions
          </h3>
          <p className="text-muted-foreground mt-1">
            {sortedOpinions.length} detailed opinions
          </p>
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opinion Cards */}
      <div className="space-y-4">
        {sortedOpinions.map((opinion, index) => (
          <motion.div
            key={opinion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card border-2 hover:shadow-elegant transition-all duration-300 overflow-hidden group hover:border-primary/30">
              <CardContent className="p-4 sm:p-5 md:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
                   {/* User Info Sidebar */}
                   <div className="w-full md:w-56 lg:w-64 flex-shrink-0">
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-muted/5 border-2 border-border/50 hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">
                            {opinion.user_id === currentUserId 
                              ? (opinion.user?.full_name || 'You')
                              : 'Audience Member'}
                          </div>
                          {/* Show demographics for all users, but hide for own opinions */}
                          {opinion.user_id !== currentUserId && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                              <span className="capitalize">{opinion.user?.gender || 'Not Specified'}</span>
                              <span>•</span>
                              <span>{opinion.user?.age_group || 'Not Specified'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Show location for all users, but hide for own opinions */}
                      {opinion.user_id !== currentUserId && (
                        <div className="flex items-start gap-2 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground break-words">
                            {opinion.user?.city || 'Not Specified'}, {opinion.user?.country || 'Not Specified'}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(opinion.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(opinion.created_at).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Opinion Content */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {CategoryIcon && (
                            <CategoryIcon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          )}
                          <h4 className="text-lg sm:text-xl font-bold break-words">{opinion.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {opinion.genre && (
                            <Badge variant="outline" className="capitalize text-xs">
                              {opinion.genre}
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize text-xs">
                            {opinion.content_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Upvote Badge & Breakdown - Only show if prop allows */}
                      {showLikeButton && (
                        <div className="flex flex-col gap-2 flex-shrink-0 self-start">
                          {userType !== 'audience' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpvote(opinion.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all ${
                                userUpvotes.has(opinion.id)
                                  ? "bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70"
                                  : "bg-gradient-to-r from-primary/20 to-primary/30 border border-primary/30 hover:from-primary/30 hover:to-primary/40"
                              }`}
                              title="Like"
                            >
                              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${userUpvotes.has(opinion.id) ? "fill-white" : "text-primary"}`} />
                              <span className="font-bold text-base sm:text-lg">{opinion.upvotes}</span>
                              <span className="hidden sm:inline text-xs">Like</span>
                            </Button>
                          )}
                          {userType === 'audience' && (
                            <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-muted/50 border border-border">
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                              <span className="font-bold text-base sm:text-lg text-muted-foreground">{opinion.upvotes}</span>
                              <span className="hidden sm:inline text-xs text-muted-foreground">Likes</span>
                            </div>
                          )}
                        
                          {userType !== 'audience' && upvoteBreakdowns[opinion.id] && upvoteBreakdowns[opinion.id].total > 0 && (
                            <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
                              {upvoteBreakdowns[opinion.id].audience > 0 && (
                                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 w-fit">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{upvoteBreakdowns[opinion.id].audience} Audience</span>
                                </Badge>
                              )}
                              {upvoteBreakdowns[opinion.id].creator > 0 && (
                                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 w-fit">
                                  <User className="w-2.5 h-2.5" />
                                  <span>{upvoteBreakdowns[opinion.id].creator} Creators</span>
                                </Badge>
                              )}
                              {upvoteBreakdowns[opinion.id].studio > 0 && (
                                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5 w-fit">
                                  <Briefcase className="w-2.5 h-2.5" />
                                  <span>{upvoteBreakdowns[opinion.id].studio} Studios</span>
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Opinion Text */}
                    <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed break-words">
                        {opinion.why_excited}
                      </p>
                    </div>

                    {/* Additional Details if available */}
                    {(opinion.preferences || opinion.comments) && (
                      <div className="space-y-2">
                        {opinion.preferences && Object.keys(opinion.preferences).length > 0 && (
                          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preferences</h5>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(opinion.preferences).map(([key, value]) => (
                                value && (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key.replace(/_/g, ' ')}: {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </Badge>
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        {opinion.comments && (
                          <div className="p-3 rounded-lg bg-muted/20 border border-border/50">
                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Additional Comments</h5>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words">{opinion.comments}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {opinion.would_pay && (
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="w-3 h-3" />
                          Willing to pay
                        </Badge>
                      )}
                      {opinion.upvotes > 10 && (
                        <Badge variant="outline" className="gap-1 bg-primary/5">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </Badge>
                      )}
                      {opinion.upvotes > 20 && (
                        <Badge variant="outline" className="gap-1 bg-primary/10">
                          <Sparkles className="w-3 h-3" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {opinions.length === 0 && (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No opinions yet</h3>
          <p className="text-muted-foreground">
            Be the first to share your vision!
          </p>
        </Card>
      )}
    </div>
  );
}
