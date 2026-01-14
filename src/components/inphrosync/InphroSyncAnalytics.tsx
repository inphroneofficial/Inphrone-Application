import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Calendar, TrendingUp, Smartphone, Tv, Laptop, Gamepad2, Music, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  totalResponses: number;
  uniqueParticipants: number;
  todayResponses: number;
  moodBreakdown: Record<string, number>;
  deviceBreakdown: Record<string, number>;
  appBreakdown: Record<string, number>;
  participationByDate: Record<string, number>;
}

const moodLabels: Record<string, { label: string; emoji: string }> = {
  'chill_relax': { label: 'Chill & Relax', emoji: '😌' },
  'fun_comedy': { label: 'Fun & Comedy', emoji: '😄' },
  'thriller_excitement': { label: 'Thriller & Excitement', emoji: '😱' },
  'emotional_drama': { label: 'Emotional Drama', emoji: '😢' },
  'inspiring_motivation': { label: 'Inspiring', emoji: '✨' }
};

const deviceLabels: Record<string, { label: string; icon: typeof Smartphone }> = {
  'mobile': { label: 'Mobile', icon: Smartphone },
  'laptop': { label: 'Laptop', icon: Laptop },
  'tv': { label: 'Smart TV', icon: Tv },
  'tablet': { label: 'Tablet', icon: Gamepad2 }
};

const appColors: Record<string, string> = {
  'youtube': 'bg-red-500',
  'netflix': 'bg-red-600',
  'instagram': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'spotify': 'bg-green-500',
  'prime_video': 'bg-blue-500',
  'hotstar': 'bg-blue-600',
  'jiocinema': 'bg-pink-600'
};

export function InphroSyncAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: responses, error } = await supabase
        .from('inphrosync_responses')
        .select('*');

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      // Calculate analytics
      const moodBreakdown: Record<string, number> = {};
      const deviceBreakdown: Record<string, number> = {};
      const appBreakdown: Record<string, number> = {};
      const participationByDate: Record<string, number> = {};
      const uniqueUsers = new Set<string>();
      let todayCount = 0;

      responses?.forEach(response => {
        uniqueUsers.add(response.user_id);
        
        if (response.response_date === today) {
          todayCount++;
        }

        // Count by date
        participationByDate[response.response_date] = (participationByDate[response.response_date] || 0) + 1;

        // Count by type
        if (response.question_type === 'mood') {
          moodBreakdown[response.selected_option] = (moodBreakdown[response.selected_option] || 0) + 1;
        } else if (response.question_type === 'device') {
          deviceBreakdown[response.selected_option] = (deviceBreakdown[response.selected_option] || 0) + 1;
        } else if (response.question_type === 'app') {
          appBreakdown[response.selected_option] = (appBreakdown[response.selected_option] || 0) + 1;
        }
      });

      setAnalytics({
        totalResponses: responses?.length || 0,
        uniqueParticipants: uniqueUsers.size,
        todayResponses: todayCount,
        moodBreakdown,
        deviceBreakdown,
        appBreakdown,
        participationByDate
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="premium-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const totalMoodResponses = Object.values(analytics.moodBreakdown).reduce((a, b) => a + b, 0);
  const totalDeviceResponses = Object.values(analytics.deviceBreakdown).reduce((a, b) => a + b, 0);
  const totalAppResponses = Object.values(analytics.appBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="premium-card border-0 shadow-elegant overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-3xl font-bold">{analytics.totalResponses}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="premium-card border-0 shadow-elegant overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unique Participants</p>
                  <p className="text-3xl font-bold">{analytics.uniqueParticipants}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card border-0 shadow-elegant overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Responses</p>
                  <p className="text-3xl font-bold">{analytics.todayResponses}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Calendar className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mood Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="premium-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Entertainment Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.moodBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([mood, count]) => {
                const info = moodLabels[mood] || { label: mood, emoji: '🎬' };
                const percentage = totalMoodResponses > 0 ? (count / totalMoodResponses) * 100 : 0;
                return (
                  <div key={mood} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{info.emoji}</span>
                        <span className="font-medium">{info.label}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Device & App Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="premium-card border-0 shadow-elegant h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Device Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics.deviceBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => {
                  const info = deviceLabels[device] || { label: device, icon: Smartphone };
                  const Icon = info.icon;
                  const percentage = totalDeviceResponses > 0 ? (count / totalDeviceResponses) * 100 : 0;
                  return (
                    <div key={device} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{info.label}</span>
                      </div>
                      <Badge variant="secondary">{count} ({percentage.toFixed(0)}%)</Badge>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="premium-card border-0 shadow-elegant h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Top Apps/Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analytics.appBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([app, count]) => {
                  const percentage = totalAppResponses > 0 ? (count / totalAppResponses) * 100 : 0;
                  const colorClass = appColors[app] || 'bg-gray-500';
                  return (
                    <div key={app} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                        <span className="font-medium capitalize">{app.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count} ({percentage.toFixed(0)}%)</Badge>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}