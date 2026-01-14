import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, differenceInHours } from "date-fns";

// Track which coupons we've already notified about to prevent duplicates per session
const notifiedCoupons = new Set<string>();

export function useCouponReminders() {
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once per session
    if (hasChecked.current) return;
    hasChecked.current = true;

    checkExpiringCoupons();
  }, []);

  const checkExpiringCoupons = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: coupons } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (!coupons) return;

      const now = new Date();

      for (const coupon of coupons) {
        const expiryDate = new Date(coupon.expires_at);
        const hoursLeft = differenceInHours(expiryDate, now);
        const daysLeft = differenceInDays(expiryDate, now);
        
        // If expired, freeze the coupon silently (no notification)
        if (hoursLeft < 0) {
          await supabase
            .from("coupons")
            .update({ status: "expired" })
            .eq("id", coupon.id)
            .eq("status", "active");
          // Don't show notification for already expired coupons
          continue;
        }

        // Track expiring coupons for the My Coupons page only
        // Don't show any toast notifications here - CouponExpiryAlert handles display in My Coupons
        if (daysLeft <= 2 && daysLeft >= 0) {
          notifiedCoupons.add(coupon.id);
        }
      }
    } catch (error) {
      console.error("Error checking expiring coupons:", error);
    }
  };

  return null;
}
