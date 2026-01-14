import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Sparkles, 
  ExternalLink, 
  FileText,
  ThumbsUp,
  Clock,
  MapPin,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CouponLogoImage } from "./CouponLogoImage";
import { differenceInDays, differenceInHours, format } from "date-fns";
import { cn } from "@/lib/utils";

interface Coupon {
  id: string;
  pool_id: string;
  code: string;
  merchant_name: string;
  offer_text: string;
  tracking_link: string;
  discount: string;
  discount_type: string;
  logo_url: string;
  expiresAt: string;
  category: string;
  currencyCode: string;
  currencySymbol: string;
  terms_and_conditions?: string;
  is_verified?: boolean;
  thumbs_up?: number;
  thumbs_down?: number;
  country_code?: string;
}

interface CouponRewardCardProps {
  coupon: Coupon;
  isSelected: boolean;
  isClaiming: boolean;
  onSelect: () => void;
  onViewTerms: (e: React.MouseEvent) => void;
}

export function CouponRewardCard({
  coupon,
  isSelected,
  isClaiming,
  onSelect,
  onViewTerms,
}: CouponRewardCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const daysLeft = differenceInDays(new Date(coupon.expiresAt), new Date());
  const hoursLeft = differenceInHours(new Date(coupon.expiresAt), new Date());
  const isExpiringSoon = daysLeft <= 3;
  
  const getValidLink = (link: string): string => {
    if (!link) return '#';
    return link.startsWith('http') ? link : `https://${link}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ scale: isClaiming ? 1 : 1.02 }}
      whileTap={{ scale: isClaiming ? 1 : 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => !isClaiming && onSelect()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border hover:border-primary/50 hover:shadow-lg",
        isClaiming && "opacity-50 cursor-not-allowed",
        coupon.is_verified && "border-green-500/30"
      )}
    >
      {/* Verified Badge Header */}
      {coupon.is_verified && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 py-1.5 px-4 flex items-center gap-2 z-10">
          <Shield className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
            Verified • {coupon.thumbs_up || 0}+ users
          </span>
          <Sparkles className="w-3 h-3 text-green-500 ml-auto animate-pulse" />
        </div>
      )}

      <div className={cn("p-4 sm:p-5", coupon.is_verified && "pt-10")}>
        <div className="flex items-start gap-4">
          {/* Logo with glow effect */}
          <motion.div 
            className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-background to-muted border-2 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-lg",
              isSelected && "border-primary shadow-primary/20",
              coupon.is_verified && "border-green-500/30 shadow-green-500/10"
            )}
            animate={isHovered ? { rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <CouponLogoImage 
              src={coupon.logo_url} 
              alt={coupon.merchant_name}
              className="p-1"
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg line-clamp-1">{coupon.merchant_name}</h3>
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                className={cn(
                  "px-3 py-1.5 rounded-full font-bold text-sm whitespace-nowrap",
                  "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                )}
              >
                {coupon.discount_type === 'percentage' 
                  ? `${coupon.discount}%` 
                  : `${coupon.currencySymbol}${coupon.discount}`} OFF
              </motion.div>
            </div>

            {/* Offer text */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {coupon.offer_text}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {coupon.code && (
                <Badge variant="secondary" className="font-mono">
                  {coupon.code}
                </Badge>
              )}
              
              {coupon.country_code && (
                <Badge variant="outline" className="gap-1">
                  <MapPin className="w-3 h-3" />
                  {coupon.country_code}
                </Badge>
              )}

              {isExpiringSoon ? (
                <Badge variant="destructive" className="gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  {hoursLeft <= 24 ? `${hoursLeft}h` : `${daysLeft}d`} left
                </Badge>
              ) : (
                <span className="text-muted-foreground">
                  Expires {format(new Date(coupon.expiresAt), "MMM dd")}
                </span>
              )}
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewTerms}
                className="gap-1 text-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Terms
              </Button>
              
              <a
                href={getValidLink(coupon.tracking_link)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview
              </a>

              {(coupon.thumbs_up || 0) > 0 && (
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                  {coupon.thumbs_up}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"
          >
            <Check className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      {/* Hover shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
