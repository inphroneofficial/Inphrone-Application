import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// Haptic feedback utility
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(patterns[type]);
  }
};

// Animated Pulse Orb Component
export const PulseOrb = ({ 
  className,
  color = "primary",
  size = "md",
  delay = 0
}: { 
  className?: string;
  color?: "primary" | "accent" | "cyan" | "purple";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
}) => {
  const colorClasses = {
    primary: "from-primary/30 to-primary/5",
    accent: "from-accent/30 to-accent/5",
    cyan: "from-cyan-500/30 to-cyan-500/5",
    purple: "from-purple-500/30 to-purple-500/5"
  };

  const sizeClasses = {
    sm: "w-32 h-32",
    md: "w-64 h-64",
    lg: "w-96 h-96",
    xl: "w-[500px] h-[500px]"
  };

  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-[100px] bg-gradient-radial pointer-events-none",
        colorClasses[color],
        sizeClasses[size],
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    />
  );
};

// Data Stream Particles
export const DataStream = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Live Counter Animation
export const LiveCounter = ({ 
  value, 
  label,
  icon,
  className 
}: { 
  value: number; 
  label: string;
  icon?: React.ReactNode;
  className?: string;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <motion.div
          className="p-2 rounded-xl bg-primary/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
      )}
      <div>
        <motion.span 
          className="text-2xl font-bold text-foreground"
          key={displayValue}
          initial={{ scale: 1.2, color: "hsl(var(--primary))" }}
          animate={{ scale: 1, color: "hsl(var(--foreground))" }}
          transition={{ duration: 0.3 }}
        >
          {displayValue.toLocaleString()}
        </motion.span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

// Holographic Badge
export const HolographicBadge = ({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "live";
  className?: string;
}) => {
  const variants = {
    default: "from-primary/20 via-accent/20 to-primary/20 border-primary/30",
    success: "from-green-500/20 via-emerald-500/20 to-green-500/20 border-green-500/30",
    warning: "from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-yellow-500/30",
    live: "from-red-500/20 via-pink-500/20 to-red-500/20 border-red-500/30"
  };

  return (
    <motion.div
      className={cn(
        "relative px-4 py-2 rounded-full border backdrop-blur-sm bg-gradient-to-r overflow-hidden",
        variants[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative z-10 text-sm font-medium">{children}</span>
    </motion.div>
  );
};

// Glowing Interactive Card
interface GlowingCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
  glowColor?: string;
  className?: string;
}

export const GlowingCard = forwardRef<HTMLDivElement, GlowingCardProps>(
  ({ children, glowColor = "primary", className, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    return (
      <motion.div
        ref={(node) => {
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-300",
          isHovered && "border-primary/50 shadow-lg",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setIsHovered(true);
          triggerHaptic('light');
        }}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...props}
      >
        {/* Mouse-tracking glow */}
        {isHovered && (
          <motion.div
            className="absolute w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, hsl(var(--${glowColor}) / 0.15), transparent 70%)`,
              left: mousePosition.x - 128,
              top: mousePosition.y - 128,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          animate={{ x: isHovered ? ["0%", "100%"] : "0%" }}
          transition={{ duration: 0.8 }}
        />

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
GlowingCard.displayName = "GlowingCard";

// Radial Chart Component
export const RadialChart = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  label,
  value,
  color = "primary"
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  value?: string | number;
  color?: "primary" | "accent" | "success" | "warning";
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: "stroke-primary",
    accent: "stroke-accent",
    success: "stroke-green-500",
    warning: "stroke-yellow-500"
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          className={colors[color]}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {value !== undefined && (
          <motion.span 
            className="text-xl font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {value}
          </motion.span>
        )}
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
};

// Circuit Background Pattern
export const CircuitBackground = ({ className }: { className?: string }) => (
  <svg className={cn("absolute inset-0 w-full h-full opacity-5 pointer-events-none", className)}>
    <defs>
      <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M0 50h40M60 50h40M50 0v40M50 60v40" stroke="currentColor" strokeWidth="0.5" fill="none" />
        <circle cx="50" cy="50" r="3" fill="currentColor" />
        <circle cx="0" cy="50" r="2" fill="currentColor" />
        <circle cx="100" cy="50" r="2" fill="currentColor" />
        <circle cx="50" cy="0" r="2" fill="currentColor" />
        <circle cx="50" cy="100" r="2" fill="currentColor" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)" />
  </svg>
);

// Energy Lines Background
export const EnergyLines = ({ className }: { className?: string }) => (
  <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        style={{
          top: `${20 + i * 15}%`,
          left: 0,
          right: 0,
        }}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scaleX: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.3,
        }}
      />
    ))}
  </div>
);

// Animated Progress Bar with shimmer
export const AnimatedProgress = ({
  value,
  max = 100,
  className,
  showPercentage = true,
  color = "primary"
}: {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "accent" | "gradient";
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const bgColors = {
    primary: "bg-primary",
    accent: "bg-accent",
    gradient: "bg-gradient-to-r from-primary via-accent to-primary"
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className={cn("absolute inset-y-0 left-0 rounded-full", bgColors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-end">
          <motion.span 
            className="text-xs font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

// Neural Network Mini Animation
export const NeuralNetworkMini = ({ className }: { className?: string }) => (
  <svg className={cn("w-full h-full", className)} viewBox="0 0 100 60">
    {/* Connection lines */}
    {[
      { x1: 15, y1: 15, x2: 50, y2: 10 },
      { x1: 15, y1: 30, x2: 50, y2: 30 },
      { x1: 15, y1: 45, x2: 50, y2: 50 },
      { x1: 50, y1: 10, x2: 85, y2: 30 },
      { x1: 50, y1: 30, x2: 85, y2: 30 },
      { x1: 50, y1: 50, x2: 85, y2: 30 },
    ].map((line, i) => (
      <motion.line
        key={i}
        {...line}
        stroke="hsl(var(--primary) / 0.3)"
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: i * 0.1 }}
      />
    ))}
    {/* Nodes */}
    {[
      { cx: 15, cy: 15 }, { cx: 15, cy: 30 }, { cx: 15, cy: 45 },
      { cx: 50, cy: 10 }, { cx: 50, cy: 30 }, { cx: 50, cy: 50 },
      { cx: 85, cy: 30 }
    ].map((node, i) => (
      <motion.circle
        key={i}
        {...node}
        r="4"
        fill="hsl(var(--primary))"
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ 
          scale: { duration: 2, repeat: Infinity, delay: i * 0.2 },
          default: { delay: 0.5 + i * 0.05 }
        }}
      />
    ))}
  </svg>
);

// Floating particles container
export const FloatingParticles = ({ 
  count = 15,
  className 
}: { 
  count?: number;
  className?: string;
}) => (
  <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 rounded-full bg-primary/40"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, Math.random() * 20 - 10, 0],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);
