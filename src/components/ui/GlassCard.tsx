import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  variant?: "default" | "elevated" | "interactive" | "glow";
  gradient?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", gradient = false, children, ...props }, ref) => {
    const variants = {
      default: "glass-card",
      elevated: "glass-card shadow-xl",
      interactive: "glass-card cursor-pointer group",
      glow: "glass-card shadow-glow",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 relative overflow-hidden",
          variants[variant],
          gradient && "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-accent/5 before:pointer-events-none",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };