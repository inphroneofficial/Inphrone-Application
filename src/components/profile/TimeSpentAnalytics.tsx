import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TimeSpentAnalyticsProps {
  userId: string;
}

export function TimeSpentAnalytics({ userId }: TimeSpentAnalyticsProps) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [averageSession, setAverageSession] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeData();
  }, [userId]);

  const fetchTimeData = async () => {
    try {
      const { data: logs } = await supabase
        .from('user_activity_logs')
        .select('duration_seconds, session_start, session_end')
        .eq('user_id', userId)
        .not('duration_seconds', 'is', null)
        .gt('duration_seconds', 0);

      if (logs) {
        let totalSeconds = 0;
        let validLogs = 0;

        logs.forEach(log => {
          let dur = log.duration_seconds || 0;
          
          // Recalculate from timestamps if needed
          if (dur === 0 && log.session_start && log.session_end) {
            const start = new Date(log.session_start).getTime();
            const end = new Date(log.session_end).getTime();
            dur = Math.max(0, Math.floor((end - start) / 1000));
          }

          // Only count reasonable durations (less than 24 hours)
          if (dur > 0 && dur < 86400) {
            totalSeconds += dur;
            validLogs++;
          }
        });

        const minutes = Math.round(totalSeconds / 60);
        const avg = validLogs > 0 ? Math.round(minutes / validLogs) : 0;

        setTotalMinutes(minutes);
        setSessionCount(validLogs);
        setAverageSession(avg);
      }
    } catch (error) {
      console.error('Error fetching time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          Time Spent on Inphrone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Total Time</span>
            </div>
            <motion.p 
              className="text-2xl font-bold text-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {formatTime(totalMinutes)}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg border border-accent/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <motion.p 
              className="text-2xl font-bold text-accent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {sessionCount}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/5 rounded-lg border border-chart-2/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-chart-2" />
              <span className="text-xs text-muted-foreground">Avg. Session</span>
            </div>
            <motion.p 
              className="text-2xl font-bold text-chart-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {formatTime(averageSession)}
            </motion.p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 p-3 bg-muted/30 rounded-lg"
        >
          <p className="text-xs text-muted-foreground text-center">
            Your engagement journey since joining Inphrone 🎬
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}