import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Clock, Filter, Eye } from "lucide-react";
import { HypeSignalCard } from "./HypeSignalCard";
import { useHypeSignals } from "@/hooks/useHypeSignals";
import { SkeletonList } from "@/components/common/SkeletonCard";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

interface HypeSignalFeedProps {
  categoryId?: string;
  showCategoryFilter?: boolean;
  compact?: boolean;
  limit?: number;
}

export function HypeSignalFeed({ 
  categoryId, 
  showCategoryFilter = true,
  compact = false,
  limit
}: HypeSignalFeedProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'rising' | 'top'>('new');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryId || 'all');
  
  const { 
    signals, 
    loading, 
    categories, 
    userVotes, 
    fetchSignals, 
    fetchRisingSignals,
    vote,
    isViewOnly 
  } = useHypeSignals(selectedCategory === 'all' ? undefined : selectedCategory);

  useEffect(() => {
    if (activeTab === 'rising') {
      fetchRisingSignals();
    } else {
      fetchSignals(activeTab);
    }
  }, [activeTab, selectedCategory, fetchSignals, fetchRisingSignals]);

  const displaySignals = limit ? signals.slice(0, limit) : signals;

  const tabConfig = [
    { value: 'new', label: 'New', icon: Clock },
    { value: 'rising', label: 'Rising', icon: TrendingUp },
    { value: 'top', label: 'Top (7d)', icon: Sparkles },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonList count={compact ? 3 : 5} variant="opinion" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Only Banner for non-audience */}
      {isViewOnly && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border"
        >
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <strong>Industry View:</strong> You're viewing audience demand signals. Only audience members can vote.
          </span>
        </motion.div>
      )}

      {/* Controls */}
      <div className={cn(
        "flex flex-col sm:flex-row gap-4",
        compact && "flex-row"
      )}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <TabsList className={cn(
            "grid w-full",
            compact ? "grid-cols-3 h-9" : "grid-cols-3"
          )}>
            {tabConfig.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className={cn(
                  "gap-1.5",
                  compact && "text-xs px-2"
                )}
              >
                <tab.icon className={cn("w-4 h-4", compact && "w-3 h-3")} />
                {!compact && <span>{tab.label}</span>}
                {compact && <span className="hidden sm:inline">{tab.label}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {showCategoryFilter && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className={cn("w-full sm:w-48", compact && "w-32")}>
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Signal Cards */}
      {displaySignals.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No signals yet"
          description={isViewOnly ? "No audience signals in this category yet." : "Be the first to signal what you want to see created!"}
        />
      ) : (
        <motion.div 
          className={cn(
            "grid gap-4",
            compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          )}
        >
          {displaySignals.map((signal, index) => (
            <HypeSignalCard
              key={signal.id}
              id={signal.id}
              phrase={signal.phrase}
              categoryName={signal.category_name || 'Unknown'}
              categoryColor={signal.category_color || '#666'}
              hypeCount={signal.hype_count}
              passCount={signal.pass_count}
              signalScore={signal.signal_score}
              createdAt={signal.created_at}
              expiresAt={signal.expires_at}
              userVote={userVotes[signal.id]}
              onVote={vote}
              showRank={activeTab === 'top' ? index + 1 : undefined}
              isViewOnly={isViewOnly}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
