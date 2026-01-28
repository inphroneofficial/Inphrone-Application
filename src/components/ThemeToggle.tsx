import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check if Inphrone theme is active - treat it as dark mode
    const isInphroneTheme = document.documentElement.classList.contains('inphrone-theme');
    
    if (isInphroneTheme) {
      setTheme("dark");
      return;
    }

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDarkClass = document.documentElement.classList.contains("dark");
    
    // Use existing class first, then saved theme, then system preference
    const initialTheme = isDarkClass ? "dark" : savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const isInphroneTheme = root.classList.contains('inphrone-theme');
    
    // If in Inphrone theme, switching to light removes the inphrone-theme
    if (isInphroneTheme) {
      root.classList.remove('inphrone-theme', 'dark');
      setTheme("light");
      localStorage.setItem("theme", "light");
      localStorage.removeItem("inphrone-theme");
      return;
    }
    
    // Standard toggle behavior - cycle through light -> dark -> light
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    root.classList.remove('dark', 'inphrone-theme');
    if (newTheme === "dark") {
      root.classList.add("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="hover:bg-muted transition-all hover:scale-105 text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-foreground" />
      )}
    </Button>
  );
}
