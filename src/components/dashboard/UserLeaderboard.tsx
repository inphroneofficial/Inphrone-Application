import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, Medal, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/SkeletonCard";

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  opinions: number;
  likes: number;
  isCurrentUser?: boolean;
}

interface UserLeaderboardProps {
  currentUserId?: string;
  limit?: number;
}

export function UserLeaderboard({ currentUserId, limit = 10 }: UserLeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUserId, limit]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch rewards with user profiles
      const { data: rewards } = await supabase
        .from("rewards")
        .select(`
          user_id,
          points,
          total_opinions,
          total_upvotes
        `)
        .order("points", { ascending: false })
        .limit(limit);

      if (!rewards?.length) {
        setLoading(false);
        return;
      }

      // Fetch profile info for these users
      const userIds = rewards.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, profile_picture")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const leaderboard: LeaderboardUser[] = rewards.map((reward, index) => {
        const profile = profileMap.get(reward.user_id);
        return {
          rank: index + 1,
          userId: reward.user_id,
          name: profile?.full_name || "Anonymous User",
          avatar: profile?.profile_picture,
          points: reward.points || 0,
          opinions: reward.total_opinions || 0,
          likes: reward.total_upvotes || 0,
          isCurrentUser: reward.user_id === currentUserId
        };
      });

      setUsers(leaderboard);

      // Find current user's rank if not in top list
      if (currentUserId) {
        const currentInList = leaderboard.find(u => u.isCurrentUser);
        if (!currentInList) {
          // Fetch current user's rank
          const { data: allRewards } = await supabase
            .from("rewards")
            .select("user_id, points")
            .order("points", { ascending: false });

          const userIndex = allRewards?.findIndex(r => r.user_id === currentUserId) ?? -1;
          if (userIndex !== -1) {
            const userReward = allRewards![userIndex];
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("full_name, profile_picture")
              .eq("id", currentUserId)
              .single();

            const { data: userFullReward } = await supabase
              .from("rewards")
              .select("*")
              .eq("user_id", currentUserId)
              .single();

            setCurrentUserRank({
              rank: userIndex + 1,
              userId: currentUserId,
              name: userProfile?.full_name || "You",
              avatar: userProfile?.profile_picture,
              points: userReward.points || 0,
              opinions: userFullReward?.total_opinions || 0,
              likes: userFullReward?.total_upvotes || 0,
              isCurrentUser: true
            });
          }
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Medal className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30";
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20";
      case 2: return "bg-gradient-to-r from-gray-300/10 to-gray-400/10 border-gray-400/20";
      case 3: return "bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/20";
      default: return "bg-muted/50 border-border";
    }
  };

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Top Contributors
          <Badge variant="outline" className="ml-auto text-xs">
            Weekly
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <SkeletonList count={5} variant="list-item" />
        ) : users.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No rankings yet"
            description="Be the first to share opinions and climb the leaderboard!"
            variant="compact"
          />
        ) : (
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-2">
              {users.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBackground(user.rank, user.isCurrentUser || false)}`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <Avatar className="w-10 h-10 border-2 border-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate flex items-center gap-2">
                      {user.name}
                      {user.isCurrentUser && (
                        <Badge className="text-xs bg-primary/20 text-primary border-0">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.opinions} opinions • {user.likes} likes
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {user.points}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </motion.div>
              ))}

              {/* Show current user if not in top list */}
              {currentUserRank && !users.find(u => u.isCurrentUser) && (
                <>
                  <div className="py-2 text-center">
                    <span className="text-xs text-muted-foreground">• • •</span>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBackground(currentUserRank.rank, true)}`}
                  >
                    <div className="flex items-center justify-center w-8 text-sm font-bold text-muted-foreground">
                      #{currentUserRank.rank}
                    </div>
                    
                    <Avatar className="w-10 h-10 border-2 border-primary/30">
                      <AvatarImage src={currentUserRank.avatar} alt={currentUserRank.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                        {currentUserRank.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate flex items-center gap-2">
                        {currentUserRank.name}
                        <Badge className="text-xs bg-primary/20 text-primary border-0">You</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentUserRank.opinions} opinions • {currentUserRank.likes} likes
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {currentUserRank.points}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
