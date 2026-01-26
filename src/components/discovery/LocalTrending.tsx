import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface LocalTrend {
  id: string;
  title: string;
  category: string;
  upvotes: number;
  contributor_count: number;
  city?: string;
}

interface LocalTrendingProps {
  userCity?: string;
  userCountry?: string;
  userState?: string;
}

export const LocalTrending = ({ userCity, userCountry, userState }: LocalTrendingProps) => {
  const [cityTrends, setCityTrends] = useState<LocalTrend[]>([]);
  const [stateTrends, setStateTrends] = useState<LocalTrend[]>([]);
  const [countryTrends, setCountryTrends] = useState<LocalTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"city" | "state" | "country">("city");

  useEffect(() => {
    fetchTrends();
  }, [userCity, userCountry, userState]);

  const fetchTrends = async () => {
    try {
      // Fetch opinions with location data
      const { data: opinions } = await supabase
        .from("opinions")
        .select(`
          id, title, upvotes, city, country,
          categories:category_id (name)
        `)
        .order("upvotes", { ascending: false })
        .limit(100);

      if (!opinions) {
        setLoading(false);
        return;
      }

      // Filter by city
      if (userCity) {
        const cityFiltered = opinions
          .filter(o => o.city?.toLowerCase() === userCity.toLowerCase())
          .slice(0, 5)
          .map(o => {
            const categories = o.categories as { name?: string } | null;
            return {
              id: o.id,
              title: o.title,
              category: categories?.name || "General",
              upvotes: o.upvotes || 0,
              contributor_count: 1,
              city: o.city
            };
          });
        setCityTrends(cityFiltered);
      }

      // Filter by country
      if (userCountry) {
        const countryFiltered = opinions
          .filter(o => o.country?.toLowerCase() === userCountry.toLowerCase())
          .slice(0, 5)
          .map(o => ({
            id: o.id,
            title: o.title,
            category: (o.categories as any)?.name || "General",
            upvotes: o.upvotes || 0,
            contributor_count: 1,
            city: o.city
          }));
        setCountryTrends(countryFiltered);
      }

      // For state trends, we'd need state data in opinions - using country for now
      setStateTrends([]);
    } catch (error) {
      console.error("Error fetching local trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTrends = () => {
    switch (activeTab) {
      case "city": return { trends: cityTrends, label: userCity || "Your City" };
      case "state": return { trends: stateTrends, label: userState || "Your State" };
      case "country": return { trends: countryTrends, label: userCountry || "Your Country" };
    }
  };

  const { trends, label } = getCurrentTrends();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-accent animate-pulse" />
          <h3 className="font-semibold">Local Trending</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-accent" />
        <h3 className="font-semibold">Local Trending</h3>
        <Flame className="w-4 h-4 text-orange-500" />
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-4">
        {userCity && (
          <button
            onClick={() => setActiveTab("city")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeTab === "city" 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {userCity}
          </button>
        )}
        {userState && (
          <button
            onClick={() => setActiveTab("state")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeTab === "state" 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {userState}
          </button>
        )}
        {userCountry && (
          <button
            onClick={() => setActiveTab("country")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeTab === "country" 
                ? "bg-accent text-accent-foreground" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {userCountry}
          </button>
        )}
      </div>

      {trends.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            No trending opinions in {label} yet. Be the first!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {trends.map((trend, index) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg font-bold text-muted-foreground w-6">
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{trend.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">
                    {trend.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {trend.upvotes}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};
