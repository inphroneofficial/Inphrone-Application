import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "compact";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default"
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center text-center ${
        isCompact ? "py-8 px-4" : "py-16 px-6"
      }`}
    >
      <div className={`relative ${isCompact ? "mb-3" : "mb-6"}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
        <div className={`relative ${isCompact ? "w-12 h-12" : "w-20 h-20"} rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-2 border-primary/20`}>
          <Icon className={`${isCompact ? "w-6 h-6" : "w-10 h-10"} text-primary`} />
        </div>
      </div>
      
      <h3 className={`font-semibold text-foreground ${isCompact ? "text-base mb-1" : "text-xl mb-2"}`}>
        {title}
      </h3>
      
      <p className={`text-muted-foreground max-w-sm ${isCompact ? "text-sm" : "text-base mb-6"}`}>
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="gradient-primary text-white border-0 shadow-md hover:shadow-lg transition-all mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
