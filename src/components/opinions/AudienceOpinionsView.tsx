import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  ThumbsUp, 
  Calendar,
  Sparkles,
  Users,
  Eye,
  Heart,
  MessageCircle
} from "lucide-react";
import { OpinionViewCount } from "./OpinionViewCount";
import { ThankYouDialog } from "./ThankYouDialog";

interface Opinion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content_type: string;
  genre: string | null;
  why_excited: string;
  would_pay: boolean;
  created_at: string;
  upvotes: number;
  comments?: string | null;
  preferences?: Record<string, any>;
  user?: {
    full_name?: string;
    gender?: string;
    age_group?: string;
    country?: string;
    city?: string;
    state_region?: string;
  };
}

interface OpinionLiker {
  full_name: string;
  user_type: string;
  user_id: string;
}

interface AudienceOpinionsViewProps {
  opinions: Opinion[];
  categoryName?: string;
  currentUserId?: string;
  showLikeButton?: boolean;
  userType?: string;
  onLike?: (opinionId: string) => Promise<void>;
  refreshTrigger?: number; // Add this to force refresh
}

export function AudienceOpinionsView({ 
  opinions, 
  categoryName, 
  currentUserId: providedUserId,
  showLikeButton = false,
  userType,
  onLike,
  refreshTrigger = 0
}: AudienceOpinionsViewProps) {
  const [upvoteBreakdowns, setUpvoteBreakdowns] = useState<Record<string, any>>({});
  const [viewerCounts, setViewerCounts] = useState<Record<string, any>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(providedUserId || null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [opinionLikers, setOpinionLikers] = useState<Record<string, OpinionLiker[]>>({});
  const [thankYouDialogOpen, setThankYouDialogOpen] = useState(false);
  const [selectedLiker, setSelectedLiker] = useState<{userId: string, name: string, opinionTitle: string} | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      if (!providedUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);
      }
    };
    getUserId();
  }, [providedUserId]);

  useEffect(() => {
    // Fetch user's likes for these opinions - refetch when refreshTrigger changes
    const fetchUserLikes = async () => {
      if (!currentUserId) return;
      
      const { data } = await supabase
        .from('opinion_upvotes')
        .select('opinion_id')
        .eq('user_id', currentUserId)
        .in('opinion_id', opinions.map(o => o.id));
      
      const likes: Record<string, boolean> = {};
      data?.forEach(upvote => {
        likes[upvote.opinion_id] = true;
      });
      setUserLikes(likes);
    };
    
    if (showLikeButton && opinions.length > 0) {
      fetchUserLikes();
    }
  }, [currentUserId, opinions, showLikeButton, refreshTrigger]);

  useEffect(() => {
    // Fetch upvote breakdowns for each opinion
    const fetchBreakdowns = async () => {
      const breakdowns: Record<string, any> = {};
      
      for (const opinion of opinions) {
        const { data } = await supabase
          .rpc('get_opinion_upvote_breakdown', { opinion_uuid: opinion.id });
        
        if (data) {
          breakdowns[opinion.id] = data;
        }
      }
      
      setUpvoteBreakdowns(breakdowns);
    };

    if (opinions.length > 0) {
      fetchBreakdowns();
    }
  }, [opinions]);

  useEffect(() => {
    const fetchViewerDetails = async () => {
      const counts: Record<string, any> = {};
      for (const opinion of opinions) {
        // Get viewer profiles to categorize them
        const { data: viewData } = await supabase
          .from('opinion_views')
          .select(`
            id,
            viewer_id,
            profiles!inner(user_type)
          `)
          .eq('opinion_id', opinion.id);
        
        const viewerTypes = {
          audience: 0,
          creator: 0,
          studio: 0,
          production: 0,
          ott: 0,
          tv: 0,
          gaming: 0,
          music: 0
        };
        
        viewData?.forEach((view: any) => {
          const userType = view.profiles?.user_type;
          if (userType && userType in viewerTypes) {
            viewerTypes[userType as keyof typeof viewerTypes]++;
          }
        });
        
        counts[opinion.id] = {
          total: viewData?.length || 0,
          ...viewerTypes
        };
      }
      setViewerCounts(counts);
    };
    if (opinions.length > 0) fetchViewerDetails();
  }, [opinions]);

  // Fetch who liked each opinion (for audience's own opinions) with actual like counts
  useEffect(() => {
    const fetchOpinionLikers = async () => {
      const myOpinions = opinions.filter(o => o.user_id === currentUserId);
      const likers: Record<string, OpinionLiker[]> = {};
      
      for (const opinion of myOpinions) {
        // Fetch ALL likes (both audience upvotes and non-audience likes)
        const { data } = await supabase
          .from('opinion_upvotes')
          .select(`
            user_id,
            is_upvote,
            profiles!inner(full_name, user_type)
          `)
          .eq('opinion_id', opinion.id);
        // REMOVED .eq('is_upvote', true) to count ALL likes
        
        if (data) {
          likers[opinion.id] = data.map((upvote: any) => ({
            user_id: upvote.user_id,
            full_name: upvote.profiles?.full_name || 'Anonymous',
            user_type: upvote.profiles?.user_type || 'user'
          }));
        }
      }
      
      setOpinionLikers(likers);
    };
    
    if (opinions.length > 0 && currentUserId) {
      fetchOpinionLikers();
    }

    // Set up realtime subscription for opinion_upvotes with unique channel name
    const channel = supabase
      .channel(`opinion-likes-${currentUserId || 'guest'}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opinion_upvotes'
        },
        () => {
          // Refresh likers when any upvote changes
          if (opinions.length > 0 && currentUserId) {
            fetchOpinionLikers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opinions, currentUserId, refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (opinions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Opinions Yet</h3>
        <p className="text-muted-foreground">
          {categoryName 
            ? `You haven't shared any opinions in ${categoryName} yet. Share your first one!`
            : "You haven't shared any opinions yet. Start by selecting a category!"}
        </p>
      </Card>
    );
  }

  // Separate user's opinions from others
  const myOpinions = opinions.filter(o => o.user_id === currentUserId);
  const otherOpinions = opinions.filter(o => o.user_id !== currentUserId);

  return (
    <div className="space-y-8">
      {/* My Opinions Section */}
      {myOpinions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Opinions</h3>
            <Badge variant="secondary">{myOpinions.length} {myOpinions.length === 1 ? 'Opinion' : 'Opinions'}</Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {myOpinions.map((opinion, index) => {
            const breakdown = upvoteBreakdowns[opinion.id];
            
            return (
              <Card key={opinion.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Opinion #{myOpinions.length - index}
                    </Badge>
                    {opinion.would_pay && (
                      <Badge className="gradient-primary text-white border-0 text-xs">
                        💰 Willing to Pay
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {formatDate(opinion.created_at)}
                  </div>
                </div>

                {/* Content Type & Genre */}
                <div className="flex items-center gap-2">
                  <Badge className="gradient-accent text-white border-0">
                    {opinion.content_type}
                  </Badge>
                  {opinion.genre && (
                    <Badge variant="secondary">{opinion.genre}</Badge>
                  )}
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold">{opinion.title}</h4>
                  <p className="text-sm text-muted-foreground">{opinion.description}</p>
                </div>

                {/* Why Excited */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Why I'm Excited:</p>
                  <p className="text-sm text-muted-foreground">{opinion.why_excited}</p>
                </div>

                {/* Additional Comments */}
                {opinion.comments && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Additional Thoughts:</p>
                    <p className="text-sm text-muted-foreground">{opinion.comments}</p>
                  </div>
                )}

                {/* View Count for My Opinions */}
                    <OpinionViewCount opinionId={opinion.id} showForUserType="audience" />

                {/* Like Count & Who Liked - for audience's own opinions */}
                {userType === "audience" && (
                  <div className="space-y-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-accent fill-accent" />
                      <span className="text-sm font-semibold">
                        {breakdown?.total || opinionLikers[opinion.id]?.length || 0} {(breakdown?.total || opinionLikers[opinion.id]?.length || 0) === 1 ? 'Like' : 'Likes'}
                      </span>
                    </div>
                    
                    {opinionLikers[opinion.id] && opinionLikers[opinion.id].length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Liked by:</p>
                        <div className="flex flex-wrap gap-2">
                          {opinionLikers[opinion.id].map((liker, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-accent/5 border-accent/30">
                                <Heart className="w-3 h-3 mr-1 text-accent fill-accent" />
                                {liker.full_name}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({liker.user_type})
                                </span>
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => {
                                  setSelectedLiker({
                                    userId: liker.user_id,
                                    name: liker.full_name,
                                    opinionTitle: opinion.title
                                  });
                                  setThankYouDialogOpen(true);
                                }}
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                <span className="text-xs">Thank</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Like Button for non-audience users */}
                {showLikeButton && onLike && userType !== "audience" && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant={userLikes[opinion.id] ? "default" : "outline"}
                      size="sm"
                      onClick={() => onLike(opinion.id)}
                      className="gap-2"
                    >
                      <ThumbsUp className={`w-4 h-4 ${userLikes[opinion.id] ? 'fill-current' : ''}`} />
                      {userLikes[opinion.id] ? 'Liked' : 'Like'}
                    </Button>
                  </div>
                )}

                    {/* Selected Options (Preferences) */}
                    {opinion.preferences && Object.keys(opinion.preferences).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(opinion.preferences).map(([key, value]) => (
                            <Badge key={key as string} variant="outline" className="text-xs">
                              {`${(key as string).replace(/([A-Z])/g, ' $1').trim()}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? Object.values(value as any).join(', ') : String(value)}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  </Card>
            );
          })}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Other Audience Opinions Section */}
      {otherOpinions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Other Audience Opinions</h3>
            <Badge variant="outline">{otherOpinions.length} {otherOpinions.length === 1 ? 'Opinion' : 'Opinions'}</Badge>
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {otherOpinions.map((opinion, index) => {
                const breakdown = upvoteBreakdowns[opinion.id];
                
                return (
                  <Card key={opinion.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Opinion #{otherOpinions.length - index}
                        </Badge>
                        {opinion.would_pay && (
                          <Badge className="gradient-primary text-white border-0 text-xs">
                            💰 Willing to Pay
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(opinion.created_at)}
                      </div>
                    </div>

                    {/* Audience Member Demographics for Non-Audience Users */}
                    {userType !== "audience" && (
                      <div className="flex flex-wrap gap-2 pb-2 border-b">
                        <Badge variant="outline" className="bg-primary/5 border-primary/20">
                          <Users className="w-3 h-3 mr-1" />
                          Audience Member
                        </Badge>
                        {opinion.user_id && (
                          <>
                            {(opinion.user?.gender || opinion.preferences?.gender) && (
                              <Badge variant="outline" className="bg-muted">
                                {opinion.user?.gender || opinion.preferences?.gender}
                              </Badge>
                            )}
                            {(opinion.user?.age_group || opinion.preferences?.age_group) && (
                              <Badge variant="outline" className="bg-muted">
                                {opinion.user?.age_group || opinion.preferences?.age_group}
                              </Badge>
                            )}
                            {(opinion.user?.city || opinion.user?.country || opinion.preferences?.city || opinion.preferences?.country) && (
                              <Badge variant="outline" className="bg-muted">
                                📍 {opinion.user?.city || opinion.preferences?.city ? `${opinion.user?.city || opinion.preferences?.city}, ` : ''}{opinion.user?.country || opinion.preferences?.country || 'Not specified'}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Content Type & Genre */}
                    <div className="flex items-center gap-2">
                      <Badge className="gradient-accent text-white border-0">
                        {opinion.content_type}
                      </Badge>
                      {opinion.genre && (
                        <Badge variant="secondary">{opinion.genre}</Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">{opinion.title}</h4>
                      <p className="text-sm text-muted-foreground">{opinion.description}</p>
                    </div>

                    {/* Why Excited */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Why They're Excited:</p>
                      <p className="text-sm text-muted-foreground">{opinion.why_excited}</p>
                    </div>

                    {/* Additional Comments */}
                    {opinion.comments && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Additional Thoughts:</p>
                        <p className="text-sm text-muted-foreground">{opinion.comments}</p>
                      </div>
                    )}

                    {/* Selected Options (Preferences) */}
                    {opinion.preferences && Object.keys(opinion.preferences).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(opinion.preferences).map(([key, value]) => (
                            <Badge key={key as string} variant="outline" className="text-xs">
                              {`${(key as string).replace(/([A-Z])/g, ' $1').trim()}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? Object.values(value as any).join(', ') : String(value)}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Like Button for non-audience users */}
                    {showLikeButton && onLike && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant={userLikes[opinion.id] ? "default" : "outline"}
                          size="sm"
                          onClick={async () => {
                            await onLike(opinion.id);
                          }}
                          className="gap-2"
                        >
                          <ThumbsUp className={`w-4 h-4 ${userLikes[opinion.id] ? 'fill-current' : ''}`} />
                          {userLikes[opinion.id] ? 'Liked' : 'Like'}
                        </Button>
                      </div>
                    )}

                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Thank You Dialog */}
      {selectedLiker && (
        <ThankYouDialog
          open={thankYouDialogOpen}
          onOpenChange={setThankYouDialogOpen}
          likerUserId={selectedLiker.userId}
          likerName={selectedLiker.name}
          opinionTitle={selectedLiker.opinionTitle}
        />
      )}
    </div>
  );
}
