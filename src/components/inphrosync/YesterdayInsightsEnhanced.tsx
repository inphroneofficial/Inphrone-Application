import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { TrendingUp, Award, Sparkles, Users, Globe, Flame, BarChart3 } from "lucide-react";
import { GlowingCard, RadialChart, triggerHaptic, HolographicBadge } from "./InphroSyncPremium";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightData {
  question_type: string;
  top_option: string;
  total_count: number;
  percentage: number;
  allOptions: { option: string; count: number; percentage: number }[];
}

export function YesterdayInsightsEnhanced() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchYesterdayInsights();
  }, []);

  const fetchYesterdayInsights = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split('T')[0];

      const { data: responses, error } = await supabase
        .from("inphrosync_responses")
        .select("question_type, selected_option, user_id")
        .eq("response_date", targetDate);

      if (error) throw error;

      if (!responses || responses.length === 0) {
        setInsights([]);
        return;
      }

      // Get unique participants
      const uniqueUsers = new Set(responses.map(r => r.user_id));
      setTotalParticipants(uniqueUsers.size);

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
          allOptions: sortedOptions.map(([option, count]) => ({
            option,
            count,
            percentage: Math.round((count / totalResponses) * 100)
          }))
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

  const getChartColor = (index: number): "primary" | "accent" | "success" | "warning" => {
    const colors: ("primary" | "accent" | "success" | "warning")[] = ["primary", "accent", "success"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <motion.div
        className="relative p-12 rounded-3xl border-2 border-dashed border-border/50 text-center overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        >
          <Sparkles className="w-20 h-20 mx-auto mb-6 text-primary" />
        </motion.div>
        
        <h3 className="text-3xl font-bold mb-3">
          <span className="text-gradient">Fresh Start!</span>
        </h3>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Yesterday's insights will appear here once the community starts participating. 
          Be the first to share your entertainment pulse!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            onHoverStart={() => triggerHaptic('light')}
          >
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </motion.div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-gradient">Yesterday's Top Picks</span>
            </h2>
            <p className="text-muted-foreground mt-1">Community's most popular choices</p>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-3">
          <HolographicBadge variant="live">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{totalParticipants} Participants</span>
            </div>
          </HolographicBadge>
          <HolographicBadge variant="default">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global</span>
            </div>
          </HolographicBadge>
        </div>
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.question_type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <GlowingCard className="h-full" glowColor={getChartColor(index)}>
              <div className="p-6 space-y-5">
                {/* Trophy Badge */}
                <div className="absolute -top-3 -right-3 z-20">
                  <motion.div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-xl"
                    animate={{ 
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Award className="w-7 h-7 text-white" />
                  </motion.div>
                </div>

                {/* Header */}
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="text-5xl"
                    animate={!isMobile ? { 
                      scale: [1, 1.15, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {getIcon(insight.question_type)}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {getQuestionTitle(insight.question_type)}
                    </p>
                    <h3 className="text-lg font-bold mt-1 line-clamp-2 text-foreground">
                      {insight.top_option}
                    </h3>
                  </div>
                </div>

                {/* Radial Chart */}
                <div className="flex items-center justify-center py-4">
                  <RadialChart
                    percentage={insight.percentage}
                    size={100}
                    value={`${insight.percentage}%`}
                    label="Top Choice"
                    color={getChartColor(index)}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">{insight.total_count}</span> votes
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-medium text-orange-500">Trending</span>
                  </div>
                </div>

                {/* Mini breakdown */}
                <div className="space-y-2">
                  {insight.allOptions.slice(0, 3).map((opt, i) => (
                    <div key={opt.option} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="truncate text-muted-foreground">{opt.option}</span>
                          <span className="font-medium">{opt.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${opt.percentage}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlowingCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
