import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Gift, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PoolCoupon {
  id: string;
  merchant_name: string;
  offer_text: string;
  discount: string;
  discount_type: string;
  category: string;
  is_active: boolean;
  times_shown: number;
  expires_at: string;
  country_code: string;
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<PoolCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchCoupons();
  }, [categoryFilter]);

  const fetchCoupons = async () => {
    try {
      let query = supabase
        .from("coupon_pool")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-coupon', {
        body: { 
          couponId, 
          action: 'toggle-status', 
          newStatus: !currentStatus 
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Coupon ${!currentStatus ? "activated" : "deactivated"}`);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error updating coupon:", error);
      toast.error(`Failed to update coupon: ${error.message}`);
    }
  };

  const refreshCouponPool = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-coupon-pool');
      
      if (error) throw error;
      
      toast.success("Coupon pool refreshed successfully");
      fetchCoupons();
    } catch (error: any) {
      console.error("Error refreshing coupon pool:", error);
      toast.error(`Failed to refresh coupons: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const categories = ["all", "ott", "movies", "electronics", "food", "travel", "fashion"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Coupon Pool Management
        </CardTitle>
        <CardDescription>
          Manage coupon pool inventory and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-center">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={refreshCouponPool} 
            disabled={refreshing}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? "Refreshing..." : "Refresh Pool"}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Coupons</p>
            <p className="text-2xl font-bold">{coupons.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {coupons.filter(c => c.is_active).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {coupons.filter(c => !c.is_active).length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + (c.times_shown || 0), 0)}
            </p>
          </Card>
        </div>

        <ScrollArea className="h-[500px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.merchant_name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {coupon.offer_text}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount}%` : `${coupon.discount}`} OFF
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge>{coupon.category}</Badge>
                    </TableCell>
                    <TableCell>{coupon.times_shown || 0}</TableCell>
                    <TableCell>
                      {new Date(coupon.expires_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {coupon.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                      >
                        {coupon.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
