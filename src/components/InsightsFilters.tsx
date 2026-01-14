import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface FiltersProps {
  filters: {
    country: string;
    city: string;
    ageGroup: string;
    gender: string;
    state: string;
    contentType: string;
    category: string;
  };
  onChange: (filters: any) => void;
  availableOptions: {
    countries: string[];
    cities: string[];
    ageGroups: string[];
    genders: string[];
    states: string[];
    contentTypes: string[];
    categories: string[];
  };
}

export function InsightsFilters({ filters, onChange, availableOptions }: FiltersProps) {
  const hasActiveFilters = filters.country !== "all" || 
                           filters.city !== "all" || 
                           filters.ageGroup !== "all" || 
                           filters.gender !== "all" ||
                           filters.state !== "all" ||
                           filters.contentType !== "all";

  const clearFilters = () => {
    onChange({
      country: "all",
      city: "all",
      ageGroup: "all",
      gender: "all",
      state: "all",
      contentType: "all",
      category: "all"
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-md border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filter Insights
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Content Type</label>
              <Select value={filters.contentType || "all"} onValueChange={(value) => onChange({ ...filters, contentType: value })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Types</SelectItem>
                  {availableOptions.contentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Age Group</label>
              <Select value={filters.ageGroup || "all"} onValueChange={(value) => onChange({ ...filters, ageGroup: value })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Ages</SelectItem>
                  {availableOptions.ageGroups.map(age => (
                    <SelectItem key={age} value={age}>{age}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gender</label>
              <Select value={filters.gender || "all"} onValueChange={(value) => onChange({ ...filters, gender: value })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Genders</SelectItem>
                  {availableOptions.genders.map(gender => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Geographic Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Country</label>
              <Select value={filters.country || "all"} onValueChange={(value) => onChange({ ...filters, country: value, state: "all", city: "all" })}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Countries</SelectItem>
                  {availableOptions.countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">State/Region</label>
              <Select value={filters.state || "all"} onValueChange={(value) => onChange({ ...filters, state: value, city: "all" })} disabled={!filters.country || filters.country === "all"}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All States</SelectItem>
                  {availableOptions.states.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</label>
              <Select value={filters.city || "all"} onValueChange={(value) => onChange({ ...filters, city: value })} disabled={!filters.state || filters.state === "all"}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Cities</SelectItem>
                  {availableOptions.cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
