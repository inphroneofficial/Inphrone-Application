import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Globe, Users, Zap, TrendingUp, Clock, BarChart3, PieChart } from "lucide-react";
import { GlowingCard, HolographicBadge, triggerHaptic } from "./InphroSyncPremium";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'mood' | 'device' | 'app';
  option: string;
  timestamp: Date;
  location?: string;
}

interface CommunityStats {
  todayParticipants: number;
  activeNow: number;
  totalResponses: number;
  countriesReached: number;
}

interface QuestionVoteCounts {
  [questionType: string]: {
    questionText: string;
    options: { [option: string]: number };
    total: number;
  };
}

interface LiveActivityFeedProps {
  showDetailedVotes?: boolean;
}

export function LiveActivityFeed({ showDetailedVotes = false }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    todayParticipants: 0,
    activeNow: 0,
    totalResponses: 0,
    countriesReached: 0
  });
  const [isLive, setIsLive] = useState(true);
  const [voteCounts, setVoteCounts] = useState<QuestionVoteCounts>({});

  useEffect(() => {
    fetchInitialData();
    if (showDetailedVotes) {
      fetchVoteCounts();
    }
    const cleanup = setupRealtimeSubscription();
    
    // Simulate active users (in production, use Supabase Presence)
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeNow: Math.max(1, prev.activeNow + Math.floor(Math.random() * 3) - 1)
      }));
    }, 5000);

    // Polling for vote counts (for non-audience users)
    const voteInterval = showDetailedVotes ? setInterval(fetchVoteCounts, 3000) : null;

    return () => {
      cleanup();
      clearInterval(interval);
      if (voteInterval) clearInterval(voteInterval);
    };
  }, [showDetailedVotes]);

  const fetchInitialData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch recent responses with user_id for profile lookup
      const { data: responses, error: responsesError } = await supabase
        .from('inphrosync_responses')
        .select('id, question_type, selected_option, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(10);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
      }

      if (responses && responses.length > 0) {
        // Fetch profiles separately for the user_ids - include city for accurate location
        const userIds = [...new Set(responses.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, city, state_region, country')
          .in('id', userIds);

        // Build location map with city + country priority
        const profileMap = new Map(profiles?.map(p => {
          // Prefer city, then state, then country
          const location = p.city 
            ? `${p.city}${p.country ? `, ${p.country}` : ''}`
            : p.state_region 
              ? `${p.state_region}${p.country ? `, ${p.country}` : ''}`
              : p.country || 'somewhere';
          return [p.id, location];
        }) || []);

        const items: ActivityItem[] = responses.map(r => ({
          id: r.id,
          type: r.question_type as 'mood' | 'device' | 'app',
          option: r.selected_option,
          timestamp: new Date(r.created_at),
          location: profileMap.get(r.user_id) || 'somewhere'
        }));
        setActivities(items);
      }

      // Fetch stats - get all responses for today's count
      const { data: allResponses, count: totalCount } = await supabase
        .from('inphrosync_responses')
        .select('user_id, response_date', { count: 'exact' });

      // Get unique countries from profiles
      const { data: profilesWithCountries } = await supabase
        .from('profiles')
        .select('country')
        .not('country', 'is', null);

      const uniqueCountries = new Set(profilesWithCountries?.map(p => p.country).filter(Boolean) || []);

      if (allResponses) {
        const todayUsers = new Set(
          allResponses.filter(r => r.response_date === today).map(r => r.user_id)
        );

        setStats({
          todayParticipants: todayUsers.size,
          activeNow: Math.max(1, Math.floor(Math.random() * 5) + 1),
          totalResponses: totalCount || allResponses.length,
          countriesReached: Math.max(1, uniqueCountries.size)
        });
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchVoteCounts = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch questions
      const { data: questions } = await supabase
        .from('inphrosync_questions')
        .select('*')
        .eq('is_active', true);

      // Fetch today's responses
      const { data: responses } = await supabase
        .from('inphrosync_responses')
        .select('question_type, selected_option')
        .eq('response_date', today);

      if (questions && responses) {
        const counts: QuestionVoteCounts = {};
        
        questions.forEach(q => {
          const questionResponses = responses.filter(r => r.question_type === q.question_type);
          const options = q.options as Array<{ id: string; label: string }>;
          
          const optionCounts: { [option: string]: number } = {};
          options.forEach(opt => {
            optionCounts[opt.label] = questionResponses.filter(r => r.selected_option === opt.label).length;
          });
          
          counts[q.question_type] = {
            questionText: q.question_text,
            options: optionCounts,
            total: questionResponses.length
          };
        });
        
        setVoteCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('live-activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inphrosync_responses'
        },
        async (payload) => {
          // Fetch the user's profile for location
          const userId = payload.new.user_id;
          let location = 'somewhere';
          
          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('city, state_region, country')
              .eq('id', userId)
              .single();
            
            if (profile) {
              location = profile.city 
                ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}`
                : profile.state_region 
                  ? `${profile.state_region}${profile.country ? `, ${profile.country}` : ''}`
                  : profile.country || 'somewhere';
            }
          }

          const newActivity: ActivityItem = {
            id: payload.new.id,
            type: payload.new.question_type as 'mood' | 'device' | 'app',
            option: payload.new.selected_option,
            timestamp: new Date(payload.new.created_at),
            location
          };

          setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
          triggerHaptic('light');
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalResponses: prev.totalResponses + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mood': return '🎭';
      case 'device': return '📱';
      case 'app': return '🎬';
      default: return '✨';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const location = activity.location || 'somewhere';
    switch (activity.type) {
      case 'mood':
        return `Someone in ${location} is feeling "${activity.option}"`;
      case 'device':
        return `${activity.option} entertainment in ${location}`;
      case 'app':
        return `${activity.option} is being watched in ${location}`;
      default:
        return `New activity from ${location}`;
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'mood': return { icon: '🎭', color: 'from-pink-500 to-rose-500' };
      case 'device': return { icon: '📱', color: 'from-blue-500 to-cyan-500' };
      case 'app': return { icon: '🎬', color: 'from-purple-500 to-violet-500' };
      default: return { icon: '✨', color: 'from-primary to-accent' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlowingCard>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Community Pulse</h3>
                  <p className="text-xs text-muted-foreground">Real-time engagement metrics</p>
                </div>
              </div>
              <HolographicBadge variant="live">
                <span className="flex items-center gap-1.5">
                  <motion.span 
                    className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Live
                </span>
              </HolographicBadge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Users, value: stats.todayParticipants, label: "Today's Participants", color: "text-blue-500" },
                { icon: Zap, value: stats.activeNow, label: "Active Now", color: "text-green-500" },
                { icon: TrendingUp, value: stats.totalResponses, label: "Total Responses", color: "text-purple-500" },
                { icon: Globe, value: stats.countriesReached, label: "Countries", color: "text-orange-500" }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-3 rounded-xl bg-muted/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <motion.p 
                    className="text-xl font-bold"
                    key={stat.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </GlowingCard>
      </motion.div>

      {/* Detailed Vote Counts for Non-Audience Users */}
      {showDetailedVotes && Object.keys(voteCounts).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlowingCard>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Live Vote Distribution</h3>
                  <p className="text-xs text-muted-foreground">Real-time audience selections today</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(voteCounts).map(([type, data], idx) => {
                  const { icon, color } = getQuestionIcon(type);
                  const maxVotes = Math.max(...Object.values(data.options), 1);
                  
                  return (
                    <motion.div
                      key={type}
                      className="p-4 rounded-2xl bg-muted/20 border border-border/30"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}>
                          {icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{data.questionText}</p>
                          <p className="text-xs text-muted-foreground">{data.total} responses today</p>
                        </div>
                        <HolographicBadge variant="live">
                          <span className="flex items-center gap-1">
                            <motion.span
                              className="w-1.5 h-1.5 rounded-full bg-green-500"
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            Live
                          </span>
                        </HolographicBadge>
                      </div>
                      
                      <div className="space-y-2">
                        {Object.entries(data.options).map(([option, count]) => {
                          const percentage = data.total > 0 ? (count / data.total) * 100 : 0;
                          
                          return (
                            <div key={option} className="group">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium truncate max-w-[60%]">{option}</span>
                                <span className="text-muted-foreground">
                                  <motion.span
                                    key={count}
                                    initial={{ scale: 1.3, color: 'hsl(var(--primary))' }}
                                    animate={{ scale: 1, color: 'hsl(var(--muted-foreground))' }}
                                    className="font-bold mr-1"
                                  >
                                    {count}
                                  </motion.span>
                                  ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full bg-gradient-to-r ${color} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlowingCard>
        </motion.div>
      )}

      {/* Live Activity Stream */}
      <GlowingCard>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Live Activity Stream</h3>
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isLive ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
              }`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{getActivityText(activity)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {i === 0 && (
                      <motion.span
                        className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        New
                      </motion.span>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Waiting for activity...</p>
                  <p className="text-xs">Be the first to participate today!</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlowingCard>
    </div>
  );
}
