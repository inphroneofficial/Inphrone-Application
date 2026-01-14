import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, AlertCircle, Check } from "lucide-react";
import { useLocationDetection } from "@/hooks/useLocationDetection";

interface LocationInputProps {
  onLocationChange: (city: string, country: string) => void;
  initialCity?: string;
  initialCountry?: string;
}

export function LocationInput({ onLocationChange, initialCity, initialCountry }: LocationInputProps) {
  const location = useLocationDetection();
  const [manualMode, setManualMode] = useState(false);
  const [city, setCity] = useState(initialCity || "");
  const [country, setCountry] = useState(initialCountry || "");
  const [hasDetected, setHasDetected] = useState(false);

  // Auto-detect on mount
  useEffect(() => {
    if (!location.loading && !hasDetected) {
      if (location.city && location.country) {
        setCity(location.city);
        setCountry(location.country);
        onLocationChange(location.city, location.country);
        setHasDetected(true);
      } else if (location.error || (!location.city && !location.country)) {
        // Detection failed, switch to manual mode
        setManualMode(true);
        setHasDetected(true);
      }
    }
  }, [location.loading, location.city, location.country, location.error, hasDetected, onLocationChange]);

  // Update parent when manual values change
  useEffect(() => {
    if (manualMode) {
      onLocationChange(city, country);
    }
  }, [city, country, manualMode, onLocationChange]);

  const handleRetryDetection = async () => {
    setManualMode(false);
    setHasDetected(false);
    await location.refetch();
  };

  if (location.loading && !hasDetected) {
    return (
      <div className="space-y-2 p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Detecting your location...</span>
        </div>
      </div>
    );
  }

  if (!manualMode && city && country) {
    return (
      <div className="space-y-2 p-4 rounded-lg border border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-primary" />
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-medium">Location Detected</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setManualMode(true)}
            className="text-xs"
          >
            Edit
          </Button>
        </div>
        <p className="text-sm text-muted-foreground ml-6">
          {city}, {country}
        </p>
      </div>
    );
  }

  // Manual mode
  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="font-medium">Enter your location</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRetryDetection}
          className="text-xs"
        >
          <MapPin className="w-3 h-3 mr-1" />
          Auto-detect
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Location is required to submit your opinion
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="city" className="text-xs">City *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Mumbai"
            className="h-9"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="country" className="text-xs">Country *</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., India"
            className="h-9"
            required
          />
        </div>
      </div>
    </div>
  );
}