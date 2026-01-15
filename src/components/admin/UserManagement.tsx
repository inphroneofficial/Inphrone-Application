import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Trash2, Eye, UserCog, Mail, MapPin, Calendar, Building2, Briefcase, Globe, Users, Heart, Gift, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  country: string;
  city: string | null;
  state_region: string | null;
  gender: string | null;
  age_group: string | null;
  date_of_birth: string | null;
  created_at: string;
  onboarding_completed: boolean;
}

interface UserStats {
  opinions_count: number;
  coupons_count: number;
  upvotes_received: number;
  upvotes_given: number;
  last_activity: string | null;
  total_time_spent: number;
  streaks: any;
  badges: any[];
}

interface SpecificProfile {
  [key: string]: any;
}

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [specificProfile, setSpecificProfile] = useState<SpecificProfile | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterType, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((user) => user.user_type === filterType);
    }

    setFilteredUsers(filtered);
  };

  const fetchUserStats = async (userId: string, userType: string) => {
    setStatsLoading(true);
    try {
      // Fetch basic stats
      const [opinionsRes, couponsRes, upvotesGivenRes, activityRes, timeRes, streaksRes, badgesRes] = await Promise.all([
        supabase.from("opinions").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("coupons").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("opinion_upvotes").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("user_activity_logs").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single(),
        supabase.from("user_activity_logs").select("duration_seconds").eq("user_id", userId),
        supabase.from("user_streaks").select("*").eq("user_id", userId).single(),
        supabase.from("user_badges").select("*").eq("user_id", userId)
      ]);

      // Calculate upvotes received on user's opinions
      const { data: userOpinions } = await supabase.from("opinions").select("id").eq("user_id", userId);
      let upvotesReceived = 0;
      if (userOpinions && userOpinions.length > 0) {
        const { count } = await supabase
          .from("opinion_upvotes")
          .select("id", { count: "exact", head: true })
          .in("opinion_id", userOpinions.map(o => o.id));
        upvotesReceived = count || 0;
      }

      const totalTimeSpent = timeRes.data?.reduce((sum: number, log: any) => sum + (log.duration_seconds || 0), 0) || 0;

      setUserStats({
        opinions_count: opinionsRes.count || 0,
        coupons_count: couponsRes.count || 0,
        upvotes_received: upvotesReceived,
        upvotes_given: upvotesGivenRes.count || 0,
        last_activity: activityRes.data?.created_at || null,
        total_time_spent: totalTimeSpent,
        streaks: streaksRes.data || null,
        badges: badgesRes.data || []
      });

      // Fetch specific profile based on user type
      let specificData = null;
      switch (userType) {
        case 'audience':
          const { data: audienceData } = await supabase.from("audience_profiles").select("*").eq("user_id", userId).single();
          specificData = audienceData;
          break;
        case 'creator':
          const { data: creatorData } = await supabase.from("creator_profiles").select("*").eq("user_id", userId).single();
          specificData = creatorData;
          break;
        case 'studio':
          const { data: studioData } = await supabase.from("studio_profiles").select("*").eq("user_id", userId).single();
          specificData = studioData;
          break;
        case 'ott':
          const { data: ottData } = await supabase.from("ott_profiles").select("*").eq("user_id", userId).single();
          specificData = ottData;
          break;
        case 'tv':
          const { data: tvData } = await supabase.from("tv_profiles").select("*").eq("user_id", userId).single();
          specificData = tvData;
          break;
        case 'gaming':
          const { data: gamingData } = await supabase.from("gaming_profiles").select("*").eq("user_id", userId).single();
          specificData = gamingData;
          break;
        case 'music':
          const { data: musicData } = await supabase.from("music_profiles").select("*").eq("user_id", userId).single();
          specificData = musicData;
          break;
        case 'developer':
          const { data: developerData } = await supabase.from("developer_profiles").select("*").eq("user_id", userId).single();
          specificData = developerData;
          break;
      }
      setSpecificProfile(specificData);

    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setSpecificProfile(null);
    fetchUserStats(user.id, user.user_type);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      // Optimistically remove from UI immediately
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      const { data, error } = await supabase.functions.invoke("delete-individual-user", {
        body: { userId }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`User ${userName} and all associated data deleted successfully`);
      } else {
        // Revert if failed
        fetchUsers();
        throw new Error(data?.error || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(`Failed to delete user: ${error.message}`);
      // Refresh to restore correct state on error
      fetchUsers();
    }
  };

  const getUserTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      audience: "bg-blue-500/10 text-blue-600",
      creator: "bg-purple-500/10 text-purple-600",
      studio: "bg-green-500/10 text-green-600",
      production: "bg-orange-500/10 text-orange-600",
      ott: "bg-pink-500/10 text-pink-600",
      tv: "bg-cyan-500/10 text-cyan-600",
      gaming: "bg-red-500/10 text-red-600",
      music: "bg-yellow-500/10 text-yellow-600",
      developer: "bg-indigo-500/10 text-indigo-600"
    };
    return colors[type] || "bg-gray-500/10 text-gray-600";
  };

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const renderSpecificProfileDetails = (userType: string, profile: SpecificProfile | null) => {
    if (!profile) return <div className="text-sm text-muted-foreground">No specific profile data available.</div>;

    switch (userType) {
      case 'audience':
        return (
          <div className="grid grid-cols-2 gap-4">
            {profile.entertainment_preferences?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Entertainment Preferences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.entertainment_preferences.map((pref: string) => (
                    <Badge key={pref} variant="secondary" className="text-xs">{pref}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.favorite_platforms?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Favorite Platforms</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.favorite_platforms.map((platform: string) => (
                    <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.genre_interests?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Genre Interests</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.genre_interests.map((genre: string) => (
                    <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.language_preferences?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Language Preferences</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.language_preferences.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.preferred_devices?.length > 0 && (
              <div>
                <p className="text-sm font-medium">Preferred Devices</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.preferred_devices.map((device: string) => (
                    <Badge key={device} variant="secondary" className="text-xs">{device}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.content_frequency && (
              <div>
                <p className="text-sm font-medium">Content Frequency</p>
                <p className="text-sm text-muted-foreground capitalize">{profile.content_frequency}</p>
              </div>
            )}
            {profile.willingness_to_participate && (
              <div>
                <p className="text-sm font-medium">Willing to Participate</p>
                <Badge variant={profile.willingness_to_participate === 'yes' ? 'default' : 'secondary'}>
                  {profile.willingness_to_participate}
                </Badge>
              </div>
            )}
          </div>
        );
      case 'creator':
        return (
          <div className="grid grid-cols-2 gap-4">
            {profile.creator_name && (
              <div>
                <p className="text-sm font-medium">Creator Name</p>
                <p className="text-sm text-muted-foreground">{profile.creator_name}</p>
              </div>
            )}
            {profile.creator_type && (
              <div>
                <p className="text-sm font-medium">Creator Type</p>
                <Badge variant="secondary">{profile.creator_type}</Badge>
              </div>
            )}
            {profile.primary_category && (
              <div>
                <p className="text-sm font-medium">Primary Category</p>
                <Badge variant="default">{profile.primary_category}</Badge>
              </div>
            )}
            {profile.industry_segment && (
              <div>
                <p className="text-sm font-medium">Industry Segment</p>
                <p className="text-sm text-muted-foreground">{profile.industry_segment}</p>
              </div>
            )}
            {profile.experience_level && (
              <div>
                <p className="text-sm font-medium">Experience Level</p>
                <Badge variant="outline">{profile.experience_level}</Badge>
              </div>
            )}
            {profile.region_of_operation && (
              <div>
                <p className="text-sm font-medium">Region of Operation</p>
                <p className="text-sm text-muted-foreground">{profile.region_of_operation}</p>
              </div>
            )}
            {profile.active_platforms?.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Active Platforms</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.active_platforms.map((platform: string) => (
                    <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.portfolio_link && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Portfolio Link</p>
                <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                  {profile.portfolio_link}
                </a>
              </div>
            )}
          </div>
        );
      case 'studio':
      case 'ott':
      case 'tv':
      case 'gaming':
      case 'music':
      case 'developer':
        return (
          <div className="grid grid-cols-2 gap-4">
            {profile.organization_name && (
              <div>
                <p className="text-sm font-medium">Organization Name</p>
                <p className="text-sm text-muted-foreground">{profile.organization_name}</p>
              </div>
            )}
            {profile.organization_type && (
              <div>
                <p className="text-sm font-medium">Organization Type</p>
                <Badge variant="secondary">{profile.organization_type}</Badge>
              </div>
            )}
            {profile.official_contact_email && (
              <div>
                <p className="text-sm font-medium">Contact Email</p>
                <p className="text-sm text-muted-foreground">{profile.official_contact_email}</p>
              </div>
            )}
            {profile.headquarters_location && (
              <div>
                <p className="text-sm font-medium">Headquarters</p>
                <p className="text-sm text-muted-foreground">{profile.headquarters_location}</p>
              </div>
            )}
            {profile.team_size && (
              <div>
                <p className="text-sm font-medium">Team Size</p>
                <p className="text-sm text-muted-foreground">{profile.team_size}</p>
              </div>
            )}
            {profile.data_access_role && (
              <div>
                <p className="text-sm font-medium">Data Access Role</p>
                <p className="text-sm text-muted-foreground">{profile.data_access_role}</p>
              </div>
            )}
            {profile.operation_regions?.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Operation Regions</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.operation_regions.map((region: string) => (
                    <Badge key={region} variant="secondary" className="text-xs">{region}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.content_focus?.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Content Focus</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.content_focus.map((focus: string) => (
                    <Badge key={focus} variant="secondary" className="text-xs">{focus}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.preferred_insights?.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Preferred Insights</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.preferred_insights.map((insight: string) => (
                    <Badge key={insight} variant="secondary" className="text-xs">{insight}</Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.website_link && (
              <div className="col-span-2">
                <p className="text-sm font-medium">Website</p>
                <a href={profile.website_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                  {profile.website_link}
                </a>
              </div>
            )}
          </div>
        );
      default:
        return <div className="text-sm text-muted-foreground">No specific profile data available.</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          User Management
        </CardTitle>
        <CardDescription>
          View, search, and manage all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="audience">Audience</SelectItem>
              <SelectItem value="creator">Creator</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="ott">OTT</SelectItem>
              <SelectItem value="tv">TV</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="music">Music</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getUserTypeColor(user.user_type)}>
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.city ? `${user.city}, ${user.country}` : user.country}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5" />
                                User Details: {user.full_name}
                              </DialogTitle>
                              <DialogDescription>
                                Complete profile and activity information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser?.id === user.id && (
                              <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                  <TabsTrigger value="profile">Profile Details</TabsTrigger>
                                  <TabsTrigger value="activity">Activity</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="basic" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-2">
                                      <Mail className="w-4 h-4 mt-1 text-primary" />
                                      <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Briefcase className="w-4 h-4 mt-1 text-primary" />
                                      <div>
                                        <p className="text-sm font-medium">User Type</p>
                                        <Badge className={getUserTypeColor(user.user_type)}>
                                          {user.user_type}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="w-4 h-4 mt-1 text-primary" />
                                      <div>
                                        <p className="text-sm font-medium">Location</p>
                                        <p className="text-sm text-muted-foreground">
                                          {[user.city, user.state_region, user.country].filter(Boolean).join(', ') || 'Not specified'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                      <Calendar className="w-4 h-4 mt-1 text-primary" />
                                      <div>
                                        <p className="text-sm font-medium">Joined</p>
                                        <p className="text-sm text-muted-foreground">
                                          {new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    {user.gender && (
                                      <div className="flex items-start gap-2">
                                        <Users className="w-4 h-4 mt-1 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium">Gender</p>
                                          <p className="text-sm text-muted-foreground capitalize">{user.gender}</p>
                                        </div>
                                      </div>
                                    )}
                                    {user.age_group && (
                                      <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 mt-1 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium">Age Group</p>
                                          <p className="text-sm text-muted-foreground">{user.age_group}</p>
                                        </div>
                                      </div>
                                    )}
                                    {user.date_of_birth && (
                                      <div className="flex items-start gap-2">
                                        <Calendar className="w-4 h-4 mt-1 text-primary" />
                                        <div>
                                          <p className="text-sm font-medium">Date of Birth</p>
                                          <p className="text-sm text-muted-foreground">
                                            {new Date(user.date_of_birth).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                      <Building2 className="w-4 h-4 mt-1 text-primary" />
                                      <div>
                                        <p className="text-sm font-medium">Onboarding</p>
                                        <Badge variant={user.onboarding_completed ? "default" : "secondary"}>
                                          {user.onboarding_completed ? "Completed" : "Pending"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="profile" className="space-y-4 mt-4">
                                  <div className="p-4 bg-muted/30 rounded-lg">
                                    <h4 className="font-medium mb-4 flex items-center gap-2">
                                      <Building2 className="w-4 h-4" />
                                      {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)} Profile Data
                                    </h4>
                                    {statsLoading ? (
                                      <div className="text-center py-4">Loading profile details...</div>
                                    ) : (
                                      renderSpecificProfileDetails(user.user_type, specificProfile)
                                    )}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="activity" className="space-y-4 mt-4">
                                  {statsLoading ? (
                                    <div className="text-center py-4">Loading activity stats...</div>
                                  ) : userStats && (
                                    <>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Opinions</p>
                                          </div>
                                          <p className="text-2xl font-bold">{userStats.opinions_count}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Gift className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Coupons</p>
                                          </div>
                                          <p className="text-2xl font-bold">{userStats.coupons_count}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Likes Received</p>
                                          </div>
                                          <p className="text-2xl font-bold">{userStats.upvotes_received}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Heart className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Likes Given</p>
                                          </div>
                                          <p className="text-2xl font-bold">{userStats.upvotes_given}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Time Spent</p>
                                          </div>
                                          <p className="text-2xl font-bold">{formatTimeSpent(userStats.total_time_spent)}</p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg">
                                          <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <p className="text-sm font-medium">Last Active</p>
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            {userStats.last_activity 
                                              ? new Date(userStats.last_activity).toLocaleDateString()
                                              : "Never"}
                                          </p>
                                        </div>
                                      </div>

                                      {userStats.streaks && (
                                        <>
                                          <Separator />
                                          <div className="p-4 bg-muted/30 rounded-lg">
                                            <h4 className="font-medium mb-3">Streak Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div>
                                                <p className="text-sm text-muted-foreground">Current Streak</p>
                                                <p className="font-bold">{userStats.streaks.current_streak_weeks || 0} weeks</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-muted-foreground">Longest Streak</p>
                                                <p className="font-bold">{userStats.streaks.longest_streak_weeks || 0} weeks</p>
                                              </div>
                                              <div>
                                                <p className="text-sm text-muted-foreground">Streak Tier</p>
                                                <Badge variant="outline" className="capitalize">{userStats.streaks.streak_tier || 'none'}</Badge>
                                              </div>
                                              <div>
                                                <p className="text-sm text-muted-foreground">Total Contributions</p>
                                                <p className="font-bold">{userStats.streaks.total_weekly_contributions || 0}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </>
                                      )}

                                      {userStats.badges && userStats.badges.length > 0 && (
                                        <>
                                          <Separator />
                                          <div className="p-4 bg-muted/30 rounded-lg">
                                            <h4 className="font-medium mb-3">Badges Earned</h4>
                                            <div className="flex flex-wrap gap-2">
                                              {userStats.badges.map((badge: any) => (
                                                <Badge key={badge.id} variant="default" className="gap-1">
                                                  {badge.badge_name}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </>
                                  )}
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.full_name}? This will permanently delete their account and all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                className="bg-destructive"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}