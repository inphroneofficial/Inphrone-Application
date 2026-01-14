import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown, 
  Shield, 
  Clock,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, differenceInHours } from "date-fns";
import { CouponLogoImage } from "./CouponLogoImage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CouponCardProps {
  coupon: {
    id: string;
    pool_coupon_id?: string;
    coupon_type: string;
    coupon_code?: string;
    coupon_value: number;
    merchant_name?: string;
    merchant_link?: string;
    usage_instructions?: string;
    currency_code?: string;
    description?: string;
    logo_url?: string;
    discount_type?: string;
    expires_at: string;
    status: string;
    terms_and_conditions?: string;
    is_verified?: boolean;
    thumbs_up?: number;
    thumbs_down?: number;
    user_feedback?: boolean | null;
  };
  onCopy: (code: string | undefined, id: string) => void;
  copiedId: string | null;
  onMarkAsUsed: (id: string) => void;
  onViewDetails: (coupon: any) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function CouponCard({
  coupon,
  onCopy,
  copiedId,
  onMarkAsUsed,
  onViewDetails,
  isFavorite,
  onToggleFavorite,
}: CouponCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(coupon.user_feedback ?? null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const daysLeft = differenceInDays(new Date(coupon.expires_at), new Date());
  const hoursLeft = differenceInHours(new Date(coupon.expires_at), new Date());
  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;
  const isExpiringVeryFast = hoursLeft <= 24 && hoursLeft > 0;
  const currencySymbol = coupon.currency_code === 'USD' ? '$' : '₹';

  const handleFeedback = async (isHelpful: boolean) => {
    if (feedbackGiven !== null || submittingFeedback) return;
    
    setSubmittingFeedback(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to provide feedback");
        return;
      }

      // Insert feedback
      const { error } = await supabase.from("coupon_feedback").insert({
        user_id: user.id,
        claimed_coupon_id: coupon.id,
        pool_coupon_id: coupon.pool_coupon_id || null,
        is_helpful: isHelpful,
      });

      if (error) throw error;

      // Update user's coupon record
      await supabase
        .from("coupons")
        .update({ 
          user_feedback: isHelpful,
          feedback_given_at: new Date().toISOString()
        })
        .eq("id", coupon.id);

      setFeedbackGiven(isHelpful);
      toast.success(isHelpful ? "Thanks for the feedback!" : "Sorry it didn't work. We'll review this coupon.");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getValidLink = (link: string | undefined): string => {
    if (!link) return '#';
    return link.startsWith('http') ? link : `https://${link}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border-2",
        isExpiringSoon && "border-orange-500/50 shadow-orange-500/20 shadow-lg",
        coupon.is_verified && "border-green-500/30 shadow-green-500/10 shadow-md",
        coupon.status === "used" && "opacity-60"
      )}>
        {/* Verified/Trust Badge Header */}
        {coupon.is_verified && (
          <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 px-4 py-2 flex items-center gap-2 border-b border-green-500/20">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Verified by {coupon.thumbs_up || 0}+ users
            </span>
            <Sparkles className="w-3 h-3 text-green-500 ml-auto animate-pulse" />
          </div>
        )}

        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Logo */}
            <motion.div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-background to-muted border-2 border-border flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg"
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              <CouponLogoImage 
                src={coupon.logo_url}
                alt={coupon.merchant_name || coupon.coupon_type}
                className="p-1"
              />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3 w-full">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl truncate">
                    {coupon.merchant_name || coupon.coupon_type}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge className={cn(
                      "text-white border-0 font-bold",
                      coupon.status === "active" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                        : coupon.status === "used"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                        : "bg-gradient-to-r from-gray-500 to-gray-600"
                    )}>
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.coupon_value}% OFF` 
                        : `${currencySymbol}${coupon.coupon_value} OFF`}
                    </Badge>
                    
                    {isExpiringVeryFast ? (
                      <Badge variant="destructive" className="animate-pulse gap-1">
                        <Clock className="w-3 h-3" />
                        {hoursLeft}h left!
                      </Badge>
                    ) : isExpiringSoon ? (
                      <Badge variant="destructive" className="animate-pulse gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {daysLeft} days left
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(coupon.expires_at), "MMM dd")}</span>
                </div>
              </div>

              {/* Description */}
              {coupon.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {coupon.description}
                </p>
              )}

              {/* Coupon Code Box */}
              {coupon.coupon_code && coupon.status === "active" && (
                <motion.div 
                  className="flex items-center gap-2 p-3 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-dashed border-primary/30 rounded-xl"
                  whileHover={{ borderColor: "hsl(var(--primary))" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Code</p>
                    <p className="font-mono font-bold text-primary text-lg tracking-widest truncate">
                      {coupon.coupon_code}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onCopy(coupon.coupon_code, coupon.id)}
                    className={cn(
                      "gap-1.5 transition-all",
                      copiedId === coupon.id && "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    {copiedId === coupon.id ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* How to Use - Expandable */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    How to Use
                  </span>
                  {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>

                <AnimatePresence>
                  {showInstructions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 p-4 bg-muted/30 rounded-xl border">
                        {/* Step-by-step instructions */}
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                            <p className="text-sm">Click "Copy Code" to copy the coupon code</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                            <p className="text-sm">Click "Go to Store" to visit the merchant (required to activate discount)</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                            <p className="text-sm">Paste the code at checkout to get your discount</p>
                          </div>
                        </div>

                        {/* Warning */}
                        <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            <strong className="text-amber-600 dark:text-amber-400">Important:</strong> This coupon may only work if you visit the store through our link. Click the button below to ensure the discount applies.
                          </p>
                        </div>

                        {/* Terms */}
                        {coupon.terms_and_conditions && (
                          <div className="text-xs text-muted-foreground">
                            <p className="font-medium mb-1">Terms:</p>
                            <p className="line-clamp-3">{coupon.terms_and_conditions}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {coupon.merchant_link && coupon.status === "active" && (
                  <Button
                    size="sm"
                    asChild
                    className="gap-1.5 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <a
                      href={getValidLink(coupon.merchant_link)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Go to Store
                    </a>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(coupon)}
                >
                  View Details
                </Button>

                {coupon.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsUsed(coupon.id)}
                    className="text-muted-foreground"
                  >
                    Mark as Used
                  </Button>
                )}
              </div>

              {/* Feedback Section */}
              {coupon.status === "active" && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Was this helpful?</p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackGiven !== null || submittingFeedback}
                      className={cn(
                        "p-2 rounded-full transition-all",
                        feedbackGiven === true 
                          ? "bg-green-500 text-white" 
                          : "bg-muted hover:bg-green-500/20 hover:text-green-500",
                        (feedbackGiven !== null || submittingFeedback) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackGiven !== null || submittingFeedback}
                      className={cn(
                        "p-2 rounded-full transition-all",
                        feedbackGiven === false 
                          ? "bg-red-500 text-white" 
                          : "bg-muted hover:bg-red-500/20 hover:text-red-500",
                        (feedbackGiven !== null || submittingFeedback) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
