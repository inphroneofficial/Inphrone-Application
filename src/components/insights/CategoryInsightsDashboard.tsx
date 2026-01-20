import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, Users, MapPin, Sparkles, Heart, Clock, Target, Zap } from "lucide-react";

interface CategoryInsights {
  genres: Array<{ name: string; count: number; percentage: number }>;
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    locations: Record<string, number>;
  };
  totalOpinions: number;
}

interface CategoryDashboardProps {
  insights: CategoryInsights;
  categoryName: string;
  theme: {
    gradient: string;
    bgGradient: string;
    colors: string[];
    icon: any;
  };
  userType?: string;
  showDemographics?: boolean;
}

export function CategoryInsightsDashboard({ insights, categoryName, theme, userType = "audience", showDemographics = false }: CategoryDashboardProps) {
  // Calculate total genre count for proper percentage calculation
  const totalGenreCount = insights.genres.reduce((sum, g) => sum + g.count, 0);
  
  // Genre data with properly calculated percentages (must sum to 100%)
  const genreData = insights.genres.slice(0, 8).map(g => ({
    name: g.name,
    value: totalGenreCount > 0 ? Math.round((g.count / totalGenreCount) * 100) : 0,
    count: g.count
  }));

  // Age data with proper percentage calculation
  const ageEntries = Object.entries(insights.demographics.age)
    .filter(([name, value]) => name && name.toLowerCase() !== 'not specified' && value > 0);
  const totalAgeCount = ageEntries.reduce((sum, [, value]) => sum + value, 0);
  const ageData = ageEntries.map(([name, value]) => ({
    name,
    value,
    percentage: totalAgeCount > 0 ? Math.round((value / totalAgeCount) * 100) : 0
  }));

  // Gender data with proper percentage calculation
  const genderEntries = Object.entries(insights.demographics.gender)
    .filter(([name, value]) => name && name.toLowerCase() !== 'not specified' && value > 0);
  const totalGenderCount = genderEntries.reduce((sum, [, value]) => sum + value, 0);
  const genderData = genderEntries.map(([name, value]) => ({
    name,
    value,
    percentage: totalGenderCount > 0 ? Math.round((value / totalGenderCount) * 100) : 0
  }));

  // Location data with proper percentage calculation
  const locationEntries = Object.entries(insights.demographics.locations)
    .filter(([name, value]) => name && name.toLowerCase() !== 'not specified' && value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const totalLocationCount = locationEntries.reduce((sum, [, value]) => sum + value, 0);
  const locationData = locationEntries.map(([name, value]) => ({
    name,
    value,
    percentage: totalLocationCount > 0 ? Math.round((value / totalLocationCount) * 100) : 0
  }));

  // Calculate engagement metrics properly (capped at 100%)
  const topGenre = genreData[0];
  const engagementScore = insights.totalOpinions > 0 ? Math.min(100, Math.round((insights.totalOpinions / Math.max(insights.totalOpinions, 100)) * 100)) : 0;
  const diversityScore = genreData.length > 0 ? Math.min(100, Math.round((genreData.length / 10) * 100)) : 0;

  const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="space-y-8">
      {/* Category Header with Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-r ${theme.bgGradient} backdrop-blur-lg border-2 border-primary/30`}
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <Badge className={`mb-4 bg-gradient-to-r ${theme.gradient} text-white border-0`}>
                <theme.icon className="w-4 h-4 mr-2" />
                {categoryName} Deep Dive
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-2">
                <span className={`bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                  {insights.totalOpinions}
                </span> opinions analyzed
              </h2>
              <p className="text-muted-foreground text-lg">Real-time audience intelligence for {categoryName}</p>
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <theme.icon className="w-24 h-24 text-primary/20" />
            </motion.div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-background/50 backdrop-blur text-center">
              <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{genreData.length}</p>
              <p className="text-sm text-muted-foreground">Genres</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 backdrop-blur text-center">
              <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{locationData.length}</p>
              <p className="text-sm text-muted-foreground">Regions</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 backdrop-blur text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{engagementScore}%</p>
              <p className="text-sm text-muted-foreground">Engagement</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 backdrop-blur text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{diversityScore}%</p>
              <p className="text-sm text-muted-foreground">Diversity</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Genre/App Type Distribution - Enhanced */}
      {genreData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {categoryName === 'App Development' ? 'App Type Distribution' : 'Genre Distribution'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genreData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: any, name: string, props: any) => [
                        `${value}% (${props.payload.count} opinions)`,
                        'Share'
                      ]}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 8, 8, 0]}
                      animationDuration={1000}
                    >
                      {genreData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={theme.colors[index % theme.colors.length]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {categoryName === 'App Development' ? 'App Type Breakdown' : 'Genre Breakdown'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationDuration={1000}
                    >
                      {genreData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={theme.colors[index % theme.colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value: any, name: string, props: any) => [
                        `${value}%`,
                        props.payload.name
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {genreData.slice(0, 5).map((genre, index) => (
                  <Badge 
                    key={genre.name}
                    variant="outline"
                    style={{ borderColor: theme.colors[index % theme.colors.length] }}
                    className="text-xs"
                  >
                    {genre.name} {genre.value}%
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Genre/App Type Highlight */}
      {topGenre && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 rounded-2xl bg-gradient-to-r ${theme.bgGradient} border border-primary/20`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-xl bg-gradient-to-r ${theme.gradient}`}>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {categoryName === 'App Development' ? `Top App Type in ${categoryName}` : `Top Genre in ${categoryName}`}
              </p>
              <p className="text-2xl font-bold">{topGenre.name}</p>
              <p className="text-sm text-primary">{topGenre.value}% of all opinions • {topGenre.count} submissions</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Demographics Grid - Only show if there's current week data */}
      {showDemographics && (ageData.length > 0 || genderData.length > 0 || locationData.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Age Distribution - Only show if current week data exists */}
          {ageData.length > 0 && (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Age Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ageData.map((age, index) => (
                    <motion.div
                      key={age.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{age.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{age.value} users</span>
                          <span className="text-primary font-bold">{age.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${age.percentage}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gender Distribution - Only show if current week data exists */}
          {genderData.length > 0 && (
            <Card className="glass-card border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {genderData.map((gender, index) => (
                    <div key={gender.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="font-medium">{gender.name}</span>
                      </div>
                      <span className="text-primary font-bold">{gender.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Regional Trends - Only show if current week data exists */}
      {showDemographics && locationData.length > 0 && (
        <Card className="glass-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Top Contributing Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationData.map((location, index) => (
                <motion.div
                  key={location.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-5 rounded-xl bg-gradient-to-br ${theme.bgGradient} border border-primary/20 hover:scale-105 transition-transform overflow-hidden`}
                >
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg truncate">{location.name}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{location.percentage}%</span>
                    <span className="text-sm text-muted-foreground">({location.value} opinions)</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${location.percentage}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                      className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Summary for Non-Audience Users */}
      {userType !== 'audience' && (
        <Card className="glass-card border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Actionable Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <h4 className="font-semibold mb-2">Target Audience</h4>
                <p className="text-sm text-muted-foreground">
                  {ageData.length > 0 ? `Primary: ${ageData[0]?.name || 'All ages'}` : 'Diverse age groups'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {genderData.length > 0 ? `Dominant: ${genderData[0]?.name || 'Mixed'}` : 'Balanced gender distribution'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <h4 className="font-semibold mb-2">Content Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Focus on {topGenre?.name || 'trending genres'} content
                </p>
                <p className="text-sm text-muted-foreground">
                  {genreData.length} active genre preferences identified
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border border-border">
                <h4 className="font-semibold mb-2">Regional Focus</h4>
                <p className="text-sm text-muted-foreground">
                  Top market: {locationData[0]?.name || 'Global'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {locationData.length} key regions contributing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}