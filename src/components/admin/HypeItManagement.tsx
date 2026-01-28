import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Flame, TrendingUp, Users, Archive, Trash2, 
  Search, RefreshCw, Eye, AlertTriangle, BarChart3,
  Clock, Target, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface HypeSignal {
  id: string;
  phrase: string;
  category_id: string;
  category_name?: string;
  category_color?: string;
  hype_count: number;
  pass_count: number;
  signal_score: number;
  created_at: string;
  expires_at: string;
  is_archived: boolean;
  created_by: string;
  creator_name?: string;
}

interface HypeStats {
  totalSignals: number;
  activeSignals: number;
  archivedSignals: number;
  totalVotes: number;
  avgScore: number;
  topCategory: string;
}

export function HypeItManagement() {
  const [signals, setSignals] = useState<HypeSignal[]>([]);
  const [stats, setStats] = useState<HypeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const fetchSignals = async () => {
    setLoading(true);
    try {
      // Fetch signals - the RLS policy now allows admin access to all signals
      const { data, error } = await supabase
        .from("hype_signals")
        .select(`
          *,
          categories:category_id (name, color)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching signals:", error);
        throw error;
      }

      if (data) {
        // Fetch creator names separately to avoid JOIN issues
        const creatorIds = [...new Set(data.map(s => s.created_by))];
        const { data: creators } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds);

        const creatorMap = new Map(creators?.map(c => [c.id, c.full_name]) || []);

        const formattedSignals: HypeSignal[] = data.map((s: any) => ({
          ...s,
          category_name: s.categories?.name,
          category_color: s.categories?.color,
          creator_name: creatorMap.get(s.created_by) || "Unknown",
        }));
        setSignals(formattedSignals);
      }
    } catch (error: any) {
      console.error("Error fetching signals:", error);
      toast.error("Failed to fetch signals: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get signal counts
      const { count: totalSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true });

      const { count: activeSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true })
        .eq("is_archived", false)
        .gt("expires_at", new Date().toISOString());

      const { count: archivedSignals } = await supabase
        .from("hype_signals")
        .select("*", { count: "exact", head: true })
        .eq("is_archived", true);

      // Get vote counts
      const { count: totalVotes } = await supabase
        .from("hype_votes")
        .select("*", { count: "exact", head: true });

      // Get average score
      const { data: scoreData } = await supabase
        .from("hype_signals")
        .select("signal_score");

      const avgScore = scoreData?.length
        ? scoreData.reduce((sum, s) => sum + (s.signal_score || 0), 0) / scoreData.length
        : 0;

      // Get top category
      const { data: categoryData } = await supabase
        .from("hype_signals")
        .select(`
          category_id,
          categories:category_id (name)
        `);

      const categoryCounts: Record<string, { count: number; name: string }> = {};
      categoryData?.forEach((s: any) => {
        const catId = s.category_id;
        if (!categoryCounts[catId]) {
          categoryCounts[catId] = { count: 0, name: s.categories?.name || "Unknown" };
        }
        categoryCounts[catId].count++;
      });

      const topCategory = Object.values(categoryCounts).sort((a, b) => b.count - a.count)[0]?.name || "N/A";

      setStats({
        totalSignals: totalSignals || 0,
        activeSignals: activeSignals || 0,
        archivedSignals: archivedSignals || 0,
        totalVotes: totalVotes || 0,
        avgScore: Math.round(avgScore * 10) / 10,
        topCategory,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchSignals();
    fetchStats();
  }, []);

  const archiveSignal = async (signalId: string) => {
    const { error } = await supabase
      .from("hype_signals")
      .update({ is_archived: true })
      .eq("id", signalId);

    if (error) {
      toast.error("Failed to archive signal");
    } else {
      toast.success("Signal archived");
      fetchSignals();
      fetchStats();
    }
  };

  const deleteSignal = async (signalId: string) => {
    if (!confirm("Are you sure you want to delete this signal? This action cannot be undone.")) return;

    // First delete votes
    await supabase.from("hype_votes").delete().eq("signal_id", signalId);

    const { error } = await supabase
      .from("hype_signals")
      .delete()
      .eq("id", signalId);

    if (error) {
      toast.error("Failed to delete signal");
    } else {
      toast.success("Signal deleted");
      fetchSignals();
      fetchStats();
    }
  };

  const restoreSignal = async (signalId: string) => {
    const { error } = await supabase
      .from("hype_signals")
      .update({ is_archived: false })
      .eq("id", signalId);

    if (error) {
      toast.error("Failed to restore signal");
    } else {
      toast.success("Signal restored");
      fetchSignals();
      fetchStats();
    }
  };

  const filteredSignals = signals.filter(s => {
    const matchesSearch = s.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.creator_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "active") {
      return matchesSearch && !s.is_archived && new Date(s.expires_at) > new Date();
    } else if (activeTab === "expired") {
      return matchesSearch && !s.is_archived && new Date(s.expires_at) <= new Date();
    } else if (activeTab === "archived") {
      return matchesSearch && s.is_archived;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Total Signals</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalSignals || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats?.activeSignals || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/10 to-slate-500/10 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Archive className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-muted-foreground">Archived</span>
            </div>
            <p className="text-2xl font-bold">{stats?.archivedSignals || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Votes</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalVotes || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold">{stats?.avgScore || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Top Category</span>
            </div>
            <p className="text-sm font-bold truncate">{stats?.topCategory || "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Hype It Signal Management
              </CardTitle>
              <CardDescription>
                Moderate and manage user-submitted signals
              </CardDescription>
            </div>
            <Button onClick={() => { fetchSignals(); fetchStats(); }} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search signals, categories, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Active
                <Badge variant="secondary" className="ml-1">
                  {signals.filter(s => !s.is_archived && new Date(s.expires_at) > new Date()).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="expired" className="gap-1.5">
                <Clock className="w-4 h-4" />
                Expired
                <Badge variant="secondary" className="ml-1">
                  {signals.filter(s => !s.is_archived && new Date(s.expires_at) <= new Date()).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-1.5">
                <Archive className="w-4 h-4" />
                Archived
                <Badge variant="secondary" className="ml-1">
                  {signals.filter(s => s.is_archived).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading signals...</div>
              ) : filteredSignals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No signals found</div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredSignals.map((signal, index) => (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                borderColor: signal.category_color,
                                color: signal.category_color 
                              }}
                            >
                              {signal.category_name}
                            </Badge>
                            <span className="font-semibold truncate">{signal.phrase}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>By: {signal.creator_name || "Unknown"}</span>
                            <span>🔥 {signal.hype_count} | ➡️ {signal.pass_count}</span>
                            <span>Score: {signal.signal_score}</span>
                            <span>Expires: {format(new Date(signal.expires_at), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {signal.is_archived ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => restoreSignal(signal.id)}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => archiveSignal(signal.id)}
                            >
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSignal(signal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
