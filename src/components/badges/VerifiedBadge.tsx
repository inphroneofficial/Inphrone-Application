import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, Star, Crown, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  type: "verified" | "creator" | "studio" | "top_contributor" | "early_adopter" | "ambassador";
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const badgeConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified",
    description: "Verified account",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  creator: {
    icon: Sparkles,
    label: "Creator",
    description: "Content creator account",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  studio: {
    icon: Shield,
    label: "Studio",
    description: "Official studio account",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  top_contributor: {
    icon: Crown,
    label: "Top Contributor",
    description: "Top 10% contributor this month",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  },
  early_adopter: {
    icon: Star,
    label: "Early Adopter",
    description: "Joined during beta",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10"
  },
  ambassador: {
    icon: Shield,
    label: "Ambassador",
    description: "Campus Ambassador",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  }
};

const sizeConfig = {
  sm: { icon: "w-3 h-3", badge: "text-xs px-1.5 py-0.5" },
  md: { icon: "w-4 h-4", badge: "text-xs px-2 py-1" },
  lg: { icon: "w-5 h-5", badge: "text-sm px-3 py-1.5" }
};

export const VerifiedBadge = ({ type, size = "md", showTooltip = true }: VerifiedBadgeProps) => {
  const config = badgeConfig[type];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const badge = (
    <Badge 
      variant="outline" 
      className={`${sizes.badge} ${config.bgColor} border-0 flex items-center gap-1`}
    >
      <Icon className={`${sizes.icon} ${config.color}`} />
      <span className={config.color}>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Inline verified checkmark (for next to usernames)
export const VerifiedCheck = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const iconSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCircle2 className={`${iconSize} text-blue-500 inline-block ml-1`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified account</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
