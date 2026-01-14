import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { LiveDataHero } from "@/components/landing/LiveDataHero";
import { RealTestimonials } from "@/components/landing/RealTestimonials";
import { 
  TrendingUp, 
  Users, 
  Film, 
  Music, 
  Tv, 
  Gamepad2, 
  Youtube,
  Lightbulb,
  Globe,
  Award,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Heart,
  Eye,
  Lock,
  ChevronRight,
  Play,
  Star,
  MessageCircle,
  Target,
  Layers,
  Radio
} from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Inphrone — People‑Powered Entertainment Intelligence Platform";
    const desc = "The world's first Audience-Intelligence Platform. Share opinions across 8 entertainment categories. Insights for audiences, creators, studios, OTT, TV, gaming, music, and app developers.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, []);

  const categories = [
    { icon: Film, label: "Film", color: "from-rose-500 to-pink-600", glow: "shadow-rose-500/25" },
    { icon: Music, label: "Music", color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
    { icon: Tv, label: "OTT", color: "from-blue-500 to-cyan-600", glow: "shadow-blue-500/25" },
    { icon: Tv, label: "TV", color: "from-indigo-500 to-blue-600", glow: "shadow-indigo-500/25" },
    { icon: Youtube, label: "YouTube", color: "from-red-500 to-orange-600", glow: "shadow-red-500/25" },
    { icon: Gamepad2, label: "Gaming", color: "from-emerald-500 to-teal-600", glow: "shadow-emerald-500/25" },
    { icon: Lightbulb, label: "Social", color: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/25" },
    { icon: Sparkles, label: "App Dev", color: "from-purple-500 to-pink-600", glow: "shadow-purple-500/25" },
  ];

  const features = [
    {
      icon: MessageCircle,
      title: "Share Weekly Opinions",
      description: "One authentic opinion per category, weekly. Shape entertainment's future with your unique perspective.",
      color: "from-blue-500 to-indigo-600",
      step: "01"
    },
    {
      icon: Radio,
      title: "InphroSync Daily Pulse",
      description: "3 quick daily questions. Build streaks, earn badges, see how you compare globally.",
      color: "from-violet-500 to-purple-600",
      step: "02"
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Analytics",
      description: "Advanced demographic insights, location-based trends, and real-time audience preferences.",
      color: "from-amber-500 to-orange-600",
      step: "03"
    },
    {
      icon: Target,
      title: "Your Turn Feature",
      description: "Win time slots to ask YOUR question. Shape what the community discusses next.",
      color: "from-emerald-500 to-teal-600",
      step: "04"
    },
  ];

  const stats = [
    { value: "8", label: "Categories", icon: Layers },
    { value: "8", label: "User Types", icon: Users },
    { value: "Live", label: "Analytics", icon: BarChart3 },
    { value: "24/7", label: "Active", icon: Radio },
  ];

  // Real reviews will be fetched from database

  const privacyFeatures = [
    { icon: Eye, title: "Anonymous Insights", desc: "Your opinions shape trends without revealing identity" },
    { icon: Lock, title: "Data Security", desc: "Enterprise-grade encryption protects your data" },
    { icon: Shield, title: "Privacy First", desc: "We never sell your personal information" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Ultra-Premium Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
        
        {/* Cinematic light beams */}
        <motion.div 
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, hsl(var(--accent) / 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            y: [0, -30, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        
        {/* Subtle animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10 pt-16">
        <Navbar />
        
        {/* Hero Section - Premium Data Dashboard */}
        <LiveDataHero />

        {/* How It Works - Premium Steps */}
        <section className="py-28 md:py-36 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-6"
              >
                <Badge className="px-5 py-2.5 bg-accent/10 text-accent border-accent/20 font-semibold">
                  <Sparkles className="w-4 h-4 mr-2" />
                  How It Works
                </Badge>
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black">
                Four Steps to <span className="text-gradient">Impact</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
                Real-time audience intelligence powered by authentic opinions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  {/* Connection line */}
                  {index < features.length - 1 && (
                    <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                  )}
                  
                  <div className="relative h-full p-8 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl">
                    {/* Step number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl">
                      <span className="text-lg font-black text-primary-foreground">{feature.step}</span>
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 mt-4`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold font-display mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Real Testimonials Section */}
        <RealTestimonials />

        {/* Vision Section - Premium Design */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className="relative p-12 md:p-20 rounded-[2.5rem] bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-2xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Premium decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <motion.div 
                  className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />
                <motion.div 
                  className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-3xl"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                />
                
                <div className="relative z-10 text-center">
                  <motion.div
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-10 shadow-2xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Award className="w-12 h-12 text-primary-foreground" />
                  </motion.div>
                  
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-black mb-8">
                    Wisdom Guided by{" "}
                    <span className="text-gradient">Real Human Insight</span>
                  </h2>
                  
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <motion.span
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      Our Philosophy
                    </span>
                    <motion.span
                      className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-primary"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </div>
                  
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                    We believe the best entertainment insights come from real people, not algorithms. 
                    Every opinion shared contributes to a collective intelligence that benefits 
                    creators, studios, and audiences alike.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="py-24 md:py-32 relative">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 px-5 py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Promise
              </Badge>
              <h2 className="text-4xl md:text-5xl font-display font-black">
                Your Privacy, <span className="text-gradient">Protected</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {privacyFeatures.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative p-10 rounded-3xl bg-background/60 backdrop-blur-xl border border-border/50 hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-2xl text-center h-full">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <item.icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Ultra Premium */}
        <section className="py-28 md:py-36 relative">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative p-12 md:p-24 rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-2xl border border-primary/20 shadow-2xl overflow-hidden">
                {/* Animated background effects */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-[150px]"
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                  transition={{ duration: 15, repeat: Infinity }}
                />
                
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-8"
                  >
                    <Heart className="w-16 h-16 mx-auto text-primary" />
                  </motion.div>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-8">
                    Ready to Shape the Future of{" "}
                    <span className="text-gradient">Entertainment?</span>
                  </h2>
                  
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                    Join thousands of entertainment enthusiasts who are already making their voices heard.
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-block relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                    <Button 
                      size="lg" 
                      className="relative text-xl px-16 py-10 rounded-2xl font-black bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-2xl"
                      onClick={() => navigate("/auth")}
                    >
                      Get Started Free
                      <ChevronRight className="w-6 h-6 ml-3" />
                    </Button>
                  </motion.div>
                  
                  <p className="text-sm text-muted-foreground mt-6">
                    Free for audience members • Creator plans coming soon
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2 max-w-md mx-auto">
                    By signing up, you agree to our Terms and acknowledge Inphrone's™ proprietary ownership 
                    of its brand and algorithms.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
};

export default Landing;
