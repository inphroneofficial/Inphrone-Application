import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, MapPin, Calendar, Clock, Heart, MessageSquare,
  Trophy, Gift, Zap, TrendingUp, Activity, Shield, Eye,
  Sparkles, Target, BarChart3, Globe, Star, Award, Flame
} from "lucide-react";

interface UserDetailsProps {
  userId: string;
  userName: string;
  userType: string;
  onClose?: () => void;
}

interface ComprehensiveStats {
  // Basic counts
  opinions_count: number;
  inphrosync_count: number;
  yourturn_count: number;
  coupons_count: number;
  upvotes_received: number;
  upvotes_given: number;
  total_time_spent: number;
  
  // Engagement metrics
  current_streak: number;
  longest_streak: number;
  badges_count: number;
  referrals_count: number;
  
  // Activity patterns
  last_opinion_date: string | null;
  last_sync_date: string | null;
  last_login: string | null;
  
  // Profile completeness
  profile_completeness: number;
  
  // Category preferences
  top_categories: { category: string; count: number }[];
}

interface ProfileData {
  basic: any;
  specific: any;
}

export function EnhancedUserDetails({ userId, userName, userType, onClose }: UserDetailsProps) {
  const [stats, setStats] = useState<ComprehensiveStats | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (userId) {
      fetchComprehensiveData();
    }
  }, [userId]);

  const fetchComprehensiveData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        basicProfile,
        opinionsRes,
        syncRes,
        votesRes,
        couponsRes,
        upvotesGiven,
        streaksRes,
        badgesRes,
        referralsRes,
        activityRes
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("opinions").select("id, created_at, content_type").eq("user_id", userId),
        supabase.from("inphrosync_responses").select("id, response_date").eq("user_id", userId),
        supabase.from("your_turn_votes").select("id").eq("user_id", userId),
        supabase.from("coupons").select("id").eq("user_id", userId),
        supabase.from("opinion_upvotes").select("id").eq("user_id", userId),
        supabase.from("user_streaks").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("user_badges").select("*").eq("user_id", userId),
        supabase.from("referrals").select("id").eq("referrer_id", userId),
        supabase.from("user_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10)
      ]);

      // Calculate upvotes received on user's opinions
      let upvotesReceived = 0;
      if (opinionsRes.data && opinionsRes.data.length > 0) {
        const { count } = await supabase
          .from("opinion_upvotes")
          .select("id", { count: "exact", head: true })
          .in("opinion_id", opinionsRes.data.map((o: any) => o.id));
        upvotesReceived = count || 0;
      }

      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      opinionsRes.data?.forEach((op: any) => {
        if (op.content_type) {
          categoryCount[op.content_type] = (categoryCount[op.content_type] || 0) + 1;
        }
      });
      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate total time spent
      const totalTime = activityRes.data?.reduce((sum: number, log: any) => 
        sum + (log.duration_seconds || 0), 0) || 0;

      // Calculate profile completeness
      const profileFields = ['full_name', 'email', 'country', 'city', 'gender', 'age_group'];
      const filledFields = profileFields.filter(f => basicProfile.data?.[f]).length;
      const profileCompleteness = Math.round((filledFields / profileFields.length) * 100);

      // Sort sync responses to find streak info
      const sortedSyncs = syncRes.data?.sort((a: any, b: any) => 
        new Date(b.response_date).getTime() - new Date(a.response_date).getTime()
      );

      setStats({
        opinions_count: opinionsRes.data?.length || 0,
        inphrosync_count: syncRes.data?.length || 0,
        yourturn_count: votesRes.data?.length || 0,
        coupons_count: couponsRes.data?.length || 0,
        upvotes_received: upvotesReceived,
        upvotes_given: upvotesGiven.data?.length || 0,
        total_time_spent: totalTime,
        current_streak: streaksRes.data?.inphrosync_streak_days || streaksRes.data?.current_streak_weeks || 0,
        longest_streak: streaksRes.data?.inphrosync_longest_streak || 0,
        badges_count: badgesRes.data?.length || 0,
        referrals_count: referralsRes.data?.length || 0,
        last_opinion_date: opinionsRes.data && opinionsRes.data.length > 0 ? opinionsRes.data[0].created_at : null,
        last_sync_date: sortedSyncs?.[0]?.response_date || null,
        last_login: activityRes.data?.[0]?.created_at || null,
        profile_completeness: profileCompleteness,
        top_categories: topCategories
      });

      // Fetch specific profile based on user type
      let specificProfile = null;
      try {
        if (userType === 'audience') {
          const { data } = await supabase.from('audience_profiles').select('*').eq('user_id', userId).maybeSingle();
          specificProfile = data;
        } else if (userType === 'creator') {
          const { data } = await supabase.from('creator_profiles').select('*').eq('user_id', userId).maybeSingle();
          specificProfile = data;
        } else if (userType === 'studio') {
          const { data } = await supabase.from('studio_profiles').select('*').eq('user_id', userId).maybeSingle();
          specificProfile = data;
        } else if (userType === 'developer') {
          const { data } = await supabase.from('developer_profiles').select('*').eq('user_id', userId).maybeSingle();
          specificProfile = data;
        }
      } catch (e) {
        console.log('Profile fetch error:', e);
      }

      setProfile({
        basic: basicProfile.data,
        specific: specificProfile
      });

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      audience: "from-blue-500 to-cyan-500",
      creator: "from-purple-500 to-pink-500",
      studio: "from-green-500 to-emerald-500",
      ott: "from-pink-500 to-rose-500",
      tv: "from-cyan-500 to-blue-500",
      gaming: "from-red-500 to-orange-500",
      music: "from-yellow-500 to-amber-500",
      developer: "from-indigo-500 to-violet-500"
    };
    return colors[type] || "from-gray-500 to-slate-500";
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getUserTypeColor(userType)} p-6`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{userName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-white/20 text-white border-white/30 capitalize">
                {userType}
              </Badge>
              <span className="text-white/80 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile?.basic?.city || profile?.basic?.country || 'Unknown'}
              </span>
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {formatDate(profile?.basic?.created_at)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-sm">Profile Completeness</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={stats?.profile_completeness || 0} className="w-24 h-2 bg-white/20" />
              <span className="text-white font-semibold">{stats?.profile_completeness}%</span>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-2">
            <Activity className="w-4 h-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="achievements" className="gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<MessageSquare className="w-5 h-5" />}
              label="Opinions"
              value={stats?.opinions_count || 0}
              color="purple"
            />
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              label="InphroSync"
              value={stats?.inphrosync_count || 0}
              color="cyan"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Your Turn"
              value={stats?.yourturn_count || 0}
              color="amber"
            />
            <StatCard
              icon={<Gift className="w-5 h-5" />}
              label="Coupons"
              value={stats?.coupons_count || 0}
              color="pink"
            />
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              label="Likes Received"
              value={stats?.upvotes_received || 0}
              color="red"
            />
            <StatCard
              icon={<Heart className="w-5 h-5" />}
              label="Likes Given"
              value={stats?.upvotes_given || 0}
              color="rose"
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Time Spent"
              value={formatTime(stats?.total_time_spent || 0)}
              color="blue"
              isString
            />
            <StatCard
              icon={<Globe className="w-5 h-5" />}
              label="Referrals"
              value={stats?.referrals_count || 0}
              color="green"
            />
          </div>

          {/* Category Distribution */}
          {stats?.top_categories && stats.top_categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.top_categories.map((cat, idx) => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">{cat.category}</span>
                          <span className="text-sm text-muted-foreground">{cat.count} opinions</span>
                        </div>
                        <Progress 
                          value={(cat.count / stats.opinions_count) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Streak & Activity */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/20">
                    <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-500">{stats?.current_streak || 0}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Longest Streak</span>
                  <span className="font-semibold">{stats?.longest_streak || 0} days</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Score</p>
                    <p className="text-3xl font-bold text-green-500">
                      {Math.min(100, Math.round(
                        ((stats?.opinions_count || 0) * 10 +
                        (stats?.inphrosync_count || 0) * 5 +
                        (stats?.upvotes_given || 0) * 2) / 10
                      ))}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last Active</span>
                  <span className="font-semibold">{formatDate(stats?.last_login)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TimelineItem
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="Last Opinion"
                  date={formatDate(stats?.last_opinion_date)}
                  color="purple"
                />
                <TimelineItem
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Last InphroSync"
                  date={formatDate(stats?.last_sync_date)}
                  color="cyan"
                />
                <TimelineItem
                  icon={<Eye className="w-4 h-4" />}
                  label="Last Login"
                  date={formatDate(stats?.last_login)}
                  color="blue"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={<Mail />} label="Email" value={profile?.basic?.email} />
                <InfoRow icon={<User />} label="Full Name" value={profile?.basic?.full_name} />
                <InfoRow icon={<MapPin />} label="Location" value={[profile?.basic?.city, profile?.basic?.state_region, profile?.basic?.country].filter(Boolean).join(', ')} />
                <InfoRow icon={<Calendar />} label="Date of Birth" value={profile?.basic?.date_of_birth ? formatDate(profile?.basic?.date_of_birth) : null} />
                <InfoRow icon={<User />} label="Gender" value={profile?.basic?.gender} />
                <InfoRow icon={<User />} label="Age Group" value={profile?.basic?.age_group} />
              </div>
            </CardContent>
          </Card>

          {/* Type-Specific Profile */}
          {profile?.specific && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base capitalize">{userType} Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(profile.specific).map(([key, value]) => {
                    if (key === 'id' || key === 'user_id' || key === 'created_at' || key === 'updated_at') return null;
                    if (!value) return null;
                    
                    const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    
                    if (Array.isArray(value)) {
                      return (
                        <div key={key} className="col-span-2">
                          <p className="text-sm font-medium mb-2">{displayKey}</p>
                          <div className="flex flex-wrap gap-1">
                            {(value as string[]).map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground">{displayKey}</p>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <AchievementCard
              icon={<Award className="w-8 h-8" />}
              label="Badges Earned"
              value={stats?.badges_count || 0}
              color="amber"
            />
            <AchievementCard
              icon={<Flame className="w-8 h-8" />}
              label="Best Streak"
              value={stats?.longest_streak || 0}
              suffix="days"
              color="orange"
            />
            <AchievementCard
              icon={<Star className="w-8 h-8" />}
              label="Engagement Level"
              value={stats?.opinions_count && stats.opinions_count >= 50 ? 'Pro' : stats?.opinions_count && stats.opinions_count >= 20 ? 'Active' : 'Starter'}
              color="purple"
              isString
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value, color, isString = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string;
  color: string;
  isString?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    purple: "from-purple-500/10 to-pink-500/5 border-purple-500/20 text-purple-500",
    cyan: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-500",
    amber: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-500",
    pink: "from-pink-500/10 to-rose-500/5 border-pink-500/20 text-pink-500",
    red: "from-red-500/10 to-pink-500/5 border-red-500/20 text-red-500",
    rose: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-500",
    blue: "from-blue-500/10 to-cyan-500/5 border-blue-500/20 text-blue-500",
    green: "from-green-500/10 to-emerald-500/5 border-green-500/20 text-green-500"
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={`bg-gradient-to-br ${colorClasses[color]}`}>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-500/20`}>
              {icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-xl font-bold ${colorClasses[color].split(' ').pop()}`}>
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TimelineItem({ icon, label, date, color }: { 
  icon: React.ReactNode; 
  label: string; 
  date: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg bg-${color}-500/10`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value || 'Not specified'}</p>
      </div>
    </div>
  );
}

function AchievementCard({ icon, label, value, suffix, color, isString = false }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string;
  suffix?: string;
  color: string;
  isString?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="text-center py-6">
        <div className={`w-16 h-16 mx-auto rounded-full bg-${color}-500/10 flex items-center justify-center text-${color}-500 mb-3`}>
          {icon}
        </div>
        <p className="text-3xl font-bold">
          {value}{suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </Card>
    </motion.div>
  );
}
