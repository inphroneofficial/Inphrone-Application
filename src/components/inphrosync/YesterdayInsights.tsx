import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Award, Sparkles, Users } from "lucide-react";

interface InsightData {
  question_type: string;
  top_option: string;
  total_count: number;
  percentage: number;
}

export function YesterdayInsights() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchYesterdayInsights();
  }, []);

  const fetchYesterdayInsights = async () => {
    try {
      // Get yesterday's date (not day before yesterday)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split('T')[0];

      const { data: responses, error } = await supabase
        .from("inphrosync_responses")
        .select("question_type, selected_option")
        .eq("response_date", targetDate);

      if (error) throw error;

      if (!responses || responses.length === 0) {
        setInsights([]);
        return;
      }

      const groupedData: Record<string, Record<string, number>> = {};
      
      responses.forEach((response) => {
        if (!groupedData[response.question_type]) {
          groupedData[response.question_type] = {};
        }
        groupedData[response.question_type][response.selected_option] = 
          (groupedData[response.question_type][response.selected_option] || 0) + 1;
      });

      const insightsData: InsightData[] = Object.entries(groupedData).map(([questionType, options]) => {
        const sortedOptions = Object.entries(options).sort((a, b) => b[1] - a[1]);
        const totalResponses = Object.values(options).reduce((sum, count) => sum + count, 0);
        const topOptionCount = sortedOptions[0][1];
        const percentage = Math.round((topOptionCount / totalResponses) * 100);
        
        return {
          question_type: questionType,
          top_option: sortedOptions[0][0],
          total_count: topOptionCount,
          percentage,
        };
      });

      setInsights(insightsData);
    } catch (error) {
      console.error("Error fetching yesterday insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTitle = (questionType: string) => {
    if (questionType.includes("mood")) return "Entertainment Mood";
    if (questionType.includes("device")) return "Device Used";
    if (questionType.includes("app")) return "App/Platform";
    return questionType;
  };

  const getIcon = (questionType: string) => {
    if (questionType.includes("mood")) return "🎭";
    if (questionType.includes("device")) return "📱";
    if (questionType.includes("app")) return "🎬";
    return "✨";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <motion.div
        className="mb-12 p-12 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl border-2 border-border/50 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          No Previous Data Yet
        </h3>
        <p className="text-muted-foreground text-lg">
          Yesterday's insights will appear here once users start participating!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mb-12">
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Yesterday's Top Picks
          </h2>
          <p className="text-sm text-muted-foreground">Most popular choices from the community</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.question_type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <Card className="relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:scale-105 group">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Trophy badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <motion.div
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Award className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              <div className="relative p-6 space-y-4">
                {/* Icon and title */}
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="text-5xl"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {getIcon(insight.question_type)}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {getQuestionTitle(insight.question_type)}
                    </p>
                    <h3 className="text-xl font-bold mt-1 line-clamp-2">
                      {insight.top_option}
                    </h3>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Community Choice</span>
                    </div>
                    <motion.div
                      className="flex items-baseline gap-1"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 + index * 0.1 }}
                    >
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {insight.total_count}
                      </span>
                      <span className="text-sm text-muted-foreground">votes</span>
                    </motion.div>
                  </div>

                  {/* Animated progress bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Popularity</span>
                      <span className="font-bold text-primary">{insight.percentage}%</span>
                    </div>
                    <div className="relative h-3 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${insight.percentage}%` }}
                        transition={{ 
                          duration: 1.5, 
                          delay: 0.3 + index * 0.1, 
                          ease: "easeOut" 
                        }}
                      />
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5 + index * 0.2
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Decorative corner element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-full h-full text-primary" />
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}