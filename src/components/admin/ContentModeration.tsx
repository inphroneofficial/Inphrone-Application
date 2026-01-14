import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, Trash2, Eye, Flag, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Opinion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  content_type: string;
  created_at: string;
  upvotes: number;
  user_email?: string;
  user_name?: string;
}

interface Review {
  id: string;
  user_id: string;
  name: string;
  rating: number;
  review: string;
  created_at: string;
}

export function ContentModeration() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<Opinion | Review | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Fetch opinions
      const { data: opinionsData, error: opinionsError } = await supabase
        .from("opinions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (opinionsError) throw opinionsError;

      // Fetch user profiles for opinions
      const userIds = [...new Set(opinionsData?.map(o => o.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      // Combine opinions with profile data
      const opinionsWithProfiles = (opinionsData || []).map(opinion => ({
        ...opinion,
        user_email: profilesData?.find(p => p.id === opinion.user_id)?.email,
        user_name: profilesData?.find(p => p.id === opinion.user_id)?.full_name
      }));

      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (reviewsError) throw reviewsError;

      setOpinions(opinionsWithProfiles);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOpinion = async (opinionId: string) => {
    try {
      // Delete associated upvotes first
      await supabase
        .from("opinion_upvotes")
        .delete()
        .eq("opinion_id", opinionId);

      // Delete the opinion
      const { error } = await supabase
        .from("opinions")
        .delete()
        .eq("id", opinionId);

      if (error) throw error;

      toast.success("Opinion deleted successfully");
      fetchContent();
    } catch (error: any) {
      console.error("Error deleting opinion:", error);
      toast.error(`Failed to delete opinion: ${error.message}`);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);

      if (error) throw error;

      toast.success("Review deleted successfully");
      fetchContent();
    } catch (error: any) {
      console.error("Error deleting review:", error);
      toast.error(`Failed to delete review: ${error.message}`);
    }
  };

  const filteredOpinions = opinions.filter(op =>
    op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(rev =>
    rev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rev.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" />
          Content Moderation
        </CardTitle>
        <CardDescription>
          Review and manage user-generated content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="opinions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="opinions">Opinions ({opinions.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="opinions">
            <ScrollArea className="h-[500px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upvotes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading opinions...
                      </TableCell>
                    </TableRow>
                  ) : filteredOpinions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No opinions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOpinions.map((opinion) => (
                      <TableRow key={opinion.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {opinion.title}
                        </TableCell>
                        <TableCell>{opinion.user_name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{opinion.content_type}</Badge>
                        </TableCell>
                        <TableCell>{opinion.upvotes}</TableCell>
                        <TableCell>
                          {new Date(opinion.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedContent(opinion)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Opinion Details</DialogTitle>
                                  <DialogDescription>
                                    Full opinion content
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedContent && 'title' in selectedContent && (
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm font-medium">Title</p>
                                      <p className="text-sm text-muted-foreground">{selectedContent.title}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Description</p>
                                      <p className="text-sm text-muted-foreground">{selectedContent.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-medium">User</p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedContent.user_name || "Unknown"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Upvotes</p>
                                        <p className="text-sm text-muted-foreground">{selectedContent.upvotes}</p>
                                      </div>
                                    </div>
                                  </div>
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
                                  <AlertDialogTitle>Delete Opinion</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this opinion? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteOpinion(opinion.id)}
                                    className="bg-destructive"
                                  >
                                    Delete
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
          </TabsContent>

          <TabsContent value="reviews">
            <ScrollArea className="h-[500px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading reviews...
                      </TableCell>
                    </TableRow>
                  ) : filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{review.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {review.review}
                        </TableCell>
                        <TableCell>
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this review? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
