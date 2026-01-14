import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CouponRewardCard } from "@/components/coupons/CouponRewardCard";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface RewardCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

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

const CATEGORY_MAP: Record<string, { name: string; displayName: string; icon: string; preview: string }> = {
  'ott': { name: 'ott', displayName: 'OTT', icon: '📺', preview: 'Netflix, Prime, Disney+' },
  'movies': { name: 'movies', displayName: 'Movies', icon: '🎬', preview: 'BookMyShow, PVR' },
  'electronics': { name: 'electronics', displayName: 'Electronics', icon: '💻', preview: 'Laptops, Phones, Gadgets' },
  'food': { name: 'food', displayName: 'Food', icon: '🍕', preview: 'Swiggy, Zomato, Restaurants' },
  'travel': { name: 'travel', displayName: 'Travel', icon: '✈️', preview: 'Flights, Hotels, Trips' },
  'fashion': { name: 'fashion', displayName: 'Fashion', icon: '👗', preview: 'Fashion, Beauty, Accessories' }
};

export function RewardCouponDialog({ open, onOpenChange, userId }: RewardCouponDialogProps) {
  const [showThanks, setShowThanks] = useState(true);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [refreshRemaining, setRefreshRemaining] = useState(1);
  const [shownCouponIds, setShownCouponIds] = useState<string[]>([]);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [selectedTermsCoupon, setSelectedTermsCoupon] = useState<Coupon | null>(null);
  const [userCountry, setUserCountry] = useState<string>('India');

  useEffect(() => {
    if (open) {
      resetState();
      fetchUserCountry();
      
      const timer = setTimeout(() => {
        setShowThanks(false);
        setShowCategorySelection(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    } else {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setShowThanks(true);
    setShowCategorySelection(false);
    setSelectedCategory(null);
    setSelectedCoupon(null);
    setCoupons([]);
    setClaiming(false);
    setLoading(false);
    setCategoryLocked(false);
    setRefreshRemaining(1);
    setShownCouponIds([]);
  };

  const fetchUserCountry = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile?.country) {
        setUserCountry(profile.country);
      }
    } catch (error) {
      console.error('Error fetching user country:', error);
    }
  };

  const handleCategorySelect = async (category: string) => {
    if (categoryLocked || loading || selectedCategory) return;
    
    setSelectedCategory(category);
    setCategoryLocked(true);
    setLoading(true);
    setShowCategorySelection(false);
    
    await fetchCoupons(category);
  };

  const fetchCoupons = async (category: string, excludeIds: string[] = []) => {
    setLoading(true);
    try {
      const categoryConfig = CATEGORY_MAP[category.toLowerCase()];
      const backendCategory = categoryConfig?.name || category.toLowerCase();

      const { data, error } = await supabase.functions.invoke('fetch-cuelinks-coupons', {
        body: { 
          user_id: userId,
          user_country: userCountry,
          category: backendCategory,
          exclude_ids: excludeIds
        }
      });
      
      if (error) throw error;
      
      if (data?.coupons && data.coupons.length > 0) {
        setCoupons(data.coupons);
        const newIds = data.coupons.map((c: Coupon) => c.pool_id);
        setShownCouponIds(prev => [...prev, ...newIds]);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons. Please try again.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCoupons = async () => {
    if (refreshRemaining <= 0 || !selectedCategory || loading) return;
    
    setRefreshRemaining(0);
    await fetchCoupons(selectedCategory, shownCouponIds);
    toast.success('Coupons refreshed! Here are some new deals.');
  };

  const handleViewTerms = (coupon: Coupon, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTermsCoupon(coupon);
    setTermsDialogOpen(true);
  };

  const handleSelectCoupon = async (coupon: Coupon) => {
    if (claiming || selectedCoupon) return;
    
    setSelectedCoupon(coupon);
    setClaiming(true);

    try {
      const expiresAt = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(coupon.pool_id);

      const insertData: any = {
        user_id: userId,
        coupon_type: coupon.category,
        coupon_code: coupon.code || '',
        coupon_value: parseInt(coupon.discount) || 0,
        merchant_name: coupon.merchant_name,
        merchant_link: coupon.tracking_link,
        usage_instructions: coupon.offer_text,
        description: coupon.offer_text,
        currency_code: coupon.currencyCode,
        logo_url: coupon.logo_url,
        discount_type: coupon.discount_type,
        expires_at: expiresAt.toISOString(),
        status: "active",
        terms_and_conditions: coupon.terms_and_conditions || '',
      };

      if (isValidUUID) {
        insertData.pool_coupon_id = coupon.pool_id;
      }

      const { error } = await supabase.from("coupons").insert(insertData);

      if (error) throw error;

      toast.success(`${coupon.merchant_name} coupon claimed!`, {
        description: `Code: ${coupon.code || 'Check My Coupons'} - Check My Coupons for details`,
      });
      
      resetState();
      onOpenChange(false);
    } catch (error) {
      console.error("Error claiming coupon:", error);
      toast.error("Failed to claim coupon");
      setClaiming(false);
      setSelectedCoupon(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden border-2">
          {/* Animated Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border-b overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Gift className="w-12 h-12 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Claim Your Reward</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a coupon as thanks for your contribution!
                </p>
              </div>
              
              {/* Location Badge */}
              <Badge variant="outline" className="ml-auto gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {userCountry}
              </Badge>
            </div>
          </motion.div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <AnimatePresence mode="wait">
              {/* Thank You Animation */}
              {showThanks && (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center space-y-6 py-16"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 0.8 }}
                  >
                    <Gift className="w-24 h-24 mx-auto text-primary" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <h2 className="text-3xl font-bold">Thank You! 🎉</h2>
                    <p className="text-muted-foreground text-lg">
                      Your opinion matters! Loading your rewards...
                    </p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full max-w-xs mx-auto"
                  />
                </motion.div>
              )}

              {/* Category Selection */}
              {!showThanks && showCategorySelection && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                      <h3 className="text-xl font-bold">Choose Your Category</h3>
                      <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                    <p className="text-muted-foreground">
                      Select a category to see available coupons
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {Object.entries(CATEGORY_MAP).map(([key, category], index) => (
                      <motion.button
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleCategorySelect(key)}
                        disabled={categoryLocked || loading}
                        className="p-5 rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center space-y-2">
                          <motion.div 
                            className="text-4xl"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          >
                            {category.icon}
                          </motion.div>
                          <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {category.displayName}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {category.preview}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Coupon List */}
              {!showThanks && !showCategorySelection && (
                <motion.div
                  key="coupons"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Choose Your Reward</h3>
                      <p className="text-sm text-muted-foreground">
                        Click a coupon to claim it
                      </p>
                    </div>
                    
                    {refreshRemaining > 0 && !loading && coupons.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshCoupons}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh ({refreshRemaining})
                      </Button>
                    )}
                  </div>

                  {loading ? (
                    <motion.div 
                      className="flex flex-col items-center justify-center py-16 space-y-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="w-16 h-16 text-primary animate-spin" />
                      <p className="text-muted-foreground font-medium">Loading amazing deals for you...</p>
                    </motion.div>
                  ) : coupons.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 space-y-4"
                    >
                      <AlertTriangle className="w-16 h-16 mx-auto text-orange-500" />
                      <div>
                        <h4 className="font-bold text-lg">No coupons available</h4>
                        <p className="text-muted-foreground">
                          Try a different category or refresh later
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid gap-4 max-h-[50vh] overflow-y-auto pr-2">
                      {coupons.map((coupon, index) => (
                        <motion.div
                          key={coupon.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <CouponRewardCard
                            coupon={coupon}
                            isSelected={selectedCoupon?.id === coupon.id}
                            isClaiming={claiming}
                            onSelect={() => handleSelectCoupon(coupon)}
                            onViewTerms={(e) => handleViewTerms(coupon, e)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms Dialog */}
      <AlertDialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              {selectedTermsCoupon?.merchant_name} - Terms
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <h4 className="font-semibold">Offer Details</h4>
                  <p className="text-sm">{selectedTermsCoupon?.offer_text}</p>
                  
                  {selectedTermsCoupon?.code && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Code:</span>
                      <Badge variant="secondary" className="font-mono">
                        {selectedTermsCoupon.code}
                      </Badge>
                    </div>
                  )}
                </div>

                {selectedTermsCoupon?.terms_and_conditions && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Terms & Conditions</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTermsCoupon.terms_and_conditions}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    This coupon may only work if you visit the store through our tracking link. Always use the "Go to Store" button.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
