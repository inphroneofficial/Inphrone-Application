import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MerchantFavorite {
  id: string;
  merchant_name: string;
  category: string | null;
  created_at: string;
}

export function useMerchantFavorites() {
  const [favorites, setFavorites] = useState<MerchantFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("merchant_favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (merchantName: string, category?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("merchant_favorites")
        .insert({
          user_id: user.id,
          merchant_name: merchantName,
          category: category || null,
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("This merchant is already in your favorites");
          return;
        }
        throw error;
      }

      toast.success(`${merchantName} added to favorites!`);
      fetchFavorites();
    } catch (error) {
      console.error("Error adding favorite:", error);
      toast.error("Failed to add favorite");
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from("merchant_favorites")
        .delete()
        .eq("id", favoriteId);

      if (error) throw error;

      toast.success("Removed from favorites");
      fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove favorite");
    }
  };

  const isFavorite = (merchantName: string) => {
    return favorites.some(
      (fav) => fav.merchant_name.toLowerCase() === merchantName.toLowerCase()
    );
  };

  const getFavoriteId = (merchantName: string) => {
    return favorites.find(
      (fav) => fav.merchant_name.toLowerCase() === merchantName.toLowerCase()
    )?.id;
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    getFavoriteId,
    refreshFavorites: fetchFavorites,
  };
}
