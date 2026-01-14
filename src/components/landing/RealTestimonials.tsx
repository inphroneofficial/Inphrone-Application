import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, Users, MessageSquare, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Review {
  id: string;
  name: string;
  user_type: string;
  rating: number;
  review: string;
  location: string | null;
  created_at: string;
}

const userTypeEmojis: Record<string, string> = {
  audience: "🎬",
  creator: "✨",
  studio: "🎥",
  production: "🎬",
  ott: "📺",
  tv: "📡",
  gaming: "🎮",
  music: "🎵",
  developer: "💻",
};

const userTypeLabels: Record<string, string> = {
  audience: "Entertainment Enthusiast",
  creator: "Content Creator",
  studio: "Studio Professional",
  production: "Production House",
  ott: "OTT Platform",
  tv: "TV Network",
  gaming: "Gaming Industry",
  music: "Music Industry",
  developer: "App Developer",
};

export const RealTestimonials = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const fetchReviews = async () => {
      try {
        // Fetch ALL reviews for landing page (not just 4+ stars)
        const { data, error, count } = await supabase
          .from('reviews')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        setReviews(data || []);
        setTotalReviews(count || 0);

        // Calculate average rating from all reviews
        if (data && data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAvgRating(avg);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setIsLoading(false);
      }
    };

    fetchReviews();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleWriteReview = () => {
    if (isAuthenticated) {
      navigate('/reviews');
    } else {
      navigate('/auth');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-5 py-2.5 bg-primary/10 text-primary border-primary/20 font-semibold">
              <Star className="w-4 h-4 mr-2" />
              Community Voices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              What Our <span className="text-gradient">Users Say</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-background/60 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // No reviews - show CTA to write first review
  if (reviews.length === 0) {
    return (
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 px-5 py-2.5 bg-primary/10 text-primary border-primary/20 font-semibold">
              <Star className="w-4 h-4 mr-2" />
              Community Voices
            </Badge>
            <h2 className="text-4xl md:text-5xl font-display font-black">
              Be the First to <span className="text-gradient">Share</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              Join our community and share your experience. Your voice matters!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">
              Be among the first to share your thoughts and help shape the future of entertainment intelligence.
            </p>
            <Button 
              onClick={handleWriteReview}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <PenLine className="w-4 h-4" />
              Write a Review
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge className="mb-6 px-5 py-2.5 bg-primary/10 text-primary border-primary/20 font-semibold">
            <Star className="w-4 h-4 mr-2" />
            Community Voices
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-black">
            What Our <span className="text-gradient">Users Say</span>
          </h2>
          
          {/* Stats row */}
          <motion.div 
            className="flex items-center justify-center gap-8 mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{totalReviews}</span>
              <span className="text-sm text-muted-foreground">Reviews</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-lg font-bold text-foreground">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">Average</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.slice(0, 6).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="relative p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl h-full flex flex-col">
                {/* Quote icon */}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Quote className="w-4 h-4 text-primary-foreground" />
                </div>
                
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-lg text-foreground leading-relaxed mb-6 flex-1 line-clamp-4">
                  "{review.review}"
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl">
                    {userTypeEmojis[review.user_type] || "🌟"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{review.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userTypeLabels[review.user_type] || "Community Member"}
                      {review.location && ` • ${review.location}`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
