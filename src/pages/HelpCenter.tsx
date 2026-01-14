import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, MessageCircle, FileText, Search, Users } from "lucide-react";

export default function HelpCenter() {
  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using Inphrone",
      articles: [
        "Creating your account",
        "Completing your profile",
        "Submitting your first opinion",
        "Understanding 8 user types"
      ]
    },
    {
      icon: Users,
      title: "For Audiences",
      description: "Make your voice heard",
      articles: [
        "How to share weekly opinions",
        "Understanding 8 entertainment categories",
        "Using InphroSync daily pulse",
        "Competing in Your Turn slots"
      ]
    },
    {
      icon: Video,
      title: "For Industry Users",
      description: "Creators, Studios, OTT, TV, Gaming, Music & App Developers",
      articles: [
        "Accessing Category Deep Dive insights",
        "Understanding demographic analytics",
        "Filtering by location, age, gender",
        "Viewing past opinions archive"
      ]
    },
    {
      icon: FileText,
      title: "Account & Privacy",
      description: "Manage your account settings",
      articles: [
        "Privacy settings",
        "Notification preferences",
        "Location detection settings",
        "Account deletion & restoration"
      ]
    },
    {
      icon: Search,
      title: "Features & Tools",
      description: "Explore platform capabilities",
      articles: [
        "Rewards & Wisdom Badges system",
        "Streak tracking & levels",
        "InphroneBot AI assistant",
        "Coupon rewards system"
      ]
    },
    {
      icon: MessageCircle,
      title: "Troubleshooting",
      description: "Common issues and solutions",
      articles: [
        "Login and authentication issues",
        "Opinion submission errors",
        "InphroSync participation problems",
        "Your Turn slot timing issues"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Help Center</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about using Inphrone
            </p>
          </div>

          {/* Search Bar */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Help Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <category.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{category.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, i) => (
                      <li key={i}>
                        <button className="text-sm text-primary hover:underline text-left">
                          {article}
                        </button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Support Section */}
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <p className="text-muted-foreground">
                Contact us at{" "}
                <a href="mailto:inphrone@gmail.com" className="text-primary hover:underline font-medium">
                  inphrone@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center p-6">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help from our team
              </p>
              <Button asChild variant="outline">
                <a href="/contact">Contact Us</a>
              </Button>
            </Card>

            <Card className="text-center p-6">
              <FileText className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">View FAQs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Quick answers to common questions
              </p>
              <Button asChild variant="outline">
                <a href="/faq">Browse FAQs</a>
              </Button>
            </Card>

            <Card className="text-center p-6">
              <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Video Tutorials</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Watch guides on YouTube
              </p>
              <Button asChild variant="outline">
                <a href="https://youtube.com/@inphrone" target="_blank" rel="noopener noreferrer">
                  Watch Now
                </a>
              </Button>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
