import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  Activity, Zap, Brain, Hexagon, Cpu, Layers, Sparkles, Users,
  TrendingUp, BarChart3, Globe, MessageSquare, ThumbsUp, Eye,
  Radar, Signal, Radio, Network, CircuitBoard, Orbit, Atom,
  Shield, Lock, ArrowRight, Play, Wifi
} from "lucide-react";
import { cn } from "@/lib/utils";

// ================== ULTRA-PREMIUM BACKGROUND EFFECTS ==================

// Animated circuit board background
export const CircuitBackground = ({ className }: { className?: string }) => {
  const paths = useMemo(() => [
    "M0,20 H40 L50,30 H100",
    "M0,40 H30 L40,50 H60 L70,40 H100",
    "M0,60 H20 L30,70 H80 L90,60 H100",
    "M0,80 H50 L60,90 H100",
    "M20,0 V30 L30,40 V70",
    "M50,0 V20 L60,30 V50 L70,60 V100",
    "M80,0 V40 L70,50 V80",
  ], []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="circuitGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Static circuit lines */}
        {paths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="0.15" />
        ))}
        
        {/* Animated energy pulses */}
        {paths.map((d, i) => (
          <motion.circle
            key={`pulse-${i}`}
            r="0.8"
            fill="hsl(var(--primary))"
            style={{ filter: "blur(0.3px)" }}
          >
            <animateMotion
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
              path={d}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </motion.circle>
        ))}
        
        {/* Junction nodes */}
        {[
          { x: 40, y: 20 }, { x: 50, y: 30 }, { x: 30, y: 40 },
          { x: 60, y: 50 }, { x: 70, y: 40 }, { x: 20, y: 60 },
          { x: 80, y: 60 }, { x: 50, y: 80 }, { x: 60, y: 90 },
        ].map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r="1"
            fill="hsl(var(--primary))"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </svg>
    </div>
  );
};

// Floating holographic orbs
export const HolographicOrbs = ({ className }: { className?: string }) => {
  const orbs = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 60 + Math.random() * 100,
      x: 10 + (i * 15) + Math.random() * 10,
      y: 20 + Math.random() * 60,
      duration: 8 + Math.random() * 4,
      delay: i * 0.5,
    })), []
  );

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: `radial-gradient(ellipse at 30% 30%, 
              hsl(var(--primary) / 0.15) 0%, 
              hsl(var(--accent) / 0.08) 40%, 
              transparent 70%)`,
            border: "1px solid hsl(var(--primary) / 0.1)",
            backdropFilter: "blur(1px)",
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// ================== PREMIUM DATA VISUALIZATION COMPONENTS ==================

// 3D-like rotating data sphere
export const DataSphere = ({ value, max, size = 120 }: { value: number; max: number; size?: number }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Orbital rings */}
      {[0, 60, 120].map((rotation, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-primary/20"
          style={{
            transform: `rotateX(60deg) rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateZ: 360 }}
          transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
        />
      ))}
      
      {/* Core sphere */}
      <motion.div
        className="absolute inset-4 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, 
            hsl(var(--primary) / 0.8) 0%, 
            hsl(var(--primary) / 0.4) 50%, 
            hsl(var(--primary) / 0.1) 100%)`,
          boxShadow: `0 0 30px hsl(var(--primary) / 0.3), 
                      inset 0 0 20px hsl(var(--primary) / 0.2)`,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-center">
          <span className="text-2xl font-black text-white">{Math.round(percentage)}%</span>
        </div>
      </motion.div>
      
      {/* Floating data particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary"
          style={{
            left: "50%",
            top: "50%",
            boxShadow: "0 0 6px hsl(var(--primary))",
          }}
          animate={{
            x: [0, Math.cos(i * 45 * Math.PI / 180) * 50, 0],
            y: [0, Math.sin(i * 45 * Math.PI / 180) * 50, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}
    </motion.div>
  );
};

// Real-time pulse indicator with multiple rings
export const LivePulseAdvanced = ({ 
  label = "LIVE", 
  count,
  color = "emerald" 
}: { 
  label?: string; 
  count?: number;
  color?: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="relative">
      {/* Multiple expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={`absolute inset-0 rounded-full bg-${color}-500`}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 2,
            delay: i * 0.6,
            repeat: Infinity,
          }}
        />
      ))}
      <span className={`relative flex h-3 w-3 rounded-full bg-${color}-500 shadow-lg`} 
            style={{ boxShadow: `0 0 10px hsl(var(--${color === 'emerald' ? 'primary' : color}))` }} 
      />
    </div>
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold text-${color}-500 tracking-wider`}>{label}</span>
      {count !== undefined && (
        <motion.span 
          className={`text-xs font-mono text-${color}-400 bg-${color}-500/10 px-2 py-0.5 rounded-full`}
          key={count}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {count}
        </motion.span>
      )}
    </div>
  </div>
);

// Premium holographic card with depth effect
export const HolographicCardPremium = ({
  children,
  className,
  glowColor = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setMousePos({ x: 50, y: 50 });
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-card/95 to-card/80",
        "border border-border/50 hover:border-primary/30",
        "backdrop-blur-xl shadow-xl",
        "transition-all duration-300",
        className
      )}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
    >
      {/* Holographic shimmer */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, 
            hsl(var(--${glowColor}) / 0.2) 0%, 
            transparent 50%)`,
        }}
      />
      
      {/* Edge glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px hsl(var(--${glowColor}) / 0.1)`,
        }}
      />
      
      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsl(var(--primary) / 0.03) 2px,
            hsl(var(--primary) / 0.03) 4px
          )`,
        }}
        animate={{ backgroundPositionY: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

// Advanced metric display with animation
export const MetricDisplayAdvanced = ({
  label,
  value,
  icon: Icon,
  gradient,
  suffix = "",
  trend,
  isBlurred = false,
  isLive = false,
}: {
  label: string;
  value: number;
  icon: any;
  gradient: string;
  suffix?: string;
  trend?: number;
  isBlurred?: boolean;
  isLive?: boolean;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isBlurred) return;
    const duration = 2000;
    const increment = value / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, isBlurred]);

  return (
    <HolographicCardPremium className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="relative">
          {/* Rotating border */}
          <motion.div
            className="absolute -inset-1 rounded-xl"
            style={{
              background: `conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.3), transparent)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div className={cn("relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg", `bg-gradient-to-br ${gradient}`)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLive && <LivePulseAdvanced label="" />}
          {trend !== undefined && !isBlurred && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
            >
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500">+{trend}%</span>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className={cn("transition-all", isBlurred && "blur-md select-none")}>
        <motion.p 
          className="text-3xl md:text-4xl font-black tracking-tight font-display"
          key={displayValue}
        >
          {displayValue.toLocaleString()}{suffix}
        </motion.p>
      </div>
      <p className="text-sm text-muted-foreground mt-2 font-medium">{label}</p>
    </HolographicCardPremium>
  );
};

// Neural network with data flow
export const NeuralNetworkAdvanced = ({ className }: { className?: string }) => {
  const layers = [
    [{ x: 15, y: 25 }, { x: 15, y: 50 }, { x: 15, y: 75 }],
    [{ x: 35, y: 20 }, { x: 35, y: 40 }, { x: 35, y: 60 }, { x: 35, y: 80 }],
    [{ x: 55, y: 30 }, { x: 55, y: 50 }, { x: 55, y: 70 }],
    [{ x: 75, y: 35 }, { x: 75, y: 55 }, { x: 75, y: 75 }],
    [{ x: 90, y: 50 }],
  ];

  return (
    <div className={cn("relative w-full h-40", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Connections with animated pulses */}
        {layers.slice(0, -1).map((layer, li) =>
          layer.map((node, ni) => {
            // Safety check for node coordinates
            if (!node || node.x === undefined || node.y === undefined) return null;
            return layers[li + 1].map((nextNode, nni) => {
              // Safety check for nextNode coordinates
              if (!nextNode || nextNode.x === undefined || nextNode.y === undefined) return null;
              return (
                <g key={`conn-${li}-${ni}-${nni}`}>
                  <line
                    x1={node.x}
                    y1={node.y}
                    x2={nextNode.x}
                    y2={nextNode.y}
                    stroke="hsl(var(--primary) / 0.15)"
                    strokeWidth="0.3"
                  />
                  <motion.circle
                    r="0.8"
                    fill="hsl(var(--primary))"
                    filter="url(#glow)"
                    initial={{ opacity: 0, cx: node.x, cy: node.y }}
                    animate={{
                      cx: [node.x, nextNode.x],
                      cy: [node.y, nextNode.y],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: (li * 0.4) + (ni * 0.1) + (nni * 0.05),
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                </g>
              );
            });
          })
        )}
        
        {/* Nodes */}
        {layers.map((layer, li) =>
          layer.map((node, ni) => {
            // Safety check for node coordinates
            if (!node || node.x === undefined || node.y === undefined) return null;
            return (
              <motion.circle
                key={`node-${li}-${ni}`}
                cx={node.x}
                cy={node.y}
                r={li === 4 ? 4 : 2.5}
                fill="hsl(var(--primary))"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  delay: li * 0.3 + ni * 0.1,
                  repeat: Infinity,
                }}
              />
            );
          })
        )}
      </svg>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[9px] text-muted-foreground/70 font-mono">
        <span>INPUT</span>
        <span>PROCESSING</span>
        <span>OUTPUT</span>
      </div>
    </div>
  );
};

// Live activity stream with premium styling
export const LiveActivityStream = ({ 
  activities,
  isBlurred = false,
}: { 
  activities: Array<{
    id: string;
    type: string;
    category?: string;
    userType: string;
    time: Date;
  }>;
  isBlurred?: boolean;
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "opinion": return MessageSquare;
      case "upvote": return ThumbsUp;
      case "view": return Eye;
      default: return Activity;
    }
  };

  return (
    <div className={cn("space-y-2", isBlurred && "blur-sm")}>
      <AnimatePresence mode="popLayout">
        {activities.slice(0, 5).map((activity, i) => {
          const Icon = getIcon(activity.type);
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30 backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {activity.userType} {activity.type === "opinion" ? "shared" : "engaged"} in {activity.category || "Entertainment"}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{getTimeAgo(activity.time)}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Active users with presence visualization
export const ActiveUsersDisplay = ({
  count,
  isLive = true,
  isBlurred = false,
}: {
  count: number;
  isLive?: boolean;
  isBlurred?: boolean;
}) => {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    setDisplayCount(count);
  }, [count]);

  return (
    <HolographicCardPremium className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold">Online Now</span>
        </div>
        {isLive && <LivePulseAdvanced label="LIVE" />}
      </div>
      
      <div className={cn("flex items-center gap-4", isBlurred && "blur-md")}>
        {/* User avatars stack */}
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(displayCount, 5) }).map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, hsl(${(i * 60) % 360} 70% 50%), hsl(${(i * 60 + 30) % 360} 70% 40%))`,
                zIndex: 5 - i,
              }}
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Users className="w-3.5 h-3.5 text-white" />
            </motion.div>
          ))}
          {displayCount > 5 && (
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              +{displayCount - 5}
            </motion.div>
          )}
        </div>
        
        {/* Count display */}
        <div>
          <motion.span
            key={displayCount}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-emerald-500"
          >
            {displayCount}
          </motion.span>
          <p className="text-xs text-muted-foreground">active users</p>
        </div>
      </div>
      
      {/* Activity indicator bars */}
      <div className="mt-4 flex gap-0.5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-full bg-emerald-500"
            initial={{ height: 2 }}
            animate={{ 
              height: [2, 4 + Math.random() * 8, 2],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 0.5 + Math.random(),
              delay: i * 0.05,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </HolographicCardPremium>
  );
};

// Category radar visualization
export const CategoryRadarAdvanced = ({
  data,
  isBlurred = false,
}: {
  data: Array<{ name: string; count: number; color: string; icon: any }>;
  isBlurred?: boolean;
}) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className={cn("space-y-3", isBlurred && "blur-sm")}>
      {data.map((cat, i) => {
        const percentage = (cat.count / maxCount) * 100;
        const Icon = cat.icon;

        return (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cat.color}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-sm font-bold">{cat.count}</span>
              </div>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden ml-11">
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{ background: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  }}
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Sign in overlay premium
export const SignInOverlayPremium = ({ onSignIn }: { onSignIn: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="absolute inset-0 z-30 flex items-center justify-center bg-background/95 backdrop-blur-xl rounded-2xl"
  >
    <div className="text-center p-8 max-w-sm">
      <motion.div
        className="relative w-24 h-24 mx-auto mb-6"
        animate={{ 
          boxShadow: [
            "0 0 30px hsl(var(--primary) / 0.3)",
            "0 0 60px hsl(var(--primary) / 0.5)",
            "0 0 30px hsl(var(--primary) / 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Lock className="w-10 h-10 text-white" />
        </div>
      </motion.div>
      
      <h3 className="text-2xl font-black mb-3">Unlock Full Intelligence</h3>
      <p className="text-muted-foreground mb-6">
        Sign in to access real-time analytics, trending insights, and detailed demographic data.
      </p>
      
      <motion.button
        onClick={onSignIn}
        className="w-full py-4 px-6 rounded-xl font-bold text-white relative overflow-hidden group"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          Get Started
          <ArrowRight className="w-5 h-5" />
        </span>
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.5 }}
        />
      </motion.button>
    </div>
  </motion.div>
);
