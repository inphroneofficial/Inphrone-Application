import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      title: "Introducing Inphrone: The World's First Audience-Intelligence Platform",
      excerpt: "Discover how Inphrone is revolutionizing entertainment by connecting audiences directly with creators, studios, OTT platforms, TV networks, gaming companies, music labels, and app developers across 8 categories.",
      date: "2025-01-15",
      category: "Platform Updates",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80"
    },
    {
      title: "InphroSync & Your Turn: Daily Engagement Features Explained",
      excerpt: "Learn how InphroSync's daily entertainment pulse and the competitive Your Turn feature are changing how audiences participate in shaping entertainment trends.",
      date: "2025-01-10",
      category: "Features",
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80"
    },
    {
      title: "8 Entertainment Categories: From Film to App Development",
      excerpt: "Explore all 8 entertainment categories on Inphrone — Film, Music, OTT, TV, YouTube, Gaming, Social Media, and the newest addition: App Development.",
      date: "2025-01-05",
      category: "Industry Insights",
      image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80"
    },
    {
      title: "Understanding User Types: From Audiences to App Developers",
      excerpt: "A deep dive into Inphrone's 8 user types and how each one benefits from the platform's unique audience intelligence features.",
      date: "2024-12-28",
      category: "User Guides",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
    },
    {
      title: "Meet the Founder: Thangella Gadidamalla's Vision for Entertainment",
      excerpt: "Learn about the visionary entrepreneur behind Inphrone and the mission to democratize entertainment intelligence worldwide through people-powered insights.",
      date: "2024-12-20",
      category: "Company",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
    },
    {
      title: "Location-Based Insights: How Demographics Shape Entertainment",
      excerpt: "How Inphrone's automatic location detection and demographic analytics help creators understand their global audience without compromising privacy.",
      date: "2024-12-15",
      category: "Analytics",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Inphrone Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Insights, updates, and stories from the world's first Audience-Intelligence Platform
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {posts[0] && (
          <section className="py-12 container mx-auto px-4">
            <Card className="overflow-hidden max-w-6xl mx-auto hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-64 md:h-full">
                  <img 
                    src={posts[0].image} 
                    alt={posts[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <Badge className="w-fit mb-4">{posts[0].category}</Badge>
                  <h2 className="text-3xl font-bold mb-4">{posts[0].title}</h2>
                  <p className="text-muted-foreground mb-4">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(posts[0].date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button className="w-fit">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Recent Posts Grid */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Recent Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <Badge className="w-fit mb-2">{post.category}</Badge>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-8 text-center bg-gradient-to-br from-primary/10 to-background">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for the latest insights, platform updates, and industry trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button>Subscribe</Button>
            </div>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
