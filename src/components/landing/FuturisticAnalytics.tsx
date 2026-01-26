import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Zap, Brain, Network, Hexagon, 
  CircuitBoard, Cpu, Radar, Layers, Sparkles,
  TrendingUp, BarChart3, PieChart, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Animated hex grid background
export const HexGridBackground = ({ className }: { className?: string }) => {
  const hexagons = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
      size: 40 + Math.random() * 30,
      x: (i % 6) * 16 + (Math.floor(i / 6) % 2) * 8,
      y: Math.floor(i / 6) * 18,
    })), []
  );

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {hexagons.map((hex) => (
        <motion.div
          key={hex.id}
          className="absolute"
          style={{ left: `${hex.x}%`, top: `${hex.y}%` }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: hex.duration,
            delay: hex.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Hexagon 
            className="text-primary/20" 
            style={{ width: hex.size, height: hex.size }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// Neural network visualization
export const NeuralNetworkViz = ({ className }: { className?: string }) => {
  const nodes = useMemo(() => [
    { id: 1, x: 10, y: 30, layer: 0 },
    { id: 2, x: 10, y: 50, layer: 0 },
    { id: 3, x: 10, y: 70, layer: 0 },
    { id: 4, x: 35, y: 25, layer: 1 },
    { id: 5, x: 35, y: 45, layer: 1 },
    { id: 6, x: 35, y: 65, layer: 1 },
    { id: 7, x: 35, y: 85, layer: 1 },
    { id: 8, x: 60, y: 35, layer: 2 },
    { id: 9, x: 60, y: 55, layer: 2 },
    { id: 10, x: 60, y: 75, layer: 2 },
    { id: 11, x: 85, y: 45, layer: 3 },
    { id: 12, x: 85, y: 65, layer: 3 },
  ], []);

  const connections = useMemo(() => {
    const conns: { from: typeof nodes[0]; to: typeof nodes[0]; delay: number }[] = [];
    nodes.forEach((from) => {
      nodes.filter(n => n.layer === from.layer + 1).forEach((to) => {
        conns.push({ from, to, delay: Math.random() * 2 });
      });
    });
    return conns;
  }, [nodes]);

  return (
    <div className={cn("relative w-full h-32", className)}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Connections */}
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="url(#neuralGradient)"
            strokeWidth="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 3,
              delay: conn.delay,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2.5"
            fill={`hsl(var(--primary))`}
            initial={{ scale: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: node.layer * 0.3,
              repeat: Infinity,
            }}
          />
        ))}
        
        <defs>
          <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center"
        >
          <Brain className="w-5 h-5 text-primary" />
        </motion.div>
      </div>
    </div>
  );
};

// Data stream visualization
export const DataStreamViz = ({ className, intensity = 5 }: { className?: string; intensity?: number }) => {
  const particles = useMemo(() => 
    Array.from({ length: intensity * 6 }, (_, i) => ({
      id: i,
      delay: (i * 0.3) % 3,
      duration: 2 + Math.random(),
      y: 10 + (i % 5) * 20,
      size: 2 + Math.random() * 3,
    })), [intensity]
  );

  return (
    <div className={cn("relative h-24 w-full overflow-hidden rounded-lg bg-background/50 border border-border/30", className)}>
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-primary/30" style={{ top: `${20 + i * 15}%` }} />
        ))}
      </div>
      
      {/* Data particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-primary to-accent"
          style={{ 
            width: p.size, 
            height: p.size,
            top: `${p.y}%`,
            filter: "blur(0.5px)",
          }}
          initial={{ left: "-5%", opacity: 0 }}
          animate={{ 
            left: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Labels */}
      <div className="absolute bottom-1 left-2 text-[8px] text-muted-foreground/70 font-mono">
        DATA STREAM
      </div>
      <div className="absolute top-1 right-2 flex items-center gap-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="text-[8px] text-emerald-500 font-mono">LIVE</span>
      </div>
    </div>
  );
};

// Radial progress meter
export const RadialMeter = ({ 
  value, 
  max, 
  label, 
  icon: Icon,
  color = "primary",
  size = 100,
}: { 
  value: number; 
  max: number; 
  label: string; 
  icon: any;
  color?: string;
  size?: number;
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`hsl(var(--${color}))`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px hsl(var(--${color}) / 0.5))`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className={`w-5 h-5 mb-1 text-${color}`} style={{ color: `hsl(var(--${color}))` }} />
        <span className="text-lg font-bold">{value.toLocaleString()}</span>
      </div>
      
      <span className="text-xs text-muted-foreground mt-2">{label}</span>
    </div>
  );
};

// Animated stat counter with glow
export const GlowingStat = ({
  value,
  label,
  icon: Icon,
  gradient,
  suffix = "",
  delay = 0,
}: {
  value: number;
  label: string;
  icon: any;
  gradient: string;
  suffix?: string;
  delay?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
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
    }, delay);
    
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute -inset-2 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500",
          `bg-gradient-to-r ${gradient}`
        )} 
      />
      
      {/* Card */}
      <div className="relative p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-border/40 hover:border-primary/30 transition-all">
        {/* Icon with rotating ring */}
        <div className="relative mb-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1 rounded-xl border border-dashed border-primary/20"
          />
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", `bg-gradient-to-br ${gradient}`)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* Value */}
        <p className="text-2xl font-black font-display tracking-tight">
          {displayValue.toLocaleString()}{suffix}
        </p>
        
        {/* Label */}
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        
        {/* Decorative corner */}
        <div className="absolute top-2 right-2 w-8 h-8">
          <div className="absolute top-0 right-0 w-4 h-px bg-primary/30" />
          <div className="absolute top-0 right-0 w-px h-4 bg-primary/30" />
        </div>
      </div>
    </motion.div>
  );
};

// Animated waveform visualization
export const WaveformViz = ({ 
  data, 
  className,
  color = "primary",
}: { 
  data: number[]; 
  className?: string;
  color?: string;
}) => {
  const normalizedData = useMemo(() => {
    const max = Math.max(...data, 1);
    return data.map(v => (v / max) * 100);
  }, [data]);

  return (
    <div className={cn("flex items-end gap-0.5 h-16 w-full", className)}>
      {normalizedData.map((value, i) => (
        <motion.div
          key={i}
          className={cn("flex-1 rounded-t-sm", `bg-${color}`)}
          style={{ 
            background: `linear-gradient(to top, hsl(var(--${color})), hsl(var(--${color}) / 0.5))`,
          }}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(value, 8)}%` }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

// Holographic card effect
export const HolographicCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-card/90 to-card/70",
        "border border-border/40",
        "backdrop-blur-xl",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
    >
      {/* Holographic shimmer */}
      <div
        className="absolute inset-0 opacity-30 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, hsl(var(--primary) / 0.3) 0%, transparent 50%)`,
        }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Circular progress indicator
export const CircularProgress = ({
  segments,
  size = 120,
  strokeWidth = 8,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  
  let cumulativeOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        
        {/* Segments */}
        {segments.map((segment, i) => {
          const percentage = (segment.value / total) * 100;
          const segmentLength = (percentage / 100) * circumference;
          const offset = (cumulativeOffset / 100) * circumference;
          cumulativeOffset += percentage;

          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: -offset }}
              transition={{ duration: 1, delay: i * 0.2, ease: "easeOut" }}
              style={{
                filter: `drop-shadow(0 0 4px ${segment.color}40)`,
              }}
            />
          );
        })}
      </svg>
      
      {/* Center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{total}</span>
        <span className="text-[10px] text-muted-foreground">TOTAL</span>
      </div>
    </div>
  );
};
