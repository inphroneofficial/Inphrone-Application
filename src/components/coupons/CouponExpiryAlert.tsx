import { useState, useEffect } from "react";
import { AlertTriangle, Clock, X, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays, format } from "date-fns";

interface Coupon {
  id: string;
  merchant_name?: string;
  expires_at: string;
  coupon_value: number;
  discount_type?: string;
  currency_symbol?: string;
}

interface CouponExpiryAlertProps {
  coupons: Coupon[];
  onViewCoupon?: (couponId: string) => void;
}

export function CouponExpiryAlert({ coupons, onViewCoupon }: CouponExpiryAlertProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Filter coupons expiring within 7 days
  const expiringCoupons = coupons.filter(coupon => {
    const daysLeft = differenceInDays(new Date(coupon.expires_at), new Date());
    return daysLeft >= 0 && daysLeft <= 7 && !dismissed.includes(coupon.id);
  });

  // Sort by expiry date (soonest first)
  const sortedExpiringCoupons = [...expiringCoupons].sort((a, b) => 
    new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
  );

  const dismissCoupon = (couponId: string) => {
    setDismissed(prev => [...prev, couponId]);
  };

  const dismissAll = () => {
    setDismissed(prev => [...prev, ...expiringCoupons.map(c => c.id)]);
  };

  if (sortedExpiringCoupons.length === 0) return null;

  const urgentCount = sortedExpiringCoupons.filter(c => 
    differenceInDays(new Date(c.expires_at), new Date()) <= 2
  ).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="mb-6"
      >
        <div className={`relative overflow-hidden rounded-xl border-2 ${
          urgentCount > 0 
            ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10' 
            : 'border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-amber-500/10'
        }`}>
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              background: [
                'radial-gradient(circle at 0% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 100% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 0% 50%, rgba(251, 146, 60, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <motion.div
                animate={urgentCount > 0 ? { 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1.1, 1]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                className={`p-2 rounded-full ${urgentCount > 0 ? 'bg-orange-500/20' : 'bg-yellow-500/20'}`}
              >
                <AlertTriangle className={`h-5 w-5 ${urgentCount > 0 ? 'text-orange-500' : 'text-yellow-500'}`} />
              </motion.div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  Coupons Expiring Soon
                  <Badge variant="outline" className={`${urgentCount > 0 ? 'bg-orange-500/20 text-orange-500 border-orange-500/30' : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'}`}>
                    {sortedExpiringCoupons.length}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {urgentCount > 0 
                    ? `${urgentCount} coupon${urgentCount > 1 ? 's' : ''} expiring in less than 3 days!`
                    : 'Use them before they expire'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-xs"
              >
                {isMinimized ? 'Expand' : 'Minimize'}
              </Button>
              {sortedExpiringCoupons.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissAll}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Dismiss All
                </Button>
              )}
            </div>
          </div>

          {/* Coupon List */}
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="relative divide-y divide-border/30"
              >
                {sortedExpiringCoupons.slice(0, 5).map((coupon, index) => {
                  const daysLeft = differenceInDays(new Date(coupon.expires_at), new Date());
                  const isUrgent = daysLeft <= 2;
                  
                  return (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors ${
                        isUrgent ? 'bg-orange-500/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${isUrgent ? 'bg-orange-500/20' : 'bg-yellow-500/20'}`}>
                          <Gift className={`h-4 w-4 ${isUrgent ? 'text-orange-500' : 'text-yellow-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {coupon.merchant_name || 'Reward Coupon'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className={isUrgent ? 'text-orange-500 font-semibold' : ''}>
                              {daysLeft === 0 
                                ? 'Expires TODAY!' 
                                : daysLeft === 1 
                                  ? 'Expires tomorrow' 
                                  : `${daysLeft} days left`
                              }
                            </span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{format(new Date(coupon.expires_at), 'MMM dd')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          isUrgent 
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0' 
                            : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0'
                        }`}>
                          {coupon.discount_type === 'percentage' 
                            ? `${coupon.coupon_value}% OFF`
                            : `${coupon.currency_symbol || '₹'}${coupon.coupon_value} OFF`
                          }
                        </Badge>
                        {onViewCoupon && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewCoupon(coupon.id)}
                            className="text-xs"
                          >
                            Use Now
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => dismissCoupon(coupon.id)}
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
                
                {sortedExpiringCoupons.length > 5 && (
                  <div className="p-3 text-center text-sm text-muted-foreground bg-muted/30">
                    <Sparkles className="h-4 w-4 inline-block mr-1" />
                    And {sortedExpiringCoupons.length - 5} more coupon{sortedExpiringCoupons.length - 5 > 1 ? 's' : ''} expiring soon
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
