import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Reviews() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    rating: 5,
    review: "",
    insightsHelpful: "",
    recommendation: ""
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

const fetchReviews = async () => {
  const { data } = await supabase
    .from('reviews' as any)
    .select('*')
    .order('created_at', { ascending: false });
  setReviews((data as any) || []);
};

  interface ReviewRow {
    id: string;
    user_type: string;
    name: string;
    location: string | null;
    rating: number;
    review: string;
    insights_helpful: string | null;
    recommendation: string | null;
    created_at: string;
  }
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [filter, setFilter] = useState<"top"|"new"|"old"|"audience"|"creator">("new");

useEffect(() => {
  loadUserProfile();
  fetchReviews();
}, []);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, full_name, city, country")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserType(profile.user_type);
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || "",
          location: `${profile.city || ""}, ${profile.country || ""}`.trim()
        }));
      }
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in to submit a review");

    // Save review to database only (no email)
    const { error: insertError } = await supabase.from('reviews' as any).insert({
      user_id: user.id,
      user_type: userType || 'audience',
      name: formData.name,
      location: formData.location || null,
      rating: formData.rating,
      review: formData.review,
      insights_helpful: formData.insightsHelpful || null,
      recommendation: formData.recommendation || null,
    });
    if (insertError) throw insertError;

    toast.success("Thank you for your review! It has been submitted successfully.");
    setFormData(prev => ({
      ...prev,
      rating: 5,
      review: "",
      insightsHelpful: "",
      recommendation: ""
    }));
    fetchReviews();
  } catch (error) {
    console.error("Error submitting review:", error);
    toast.error("Failed to submit review. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const isCreatorType = userType && ['creator', 'studio', 'production', 'ott', 'tv', 'music', 'gaming'].includes(userType);

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Reviews & Testimonials</h1>
            <p className="text-muted-foreground text-lg">
              Share your experience with Inphrone's 8 entertainment categories, InphroSync, Your Turn, and insights features
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            rating <= formData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {isCreatorType && (
                  <div className="space-y-2">
                    <Label htmlFor="insightsHelpful">Are the insights helping you?</Label>
                    <Textarea
                      id="insightsHelpful"
                      required
                      value={formData.insightsHelpful}
                      onChange={(e) => setFormData({ ...formData, insightsHelpful: e.target.value })}
                      placeholder="Tell us how Inphrone insights are helping your creative process..."
                      rows={4}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="review">Your Review</Label>
                  <Textarea
                    id="review"
                    required
                    value={formData.review}
                    onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                    placeholder="Share your experience with Inphrone..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendation">Would you recommend Inphrone?</Label>
                  <Textarea
                    id="recommendation"
                    required
                    value={formData.recommendation}
                    onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    placeholder="Why would you recommend Inphrone to others?"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Star className="w-4 h-4 mr-2" />
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>

{/* Reviews List with Filters */}
<div className="space-y-6 mt-12">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-3xl font-bold">What Users Say</h2>
    <div className="flex gap-2">
      {[
        { key: 'top', label: 'Top' },
        { key: 'new', label: 'New' },
        { key: 'old', label: 'Old' },
        { key: 'audience', label: 'Audience' },
        { key: 'creator', label: 'Creators & Studios' },
      ].map((f) => (
        <Button key={f.key} variant={filter === f.key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f.key as any)}>
          {f.label}
        </Button>
      ))}
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-6">
    {reviews
      .filter(r => filter === 'audience' ? r.user_type === 'audience' : filter === 'creator' ? r.user_type !== 'audience' : true)
      .sort((a,b) => filter === 'top' ? b.rating - a.rating : filter === 'old' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((r) => (
        <Card key={r.id}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-muted-foreground mb-4">{r.review}</p>
            {r.insights_helpful && (
              <p className="text-sm text-muted-foreground mb-2">How insights help: {r.insights_helpful}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1 capitalize">
                {r.user_type === 'audience' ? <Users className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />} 
                {r.user_type === 'audience' ? 'Audience' : 'Creator/Studio'}
              </Badge>
              <span className="text-sm font-medium">{r.name}</span>
              {r.location && <span className="text-sm text-muted-foreground">• {r.location}</span>}
            </div>
          </CardContent>
        </Card>
      ))}
    {reviews.length === 0 && (
      <p className="text-muted-foreground">No reviews yet. Be the first to share!</p>
    )}
  </div>
</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
