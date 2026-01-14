import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Clock, Activity, Eye, ListTree, TrendingUp, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface PageStat {
  page: string;
  displayName: string;
  totalSeconds: number;
  visits: number;
  percentage: number;
  icon: string;
}

interface CategoryViewStat {
  category_id: string;
  name: string;
  visits: number;
  color?: string;
}

const PAGE_DISPLAY_NAMES: Record<string, { name: string; icon: string }> = {
  'dashboard': { name: 'Dashboard', icon: '📊' },
  'profile': { name: 'Profile', icon: '👤' },
  'insights': { name: 'Insights', icon: '💡' },
  'inphrosync': { name: 'InphroSync', icon: '🔄' },
  'your-turn': { name: 'Your Turn', icon: '🎯' },
  'my-coupons': { name: 'My Coupons', icon: '🎟️' },
  'reviews': { name: 'Reviews', icon: '⭐' },
  'landing': { name: 'Home', icon: '🏠' },
  'about': { name: 'About', icon: 'ℹ️' },
  'stats': { name: 'Statistics', icon: '📈' },
};

const getCategoryPageName = (pageName: string): { name: string; icon: string } => {
  if (pageName.startsWith('category_detail:')) {
    return { name: 'Category Explore', icon: '🎬' };
  }
  const lower = pageName.toLowerCase().replace(/[^a-z]/g, '-');
  return PAGE_DISPLAY_NAMES[lower] || PAGE_DISPLAY_NAMES[pageName] || { name: pageName, icon: '📄' };
};

export function ProfileActivityAnalysis() {
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [categoryViews, setCategoryViews] = useState<CategoryViewStat[]>([]);
  const [actions, setActions] = useState({ opinions: 0, likes: 0, likesReceived: 0, sessions: 0, totalTime: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch activity logs - only include logs with valid duration
      const { data: logs } = await supabase
        .from('user_activity_logs')
        .select('page_name, duration_seconds, session_start, session_end')
        .eq('user_id', user.id)
        .not('duration_seconds', 'is', null)
        .gt('duration_seconds', 0);

      const grouped: Record<string, { totalSeconds: number; visits: number }> = {};
      let totalTime = 0;

      const categoryCount: Record<string, number> = {};

      (logs || []).forEach((l) => {
        const page = l.page_name || 'unknown';
        // Calculate duration from timestamps if duration_seconds is missing or zero
        let dur = l.duration_seconds || 0;
        if (dur === 0 && l.session_start && l.session_end) {
          const start = new Date(l.session_start).getTime();
          const end = new Date(l.session_end).getTime();
          dur = Math.max(0, Math.floor((end - start) / 1000));
        }
        
        // Only count if duration is reasonable (less than 24 hours)
        if (dur > 0 && dur < 86400) {
          totalTime += dur;
          // Group category pages together
          const groupKey = page.startsWith('category_detail:') ? 'category_explore' : page;
          grouped[groupKey] = grouped[groupKey] || { totalSeconds: 0, visits: 0 };
          grouped[groupKey].totalSeconds += dur;
          grouped[groupKey].visits += 1;

          if (page.startsWith('category_detail:')) {
            const catId = page.split(':')[1];
            if (catId) {
              categoryCount[catId] = (categoryCount[catId] || 0) + 1;
            }
          }
        }
      });

      const pageStatsArr: PageStat[] = Object.entries(grouped)
        .map(([page, v]) => {
          const { name, icon } = page === 'category_explore' 
            ? { name: 'Category Explore', icon: '🎬' } 
            : getCategoryPageName(page);
          return {
            page,
            displayName: name,
            totalSeconds: v.totalSeconds,
            visits: v.visits,
            percentage: totalTime > 0 ? (v.totalSeconds / totalTime) * 100 : 0,
            icon,
          };
        })
        .sort((a, b) => b.totalSeconds - a.totalSeconds)
        .slice(0, 6);

      setPageStats(pageStatsArr);

      // Fetch category names for viewed categories
      const categoryIds = Object.keys(categoryCount);
      if (categoryIds.length) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name, color')
          .in('id', categoryIds);
        const map = new Map((cats || []).map((c) => [c.id, { name: c.name, color: c.color }]));
        const catViews: CategoryViewStat[] = categoryIds
          .map((id) => ({ 
            category_id: id, 
            name: map.get(id)?.name || id, 
            visits: categoryCount[id],
            color: map.get(id)?.color 
          }))
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 5);
        setCategoryViews(catViews);
      } else {
        setCategoryViews([]);
      }

      // Actions performed
      const [{ count: opinionsCount }, { count: likesCount }, { data: myOpinions }] = await Promise.all([
        supabase.from('opinions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('opinion_upvotes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('opinions').select('id').eq('user_id', user.id),
      ]);

      // Likes received across my opinions
      let likesReceived = 0;
      const myOpinionIds = (myOpinions || []).map(o => o.id);
      if (myOpinionIds.length > 0) {
        const { count: received } = await supabase
          .from('opinion_upvotes')
          .select('id', { count: 'exact', head: true })
          .in('opinion_id', myOpinionIds);
        likesReceived = received || 0;
      }

      setActions({ opinions: opinionsCount || 0, likes: likesCount || 0, likesReceived, sessions: logs?.length || 0, totalTime });
      setLoading(false);
    };

    load();
  }, []);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${s}s`;
  };

  const getGradientByIndex = (index: number) => {
    const gradients = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <Card className="shadow-elegant animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Profile Activity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              Total Time
            </div>
            <div className="text-xl font-bold text-violet-600 dark:text-violet-400">{fmt(actions.totalTime)}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Sessions
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{actions.sessions}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Opinions
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{actions.opinions}</div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Heart className="w-3.5 h-3.5" />
              Likes Received
            </div>
            <div className="text-xl font-bold text-pink-600 dark:text-pink-400">{actions.likesReceived}</div>
          </motion.div>
        </div>

        <Separator className="bg-border" />

        {/* Time by Page - Enhanced Visual */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ListTree className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Time Spent by Page</h4>
          </div>
          
          {pageStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity recorded yet</p>
              <p className="text-xs">Start exploring to see your analytics!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pageStats.map((p, index) => (
                <motion.div 
                  key={p.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-sm font-medium">{p.displayName}</span>
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        {p.visits} {p.visits === 1 ? 'visit' : 'visits'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{p.percentage.toFixed(0)}%</span>
                      <span className="text-sm font-bold min-w-[4rem] text-right">{fmt(p.totalSeconds)}</span>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.percentage}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getGradientByIndex(index)}`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Most Viewed Categories */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Most Viewed Categories</h4>
          </div>
          
          {categoryViews.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No categories viewed yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {categoryViews.map((c, index) => (
                <motion.div 
                  key={c.category_id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/50 hover:border-primary/30 transition-all text-center group"
                >
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{c.visits}</span>
                  </div>
                  {index === 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                    >
                      Top
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
