import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  MessageSquare, 
  Heart, 
  Award, 
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/SkeletonCard";

interface ActivityItem {
  id: string;
  type: "opinion" | "like" | "badge" | "milestone" | "new_user";
  title: string;
  description: string;
  timestamp: Date;
  category?: string;
}

interface ActivityFeedProps {
  userId?: string;
  limit?: number;
}

export function ActivityFeed({ userId, limit = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    
    // Set up realtime subscription for new activities
    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'opinions' },
        () => fetchActivities()
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'opinion_upvotes' },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  const fetchActivities = async () => {
    try {
      const activities: ActivityItem[] = [];

      // Fetch recent opinions (platform-wide or user-specific)
      const opinionsQuery = supabase
        .from("opinions")
        .select(`
          id,
          title,
          created_at,
          category_id,
          categories:category_id (name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) {
        opinionsQuery.eq("user_id", userId);
      }

      const { data: opinions } = await opinionsQuery;

      opinions?.forEach((op: any) => {
        activities.push({
          id: `opinion-${op.id}`,
          type: "opinion",
          title: userId ? "You shared an opinion" : "New opinion shared",
          description: op.title,
          timestamp: new Date(op.created_at),
          category: op.categories?.name
        });
      });

      // Fetch recent likes received (for logged-in user)
      if (userId) {
        const { data: userOpinions } = await supabase
          .from("opinions")
          .select("id")
          .eq("user_id", userId);

        if (userOpinions?.length) {
          const opinionIds = userOpinions.map(o => o.id);
          const { data: likes } = await supabase
            .from("opinion_upvotes")
            .select(`
              id,
              created_at,
              opinion_id
            `)
            .in("opinion_id", opinionIds)
            .order("created_at", { ascending: false })
            .limit(5);

          likes?.forEach((like: any) => {
            activities.push({
              id: `like-${like.id}`,
              type: "like",
              title: "Someone liked your opinion",
              description: "Your voice is being heard!",
              timestamp: new Date(like.created_at)
            });
          });
        }

        // Fetch badges
        const { data: badges } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false })
          .limit(3);

        badges?.forEach((badge: any) => {
          activities.push({
            id: `badge-${badge.id}`,
            type: "badge",
            title: "Badge Earned!",
            description: badge.badge_name,
            timestamp: new Date(badge.earned_at || badge.created_at)
          });
        });
      }

      // Fetch new user count for today (platform-wide stat)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      if (newUsersToday && newUsersToday > 0) {
        activities.push({
          id: "milestone-users-today",
          type: "new_user",
          title: "New Members Today",
          description: `${newUsersToday} new ${newUsersToday === 1 ? "user" : "users"} joined today`,
          timestamp: new Date()
        });
      }

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(activities.slice(0, limit));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "opinion": return <MessageSquare className="w-4 h-4 text-primary" />;
      case "like": return <Heart className="w-4 h-4 text-red-500" />;
      case "badge": return <Award className="w-4 h-4 text-yellow-500" />;
      case "milestone": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "new_user": return <Users className="w-4 h-4 text-accent" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "opinion": return "bg-primary/10 border-primary/20";
      case "like": return "bg-red-500/10 border-red-500/20";
      case "badge": return "bg-yellow-500/10 border-yellow-500/20";
      case "milestone": return "bg-green-500/10 border-green-500/20";
      case "new_user": return "bg-accent/10 border-accent/20";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {userId ? "Your Activity" : "Platform Activity"}
          <Badge variant="outline" className="ml-auto text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SkeletonList count={5} variant="list-item" />
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No activity yet"
            description="Your activity will appear here as you engage with the platform"
            variant="compact"
          />
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="p-2 bg-background rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    {activity.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {activity.category}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
