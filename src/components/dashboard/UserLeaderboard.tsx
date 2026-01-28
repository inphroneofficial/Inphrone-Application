import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Crown, Medal, Star, TrendingUp, MessageSquare, Zap, Vote } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/SkeletonCard";

interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalScore: number;
  opinions: number;
  inphrosync: number;
  yourturn: number;
  likes: number;
  isCurrentUser?: boolean;
}

interface UserLeaderboardProps {
  currentUserId?: string;
  limit?: number;
}

// Scoring weights for contribution calculation
const SCORE_WEIGHTS = {
  opinions: 10,      // 10 points per opinion
  inphrosync: 2,     // 2 points per InphroSync response
  yourturn: 5,       // 5 points per YourTurn vote
  likesReceived: 3,  // 3 points per like received
};

export function UserLeaderboard({ currentUserId, limit = 10 }: UserLeaderboardProps) {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUserId, limit]);

  const fetchLeaderboard = async () => {
    try {
      // Fetch ALL profiles (not just audience) for true top contributors
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, profile_picture, user_type");

      if (!profiles?.length) {
        setLoading(false);
        return;
      }

      const userIds = profiles.map(p => p.id);

      // Fetch all contribution data in parallel
      const [opinionsResult, inphrosyncResult, yourturnResult, likesResult] = await Promise.all([
        // Count opinions per user
        supabase
          .from("opinions")
          .select("user_id")
          .in("user_id", userIds),
        
        // Count InphroSync responses per user
        supabase
          .from("inphrosync_responses")
          .select("user_id")
          .in("user_id", userIds),
        
        // Count YourTurn votes per user
        supabase
          .from("your_turn_votes")
          .select("user_id")
          .in("user_id", userIds),
        
        // Count likes received on opinions per user
        supabase
          .from("opinion_upvotes")
          .select("opinion_id, opinions!inner(user_id)")
          .in("opinions.user_id", userIds),
      ]);

      // Aggregate counts per user
      const opinionCounts = new Map<string, number>();
      opinionsResult.data?.forEach(o => {
        opinionCounts.set(o.user_id, (opinionCounts.get(o.user_id) || 0) + 1);
      });

      const inphrosyncCounts = new Map<string, number>();
      inphrosyncResult.data?.forEach(i => {
        inphrosyncCounts.set(i.user_id, (inphrosyncCounts.get(i.user_id) || 0) + 1);
      });

      const yourturnCounts = new Map<string, number>();
      yourturnResult.data?.forEach(y => {
        yourturnCounts.set(y.user_id, (yourturnCounts.get(y.user_id) || 0) + 1);
      });

      const likesCounts = new Map<string, number>();
      likesResult.data?.forEach((l: any) => {
        const authorId = l.opinions?.user_id;
        if (authorId) {
          likesCounts.set(authorId, (likesCounts.get(authorId) || 0) + 1);
        }
      });

      // Calculate total scores and build leaderboard
      const leaderboard: LeaderboardUser[] = profiles.map(profile => {
        const opinions = opinionCounts.get(profile.id) || 0;
        const inphrosync = inphrosyncCounts.get(profile.id) || 0;
        const yourturn = yourturnCounts.get(profile.id) || 0;
        const likes = likesCounts.get(profile.id) || 0;

        const totalScore = 
          (opinions * SCORE_WEIGHTS.opinions) +
          (inphrosync * SCORE_WEIGHTS.inphrosync) +
          (yourturn * SCORE_WEIGHTS.yourturn) +
          (likes * SCORE_WEIGHTS.likesReceived);

        return {
          rank: 0, // Will be set after sorting
          userId: profile.id,
          name: profile.full_name || "Anonymous User",
          avatar: profile.profile_picture,
          totalScore,
          opinions,
          inphrosync,
          yourturn,
          likes,
          isCurrentUser: profile.id === currentUserId,
        };
      });

      // Sort by total score and assign ranks
      leaderboard.sort((a, b) => b.totalScore - a.totalScore);
      leaderboard.forEach((user, index) => {
        user.rank = index + 1;
      });

      // Filter to only include users with some activity
      const activeUsers = leaderboard.filter(u => u.totalScore > 0);
      
      // Take top N users
      const topUsers = activeUsers.slice(0, limit);
      setUsers(topUsers);

      // Find current user's rank if not in top list
      if (currentUserId) {
        const currentInList = topUsers.find(u => u.isCurrentUser);
        if (!currentInList) {
          const userInFullList = activeUsers.find(u => u.userId === currentUserId);
          if (userInFullList) {
            setCurrentUserRank(userInFullList);
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

  const renderUserRow = (user: LeaderboardUser, index: number) => (
    <motion.div
      key={user.userId}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${getRankBackground(user.rank, user.isCurrentUser || false)}`}
    >
      <div className="flex items-center justify-center w-8">
        {user.rank <= 3 ? getRankIcon(user.rank) : (
          <span className="text-sm font-bold text-muted-foreground">#{user.rank}</span>
        )}
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5" title="Opinions">
            <MessageSquare className="w-3 h-3" /> {user.opinions}
          </span>
          <span className="flex items-center gap-0.5" title="InphroSync">
            <Zap className="w-3 h-3" /> {user.inphrosync}
          </span>
          <span className="flex items-center gap-0.5" title="YourTurn">
            <Vote className="w-3 h-3" /> {user.yourturn}
          </span>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {user.totalScore}
        </p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </motion.div>
  );

  return (
    <Card className="border-2 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Top Contributors
          <Badge variant="outline" className="ml-auto text-xs">
            All Time
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Based on opinions, InphroSync, and YourTurn participation
        </p>
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
              {users.map((user, index) => renderUserRow(user, index))}

              {/* Show current user if not in top list */}
              {currentUserRank && !users.find(u => u.isCurrentUser) && (
                <>
                  <div className="py-2 text-center">
                    <span className="text-xs text-muted-foreground">• • •</span>
                  </div>
                  {renderUserRow(currentUserRank, users.length)}
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
