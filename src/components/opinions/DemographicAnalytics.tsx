import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from "recharts";
import { Users, TrendingUp, Globe, Calendar, Filter, MapPin } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Opinion {
  id: string;
  user_id: string;
  category_id: string;
  created_at?: string;
  genre?: string;
  profiles?: {
    gender?: string;
    age_group?: string;
    city?: string;
    country?: string;
  } | null;
}

interface DemographicAnalyticsProps {
  categoryId: string;
  categoryName?: string;
}

const COLORS = [
  'hsl(var(--primary))', 
  'hsl(var(--accent))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))',
  'hsl(var(--chart-1))',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981'
];

export function DemographicAnalytics({ categoryId, categoryName }: DemographicAnalyticsProps) {
  const [viewMode, setViewMode] = useState<"gender" | "age" | "location" | "timeline">("gender");
  const [opinions, setOpinions] = useState<Opinion[]>([]);

  useEffect(() => {
    const fetchOpinions = async () => {
      if (!categoryId) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch opinions for this category
        const { data: opinionsData, error: opinionsError } = await supabase
          .from("opinions")
          .select("id, user_id, category_id, created_at, genre")
          .eq("category_id", categoryId);

        if (opinionsError) {
          console.error("Error fetching opinions:", opinionsError);
          setOpinions([]);
          return;
        }

        if (!opinionsData || opinionsData.length === 0) {
          setOpinions([]);
          return;
        }

        // Fetch profiles - RLS will automatically filter based on user type
        const userIds = [...new Set(opinionsData.map(o => o.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, gender, age_group, city, country, user_type")
          .in("id", userIds);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }

        // Map profiles to opinions
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        const enrichedOpinions = opinionsData
          .map(opinion => {
            const profile = profilesMap.get(opinion.user_id);
            if (!profile) return null;
            
            return {
              ...opinion,
              profiles: {
                gender: profile.gender,
                age_group: profile.age_group,
                city: profile.city,
                country: profile.country
              }
            };
          })
          .filter(opinion => opinion !== null) as Opinion[];

        console.log('DemographicAnalytics enriched opinions:', enrichedOpinions.length);
        setOpinions(enrichedOpinions);
      } catch (error) {
        console.error('Error in fetchOpinions:', error);
        setOpinions([]);
      }
    };

    fetchOpinions();
  }, [categoryId]);

  // Calculate gender distribution
  const genderData = useMemo(() => {
    const genderCounts = opinions.reduce((acc, opinion) => {
      const gender = opinion.profiles?.gender;
      if (gender && gender.trim() !== '') {
        acc[gender] = (acc[gender] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genderCounts)
      .map(([name, value]) => ({
        name: name === "male" ? "Male" : name === "female" ? "Female" : name === "other" ? "Other" : name,
        value,
        percentage: ((value / opinions.length) * 100).toFixed(1),
        ratio: `${value}/${opinions.length}`
      }))
      .sort((a, b) => b.value - a.value);
  }, [opinions]);

  // Calculate age group distribution
  const ageChartData = useMemo(() => {
    const ageData = opinions.reduce((acc, opinion) => {
      const age = opinion.profiles?.age_group;
      if (age && age.trim() !== '') {
        if (!acc[age]) {
          acc[age] = { count: 0, preferences: {} };
        }
        acc[age].count++;
        
        const genre = opinion.genre;
        if (genre) {
          acc[age].preferences[genre] = (acc[age].preferences[genre] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, { count: number; preferences: Record<string, number> }>);

    return Object.entries(ageData)
      .map(([name, data]) => {
        const topPreference = Object.entries(data.preferences)
          .sort((a, b) => b[1] - a[1])[0];
        
        return {
          name,
          count: data.count,
          percentage: ((data.count / opinions.length) * 100).toFixed(1),
          engagement: Math.round((data.count / opinions.length) * 100),
          topPreference: topPreference ? topPreference[0] : 'N/A',
          preferenceCount: topPreference ? topPreference[1] : 0,
          similarityScore: topPreference ? Math.round((topPreference[1] / data.count) * 100) : 0
        };
      })
      .sort((a, b) => {
        const order = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
  }, [opinions]);

  // Calculate country distribution
  const countryChartData = useMemo(() => {
    const countryData = opinions.reduce((acc, opinion) => {
      const country = opinion.profiles?.country;
      if (country && country.trim() !== '') {
        acc[country] = (acc[country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryData)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / opinions.length) * 100).toFixed(1),
        share: Math.round((count / opinions.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [opinions]);

  // Calculate city distribution
  const cityChartData = useMemo(() => {
    const cityData = opinions.reduce((acc, opinion) => {
      const city = opinion.profiles?.city;
      if (city && city.trim() !== '') {
        acc[city] = (acc[city] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cityData)
      .map(([name, count]) => ({
        name,
        count,
        percentage: ((count / opinions.length) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [opinions]);

  // Timeline data
  const timelineData = useMemo(() => {
    const timeline: Record<string, number> = {};
    opinions.forEach(opinion => {
      if (opinion.created_at) {
        const date = new Date(opinion.created_at);
        const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
        timeline[dateKey] = (timeline[dateKey] || 0) + 1;
      }
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => {
        const [aMonth, aDay] = a.date.split('/').map(Number);
        const [bMonth, bDay] = b.date.split('/').map(Number);
        return aMonth !== bMonth ? aMonth - bMonth : aDay - bDay;
      });
  }, [opinions]);

  // Engagement radar data
  const radarData = useMemo(() => {
    return genderData.slice(0, 5).map(g => ({
      category: g.name,
      value: Number(g.percentage)
    }));
  }, [genderData]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const countries = new Set<string>();
    const cities = new Set<string>();
    const genders = new Set<string>();
    const ages = new Set<string>();

    opinions.forEach(o => {
      if (o.profiles?.country && o.profiles.country.trim() !== '') {
        countries.add(o.profiles.country);
      }
      if (o.profiles?.city && o.profiles.city.trim() !== '') {
        cities.add(o.profiles.city);
      }
      if (o.profiles?.gender && o.profiles.gender.trim() !== '') {
        genders.add(o.profiles.gender);
      }
      if (o.profiles?.age_group && o.profiles.age_group.trim() !== '') {
        ages.add(o.profiles.age_group);
      }
    });
    
    return {
      totalOpinions: opinions.length,
      uniqueCountries: countries.size,
      uniqueCities: cities.size,
      genderDiversity: genders.size,
      ageDiversity: ages.size
    };
  }, [opinions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with view mode selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h3 className="text-xl sm:text-2xl font-bold">Advanced Demographic Analytics</h3>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gender">Gender Analysis</SelectItem>
              <SelectItem value="age">Age Distribution</SelectItem>
              <SelectItem value="location">Location Insights</SelectItem>
              <SelectItem value="timeline">Timeline Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Total Opinions</span>
              <span className="text-xl sm:text-2xl font-bold text-primary">{summaryStats.totalOpinions}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Countries</span>
              <span className="text-xl sm:text-2xl font-bold text-accent">{summaryStats.uniqueCountries}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Cities</span>
              <span className="text-xl sm:text-2xl font-bold text-chart-2">{summaryStats.uniqueCities}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Gender Types</span>
              <span className="text-xl sm:text-2xl font-bold text-chart-3">{summaryStats.genderDiversity}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Age Groups</span>
              <span className="text-xl sm:text-2xl font-bold text-chart-4">{summaryStats.ageDiversity}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic View Based on Selection */}
      {viewMode === "gender" && genderData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Gender Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {viewMode === "age" && ageChartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Age Group Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {viewMode === "location" && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {countryChartData.length > 0 && (
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={countryChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          {cityChartData.length > 0 && (
            <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cityChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {viewMode === "timeline" && timelineData.length > 0 && (
        <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Opinions Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Show message when no data */}
      {opinions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No demographic data available for this category yet.</p>
        </Card>
      )}
    </div>
  );
}