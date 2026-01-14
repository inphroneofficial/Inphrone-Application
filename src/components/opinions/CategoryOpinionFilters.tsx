import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CategoryFiltersProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  contentTypeFilter: string;
  onContentTypeChange: (value: string) => void;
  genreFilter: string;
  onGenreChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  contentTypes: string[];
  genres: string[];
}

export function CategoryOpinionFilters({
  sortBy,
  onSortChange,
  contentTypeFilter,
  onContentTypeChange,
  genreFilter,
  onGenreChange,
  searchQuery,
  onSearchChange,
  contentTypes,
  genres
}: CategoryFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search opinions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectContent>
      </Select>

      <Select value={contentTypeFilter} onValueChange={onContentTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Content Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {contentTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={genreFilter} onValueChange={onGenreChange}>
        <SelectTrigger>
          <SelectValue placeholder="Genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
