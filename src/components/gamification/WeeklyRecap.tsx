import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  TrendingUp, 
  Heart, 
  MessageSquare, 
  Award,
  Share2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface WeeklyRecapData {
  opinions_shared: number;
  likes_received: number;
  likes_given: number;
  top_category: string;
  streak_days: number;
  rank_change: number;
  wisdom_title: string;
}

interface WeeklyRecapProps {
  userId: string;
  onClose?: () => void;
}

export const WeeklyRecap = ({ userId, onClose }: WeeklyRecapProps) => {
  const [recapData, setRecapData] = useState<WeeklyRecapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchRecapData();
  }, [userId]);

  const fetchRecapData = async () => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Get opinions from past week
      const { data: opinions } = await supabase
        .from("opinions")
        .select("id, category_id, categories:category_id(name)")
        .eq("user_id", userId)
        .gte("created_at", weekAgo.toISOString());

      // Get likes received on user's opinions
      const { data: userOpinions } = await supabase
        .from("opinions")
        .select("id")
        .eq("user_id", userId);

      const opinionIds = userOpinions?.map(o => o.id) || [];
      
      let likesReceived = 0;
      if (opinionIds.length > 0) {
        const { data: likes } = await supabase
          .from("opinion_upvotes")
          .select("id")
          .in("opinion_id", opinionIds)
          .gte("created_at", weekAgo.toISOString());
        likesReceived = likes?.length || 0;
      }

      // Get likes given
      const { data: likesGiven } = await supabase
        .from("opinion_upvotes")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", weekAgo.toISOString());

      // Get streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak_weeks, streak_tier")
        .eq("user_id", userId)
        .single();

      // Find top category
      const categoryCount: Record<string, number> = {};
      opinions?.forEach(op => {
        const categories = op.categories as { name?: string } | null;
        const catName = categories?.name || "Unknown";
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
      });
      const topCategory = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

      // Determine wisdom title based on activity
      const activityScore = (opinions?.length || 0) * 10 + likesReceived * 5 + (likesGiven?.length || 0) * 2;
      let wisdomTitle = "Curious Explorer";
      if (activityScore > 100) wisdomTitle = "Insight Sage";
      else if (activityScore > 50) wisdomTitle = "Cultural Curator";
      else if (activityScore > 20) wisdomTitle = "Opinion Enthusiast";

      setRecapData({
        opinions_shared: opinions?.length || 0,
        likes_received: likesReceived,
        likes_given: likesGiven?.length || 0,
        top_category: topCategory,
        streak_days: (streakData?.current_streak_weeks || 0) * 7,
        rank_change: Math.floor(Math.random() * 20) - 10, // Placeholder
        wisdom_title: wisdomTitle
      });
    } catch (error) {
      console.error("Error fetching recap:", error);
    } finally {
      setLoading(false);
    }
  };

  const slides = recapData ? [
    {
      title: "Your Week in Review",
      icon: <Calendar className="w-12 h-12 text-primary" />,
      content: (
        <div className="text-center">
          <p className="text-4xl font-bold text-primary mb-2">
            {recapData.opinions_shared}
          </p>
          <p className="text-muted-foreground">opinions shared</p>
        </div>
      )
    },
    {
      title: "Community Love",
      icon: <Heart className="w-12 h-12 text-red-500" />,
      content: (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-red-500">{recapData.likes_received}</p>
            <p className="text-sm text-muted-foreground">likes received</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-accent">{recapData.likes_given}</p>
            <p className="text-sm text-muted-foreground">likes given</p>
          </div>
        </div>
      )
    },
    {
      title: "Your Passion",
      icon: <Sparkles className="w-12 h-12 text-accent" />,
      content: (
        <div className="text-center">
          <Badge className="text-lg px-4 py-2">{recapData.top_category}</Badge>
          <p className="text-muted-foreground mt-2">was your top category</p>
        </div>
      )
    },
    {
      title: "Wisdom Earned",
      icon: <Award className="w-12 h-12 text-amber-500" />,
      content: (
        <div className="text-center">
          <p className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            {recapData.wisdom_title}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Keep sharing to level up!
          </p>
        </div>
      )
    }
  ] : [];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <div className="animate-pulse text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading your recap...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!recapData) return null;

  return (
    <Card className="p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Recap
          </h3>
          <div className="flex gap-1">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-[200px] flex flex-col items-center justify-center"
        >
          {slides[currentSlide]?.icon}
          <h4 className="text-lg font-semibold mt-4 mb-4">
            {slides[currentSlide]?.title}
          </h4>
          {slides[currentSlide]?.content}
        </motion.div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            Previous
          </Button>
          {currentSlide < slides.length - 1 ? (
            <Button
              size="sm"
              onClick={() => setCurrentSlide(currentSlide + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={onClose}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Recap
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
