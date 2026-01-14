import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Hash } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";

interface TrendingTopic {
  id: string;
  topic: string;
  count: number;
  category: string;
  trend: "up" | "stable" | "new";
}

export function TrendingTopics() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      // Fetch recent opinions and extract common topics
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentOpinions } = await supabase
        .from("opinions")
        .select(`
          id,
          title,
          genre,
          content_type,
          category_id,
          categories:category_id (name)
        `)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (!recentOpinions?.length) {
        setLoading(false);
        return;
      }

      // Extract topics from genres and content types
      const topicCounts: Record<string, { count: number; category: string }> = {};

      recentOpinions.forEach((op: any) => {
        const categoryName = op.categories?.name || "General";
        
        // Count genres
        if (op.genre) {
          const key = op.genre.toLowerCase();
          if (!topicCounts[key]) {
            topicCounts[key] = { count: 0, category: categoryName };
          }
          topicCounts[key].count++;
        }

        // Count content types
        if (op.content_type) {
          const key = op.content_type.toLowerCase();
          if (!topicCounts[key]) {
            topicCounts[key] = { count: 0, category: categoryName };
          }
          topicCounts[key].count++;
        }

        // Extract keywords from title (simple approach)
        const words = op.title.split(/\s+/).filter((w: string) => w.length > 4);
        words.slice(0, 2).forEach((word: string) => {
          const key = word.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (key.length > 4) {
            if (!topicCounts[key]) {
              topicCounts[key] = { count: 0, category: categoryName };
            }
            topicCounts[key].count++;
          }
        });
      });

      // Convert to array and sort
      const sortedTopics: TrendingTopic[] = Object.entries(topicCounts)
        .filter(([_, data]) => data.count >= 2) // At least 2 mentions
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([topic, data], index) => ({
          id: `topic-${index}`,
          topic: topic.charAt(0).toUpperCase() + topic.slice(1),
          count: data.count,
          category: data.category,
          trend: data.count >= 5 ? "up" : data.count >= 3 ? "stable" : "new"
        }));

      setTopics(sortedTopics);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: TrendingTopic["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "new": return <Flame className="w-3 h-3 text-orange-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Hash className="w-5 h-5 text-primary" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" />
          Trending Topics
          <Badge variant="outline" className="ml-auto text-xs">
            This Week
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No trends yet"
            description="Share opinions to help discover trending topics"
            variant="compact"
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge
                  variant="outline"
                  className="py-2 px-3 text-sm flex items-center gap-2 hover:bg-muted/50 cursor-default transition-colors"
                >
                  {getTrendIcon(topic.trend)}
                  <span className="font-medium">{topic.topic}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {topic.count}
                  </span>
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
