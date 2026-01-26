import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, Users, Calendar, TrendingUp, Smartphone, Tv, Laptop, 
  Globe, Zap, ArrowRight, Sparkles, UserPlus, Eye, Activity,
  PieChart, Target, Clock, MapPin
} from "lucide-react";
import { 
  GlowingCard, RadialChart, LiveCounter, HolographicBadge, 
  AnimatedProgress, NeuralNetworkMini, CircuitBackground,
  FloatingParticles, triggerHaptic
} from "./InphroSyncPremium";

interface AnalyticsData {
  totalResponses: number;
  uniqueParticipants: number;
  todayResponses: number;
  weeklyGrowth: number;
  avgResponseRate: number;
  moodBreakdown: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  appBreakdown: Record<string, number>;
  hourlyDistribution: number[];
  topCountries: { country: string; count: number }[];
}

const moodEmojis: Record<string, string> = {
  'chill_relax': '😌',
  'fun_comedy': '😄',
  'thriller_excitement': '😱',
  'emotional_drama': '😢',
  'inspiring_motivation': '✨'
};

const deviceIcons: Record<string, typeof Smartphone> = {
  'mobile': Smartphone,
  'laptop': Laptop,
  'tv': Tv,
  'tablet': Smartphone
};

export function ProAnalyticsDashboard({ userType }: { userType: string | null }) {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    // Show CTA after 5 seconds
    const timer = setTimeout(() => setShowCTA(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: responses, error } = await supabase
        .from('inphrosync_responses')
        .select('*, profiles!inner(country)');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Calculate all metrics
      const moodBreakdown: Record<string, number> = {};
      const deviceBreakdown: Record<string, number> = {};
      const appBreakdown: Record<string, number> = {};
      const hourlyDistribution = new Array(24).fill(0);
      const countryCount: Record<string, number> = {};
      const uniqueUsers = new Set<string>();
      let todayCount = 0;
      let weekCount = 0;
      let prevWeekCount = 0;

      responses?.forEach(response => {
        uniqueUsers.add(response.user_id);
        
        const responseDate = response.response_date;
        if (responseDate === today) todayCount++;
        if (responseDate >= weekAgoStr) weekCount++;
        
        // Check previous week
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];
        if (responseDate >= twoWeeksAgoStr && responseDate < weekAgoStr) {
          prevWeekCount++;
        }

        // Breakdowns
        if (response.question_type === 'mood') {
          moodBreakdown[response.selected_option] = (moodBreakdown[response.selected_option] || 0) + 1;
        } else if (response.question_type === 'device') {
          deviceBreakdown[response.selected_option] = (deviceBreakdown[response.selected_option] || 0) + 1;
        } else if (response.question_type === 'app') {
          appBreakdown[response.selected_option] = (appBreakdown[response.selected_option] || 0) + 1;
        }

        // Hourly distribution (mock based on created_at)
        if (response.created_at) {
          const hour = new Date(response.created_at).getHours();
          hourlyDistribution[hour]++;
        }

        // Country count
        const country = (response as any).profiles?.country || 'Unknown';
        if (country !== 'Unknown') {
          countryCount[country] = (countryCount[country] || 0) + 1;
        }
      });

      // Weekly growth
      const weeklyGrowth = prevWeekCount > 0 
        ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100)
        : weekCount > 0 ? 100 : 0;

      // Top countries
      const topCountries = Object.entries(countryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }));

      setAnalytics({
        totalResponses: responses?.length || 0,
        uniqueParticipants: uniqueUsers.size,
        todayResponses: todayCount,
        weeklyGrowth,
        avgResponseRate: uniqueUsers.size > 0 ? Math.round((responses?.length || 0) / uniqueUsers.size * 10) / 10 : 0,
        moodBreakdown,
        deviceBreakdown,
        appBreakdown,
        hourlyDistribution,
        topCountries
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = () => {
    const labels: Record<string, string> = {
      creator: 'Creator',
      ott: 'OTT Platform',
      tv: 'TV Network',
      music: 'Music Industry',
      gaming: 'Game Developer',
      developer: 'App Developer'
    };
    return labels[userType || ''] || 'Professional';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalMood = Object.values(analytics.moodBreakdown).reduce((a, b) => a + b, 0);
  const totalDevice = Object.values(analytics.deviceBreakdown).reduce((a, b) => a + b, 0);
  const totalApp = Object.values(analytics.appBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="relative space-y-8">
      {/* Background effects */}
      <CircuitBackground className="opacity-30" />
      <FloatingParticles count={10} />

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="p-4 rounded-2xl bg-gradient-to-br from-accent to-purple-600 shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <BarChart3 className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-bold">Audience Analytics</h2>
              <HolographicBadge variant="live">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Live
                </span>
              </HolographicBadge>
            </div>
            <p className="text-muted-foreground">
              Real-time insights for <span className="font-medium text-foreground">{getUserTypeLabel()}</span> professionals
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            icon: BarChart3, 
            value: analytics.totalResponses, 
            label: "Total Responses",
            color: "from-blue-500 to-cyan-500"
          },
          { 
            icon: Users, 
            value: analytics.uniqueParticipants, 
            label: "Unique Participants",
            color: "from-purple-500 to-pink-500"
          },
          { 
            icon: Calendar, 
            value: analytics.todayResponses, 
            label: "Today's Responses",
            color: "from-green-500 to-emerald-500"
          },
          { 
            icon: TrendingUp, 
            value: `${analytics.weeklyGrowth > 0 ? '+' : ''}${analytics.weeklyGrowth}%`, 
            label: "Weekly Growth",
            color: analytics.weeklyGrowth >= 0 ? "from-green-500 to-teal-500" : "from-red-500 to-orange-500"
          }
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlowingCard>
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
              </div>
            </GlowingCard>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlowingCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Entertainment Mood Distribution</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(analytics.moodBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([mood, count], i) => {
                    const percentage = totalMood > 0 ? (count / totalMood) * 100 : 0;
                    return (
                      <motion.div
                        key={mood}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{moodEmojis[mood] || '🎬'}</span>
                            <span className="text-sm font-medium capitalize">{mood.replace('_', ' ')}</span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {count} <span className="text-xs">({percentage.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <AnimatedProgress value={percentage} showPercentage={false} color="gradient" />
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Device Usage */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlowingCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-accent/10">
                  <Smartphone className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-lg">Device Usage</h3>
              </div>
              <div className="flex items-center justify-center gap-6 py-4">
                {Object.entries(analytics.deviceBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([device, count], i) => {
                    const percentage = totalDevice > 0 ? (count / totalDevice) * 100 : 0;
                    const Icon = deviceIcons[device] || Smartphone;
                    return (
                      <motion.div
                        key={device}
                        className="text-center"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                      >
                        <RadialChart
                          percentage={percentage}
                          size={80}
                          strokeWidth={6}
                          color={i === 0 ? "primary" : "accent"}
                        />
                        <div className="mt-2 flex flex-col items-center">
                          <Icon className="w-4 h-4 text-muted-foreground mb-1" />
                          <span className="text-xs font-medium capitalize">{device}</span>
                          <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Top Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlowingCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-green-500/10">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-bold text-lg">Top Platforms</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(analytics.appBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([app, count], i) => {
                    const percentage = totalApp > 0 ? (count / totalApp) * 100 : 0;
                    return (
                      <motion.div
                        key={app}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => triggerHaptic('light')}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary w-6">#{i + 1}</span>
                          <span className="font-medium capitalize">{app.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="secondary">{count} ({percentage.toFixed(0)}%)</Badge>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </GlowingCard>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlowingCard>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Globe className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg">Geographic Distribution</h3>
              </div>
              {analytics.topCountries.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topCountries.map((item, i) => (
                    <motion.div
                      key={item.country}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{item.country}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item.count} responses</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Geographic data will appear as more users participate</p>
                </div>
              )}
            </div>
          </GlowingCard>
        </motion.div>
      </div>

      {/* AI Insights Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlowingCard glowColor="accent">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">AI-Powered Insights</h3>
                  <p className="text-xs text-muted-foreground">Powered by advanced analytics</p>
                </div>
              </div>
              <div className="w-16 h-12">
                <NeuralNetworkMini />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Peak engagement at 8-10 PM", icon: Clock },
                { label: "Mobile dominates consumption", icon: Smartphone },
                { label: "Comedy content trending", icon: TrendingUp }
              ].map((insight, i) => (
                <motion.div
                  key={insight.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <insight.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{insight.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Join CTA for non-audience */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <GlowingCard className="shadow-2xl">
              <div className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Want to contribute?</p>
                  <p className="text-xs text-muted-foreground">Join as an audience member to share your daily entertainment pulse</p>
                </div>
                <Button 
                  className="gap-2"
                  onClick={() => {
                    triggerHaptic('medium');
                    navigate('/onboarding');
                  }}
                >
                  Join Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </GlowingCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
