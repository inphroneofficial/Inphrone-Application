import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { Settings, Sun, Moon, Monitor, Bell, BellOff, Globe, Compass, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useWebPushNotifications } from "@/hooks/useWebPushNotifications";
import { motion } from "framer-motion";

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  language: string;
  theme_mode: 'light' | 'dark' | 'system' | 'inphrone';
  tour_completed?: boolean;
}

import { translations, getTranslation } from "@/lib/translations";

// Language Context for app-wide translation
interface LanguageContextType {
  language: string;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key) => key,
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Load language from localStorage or profile
    const savedLang = localStorage.getItem('inphrone_language');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
    
    // Listen for language changes from other components
    const handleLanguageChange = (event: CustomEvent<{ language: string }>) => {
      setLanguage(event.detail.language);
    };
    
    window.addEventListener('language-change', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('language-change', handleLanguageChange as EventListener);
    };
  }, []);

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  const updateLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('inphrone_language', lang);
    // Dispatch event for other components to sync
    window.dispatchEvent(new CustomEvent('language-change', { detail: { language: lang } }));
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage: updateLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Web Push Toggle Component
function WebPushToggle() {
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    subscribeToPush, 
    unsubscribeFromPush,
    permission 
  } = useWebPushNotifications();
  const { t } = useLanguage();

  if (!isSupported) return null;

  return (
    <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Browser Push
          </p>
          <p className="text-xs text-muted-foreground">
            {isSubscribed 
              ? 'Receive notifications even when browser is closed' 
              : 'Enable to get alerts when away from app'}
          </p>
        </div>
        <Button
          variant={isSubscribed ? 'outline' : 'default'}
          size="sm"
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={isLoading || permission === 'denied'}
          className="text-xs"
        >
          {isLoading ? '...' : isSubscribed ? 'Disable' : 'Enable'}
        </Button>
      </div>
    </div>
  );
}

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const { language: currentLanguage, setLanguage: setAppLanguage, t } = useLanguage();
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    language: 'en',
    theme_mode: 'dark',
  });
  const [loading, setLoading] = useState(false);

  // Listen for open-settings-dialog event from mobile menu
  useEffect(() => {
    const handleOpenSettings = () => {
      setOpen(true);
    };
    
    window.addEventListener('open-settings-dialog', handleOpenSettings);
    return () => {
      window.removeEventListener('open-settings-dialog', handleOpenSettings);
    };
  }, []);

  // Sync settings.theme_mode with current theme when dialog opens or theme changes
  useEffect(() => {
    if (open) {
      // Check if inphrone theme is active
      const isInphroneTheme = document.documentElement.classList.contains('inphrone-theme');
      if (isInphroneTheme) {
        setSettings(prev => ({
          ...prev,
          theme_mode: 'inphrone'
        }));
      } else if (theme) {
        setSettings(prev => ({
          ...prev,
          theme_mode: theme as 'light' | 'dark' | 'system'
        }));
      }
      fetchSettings();
    }
  }, [open, theme]);

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return;
    }

    if (data?.settings && typeof data.settings === 'object') {
      const savedSettings = data.settings as any;
      const savedLanguage = savedSettings.language ?? 'en';
      // Use current theme as source of truth for theme_mode
      const newSettings = {
        notifications_enabled: savedSettings.notifications_enabled ?? true,
        email_notifications: savedSettings.email_notifications ?? true,
        language: savedLanguage,
        theme_mode: (theme as 'light' | 'dark' | 'system') ?? 'dark',
        tour_completed: savedSettings.tour_completed ?? false,
      };
      setSettings(newSettings);
      setAppLanguage(savedLanguage);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const updatedSettings = { ...settings, ...newSettings };

    const { error } = await supabase
      .from('profiles')
      .update({ settings: updatedSettings })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update settings');
      setLoading(false);
      return;
    }

    setSettings(updatedSettings);
    
    // Apply theme mode changes
    if (newSettings.theme_mode) {
      const root = document.documentElement;
      
      // Remove inphrone-theme class first
      root.classList.remove('inphrone-theme');
      
      if (newSettings.theme_mode === 'inphrone') {
        // Apply inphrone theme - pure black & white (built on dark mode)
        root.classList.add('inphrone-theme', 'dark');
        setTheme('dark'); // Inphrone theme IS dark mode variant
      } else {
        // Standard light/dark/system - these work independently
        setTheme(newSettings.theme_mode);
      }
    }

    // Apply language changes
    if (newSettings.language) {
      setAppLanguage(newSettings.language);
    }
    
    toast.success(t('settingsUpdated'));
    setLoading(false);
  };

  const handleStartTour = async () => {
    // Close dialog first
    setOpen(false);
    
    // Longer delay to ensure dialog is fully closed and DOM is clean
    setTimeout(() => {
      // Reset any body styles that might be left from dialog
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      
      // Dispatch event to trigger full guided tour
      window.dispatchEvent(new CustomEvent('start-guided-tour'));
    }, 400);
  };

  const handleStartQuickTour = async () => {
    // Close dialog first
    setOpen(false);
    
    // Longer delay to ensure dialog is fully closed and DOM is clean
    setTimeout(() => {
      // Reset any body styles that might be left from dialog
      document.body.style.overflow = '';
      document.body.style.pointerEvents = '';
      
      // Dispatch event to trigger quick overview tour
      window.dispatchEvent(new CustomEvent('start-quick-tour'));
    }, 400);
  };

  const handleResetToEnglish = () => {
    updateSettings({ language: 'en' });
    toast.success(t('languageReset'));
  };

  const languages = [
    { value: 'en', label: 'English', native: 'English' },
    { value: 'es', label: 'Spanish', native: 'Español' },
    { value: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { value: 'te', label: 'Telugu', native: 'తెలుగు' },
    { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { value: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { value: 'mr', label: 'Marathi', native: 'मराठी' },
    { value: 'bn', label: 'Bengali', native: 'বাংলা' },
    { value: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { value: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { value: 'fr', label: 'French', native: 'Français' },
    { value: 'de', label: 'German', native: 'Deutsch' },
    { value: 'ja', label: 'Japanese', native: '日本語' },
    { value: 'ko', label: 'Korean', native: '한국어' },
    { value: 'zh', label: 'Chinese', native: '中文' },
    { value: 'ar', label: 'Arabic', native: 'العربية' },
    { value: 'pt', label: 'Portuguese', native: 'Português' },
    { value: 'ru', label: 'Russian', native: 'Русский' },
    { value: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('settings')}
          </DialogTitle>
          <DialogDescription>
            {t('customizeExperience')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Display Mode Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <h3 className="font-semibold">{t('displayMode')}</h3>
            </div>
            
            <RadioGroup 
              value={settings.theme_mode} 
              onValueChange={(value: 'light' | 'dark' | 'system' | 'inphrone') => updateSettings({ theme_mode: value })}
              className="grid grid-cols-2 gap-3"
            >
              <Label 
                htmlFor="light" 
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.theme_mode === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="light" id="light" className="sr-only" />
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium">{t('light')}</span>
              </Label>
              <Label 
                htmlFor="dark" 
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.theme_mode === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="dark" id="dark" className="sr-only" />
                <Moon className="w-6 h-6" />
                <span className="text-sm font-medium">{t('dark')}</span>
              </Label>
              <Label 
                htmlFor="system" 
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.theme_mode === 'system' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="system" id="system" className="sr-only" />
                <Monitor className="w-6 h-6" />
                <span className="text-sm font-medium">{t('system')}</span>
              </Label>
              <Label 
                htmlFor="inphrone" 
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  settings.theme_mode === 'inphrone' 
                    ? 'border-white bg-black text-white' 
                    : 'border-border hover:border-primary/50 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <RadioGroupItem value="inphrone" id="inphrone" className="sr-only" />
                <Sparkles className={`w-6 h-6 ${settings.theme_mode === 'inphrone' ? 'text-white' : ''}`} />
                <span className={`text-sm font-medium ${settings.theme_mode === 'inphrone' ? 'text-white' : ''}`}>Inphrone</span>
                <span className={`text-[10px] ${settings.theme_mode === 'inphrone' ? 'text-white/70' : 'text-muted-foreground'}`}>Black & White</span>
              </Label>
            </RadioGroup>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <h3 className="font-semibold">{t('notifications')}</h3>
            </div>
            
            {/* Browser Push Notifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex-1">
                  <Label htmlFor="notifications" className="cursor-pointer flex items-center gap-2">
                    {settings.notifications_enabled ? (
                      <Bell className="w-4 h-4 text-primary" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    {t('pushNotifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pushDescription')}
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ notifications_enabled: checked })
                  }
                  disabled={loading}
                />
              </div>
              
              {/* Browser Permission Status */}
              {isSupported && (
                <div className="px-3 py-2 rounded-lg bg-muted/20 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {t('browserPermission')}: 
                    <Badge 
                      variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {permission === 'granted' ? t('allowed') : permission === 'denied' ? t('blocked') : t('notSet')}
                    </Badge>
                  </div>
                  {permission !== 'granted' && permission !== 'denied' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={async () => {
                        const granted = await requestPermission();
                        if (granted) {
                          toast.success(t('notificationsEnabled'));
                        }
                      }}
                      className="text-xs h-7"
                    >
                      {t('enable')}
                    </Button>
                  )}
                  {permission === 'denied' && (
                    <span className="text-xs text-destructive">
                      {t('enableInBrowser')}
                    </span>
                  )}
                </div>
              )}
              
              {/* Web Push Subscription */}
              <WebPushToggle />
            </div>
            
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex-1">
                <Label htmlFor="email-notifications" className="cursor-pointer">
                  {t('emailNotifications')}
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('emailDescription')}
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  updateSettings({ email_notifications: checked })
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Language Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Globe className="w-4 h-4" />
              <h3 className="font-semibold">{t('language')}</h3>
            </div>
            <div className="flex gap-2">
              <Select
                value={settings.language}
                onValueChange={(value) => updateSettings({ language: value })}
                disabled={loading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.native}</span>
                        <span className="text-muted-foreground text-xs">({lang.label})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToEnglish}
                disabled={loading || settings.language === 'en'}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <RotateCcw className="w-3 h-3" />
                {t('defaultEnglish')}
              </Button>
            </div>
          </div>

          {/* Application Tour Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Compass className="w-4 h-4" />
              <h3 className="font-semibold">{t('applicationTour')}</h3>
            </div>
            
            {/* Full Guided Tour */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleStartTour}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/40 hover:border-primary hover:bg-gradient-to-r hover:from-primary/20 hover:via-accent/10 hover:to-primary/20 transition-all h-auto py-3"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-primary animate-pulse" />
                    <span className="font-semibold text-foreground">Full Guided Tour</span>
                  </div>
                  <span className="text-xs text-foreground/70">Navigate through all sections • 9 phases</span>
                </div>
              </Button>
            </motion.div>
            
            {/* Quick Overview Tour */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={handleStartQuickTour}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 border-accent/40 hover:border-accent hover:bg-gradient-to-r hover:from-accent/20 hover:via-primary/10 hover:to-accent/20 transition-all h-auto py-3"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Quick Overview</span>
                  </div>
                  <span className="text-xs text-foreground/70">Learn all features in one place • 14 steps</span>
                </div>
              </Button>
            </motion.div>
            
            <p className="text-xs text-muted-foreground text-center">
              {t('tourDescription')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
