import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function CouponAnalytics() {
  const [analytics, setAnalytics] = useState<any>({
    totalRedeemed: 0,
    totalSavings: 0,
    redemptionRate: 0,
    avgSavingsPerCoupon: 0,
    categoryBreakdown: [],
    monthlyTrend: [],
    topMerchants: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all coupons
      const { data: coupons } = await supabase
        .from("coupons")
        .select("*")
        .eq("user_id", user.id);

      // Fetch analytics events
      const { data: events } = await supabase
        .from("coupon_analytics")
        .select("*")
        .eq("user_id", user.id);

      if (!coupons) return;

      // Calculate metrics
      const redeemedCoupons = coupons.filter(c => c.status === "used");
      const totalSavings = redeemedCoupons.reduce((sum, c) => sum + Number(c.coupon_value), 0);
      const redemptionRate = coupons.length > 0 ? (redeemedCoupons.length / coupons.length) * 100 : 0;
      const avgSavings = redeemedCoupons.length > 0 ? totalSavings / redeemedCoupons.length : 0;

      // Category breakdown
      const categoryMap = new Map();
      redeemedCoupons.forEach(c => {
        const cat = c.coupon_type.split(" ")[0];
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(c.coupon_value));
      });
      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      // Monthly trend (last 6 months)
      const monthlyMap = new Map();
      redeemedCoupons.forEach(c => {
        const month = new Date(c.created_at).toLocaleDateString('en-US', { month: 'short' });
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });
      const monthlyTrend = Array.from(monthlyMap.entries()).map(([month, count]) => ({
        month,
        redeemed: count,
      }));

      // Top merchants
      const merchantMap = new Map();
      redeemedCoupons.forEach(c => {
        const merchant = c.coupon_type.split(" ").slice(-2).join(" ");
        merchantMap.set(merchant, (merchantMap.get(merchant) || 0) + Number(c.coupon_value));
      });
      const topMerchants = Array.from(merchantMap.entries())
        .map(([name, savings]) => ({ name, savings }))
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 5);

      setAnalytics({
        totalRedeemed: redeemedCoupons.length,
        totalSavings,
        redemptionRate: Math.round(redemptionRate),
        avgSavingsPerCoupon: Math.round(avgSavings * 100) / 100,
        categoryBreakdown,
        monthlyTrend,
        topMerchants,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-primary" />
          Coupon Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your savings and coupon usage patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Total Redeemed</div>
              <div className="text-3xl font-bold">{analytics.totalRedeemed}</div>
              <Badge className="mt-2" variant="secondary">Coupons</Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Total Savings</div>
              <div className="text-3xl font-bold text-green-500">${analytics.totalSavings}</div>
              <Badge className="mt-2" variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Redemption Rate</div>
              <div className="text-3xl font-bold">{analytics.redemptionRate}%</div>
              <Badge className="mt-2" variant="secondary">Usage</Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Avg. Savings</div>
              <div className="text-3xl font-bold">${analytics.avgSavingsPerCoupon}</div>
              <Badge className="mt-2" variant="secondary">Per Coupon</Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        {analytics.monthlyTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Monthly Redemption Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="redeemed" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {analytics.categoryBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Savings by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Merchants */}
      {analytics.topMerchants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants by Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topMerchants.map((merchant: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="font-medium">{merchant.name}</span>
                  </div>
                  <span className="text-green-500 font-bold">${merchant.savings}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
