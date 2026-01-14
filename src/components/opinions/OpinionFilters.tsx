import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FiltersProps {
  filters: {
    ageGroup: string;
    gender: string;
    country: string;
    city: string;
    dateRange: string;
    sortBy: string;
  };
  onChange: (filters: any) => void;
  availableOptions: {
    ageGroups: string[];
    genders: string[];
    countries: string[];
    cities: string[];
  };
}

export function OpinionFilters({ filters, onChange, availableOptions }: FiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange("sortBy", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="upvotes">Most Upvoted</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.ageGroup} onValueChange={(v) => handleFilterChange("ageGroup", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Age Group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ages</SelectItem>
          {availableOptions.ageGroups.map((age) => (
            <SelectItem key={age} value={age}>
              {age}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.gender} onValueChange={(v) => handleFilterChange("gender", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genders</SelectItem>
          {availableOptions.genders.map((gender) => (
            <SelectItem key={gender} value={gender}>
              {gender}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.country} onValueChange={(v) => handleFilterChange("country", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          {availableOptions.countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.city} onValueChange={(v) => handleFilterChange("city", v)}>
        <SelectTrigger>
          <SelectValue placeholder="City" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {availableOptions.cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
        <SelectTrigger>
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
