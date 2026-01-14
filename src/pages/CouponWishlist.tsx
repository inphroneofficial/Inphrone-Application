import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WishlistItem {
  id: string;
  merchant_name: string;
  category: string;
  min_discount: number;
  notify_on_match: boolean;
  created_at: string;
}

export default function CouponWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    merchant_name: "",
    category: "",
    min_discount: 0,
    notify_on_match: true,
  });

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("coupon_wishlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWishlist(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.merchant_name) {
      toast.error("Please enter a merchant name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("coupon_wishlist")
        .insert({
          user_id: user.id,
          ...newItem,
        });

      if (error) throw error;

      toast.success("Added to wishlist!");
      setNewItem({
        merchant_name: "",
        category: "",
        min_discount: 0,
        notify_on_match: true,
      });
      setDialogOpen(false);
      fetchWishlist();
    } catch (error: any) {
      console.error("Error adding to wishlist:", error);
      if (error.code === "23505") {
        toast.error("This merchant is already in your wishlist");
      } else {
        toast.error("Failed to add to wishlist");
      }
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("coupon_wishlist")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const toggleNotifications = async (id: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("coupon_wishlist")
        .update({ notify_on_match: !currentValue })
        .eq("id", id);

      if (error) throw error;

      toast.success(!currentValue ? "Notifications enabled" : "Notifications disabled");
      fetchWishlist();
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast.error("Failed to update notifications");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            Coupon Wishlist
          </h1>
          <p className="text-muted-foreground mt-1">
            Save your favorite merchants and get notified about new deals
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add to Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Wishlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">Merchant Name *</Label>
                <Input
                  id="merchant"
                  placeholder="e.g., Amazon, Netflix"
                  value={newItem.merchant_name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, merchant_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Electronics, Entertainment"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Minimum Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.min_discount}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      min_discount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify"
                  checked={newItem.notify_on_match}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notify_on_match: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="notify" className="cursor-pointer">
                  Notify me when matching coupons are available
                </Label>
              </div>

              <Button onClick={handleAdd} className="w-full">
                Add to Wishlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {wishlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add your favorite merchants to get notified about new deals!
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{item.merchant_name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.category && (
                      <Badge variant="secondary">{item.category}</Badge>
                    )}
                    {item.min_discount > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Min. Discount: <span className="font-semibold">{item.min_discount}%</span>
                      </p>
                    )}
                    <Button
                      variant={item.notify_on_match ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        toggleNotifications(item.id, item.notify_on_match)
                      }
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      {item.notify_on_match ? "Notifications On" : "Notifications Off"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
