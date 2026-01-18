import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, 
  Film, 
  Heart,
  Users,
  Lightbulb,
  Target,
  TrendingUp,
  Brain,
  Globe as GlobeIcon,
  Zap,
  Eye,
  Star,
  Rocket,
  Shield,
  Compass,
  ArrowRight,
  Quote,
  CheckCircle2,
  Hexagon,
  Database,
  BarChart3,
  Network,
  Layers,
  Activity,
  Radio,
  Cpu,
  Wifi,
  Lock
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    const incrementTime = (duration * 1000) / end;
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, Math.max(incrementTime, 10));

    return () => clearInterval(timer);
  }, [value, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// Floating data particle
const DataParticle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [y, y - 100],
      x: [x, x + (Math.random() - 0.5) * 50]
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      repeatDelay: 2
    }}
  />
);

// Animated grid line
const GridLine = ({ orientation, position, delay }: { orientation: 'h' | 'v'; position: number; delay: number }) => (
  <motion.div
    className={`absolute ${orientation === 'h' ? 'w-full h-px left-0' : 'h-full w-px top-0'} bg-gradient-to-${orientation === 'h' ? 'r' : 'b'} from-transparent via-primary/20 to-transparent`}
    style={orientation === 'h' ? { top: `${position}%` } : { left: `${position}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.5, 0], scale: [0, 1, 1] }}
    transition={{ duration: 4, delay, repeat: Infinity }}
  />
);

// Hexagon node for network visualization
const HexNode = ({ x, y, size, delay, pulse }: { x: number; y: number; size: number; delay: number; pulse?: boolean }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring" }}
  >
    <motion.div
      className={`relative ${pulse ? 'animate-pulse' : ''}`}
      animate={pulse ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Hexagon 
        className="text-primary/30" 
        style={{ width: size, height: size }}
        fill="currentColor"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/3 h-1/3 rounded-full bg-primary/60" />
      </div>
    </motion.div>
  </motion.div>
);

// Sign-in prompt overlay for About page
const AboutSignInPrompt = ({ onSignIn }: { onSignIn: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-md rounded-xl"
  >
    <div className="text-center p-6 max-w-xs">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-xl">
        <Lock className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-lg font-bold mb-2">Sign in for Full Access</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get detailed live analytics, real-time updates, and platform insights.
      </p>
      <Button onClick={onSignIn} className="w-full bg-gradient-to-r from-primary to-accent">
        Sign In / Sign Up
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  </motion.div>
);

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const [milestones, setMilestones] = useState({
    users: 0,
    opinions: 0,
    countries: 0,
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Parallax transforms
  const heroY = useTransform(smoothProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scaleProgress = useTransform(smoothProgress, [0, 0.5], [1, 0.95]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      // If not authenticated, show sign-in prompt after 10 seconds
      if (!session) {
        const timer = setTimeout(() => {
          setShowSignInPrompt(true);
        }, 10000);
        return () => clearTimeout(timer);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        setShowSignInPrompt(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.title = "About Inphrone — The World's First Audience Intelligence Platform";
    const desc = "Inphrone bridges the gap between audiences and creators, transforming opinions into intelligence — making entertainment more meaningful, human, and relevant.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    const fetchMilestones = async () => {
      try {
        const countsRes = await supabase.functions.invoke('public-platform-counts', { body: {} });
        if (countsRes.error) throw countsRes.error;
        
        const { count: opinionsCount } = await supabase.from('opinions').select('*', { count: 'exact', head: true });
        
        setMilestones({
          users: countsRes.data?.totalUsers ?? 0,
          opinions: opinionsCount || 0,
          countries: countsRes.data?.countriesCount ?? 0,
        });
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, []);

  const dataFlowSteps = [
    { icon: Users, label: "Audiences Share", description: "Opinions & Preferences", color: "from-blue-500 to-cyan-500" },
    { icon: Database, label: "Data Aggregation", description: "Anonymized & Structured", color: "from-violet-500 to-purple-500" },
    { icon: Brain, label: "AI Analysis", description: "Pattern Recognition", color: "from-primary to-pink-500" },
    { icon: BarChart3, label: "Insights Generated", description: "Actionable Intelligence", color: "from-emerald-500 to-teal-500" },
    { icon: Film, label: "Creators Act", description: "Data-Driven Decisions", color: "from-amber-500 to-orange-500" },
  ];

  const principles = [
    { icon: Shield, title: "Privacy First", description: "Anonymized insights, never individual tracking", stat: "100%", statLabel: "Anonymous" },
    { icon: Network, title: "Connected Intelligence", description: "Global network of audience voices", stat: `${milestones.countries}+`, statLabel: "Countries" },
    { icon: Layers, title: "Multi-Dimensional", description: "Across entertainment categories", stat: "8", statLabel: "Categories" },
    { icon: Activity, title: "Real-Time Pulse", description: "Live entertainment sentiment", stat: "24/7", statLabel: "Active" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden pt-16">
      <Navbar />
      
      {/* Hero Section - Futuristic Data Visualization */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-4">
        {/* Animated background grid */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Perspective grid floor */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center top'
            }}
          />
          
          {/* Floating hexagon network */}
          <div className="absolute inset-0">
            <HexNode x={10} y={20} size={40} delay={0.2} />
            <HexNode x={85} y={15} size={30} delay={0.4} />
            <HexNode x={20} y={70} size={35} delay={0.6} />
            <HexNode x={75} y={65} size={45} delay={0.8} pulse />
            <HexNode x={50} y={85} size={25} delay={1} />
            <HexNode x={5} y={50} size={28} delay={1.2} />
            <HexNode x={92} y={45} size={32} delay={1.4} />
          </div>

          {/* Connection lines between nodes */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <motion.line 
              x1="12%" y1="22%" x2="22%" y2="72%" 
              stroke="hsl(var(--primary))" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1 }}
            />
            <motion.line 
              x1="87%" y1="17%" x2="77%" y2="67%" 
              stroke="hsl(var(--accent))" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.5 }}
            />
            <motion.line 
              x1="22%" y1="72%" x2="52%" y2="87%" 
              stroke="hsl(var(--primary))" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 2 }}
            />
          </svg>

          {/* Data particles */}
          {[...Array(12)].map((_, i) => (
            <DataParticle 
              key={i} 
              delay={i * 0.3} 
              x={Math.random() * 100} 
              y={50 + Math.random() * 40} 
            />
          ))}

          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background" />
        </div>
        
        {/* Hero content */}
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 inline-flex"
            >
              <Badge className="px-6 py-3 text-sm bg-primary/10 border-primary/30 text-primary backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Cpu className="w-4 h-4" />
                </motion.div>
                Audience Intelligence Platform
              </Badge>
            </motion.div>
            
            {/* Main headline with glitch effect */}
            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight mb-8 relative"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="block text-foreground mb-2">Bridging</span>
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
                  Creators & Audiences
                </span>
                {/* Scan line effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent"
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              We're building the infrastructure that connects creative vision with collective human desire.
            </motion.p>
            
            {/* Live Data Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="relative max-w-4xl mx-auto"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />
              
              {/* Dashboard card */}
              <Card className="relative p-8 bg-card/80 backdrop-blur-xl border-2 border-primary/10 overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                
                {/* Sign-in prompt overlay for non-authenticated users */}
                <AnimatePresence>
                  {showSignInPrompt && !isAuthenticated && (
                    <AboutSignInPrompt onSignIn={() => navigate('/auth')} />
                  )}
                </AnimatePresence>
                
                {/* Header bar */}
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-emerald-500"
                    />
                    <span className="text-sm font-mono text-muted-foreground">LIVE DATA STREAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-mono text-emerald-500">CONNECTED</span>
                  </div>
                </div>
                
                {/* Stats grid */}
                <div className={`grid md:grid-cols-3 gap-8 transition-all duration-500 ${showSignInPrompt && !isAuthenticated ? 'blur-md pointer-events-none' : ''}`}>
                  {[
                    { value: milestones.users, label: "Active Users", icon: Users, trend: "+12%" },
                    { value: milestones.opinions, label: "Opinions Captured", icon: Radio, trend: "+8%" },
                    { value: milestones.countries, label: "Countries", icon: GlobeIcon, trend: "+3" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.15 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative p-4 text-center">
                        <stat.icon className="w-6 h-6 mx-auto mb-3 text-primary/60" />
                        <p className="text-4xl md:text-5xl font-black text-foreground mb-1 font-mono">
                          <AnimatedCounter value={stat.value} duration={2} />
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                        <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                          {stat.trend}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Animated progress bars */}
                <div className={`mt-8 space-y-3 transition-all duration-500 ${showSignInPrompt && !isAuthenticated ? 'blur-md pointer-events-none' : ''}`}>
                  {['Film & Cinema', 'Music & Audio', 'Gaming'].map((category, i) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8 + i * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-xs font-mono text-muted-foreground w-24 truncate">{category}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-gradient-to-r from-primary to-pink-500' :
                            i === 1 ? 'bg-gradient-to-r from-accent to-cyan-400' :
                            'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${60 + i * 15}%` }}
                          transition={{ delay: 2 + i * 0.2, duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-xs font-mono text-foreground w-12 text-right">{60 + i * 15}%</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-1.5 backdrop-blur-sm">
            <motion.div 
              className="w-1.5 h-3 rounded-full bg-primary"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Data Flow Visualization Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 px-5 py-2.5 bg-accent/10 text-accent border-accent/20">
              <Activity className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black mb-6">
              The Intelligence <span className="text-gradient">Pipeline</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From raw opinions to actionable insights in real-time
            </p>
          </motion.div>

          {/* Horizontal flow visualization */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connection line */}
            <motion.div 
              className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/40 to-primary/20 -translate-y-1/2 hidden md:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
            />
            
            <div className="grid md:grid-cols-5 gap-6 md:gap-4">
              {dataFlowSteps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative group"
                >
                  <Card className="p-6 bg-card/80 backdrop-blur border-2 border-transparent hover:border-primary/20 transition-all duration-500 h-full">
                    {/* Step number */}
                    <motion.div
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg"
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring" }}
                    >
                      {i + 1}
                    </motion.div>
                    
                    <motion.div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring" }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-lg font-bold text-center mb-2">{step.label}</h3>
                    <p className="text-sm text-muted-foreground text-center">{step.description}</p>
                  </Card>
                  
                  {/* Arrow indicator for desktop */}
                  {i < dataFlowSteps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute top-1/2 -right-5 text-primary/40"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section with Parallax */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          {/* Animated orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
            style={{ left: '10%', top: '20%' }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-accent/10 blur-3xl"
            animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            style={{ right: '10%', bottom: '20%' }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <Quote className="w-20 h-20 mx-auto text-primary/20 mb-8" />
            </motion.div>
            
            <blockquote className="text-3xl md:text-5xl font-display font-bold leading-tight mb-8">
              "When audiences express what truly resonates, and creators listen, something powerful happens — 
              <motion.span 
                className="text-gradient inline-block"
                whileInView={{ scale: [0.95, 1.05, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {" "}content becomes relevant, human, and purposeful again.
              </motion.span>"
            </blockquote>
            
            <p className="text-lg text-muted-foreground">The Inphrone Philosophy</p>
          </motion.div>
        </div>
      </section>

      {/* Principles Grid - Tech Dashboard Style */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-6 px-5 py-2.5 bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4 mr-2" />
              Core Principles
            </Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black">
              What We <span className="text-gradient">Stand For</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="p-8 h-full bg-card/60 backdrop-blur border-2 border-transparent hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                  {/* Background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Stat display */}
                  <div className="absolute top-4 right-4">
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary">{principle.stat}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{principle.statLabel}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <motion.div 
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8 }}
                    >
                      <principle.icon className="w-7 h-7 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{principle.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section - Futuristic CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          {/* Animated grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Badge className="px-5 py-2.5 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  <Target className="w-4 h-4 mr-2" />
                  Our Vision
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-display font-black leading-tight">
                  A Future Where <span className="text-gradient">Every Voice Shapes</span> Entertainment
                </h2>
                
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We envision a world where the gap between creators and audiences disappears. Where entertainment 
                  decisions are guided by collective human insight, not algorithms or assumptions.
                </p>
                
                <ul className="space-y-4 pt-4">
                  {[
                    "Content that resonates on a human level",
                    "Creators empowered with real audience intelligence",
                    "Audiences who feel truly heard and valued",
                    "An entertainment ecosystem that serves people"
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ type: "spring" }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      </motion.div>
                      <span className="text-foreground">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Animated glow */}
                <motion.div 
                  className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-2xl"
                  animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <Card className="relative p-10 bg-card/90 backdrop-blur-xl border-2 text-center overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary via-accent to-primary p-1">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                        <GlobeIcon className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-4 relative">People-Powered Entertainment</h3>
                  <p className="text-muted-foreground mb-8 relative">
                    When creators and audiences connect through understanding, 
                    the future of entertainment becomes truly human.
                  </p>
                  
                  <Button 
                    size="lg"
                    onClick={() => navigate('/auth')}
                    className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-2"
                    >
                      Join the Movement
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default About;