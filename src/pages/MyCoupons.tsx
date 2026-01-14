import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, TrendingUp, Tag, Check, Sparkles, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInDays } from "date-fns";
import { useMerchantFavorites } from "@/hooks/useMerchantFavorites";
import { NavigationControls } from "@/components/NavigationControls";
import { CouponDetailModal } from "@/components/coupons/CouponDetailModal";
import { CouponExpiryAlert } from "@/components/coupons/CouponExpiryAlert";
import { CouponCard } from "@/components/coupons/CouponCard";
import { useLocationDetection } from "@/hooks/useLocationDetection";
import { Skeleton } from "@/components/ui/skeleton";

interface Coupon {
  id: string;
  coupon_type: string;
  coupon_code?: string;
  coupon_value: number;
  merchant_name?: string;
  merchant_link?: string;
  usage_instructions?: string;
  currency_code?: string;
  currency_symbol?: string;
  description?: string;
  logo_url?: string;
  discount_type?: string;
  pool_coupon_id?: string;
  actual_savings?: number;
  expires_at: string;
  status: string;
  created_at: string;
  times_copied?: number;
  used_at?: string;
  terms_and_conditions?: string;
  is_verified?: boolean;
  thumbs_up?: number;
  thumbs_down?: number;
  user_feedback?: boolean | null;
}

export default function MyCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { isFavorite, addFavorite, removeFavorite, getFavoriteId } = useMerchantFavorites();
  const { country, countryCode, loading: locationLoading } = useLocationDetection();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch coupons with pool data for verification status
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          *,
          coupon_pool:pool_coupon_id (
            is_verified,
            thumbs_up,
            thumbs_down
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map pool data to coupon
      const mappedCoupons = (data || []).map((c: any) => ({
        ...c,
        is_verified: c.coupon_pool?.is_verified || false,
        thumbs_up: c.coupon_pool?.thumbs_up || 0,
        thumbs_down: c.coupon_pool?.thumbs_down || 0,
      }));

      setCoupons(mappedCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (code: string | undefined, id: string) => {
    const copyText = code || `COUPON-${id.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(copyText);
    setCopiedId(id);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopiedId(null), 2000);

    try {
      await supabase
        .from("coupons")
        .update({ times_copied: (coupons.find(c => c.id === id)?.times_copied || 0) + 1 })
        .eq("id", id);
      
      trackAnalytics(id, "copied");
    } catch (error) {
      console.error("Error updating copy count:", error);
    }
  };

  const trackAnalytics = async (couponId: string, eventType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("coupon_analytics").insert({
        user_id: user.id,
        coupon_id: couponId,
        event_type: eventType,
      });
    } catch (error) {
      console.error("Error tracking analytics:", error);
    }
  };

  const toggleFavorite = async (merchantName: string, category: string) => {
    if (!merchantName) return;
    
    if (isFavorite(merchantName)) {
      const favoriteId = getFavoriteId(merchantName);
      if (favoriteId) {
        await removeFavorite(favoriteId);
      }
    } else {
      await addFavorite(merchantName, category);
    }
  };

  const handleMarkAsUsed = async (couponId: string) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ 
          status: "used",
          used_at: new Date().toISOString()
        })
        .eq("id", couponId);

      if (error) throw error;

      await trackAnalytics(couponId, "used");
      toast.success("Coupon marked as used!");
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  const openCouponDetail = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailModalOpen(true);
  };

  // Filter coupons
  const activeCoupons = coupons.filter(c => {
    if (c.status !== "active") return false;
    const daysLeft = differenceInDays(new Date(c.expires_at), new Date());
    return daysLeft >= 0;
  });
  
  const usedCoupons = coupons.filter(c => c.status === "used");
  
  const expiredCoupons = coupons.filter(c => {
    if (c.status === "expired") return true;
    if (c.status === "active") {
      const daysLeft = differenceInDays(new Date(c.expires_at), new Date());
      return daysLeft < 0;
    }
    return false;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl pt-20">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-6 max-w-7xl pt-20">
      <NavigationControls showHome={true} showBack={true} />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Gift className="w-8 h-8 text-primary" />
              <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My Coupons
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track your reward coupons
              </p>
            </div>
          </div>
          
          {/* Location Badge */}
          {!locationLoading && country && (
            <Badge variant="outline" className="gap-1.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {country}
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">{activeCoupons.length}</p>
              </div>
              <Tag className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Used</p>
                <p className="text-2xl font-bold text-blue-500">{usedCoupons.length}</p>
              </div>
              <Check className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-purple-500">
                  {activeCoupons.filter(c => c.is_verified).length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold text-orange-500">
                  ₹{usedCoupons.reduce((sum, c) => sum + (c.actual_savings || c.coupon_value || 0), 0)}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expiry Alerts */}
      <CouponExpiryAlert 
        coupons={activeCoupons}
        onViewCoupon={(couponId) => {
          const coupon = coupons.find(c => c.id === couponId);
          if (coupon) openCouponDetail(coupon);
        }}
      />

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <Gift className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No coupons yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Submit opinions to earn reward coupons! Each opinion gets you exclusive discounts from top brands.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Active Coupons */}
          {activeCoupons.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                <h2 className="text-xl font-bold">Active Coupons</h2>
                <Badge variant="secondary">{activeCoupons.length}</Badge>
              </div>
              
              <AnimatePresence mode="popLayout">
                <div className="grid gap-4">
                  {activeCoupons.map((coupon, index) => (
                    <motion.div
                      key={coupon.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CouponCard
                        coupon={coupon}
                        onCopy={handleCopy}
                        copiedId={copiedId}
                        onMarkAsUsed={handleMarkAsUsed}
                        onViewDetails={openCouponDetail}
                        isFavorite={isFavorite(coupon.merchant_name || '')}
                        onToggleFavorite={() => toggleFavorite(coupon.merchant_name || '', coupon.coupon_type)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            </motion.section>
          )}

          {/* Used Coupons */}
          {usedCoupons.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full" />
                <h2 className="text-xl font-bold">Used Coupons</h2>
                <Badge variant="secondary">{usedCoupons.length}</Badge>
              </div>
              
              <div className="grid gap-4 opacity-70">
                {usedCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    onMarkAsUsed={handleMarkAsUsed}
                    onViewDetails={openCouponDetail}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Expired Coupons */}
          {expiredCoupons.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full" />
                <h2 className="text-xl font-bold text-muted-foreground">Expired</h2>
                <Badge variant="outline">{expiredCoupons.length}</Badge>
              </div>
              
              <div className="grid gap-4 opacity-50">
                {expiredCoupons.slice(0, 3).map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    onCopy={handleCopy}
                    copiedId={copiedId}
                    onMarkAsUsed={handleMarkAsUsed}
                    onViewDetails={openCouponDetail}
                  />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <CouponDetailModal
        coupon={selectedCoupon}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onCopy={handleCopy}
        copiedId={copiedId}
        onMarkAsUsed={handleMarkAsUsed}
      />
    </div>
  );
}
