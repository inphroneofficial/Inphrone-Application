import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import { RestoreAccountBanner } from "@/components/profile/RestoreAccountBanner";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { ProfileActivityAnalysis } from "@/components/profile/ProfileActivityAnalysis";
import { CreativeSoulAvatar } from "@/components/gamification/CreativeSoulAvatar";
import { WisdomBadges } from "@/components/gamification/WisdomBadges";
import { StreakTracker } from "@/components/gamification/StreakTracker";
import { CulturalEnergyMap } from "@/components/gamification/CulturalEnergyMap";
import { TimeSpentAnalytics } from "@/components/profile/TimeSpentAnalytics";
import { SectionTransition } from "@/components/PageTransition";
import { ReferralSection } from "@/components/profile/ReferralSection";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Gift, 
  Calendar,
  Film,
  Tv,
  ShoppingBag,
  Laptop,
  Shirt,
  ArrowLeft,
  Clock,
  Heart,
  TrendingUp,
  Award,
  MapPin,
  Mail,
  Building2,
  Video,
  Users,
  MessageSquare
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRealtimeLikeNotifications } from "@/hooks/useRealtimeLikeNotifications";
import { useEnhancedNotifications } from "@/hooks/useEnhancedNotifications";

interface Coupon {
  id: string;
  coupon_type: string;
  coupon_value: number;
  status: string;
  expires_at: string;
  created_at: string;
}

interface UserStats {
  totalOpinions: number;
  totalLikes: number;
  likesGiven: number;
  likesReceived: number;
  totalCoupons: number;
  rewardPoints: number;
  level: number;
  totalTimeSpent: number;
}

const COUPON_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
  movie: { icon: Film, label: "Movie Tickets", color: "from-purple-500 to-pink-500" },
  ott: { icon: Tv, label: "OTT Platform", color: "from-red-500 to-orange-500" },
  shopping: { icon: ShoppingBag, label: "Shopping", color: "from-blue-500 to-cyan-500" },
  electronics: { icon: Laptop, label: "Electronics", color: "from-green-500 to-teal-500" },
  clothes: { icon: Shirt, label: "Fashion", color: "from-yellow-500 to-amber-500" }
};

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<UserStats>({
    totalOpinions: 0,
    totalLikes: 0,
    likesGiven: 0,
    likesReceived: 0,
    totalCoupons: 0,
    rewardPoints: 0,
    level: 1,
    totalTimeSpent: 0,
  });
  const [sessionLogId, setSessionLogId] = useState<string | null>(null);

  // Real-time like notifications
  useRealtimeLikeNotifications(userId || null);
  useEnhancedNotifications(userId || null);

  useEffect(() => {
    checkAuth();
    startTimeTracking();
    
    // Setup realtime subscription for opinion likes (only if we have userId)
    let likesChannel: any = null;
    if (userId) {
      likesChannel = supabase
        .channel(`profile-likes-updates-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'opinion_upvotes'
          },
          () => {
            // Refresh profile data when likes change
            fetchProfileData(userId);
          }
        )
        .subscribe();
    }
    
    return () => {
      endTimeTracking();
      // Clean up only the channel we created
      if (likesChannel) {
        supabase.removeChannel(likesChannel);
      }
    };
  }, [userId]);

  const startTimeTracking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: user.id,
          page_name: 'profile',
          session_start: new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (!error && data) {
        setSessionLogId(data.id);
      }
    } catch (e) {
      console.error('Failed to start time tracking:', e);
    }
  };

  const endTimeTracking = async () => {
    try {
      if (!sessionLogId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: log } = await supabase
        .from('user_activity_logs')
        .select('session_start')
        .eq('id', sessionLogId)
        .single();
      
      if (log) {
        const sessionEnd = new Date();
        const sessionStart = new Date(log.session_start);
        const durationSeconds = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
        
        await supabase
          .from('user_activity_logs')
          .update({
            session_end: sessionEnd.toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq('id', sessionLogId);
      }
    } catch (e) {
      console.error('Failed to end time tracking:', e);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Please sign in to view your profile");
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await fetchProfileData(session.user.id);
  };

  const fetchProfileData = async (userId: string) => {
    try {
      await supabase.rpc('check_coupon_expiry');

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      
      // Fetch specific profile data based on user type
      if (profileData.user_type === 'audience') {
        const { data: audienceData } = await supabase
          .from("audience_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: audienceData });
      } else if (profileData.user_type === 'creator') {
        const { data: creatorData } = await supabase
          .from("creator_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: creatorData });
      } else if (profileData.user_type === 'studio') {
        const { data: studioData } = await supabase
          .from("studio_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: studioData });
      } else if (profileData.user_type === 'production') {
        const { data: productionData } = await (supabase as any)
          .from("production_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: productionData });
      } else if (profileData.user_type === 'ott') {
        const { data: ottData } = await supabase
          .from("ott_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: ottData });
      } else if (profileData.user_type === 'tv') {
        const { data: tvData } = await supabase
          .from("tv_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: tvData });
      } else if (profileData.user_type === 'gaming') {
        const { data: gamingData } = await (supabase as any)
          .from("gaming_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: gamingData });
      } else if (profileData.user_type === 'music') {
        const { data: musicData } = await supabase
          .from("music_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: musicData });
      } else if (profileData.user_type === 'developer') {
        const { data: developerData } = await supabase
          .from("developer_profiles")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        setProfile({ ...profileData, specificProfile: developerData });
      } else {
        setProfile(profileData);
      }

      const { data: couponsData, error: couponsError } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (couponsError) throw couponsError;
      setCoupons(couponsData || []);

      const { data: opinionsData } = await supabase
        .from("opinions")
        .select("id")
        .eq("user_id", userId);

      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("*")
        .eq("user_id", userId)
        .single();

      // Calculate likes received (count ALL likes on user's opinions - both audience upvotes and non-audience likes)
      let likesReceived = 0;
      const myOpinionIds = (opinionsData || []).map(o => o.id);
      if (myOpinionIds.length > 0) {
        // Query ALL upvotes/likes (both is_upvote=true and is_upvote=false) with explicit selection
        const { data: upvotesData, error: upvotesError } = await supabase
          .from('opinion_upvotes')
          .select('id', { count: 'exact' })
          .in('opinion_id', myOpinionIds);
        // Removed .eq('is_upvote', true) to count ALL likes
        
        if (upvotesError) {
          console.error('Error fetching likes:', upvotesError);
        }
        likesReceived = upvotesData?.length || 0;
        console.log('Total likes received (audience + non-audience) for user:', userId, 'Count:', likesReceived);
      }

      // Calculate likes given by this user
      const { data: upvotesData } = await supabase
        .from("opinion_upvotes")
        .select("id")
        .eq("user_id", userId)
        .eq('is_upvote', true);

      const { data: activityLogs } = await supabase
        .from('user_activity_logs')
        .select('duration_seconds')
        .eq('user_id', userId)
        .eq('page_name', 'profile');
      
      // Get total time spent across ALL pages, not just profile
      const { data: allActivityLogs } = await supabase
        .from('user_activity_logs')
        .select('duration_seconds')
        .eq('user_id', userId);
      
      const totalTimeSpent = allActivityLogs?.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) || 0;

      setStats({
        totalOpinions: opinionsData?.length || 0,
        totalLikes: likesReceived,
        likesGiven: upvotesData?.length || 0,
        likesReceived: likesReceived,
        totalCoupons: couponsData?.length || 0,
        rewardPoints: rewardsData?.points || 0,
        level: rewardsData?.level || 1,
        totalTimeSpent,
      });

      const couponsChannel = supabase
        .channel(`profile-coupons-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `user_id=eq.${userId}` }, () => {
          fetchProfileData(userId);
        })
        .subscribe();

      const opinionsChannel = supabase
        .channel(`profile-opinions-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'opinions', filter: `user_id=eq.${userId}` }, () => {
          fetchProfileData(userId);
        })
        .subscribe();

      setLoading(false);

      void couponsChannel; void opinionsChannel;
    } catch (error: any) {
      toast.error("Failed to load profile data");
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleSignOut = async () => {
    try {
      await endTimeTracking();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error("Error signing out");
    }
  };

  const handleProfileUpdate = async () => {
    if (userId) {
      await fetchProfileData(userId);
    }
  };

const isAudience = profile?.user_type === "audience";
const isCreator = profile?.user_type === "creator";
const isStudio = profile?.user_type === "studio";
const isProduction = profile?.user_type === "production";
const isOTT = profile?.user_type === "ott";
const isTV = profile?.user_type === "tv";
const isGaming = profile?.user_type === "gaming";
const isMusic = profile?.user_type === "music";
const isDeveloper = profile?.user_type === "developer";

const userTypeLabel = (() => {
  switch ((profile?.user_type || '').toLowerCase()) {
    case 'gaming': return 'Game Developer';
    case 'production': return 'Films';
    case 'ott': return 'OTT';
    case 'tv': return 'TV';
    case 'music': return 'Music';
    case 'studio': return 'Studio';
    case 'creator': return 'Creator';
    case 'audience': return 'Audience';
    case 'developer': return 'App Developer';
    default: return profile?.user_type || 'User';
  }
})();

const specificProfile = profile?.specificProfile;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin text-primary">
          <User className="w-12 h-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <RestoreAccountBanner />
        
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-6 hover-scale-102 hover-lift"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* Enhanced Profile Header Card */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-2 border-primary/20 shadow-elegant">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
              
              <CardContent className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-glow" />
                    <Avatar className="relative w-28 h-28 md:w-36 md:h-36 border-4 border-primary/30 shadow-elegant hover-scale-105 transition-transform">
                      <AvatarImage src={profile?.profile_picture || undefined} alt={`${profile?.full_name || 'User'} avatar`} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-5xl text-white font-bold">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
<Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white border-0 shadow-elegant px-4 py-1 text-sm animate-float">
  {userTypeLabel}
</Badge>
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                          {profile?.full_name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
<Badge className="capitalize bg-gradient-to-r from-primary to-accent text-white border-0 px-3 py-1 shadow-elegant">
  {userTypeLabel}
</Badge>
                          {profile?.country && (
                            <Badge variant="outline" className="border-accent/50 text-accent px-3 py-1">
                              🌍 {profile.country}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {isAudience && (
                          <ShareProfileButton
                            userName={profile?.full_name || "User"}
                            avatarUrl={profile?.profile_picture || undefined}
                            totalOpinions={stats.totalOpinions}
                            likesReceived={stats.likesReceived}
                            rewards={stats.rewardPoints}
                            level={stats.level}
                          />
                        )}
                        <EditProfileDialog profile={profile} onUpdated={() => fetchProfileData(profile.id)} trigger={<Button variant="outline" size="sm" className="hover-scale-102">Edit Profile</Button>} />
                        <DeleteAccountDialog />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/40 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          Email
                        </Label>
                        <p className="font-medium text-sm truncate">{profile?.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          Location
                        </Label>
                        <p className="font-medium text-sm">{profile?.city || 'N/A'}, {profile?.country || 'N/A'}</p>
                      </div>
                      {profile?.gender && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3 h-3" />
                            Gender
                          </Label>
                          <p className="font-medium text-sm capitalize">{profile.gender}</p>
                        </div>
                      )}
                      {profile?.date_of_birth && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Date of Birth
                          </Label>
                          <p className="font-medium text-sm">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral & Ambassador Section */}
          <SectionTransition delay={0.05}>
            <ReferralSection userId={userId} userType={profile?.user_type || 'audience'} />
          </SectionTransition>

           {specificProfile && (
              <SectionTransition delay={0.1}>
              <Card className="shadow-elegant">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Building2 className="w-6 h-6" />
                   {isAudience ? 'Audience Profile' : isCreator ? 'Creator Profile' : isStudio ? 'Studio Profile' : 'Professional Profile'}
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                   {/* Audience-specific fields */}
                   {isAudience && (
                     <>
                       {specificProfile.age_group && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Age Group</Label>
                           <p className="font-medium">{specificProfile.age_group}</p>
                         </div>
                       )}
                       {specificProfile.entertainment_preferences?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Entertainment Preferences</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.entertainment_preferences.map((pref: string) => (
                               <Badge key={pref} variant="secondary">{pref}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.favorite_platforms?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Favorite Platforms</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.favorite_platforms.map((platform: string) => (
                               <Badge key={platform} variant="secondary">{platform}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.genre_interests?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Genre Interests</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.genre_interests.map((genre: string) => (
                               <Badge key={genre} variant="secondary">{genre}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.language_preferences?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Language Preferences</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.language_preferences.map((lang: string) => (
                               <Badge key={lang} variant="secondary">{lang}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.preferred_devices?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Preferred Devices</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.preferred_devices.map((device: string) => (
                               <Badge key={device} variant="secondary">{device}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.content_frequency && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Content Frequency</Label>
                           <p className="font-medium capitalize">{specificProfile.content_frequency}</p>
                         </div>
                       )}
                       {specificProfile.willingness_to_participate && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Participation Willingness</Label>
                           <Badge variant={specificProfile.willingness_to_participate === 'yes' ? 'default' : 'secondary'}>
                             {specificProfile.willingness_to_participate}
                           </Badge>
                         </div>
                       )}
                     </>
                   )}

                   {/* Creator-specific fields */}
                   {isCreator && (
                     <>
                       {specificProfile.creator_name && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Creator Name</Label>
                           <p className="font-medium">{specificProfile.creator_name}</p>
                         </div>
                       )}
                       {specificProfile.creator_type && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Creator Type</Label>
                           <p className="font-medium">{specificProfile.creator_type}</p>
                         </div>
                       )}
                       {specificProfile.primary_category && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Primary Category</Label>
                           <Badge variant="default">{specificProfile.primary_category}</Badge>
                         </div>
                       )}
                       {specificProfile.industry_segment && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Industry Segment</Label>
                           <p className="font-medium">{specificProfile.industry_segment}</p>
                         </div>
                       )}
                       {specificProfile.active_platforms?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Active Platforms</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.active_platforms.map((platform: string) => (
                               <Badge key={platform} variant="secondary">{platform}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.region_of_operation && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Region of Operation</Label>
                           <p className="font-medium">{specificProfile.region_of_operation}</p>
                         </div>
                       )}
                       {specificProfile.content_languages?.length > 0 && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Content Languages</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.content_languages.map((lang: string) => (
                               <Badge key={lang} variant="secondary">{lang}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                       {specificProfile.experience_level && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Experience Level</Label>
                           <Badge variant="default">{specificProfile.experience_level}</Badge>
                         </div>
                       )}
                       {specificProfile.portfolio_link && (
                         <div className="space-y-1 md:col-span-2">
                           <Label className="text-xs text-muted-foreground uppercase">Portfolio Link</Label>
                           <a href={specificProfile.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                             {specificProfile.portfolio_link}
                           </a>
                         </div>
                       )}
                       {specificProfile.audience_target_group && (
                         <div className="space-y-1">
                           <Label className="text-xs text-muted-foreground uppercase">Target Audience</Label>
                           <p className="font-medium">{specificProfile.audience_target_group}</p>
                         </div>
                       )}
                       {specificProfile.insight_interests?.length > 0 && (
                         <div className="space-y-1 md:col-span-2">
                           <Label className="text-xs text-muted-foreground uppercase">Insight Interests</Label>
                           <div className="flex flex-wrap gap-1">
                             {specificProfile.insight_interests.map((interest: string) => (
                               <Badge key={interest} variant="secondary">{interest}</Badge>
                             ))}
                           </div>
                         </div>
                       )}
                     </>
                   )}

                   {/* Studio/OTT/TV/Gaming/Music/Developer-specific fields - Organization profiles */}
                   {(isStudio || isOTT || isTV || isGaming || isMusic || isDeveloper) && (
                      <>
                        {specificProfile?.organization_name && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Organization Name</Label>
                            <p className="font-medium">{specificProfile.organization_name}</p>
                          </div>
                        )}
                        {specificProfile?.organization_type && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Organization Type</Label>
                            <Badge variant="default">{specificProfile.organization_type}</Badge>
                          </div>
                        )}
                        {specificProfile?.headquarters_location && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Headquarters</Label>
                            <p className="font-medium">{specificProfile.headquarters_location}</p>
                          </div>
                        )}
                        {specificProfile?.team_size && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Team Size</Label>
                            <p className="font-medium">{specificProfile.team_size}</p>
                          </div>
                        )}
                        {specificProfile?.operation_regions?.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Operation Regions</Label>
                            <div className="flex flex-wrap gap-1">
                              {specificProfile.operation_regions.map((region: string) => (
                                <Badge key={region} variant="secondary">{region}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {specificProfile?.content_focus?.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Content Focus</Label>
                            <div className="flex flex-wrap gap-1">
                              {specificProfile.content_focus.map((focus: string) => (
                                <Badge key={focus} variant="secondary">{focus}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {specificProfile?.preferred_insights?.length > 0 && (
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs text-muted-foreground uppercase">Preferred Insights</Label>
                            <div className="flex flex-wrap gap-1">
                              {specificProfile.preferred_insights.map((insight: string) => (
                                <Badge key={insight} variant="secondary">{insight}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {specificProfile?.data_access_role && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Data Access Role</Label>
                            <p className="font-medium">{specificProfile.data_access_role}</p>
                          </div>
                        )}
                        {specificProfile?.official_contact_email && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground uppercase">Official Contact</Label>
                            <p className="font-medium">{specificProfile.official_contact_email}</p>
                          </div>
                        )}
                        {specificProfile?.website_link && (
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs text-muted-foreground uppercase">Website</Label>
                            <a href={specificProfile.website_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                              {specificProfile.website_link}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                 </div>
               </CardContent>
             </Card>
             </SectionTransition>
           )}

           {/* Stats Cards - Different for each user type */}
           {isAudience ? (
              <>
                {/* Audience Stats */}
                <SectionTransition delay={0.15}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                 <Card className="p-4 md:p-6 shadow-card hover:shadow-elegant transition-all duration-300 hover-scale-102">
                   <div className="space-y-2">
                     <TrendingUp className="w-5 h-5 text-primary" />
                     <p className="text-2xl md:text-3xl font-bold">{stats.totalOpinions}</p>
                     <p className="text-xs text-muted-foreground">Opinions Shared</p>
                   </div>
                  </Card>

                 <Card className="p-4 md:p-6 shadow-card hover:shadow-elegant transition-all duration-300 hover-scale-102">
                   <div className="space-y-2">
                     <Gift className="w-5 h-5 text-primary" />
                     <p className="text-2xl md:text-3xl font-bold">{stats.totalCoupons}</p>
                     <p className="text-xs text-muted-foreground">Coupons Earned</p>
                   </div>
                  </Card>

                  <Card className="p-4 md:p-6 shadow-card hover:shadow-elegant transition-all duration-300 hover-scale-102 gradient-primary">
                    <div className="space-y-2">
                      <Award className="w-5 h-5 text-white" />
                      <p className="text-2xl md:text-3xl font-bold text-white">{stats.rewardPoints}</p>
                      <p className="text-xs text-white/90">Reward Points</p>
                    </div>
                  </Card>

                 <Card className="p-4 md:p-6 shadow-card hover:shadow-elegant transition-all duration-300 hover-scale-102">
                   <div className="space-y-2">
                     <Clock className="w-5 h-5 text-primary" />
                     <p className="text-2xl md:text-3xl font-bold">{formatTimeSpent(stats.totalTimeSpent)}</p>
                     <p className="text-xs text-muted-foreground">Time Spent</p>
                   </div>
                 </Card>
               </div>
               </SectionTransition>

               {/* User Activity Analysis Widget */}
               <SectionTransition delay={0.2}>
               <ProfileActivityAnalysis />
               </SectionTransition>

               {/* Time Spent Analytics */}
               <SectionTransition delay={0.25}>
               <TimeSpentAnalytics userId={userId} />
               </SectionTransition>

               {/* Gamification Widgets */}
               <SectionTransition delay={0.3}>
               <div className="grid md:grid-cols-2 gap-6">
                 <CreativeSoulAvatar />
                 <StreakTracker />
               </div>
               </SectionTransition>

               <SectionTransition delay={0.35}>
                <WisdomBadges />
               </SectionTransition>
                
               <SectionTransition delay={0.4}>
                <CulturalEnergyMap />
               </SectionTransition>

                {/* Likes Received Section for Audience */}
                <SectionTransition delay={0.45}>
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-6 h-6 text-accent fill-accent" />
                      Likes Received
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Total Likes Received</p>
                          <p className="text-3xl font-bold text-accent">{stats.likesReceived}</p>
                        </div>
                        <Heart className="w-12 h-12 text-accent/30 fill-accent/30" />
                      </div>
                      
                      {stats.likesReceived > 0 && (
                        <div className="text-center text-sm text-muted-foreground">
                          <p>Your opinions have been appreciated by the community!</p>
                          <p className="mt-1">View individual likes in the category pages.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </SectionTransition>

                {/* Coupons section removed - audience profiles should not show My Reward Coupons here */}
                {/* Users can access coupons via My Coupons page */}
            </>
          ) : (
            <>
              {/* Professional Profile Details */}
              <Card className="shadow-elegant animate-slide-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Creator Profile Fields */}
                    {isCreator && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Creator Name</Label>
                          <p className="font-medium">{specificProfile.creator_name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Creator Type</Label>
                          <Badge variant="outline">{specificProfile.creator_type || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Primary Category</Label>
                          <p className="font-medium capitalize">{specificProfile.primary_category || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Industry Segment</Label>
                          <p className="font-medium">{specificProfile.industry_segment || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Experience Level</Label>
                          <Badge className="gradient-primary text-white border-0">{specificProfile.experience_level || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Region of Operation</Label>
                          <p className="font-medium">{specificProfile.region_of_operation || 'Not set'}</p>
                        </div>
                        {specificProfile.website_url && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website_url}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Studio Profile Fields */}
                    {isStudio && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Organization Name</Label>
                          <p className="font-medium">{specificProfile.organization_name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Organization Type</Label>
                          <Badge variant="outline">{specificProfile.organization_type || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Team Size</Label>
                          <p className="font-medium">{specificProfile.team_size || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Headquarters</Label>
                          <p className="font-medium">{specificProfile.headquarters || specificProfile.headquarters_location || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Industry</Label>
                          <p className="font-medium">{specificProfile.industry || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Contact Email</Label>
                          <p className="font-medium">{specificProfile.official_contact_email || 'Not set'}</p>
                        </div>
                        {specificProfile.website_link && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website_link}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Production House Profile Fields */}
                    {isProduction && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Production House Name</Label>
                          <p className="font-medium">{specificProfile.production_house_name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Size</Label>
                          <Badge variant="outline">{specificProfile.size || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Location</Label>
                          <p className="font-medium">{specificProfile.location || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Active Projects</Label>
                          <p className="font-medium">{specificProfile.active_projects || 0}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Contact Person</Label>
                          <p className="font-medium">{specificProfile.contact_person_name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Contact Email</Label>
                          <p className="font-medium">{specificProfile.contact_person_email || 'Not set'}</p>
                        </div>
                        {specificProfile.website && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* OTT Platform Profile Fields */}
                    {isOTT && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Platform Name</Label>
                          <p className="font-medium">{specificProfile.platform_name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Subscription Model</Label>
                          <Badge variant="outline">{specificProfile.subscription_model || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Country of Operation</Label>
                          <p className="font-medium">{specificProfile.country_of_operation || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Primary Audience</Label>
                          <p className="font-medium">{specificProfile.primary_audience || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Contact Person</Label>
                          <p className="font-medium">{specificProfile.contact_person || 'Not set'}</p>
                        </div>
                        {specificProfile.website && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Gaming Profile Fields */}
                    {isGaming && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-medium">{specificProfile.name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Creator Type</Label>
                          <Badge variant="outline">{specificProfile.creator_type || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Region</Label>
                          <p className="font-medium">{specificProfile.region || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Contact Email</Label>
                          <p className="font-medium">{specificProfile.contact_email || 'Not set'}</p>
                        </div>
                        {specificProfile.website_url && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website_url}
                            </a>
                          </div>
                        )}
                      </>
                    )}

                    {/* Music Profile Fields */}
                    {isMusic && specificProfile && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Name</Label>
                          <p className="font-medium">{specificProfile.name || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Role</Label>
                          <Badge variant="outline">{specificProfile.role || 'Not set'}</Badge>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Location</Label>
                          <p className="font-medium">{specificProfile.location || 'Not set'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Audience Region</Label>
                          <p className="font-medium">{specificProfile.audience_region || 'Not set'}</p>
                        </div>
                        {specificProfile.website_url && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Website</Label>
                            <a href={specificProfile.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {specificProfile.website_url}
                            </a>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* About/Description Section */}
                  {(profile?.about_me || specificProfile?.about) && (
                    <div className="mt-6 pt-6 border-t space-y-2">
                      <Label className="text-muted-foreground">About</Label>
                      <p className="text-sm leading-relaxed">{profile?.about_me || specificProfile?.about}</p>
                    </div>
                  )}

                  {(isCreator || isStudio || isProduction || isOTT || isGaming || isMusic) && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-muted-foreground text-sm text-center">
                        {isCreator && "Access creator analytics and audience insights through the Insights section in the navigation menu."}
                        {isStudio && "View comprehensive audience research and content trend analytics in the Insights section."}
                        {isProduction && "Access market research and content demand analytics through the Insights page."}
                        {isOTT && "Analyze platform engagement and content strategy insights via the Insights menu."}
                        {isGaming && "Track game developer trends and audience preferences in the Insights section."}
                        {isMusic && "Explore music industry trends and audience listening patterns via Insights."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Activity Analysis Widget for Professional Profiles */}
              <ProfileActivityAnalysis />

              {/* Review Section - Prominent */}
              <Card className="shadow-elegant border-2 border-primary/20 animate-slide-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    Share Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground mb-4">
                    Help us improve Inphrone! Your review helps us build a better platform for everyone.
                  </p>
                  <Button 
                    onClick={() => navigate('/reviews')}
                    className="w-full gradient-primary text-white border-0 shadow-elegant hover:scale-105 transition-transform"
                    size="lg"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Write a Review
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
