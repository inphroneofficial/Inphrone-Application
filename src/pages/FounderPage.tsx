import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Instagram, 
  Lightbulb, 
  Target, 
  Rocket,
  Brain,
  Users,
  Globe,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function FounderPage() {
  useEffect(() => {
    // Update document title and meta for SEO
    document.title = "Thangella Gadidamalla – Founder & CEO | Inphrone™";
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Thangella Gadidamalla is the Founder & CEO of Inphrone™, the world's first people-powered entertainment intelligence platform. Learn about his vision, expertise, and journey.");
    }

    // Add Person schema for the founder
    const existingSchema = document.querySelector('script[data-founder-schema]');
    if (!existingSchema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-founder-schema', 'true');
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "mainEntity": {
          "@type": "Person",
          "@id": "https://inphrone.com/about/founder#person",
          "name": "Thangella Gadidamalla",
          "alternateName": "G. Thangella",
          "jobTitle": "Founder & CEO",
          "worksFor": {
            "@type": "Organization",
            "name": "Inphrone",
            "url": "https://inphrone.com"
          },
          "description": "Founder of Inphrone - the world's first people-powered entertainment intelligence platform. A product thinker and system designer building at the intersection of human behavior, technology, and design.",
          "knowsAbout": [
            "Product Design",
            "System Architecture",
            "Entertainment Technology",
            "Audience Analytics",
            "Startup Development",
            "User Experience",
            "Data Intelligence"
          ],
          "sameAs": [
            "https://www.linkedin.com/in/gthangella/",
            "https://twitter.com/g_thangella",
            "https://www.instagram.com/g_thangella_k/",
            "https://github.com/gthangella"
          ],
          "image": "https://inphrone.com/inphrone-logo.jpg"
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://inphrone.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "About",
              "item": "https://inphrone.com/about"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Founder",
              "item": "https://inphrone.com/about/founder"
            }
          ]
        }
      });
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup schema on unmount
      const schema = document.querySelector('script[data-founder-schema]');
      if (schema) schema.remove();
    };
  }, []);

  const expertise = [
    { icon: Brain, title: "Product Thinking", description: "Deep understanding of user needs and market dynamics" },
    { icon: Lightbulb, title: "System Design", description: "Architecting scalable, intelligent platforms" },
    { icon: Users, title: "Audience Intelligence", description: "Bridging the gap between creators and consumers" },
    { icon: Globe, title: "Global Vision", description: "Building for a worldwide entertainment ecosystem" },
  ];

  const socialLinks = [
    { icon: Linkedin, label: "LinkedIn", url: "https://www.linkedin.com/in/gthangella/", color: "hover:text-[#0077B5]" },
    { icon: Twitter, label: "X (Twitter)", url: "https://twitter.com/g_thangella", color: "hover:text-foreground" },
    { icon: Instagram, label: "Instagram", url: "https://www.instagram.com/g_thangella_k/", color: "hover:text-[#E4405F]" },
    { icon: Github, label: "GitHub", url: "https://github.com/gthangella", color: "hover:text-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
            <li>/</li>
            <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
            <li>/</li>
            <li className="text-foreground font-medium">Founder</li>
          </ol>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-1"
            >
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                <span className="text-4xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                  TG
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              Thangella Gadidamalla
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1">
                <Rocket className="w-3 h-3 mr-1" />
                Founder & CEO
              </Badge>
              <Badge variant="outline" className="px-4 py-1">
                Inphrone™
              </Badge>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              A product thinker and system designer building at the intersection of human behavior, technology, and design.
            </motion.p>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-full border border-border bg-card hover:bg-muted transition-all ${link.color}`}
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Expertise Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              Expertise
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {expertise.map((item, index) => (
                <Card key={item.title} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>

          {/* Vision Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
              <Target className="w-6 h-6 text-accent" />
              Vision
            </h2>
            
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardContent className="p-8">
                <blockquote className="text-lg md:text-xl leading-relaxed text-muted-foreground italic">
                  "I believe the future of entertainment isn't just about what creators produce—it's about what audiences truly want. Inphrone exists to give every voice a signal, turning passive consumption into active participation. We're building a world where the audience isn't just watching—they're shaping what comes next."
                </blockquote>
                <p className="mt-6 font-semibold text-primary">— Thangella Gadidamalla</p>
              </CardContent>
            </Card>
          </motion.section>

          {/* About Inphrone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">About Inphrone™</h3>
                <p className="text-muted-foreground mb-6">
                  The world's first people-powered entertainment intelligence platform, covering 8 categories: 
                  Film, Music, OTT, TV, YouTube, Gaming, Social Media, and App Development.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button asChild>
                    <a href="/about">
                      Learn More
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/">
                      Visit Platform
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}
