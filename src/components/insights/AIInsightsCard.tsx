import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, TrendingUp, User, Lightbulb, X, Clock, Zap, BarChart3, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AIInsightsCardProps {
  userId: string;
}

interface Recommendation {
  title: string;
  reason: string;
  category: string;
}

interface Trend {
  topic: string;
  insight: string;
  momentum: string;
}

interface InsightData {
  recommendations?: Recommendation[];
  summary?: string;
  profileTitle?: string;
  description?: string;
  topTraits?: string[];
  matchingPersonality?: string;
  trends?: Trend[];
  overview?: string;
  text?: string;
}

interface InsightContext {
  opinionsCount: number;
  topCategories: string[];
  engagementScore: number;
  location: string;
}

interface CacheEntry {
  data: InsightData;
  context: InsightContext;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AIInsightsCard({ userId }: AIInsightsCardProps) {
  const [loading, setLoading] = useState(false);
  const [insightType, setInsightType] = useState<'recommendations' | 'taste_profile' | 'trending'>('recommendations');
  const [data, setData] = useState<InsightData | null>(null);
  const [context, setContext] = useState<InsightContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Cache for insights
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const loadingMessages = [
    'Analyzing your preferences...',
    'Understanding your taste profile...',
    'Finding personalized content...',
    'Generating AI insights...',
    'Almost ready...'
  ];

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setLoadingProgress(0);
    setIsExpanded(false);
    setData(null);
    setError(null);
    toast.info('Request cancelled');
  }, []);

  // Check cache
  const getCachedData = useCallback((type: string): CacheEntry | null => {
    const cacheKey = `${userId}-${type}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, [userId]);

  // Set cache
  const setCacheData = useCallback((type: string, data: InsightData, context: InsightContext) => {
    const cacheKey = `${userId}-${type}`;
    cacheRef.current.set(cacheKey, { data, context, timestamp: Date.now() });
  }, [userId]);

  const fetchInsights = async (type: 'recommendations' | 'taste_profile' | 'trending') => {
    // Check cache first
    const cached = getCachedData(type);
    if (cached) {
      setIsExpanded(true);
      setData(cached.data);
      setContext(cached.context);
      setInsightType(type);
      setError(null);
      toast.success('Loaded from cache', { description: 'Using recently generated insights' });
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    setIsExpanded(true);
    setLoading(true);
    setError(null);
    setData(null);
    setContext(null);
    setInsightType(type);
    setLoadingProgress(0);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 90 ? 90 : next;
      });
    }, 500);

    // Loading message rotation
    let messageIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);

    try {
      const { data: response, error: funcError } = await supabase.functions.invoke('ai-insights', {
        body: { user_id: userId, insight_type: type }
      });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (funcError) throw funcError;

      if (response?.success) {
        setLoadingProgress(100);
        setData(response.data);
        setContext(response.context);
        // Cache the result
        setCacheData(type, response.data, response.context);
      } else {
        throw new Error(response?.error || 'Failed to get insights');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('AI Insights error:', err);
      setError(err.message || 'Failed to load AI insights');
      toast.error('Failed to load AI insights', {
        description: err.message
      });
    } finally {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setLoading(false);
      setLoadingProgress(0);
      abortControllerRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getMomentumColor = (momentum: string) => {
    switch (momentum.toLowerCase()) {
      case 'viral': return 'bg-red-500 text-white';
      case 'hot': return 'bg-orange-500 text-white';
      case 'rising': return 'bg-green-500 text-white';
      case 'emerging': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div 
          className="flex flex-col items-center justify-center py-8 space-y-5 rounded-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--accent) / 0.1) 100%)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/20"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 4) * 20}%`,
                }}
                animate={{
                  y: [-15, 15, -15],
                  x: [-5, 5, -5],
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          
          <div className="space-y-3 text-center relative z-10 w-full px-6">
            <motion.p 
              className="font-semibold text-base text-foreground"
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingMessage}
            </motion.p>
            
            <div className="w-full max-w-xs mx-auto">
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(loadingProgress)}% complete
              </p>
            </div>
          </div>
          
          {/* Cancel Button - Prominent and Functional */}
          <Button 
            variant="destructive"
            size="sm"
            onClick={cancelRequest}
            className="mt-4 gap-2 z-20"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div 
          className="text-center py-6 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto">
            <X className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-destructive">Something went wrong</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => fetchInsights(insightType)}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setIsExpanded(false);
                setError(null);
              }}
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      );
    }

    // Close section button component - reusable
    const CloseButton = () => (
      <div className="flex justify-center pt-4 border-t border-border/50 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setIsExpanded(false);
            setData(null);
            setContext(null);
            setError(null);
          }}
          className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10 transition-all"
        >
          <X className="w-4 h-4" />
          Close Section
        </Button>
      </div>
    );

    if (!data) {
      return (
        <motion.div 
          className="text-center py-6 space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-br from-accent/20 to-primary/20">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
          </div>
          <div>
            <p className="font-medium">Discover AI-Powered Insights</p>
            <p className="text-sm text-muted-foreground mt-1">
              Get personalized recommendations based on your unique preferences
            </p>
          </div>
          
          {/* IP Notice */}
          <p className="text-[9px] text-muted-foreground/50 text-center px-4 mt-3 leading-relaxed">
            Powered by the Inphrone™ Audience Intelligence Engine. Our proprietary algorithms 
            and data aggregation methods are protected under Intellectual Property laws.
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Fast Analysis</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>Data-Driven</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              <span>Personalized</span>
            </div>
          </div>
        </motion.div>
      );
    }


    // Recommendations view
    if (insightType === 'recommendations' && data.recommendations) {
      return (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {context && (
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline" className="gap-1">
                <BarChart3 className="w-3 h-3" />
                Score: {context.engagementScore}/100
              </Badge>
              {context.topCategories.slice(0, 2).map((cat, i) => (
                <Badge key={i} variant="secondary" className="capitalize">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
          
          {data.summary && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {data.summary}
            </p>
          )}
          
          <div className="space-y-2">
            {data.recommendations.slice(0, 5).map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all border border-transparent hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {rec.reason}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 capitalize">
                    {rec.category}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
          
          <CloseButton />
        </motion.div>
      );
    }

    // Taste Profile view
    if (insightType === 'taste_profile') {
      return (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
            <motion.h3 
              className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {data.profileTitle || 'Your Profile'}
            </motion.h3>
            <p className="text-sm text-muted-foreground mt-2">{data.description}</p>
          </div>
          
          {data.topTraits && data.topTraits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Traits
              </p>
              <div className="flex flex-wrap gap-2">
                {data.topTraits.map((trait, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge className="bg-gradient-to-r from-primary/80 to-accent/80 text-white border-0">
                      {trait}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {data.matchingPersonality && (
            <div className="p-3 rounded-lg bg-muted/50 border-l-4 border-accent">
              <p className="text-xs text-muted-foreground italic">
                "{data.matchingPersonality}"
              </p>
            </div>
          )}

          {context && (
            <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {context.opinionsCount} opinions analyzed
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {context.engagementScore}% engaged
              </span>
            </div>
          )}
          
          <CloseButton />
        </motion.div>
      );
    }

    // Trending view
    if (insightType === 'trending' && data.trends) {
      return (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {data.overview && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {data.overview}
            </p>
          )}
          
          <div className="space-y-2">
            {data.trends.slice(0, 5).map((trend, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded bg-accent/10">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <span className="font-medium text-sm flex-1">{trend.topic}</span>
                  <Badge className={`text-xs ${getMomentumColor(trend.momentum)}`}>
                    {trend.momentum}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground ml-8">{trend.insight}</p>
              </motion.div>
            ))}
          </div>

          {context && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Trends curated for {context.location}
            </p>
          )}
          
          <CloseButton />
        </motion.div>
      );
    }

    if (data.text) {
      return (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
            {data.text}
          </p>
          <CloseButton />
        </motion.div>
      );
    }

    return null;
  };

  return (
    <Card className="premium-card border-0 overflow-hidden shadow-lg">
      <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            AI Insights
            <Badge variant="outline" className="text-[10px] ml-1">
              Powered by AI
            </Badge>
          </CardTitle>
          
          {isExpanded && !loading && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setIsExpanded(false);
                setData(null);
                setContext(null);
                setError(null);
              }}
              className="h-8 gap-1 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={insightType === 'recommendations' && isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => fetchInsights('recommendations')}
            disabled={loading}
            className="text-xs gap-1.5 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            For You
            {getCachedData('recommendations') && (
              <Clock className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant={insightType === 'taste_profile' && isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => fetchInsights('taste_profile')}
            disabled={loading}
            className="text-xs gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5" />
            Taste Profile
            {getCachedData('taste_profile') && (
              <Clock className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant={insightType === 'trending' && isExpanded ? "default" : "outline"}
            size="sm"
            onClick={() => fetchInsights('trending')}
            disabled={loading}
            className="text-xs gap-1.5 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trending
            {getCachedData('trending') && (
              <Clock className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Refresh cached data option */}
        {isExpanded && !loading && data && getCachedData(insightType) && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Cached</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => {
                // Clear cache for this type and refetch
                const cacheKey = `${userId}-${insightType}`;
                cacheRef.current.delete(cacheKey);
                fetchInsights(insightType);
              }}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && !loading && (
          <motion.p 
            className="text-xs text-muted-foreground text-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Click an option above to discover personalized AI insights
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}