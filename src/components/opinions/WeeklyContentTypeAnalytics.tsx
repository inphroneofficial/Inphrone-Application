import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { useMemo } from "react";
import { getCurrentWeekRangeUTC } from "@/lib/week";

interface Opinion {
  id: string;
  content_type: string;
  genre?: string | null;
  title?: string | null;
  description?: string | null;
  similar_content?: string | null;
  created_at: string;
  upvotes: number;
}

interface WeeklyContentTypeAnalyticsProps {
  opinions: Opinion[];
  categoryName?: string;
}

export function WeeklyContentTypeAnalytics({ opinions, categoryName }: WeeklyContentTypeAnalyticsProps) {
  const analytics = useMemo(() => {
    const now = new Date();
    const { start: weekStart, end: weekEnd } = getCurrentWeekRangeUTC(now);

    // Separate current week vs past opinions
    const currentWeekOpinions = opinions.filter(op => {
      const createdAt = new Date(op.created_at);
      return createdAt >= weekStart && createdAt < weekEnd;
    });

    const pastOpinions = opinions.filter(op => {
      const createdAt = new Date(op.created_at);
      return createdAt < weekStart;
    });

    // Calculate genre/content type distribution for current week with weighted scoring
    // Group by genre to show specific content preferences (e.g., "Tech", "Gaming" for YouTube)
    const genreTypeCounts = new Map<string, { 
      count: number; 
      upvotes: number; 
      relevanceScore: number;
      sampleTitles: string[];
    }>();
    
    currentWeekOpinions.forEach(op => {
      const prefs: any = (op as any).preferences || {};
      const terms: string[] = [];

      if (op.genre) terms.push(op.genre);

      // Pull from common preference fields (esp. for YouTube)
      if (Array.isArray(prefs.videoType)) terms.push(...prefs.videoType);
      if (typeof prefs.genre === 'string') terms.push(prefs.genre);
      if (Array.isArray(prefs.genre)) terms.push(...prefs.genre);

      // Fallback to content_type if no specific preferences found
      if (terms.length === 0 && op.content_type) terms.push(op.content_type);

      terms.forEach((key) => {
        const existing = genreTypeCounts.get(key) || {
          count: 0,
          upvotes: 0,
          relevanceScore: 0,
          sampleTitles: [] as string[],
        };
        existing.count++;
        existing.upvotes += op.upvotes || 0;

        if (op.title && existing.sampleTitles.length < 3) {
          existing.sampleTitles.push(op.title);
        }

        existing.relevanceScore = existing.count + (existing.upvotes * 0.5);
        genreTypeCounts.set(key, existing);
      });
    });

    // Calculate percentages and sort by relevance
    const total = currentWeekOpinions.length;
    const totalRelevance = Array.from(genreTypeCounts.values())
      .reduce((sum, data) => sum + data.relevanceScore, 0);

    const contentTypeStats = Array.from(genreTypeCounts.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        relevancePercentage: totalRelevance > 0 ? (data.relevanceScore / totalRelevance) * 100 : 0,
        upvotes: data.upvotes,
        avgUpvotes: data.count > 0 ? data.upvotes / data.count : 0,
        sampleTitles: data.sampleTitles,
        demand: data.relevanceScore // Higher = more demand
      }))
      .sort((a, b) => b.relevancePercentage - a.relevancePercentage);

    return {
      currentWeek: currentWeekOpinions,
      past: pastOpinions,
      contentTypeStats,
      weekStart: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weekEnd: weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalRelevance
    };
  }, [opinions]);

  if (analytics.contentTypeStats.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No opinions submitted this week yet</p>
            <p className="text-xs text-muted-foreground">Week: {analytics.weekStart} - {analytics.weekEnd}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            This Week's Content Demand Analysis
          </CardTitle>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{analytics.weekStart} - {analytics.weekEnd}</span>
              <Badge variant="outline" className="ml-2">
                {analytics.currentWeek.length} opinions this week
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Demand Score = Opinions submitted + (Upvotes × 0.5) — Higher scores indicate stronger audience interest
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Content Type Distribution */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Top Content Preferences - What Audiences Want Most
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ranked by audience demand score combining opinion volume and engagement. Past weeks' opinions are automatically archived.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {analytics.contentTypeStats.map((stat, idx) => (
            <div key={stat.type} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Badge 
                      className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 text-white border-0"
                    >
                      #{idx + 1}
                    </Badge>
                    <h4 className="text-base font-semibold">{stat.type}</h4>
                  </div>
                  {stat.sampleTitles.length > 0 && (
                    <div className="ml-10 space-y-1">
                      <p className="text-xs text-muted-foreground">Example opinions:</p>
                      <div className="space-y-0.5">
                        {stat.sampleTitles.map((title, i) => (
                          <p key={i} className="text-xs text-muted-foreground truncate">• {title}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-2xl font-bold text-primary">
                      {stat.relevancePercentage.toFixed(1)}%
                    </div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Demand Score
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.count} {stat.count === 1 ? 'opinion' : 'opinions'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    {stat.avgUpvotes.toFixed(1)} avg upvotes
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={stat.relevancePercentage} 
                  className="h-3 bg-muted/30"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Audience Demand</span>
                  <span>{stat.upvotes} total upvotes • {stat.percentage.toFixed(0)}% share</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Past Opinions Summary */}
      {analytics.past.length > 0 && (
        <Card className="bg-gradient-to-br from-muted/30 to-muted/10 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Past Opinions Archive</span>
              </div>
              <Badge variant="outline" className="bg-background">
                {analytics.past.length} opinions from previous weeks
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These opinions were automatically moved from past weeks and are no longer included in current analytics
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {analytics.contentTypeStats[0]?.type || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Most Requested</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.currentWeek.reduce((sum, op) => sum + (op.upvotes || 0), 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Upvotes This Week</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.contentTypeStats.length}
              </div>
              <div className="text-xs text-muted-foreground">Content Types Explored</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
