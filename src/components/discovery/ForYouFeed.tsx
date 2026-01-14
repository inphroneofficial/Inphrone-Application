import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, MapPin, Clock, ThumbsUp, Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendedOpinion {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_color: string;
  upvotes: number;
  created_at: string;
  city?: string;
  country?: string;
  match_reason: string;
  match_score: number;
}

interface ForYouFeedProps {
  userId: string;
  userCity?: string;
  userCountry?: string;
}

export const ForYouFeed = ({ userId, userCity, userCountry }: ForYouFeedProps) => {
  const [recommendations, setRecommendations] = useState<RecommendedOpinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRecommendations();
    fetchBookmarks();
  }, [userId]);

  const fetchBookmarks = async () => {
    // Get bookmarked opinions from local storage for now
    const stored = localStorage.getItem(`bookmarks_${userId}`);
    if (stored) {
      setBookmarkedIds(new Set(JSON.parse(stored)));
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Get user's past opinions to understand preferences
      const { data: userOpinions } = await supabase
        .from("opinions")
        .select("category_id, genre, content_type")
        .eq("user_id", userId);

      // Get categories user has engaged with
      const userCategories = new Set(userOpinions?.map(o => o.category_id) || []);
      const userGenres = new Set(userOpinions?.filter(o => o.genre).map(o => o.genre) || []);

      // Fetch trending opinions with category info
      const { data: opinionsData } = await supabase
        .from("opinions")
        .select(`
          id, title, description, upvotes, created_at, city, country, genre, content_type, category_id,
          categories:category_id (name, color)
        `)
        .neq("user_id", userId)
        .order("upvotes", { ascending: false })
        .limit(50);

      if (!opinionsData) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Score and rank opinions
      const scoredOpinions = opinionsData.map(opinion => {
        let score = 0;
        let reasons: string[] = [];

        // Same category preference
        if (userCategories.has(opinion.category_id)) {
          score += 30;
          reasons.push("Similar interests");
        }

        // Genre match
        if (opinion.genre && userGenres.has(opinion.genre)) {
          score += 25;
          reasons.push("Genre match");
        }

        // Local content
        if (userCity && opinion.city?.toLowerCase() === userCity.toLowerCase()) {
          score += 20;
          reasons.push("From your city");
        } else if (userCountry && opinion.country?.toLowerCase() === userCountry.toLowerCase()) {
          score += 10;
          reasons.push("From your country");
        }

        // Trending (high upvotes)
        if (opinion.upvotes >= 10) {
          score += 15;
          reasons.push("Trending");
        }

        // Recent content
        const hoursAgo = (Date.now() - new Date(opinion.created_at).getTime()) / (1000 * 60 * 60);
        if (hoursAgo < 24) {
          score += 10;
          reasons.push("Fresh");
        }

        const category = opinion.categories as any;

        return {
          id: opinion.id,
          title: opinion.title,
          description: opinion.description,
          category_name: category?.name || "Unknown",
          category_color: category?.color || "#888",
          upvotes: opinion.upvotes || 0,
          created_at: opinion.created_at,
          city: opinion.city,
          country: opinion.country,
          match_reason: reasons[0] || "Recommended",
          match_score: score
        };
      });

      // Sort by score and take top 10
      const sorted = scoredOpinions.sort((a, b) => b.match_score - a.match_score).slice(0, 10);
      setRecommendations(sorted);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (opinionId: string) => {
    const newBookmarks = new Set(bookmarkedIds);
    if (newBookmarks.has(opinionId)) {
      newBookmarks.delete(opinionId);
      toast.success("Removed from bookmarks");
    } else {
      newBookmarks.add(opinionId);
      toast.success("Added to bookmarks");
    }
    setBookmarkedIds(newBookmarks);
    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify([...newBookmarks]));
  };

  const formatTimeAgo = (date: string) => {
    const hours = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-semibold">For You</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">For You</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Share more opinions to get personalized recommendations!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">For You</h3>
        <Badge variant="secondary" className="text-xs">
          Personalized
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {recommendations.map((opinion, index) => (
            <motion.div
              key={opinion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ borderColor: opinion.category_color, color: opinion.category_color }}
                    >
                      {opinion.category_name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {opinion.match_reason}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1">{opinion.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {opinion.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {opinion.upvotes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(opinion.created_at)}
                    </span>
                    {opinion.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {opinion.city}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleBookmark(opinion.id)}
                >
                  {bookmarkedIds.has(opinion.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-primary" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};
