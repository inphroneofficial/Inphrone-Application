import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface SocialAuthProvidersProps {
  mode: "signin" | "signup";
  onEmailClick?: () => void;
}

interface AuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgClass: string;
  textClass: string;
  hoverClass: string;
  available: boolean;
  comingSoon?: boolean;
}

// Provider icons as SVG components
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

export function SocialAuthProviders({ mode, onEmailClick }: SocialAuthProvidersProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const providers: AuthProvider[] = [
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon />,
      bgClass: "bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700",
      textClass: "text-gray-700 dark:text-gray-200",
      hoverClass: "hover:shadow-md hover:border-primary/30",
      available: true,
    },
    {
      id: "apple",
      name: "Apple",
      icon: <AppleIcon />,
      bgClass: "bg-black hover:bg-zinc-900",
      textClass: "text-white",
      hoverClass: "hover:shadow-md",
      available: false,
      comingSoon: true,
    },
    {
      id: "microsoft",
      name: "Microsoft",
      icon: <MicrosoftIcon />,
      bgClass: "bg-[#2F2F2F] hover:bg-[#404040]",
      textClass: "text-white",
      hoverClass: "hover:shadow-md",
      available: false,
      comingSoon: true,
    },
  ];

  const handleProviderAuth = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    
    if (!provider?.available) {
      toast.info(`${provider?.name} sign-in coming soon!`, {
        description: "We're working on adding more sign-in options."
      });
      return;
    }

    if (providerId === "google") {
      setLoading(providerId);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        
        if (error) throw error;
      } catch (error: any) {
        console.error("OAuth error:", error);
        toast.error("Sign-in failed. Please try again.");
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Main providers */}
      <div className="space-y-3">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              type="button"
              variant="outline"
              className={`w-full h-12 relative border-2 transition-all duration-300 ${provider.bgClass} ${provider.textClass} ${provider.hoverClass} ${!provider.available ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={() => handleProviderAuth(provider.id)}
              disabled={loading === provider.id}
            >
              {loading === provider.id ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <span className="mr-3">{provider.icon}</span>
              )}
              <span className="font-medium">
                {mode === "signin" ? "Continue" : "Sign up"} with {provider.name}
              </span>
              
              {provider.comingSoon && (
                <Badge 
                  variant="secondary" 
                  className="absolute right-3 text-[10px] px-1.5 py-0.5 bg-muted/80 text-muted-foreground border-0"
                >
                  Soon
                </Badge>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium">or</span>
        </div>
      </div>

      {/* Email option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
          onClick={onEmailClick}
        >
          <Mail className="w-5 h-5 mr-3 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-medium">
            {mode === "signin" ? "Continue" : "Sign up"} with Email
          </span>
        </Button>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 pt-2"
      >
        <Lock className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Secure authentication powered by industry standards
        </span>
      </motion.div>
    </div>
  );
}
