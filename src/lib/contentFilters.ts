export type UserKind = "audience" | "creator" | "studio" | "production" | "ott" | "tv" | "gaming" | "music" | "developer";

// Centralized category visibility rules per user type
export const allowedCategoryNames = (
  userType: UserKind,
  creatorType?: string | null
): string[] => {
  // Normalize
  const ct = (creatorType || "").toLowerCase();

  if (userType === "audience") return ["Film", "Music", "OTT", "TV", "YouTube", "Gaming", "Social Media", "App Development"];

  // Studios, production houses, and OTT see long-form film/OTT/TV only
  if (userType === "studio" || userType === "production" || userType === "ott") {
    return ["Film", "OTT", "TV"];
  }

  // TV Networks see TV-related content
  if (userType === "tv") {
    return ["TV", "Film", "OTT"];
  }

  // Gaming companies see Gaming-related content + App Development
  if (userType === "gaming") {
    return ["Gaming", "YouTube", "Social Media", "App Development"];
  }

  // Music industry sees Music-related content
  if (userType === "music") {
    return ["Music", "Film", "YouTube", "Social Media"];
  }

  // Developers see App Development and Gaming categories
  if (userType === "developer") {
    return ["App Development", "Gaming", "YouTube", "Social Media"];
  }

  // Creators
  if (userType === "creator") {
    if (ct === "music" || ct === "musician" || ct === "music_creator") {
      return ["Music", "Film", "YouTube", "Social Media"]; // music creators also care about film + social + YT
    }
    // default creators
    return ["YouTube", "Gaming", "Social Media"]; // creators focused on digital formats
  }

  // Fallback to a conservative set
  return ["YouTube", "Social Media"]; 
};