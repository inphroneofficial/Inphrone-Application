import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Eye, EyeOff, Shield, Sparkles, Users, Zap, Check, Globe } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { SocialAuthProviders } from "@/components/auth/SocialAuthProviders";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"audience" | "creator" | "studio" | "production" | "ott" | "tv" | "gaming" | "music" | "developer" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const roles = [
    { value: "audience", icon: "👥", label: "Audience", tagline: "Share opinions. Earn rewards. Shape entertainment.", color: "from-blue-500 to-cyan-500" },
    { value: "creator", icon: "🎨", label: "Creator", tagline: "Build content that truly connects with audiences.", color: "from-purple-500 to-pink-500" },
    { value: "studio", icon: "🎬", label: "Studio / Production", tagline: "Discover stories audiences want next.", color: "from-amber-500 to-orange-500" },
    { value: "ott", icon: "📺", label: "OTT Platform", tagline: "Real-time demand for streaming content.", color: "from-red-500 to-rose-500" },
    { value: "tv", icon: "📡", label: "TV Network", tagline: "Understand what viewers want to watch.", color: "from-emerald-500 to-teal-500" },
    { value: "gaming", icon: "🎮", label: "Game Developer", tagline: "See what gamers want before you build.", color: "from-violet-500 to-indigo-500" },
    { value: "music", icon: "🎵", label: "Music Industry", tagline: "Track global listener preferences.", color: "from-fuchsia-500 to-purple-500" },
    { value: "developer", icon: "📱", label: "App Developer", tagline: "Build apps that solve real problems.", color: "from-cyan-500 to-blue-500" },
  ] as const;

  const signUpSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
    country: z.string().trim().min(2, "Country is required"),
    agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms and privacy policy"),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];

  // Handle navigation after auth
  const handleAuthNavigation = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed, settings")
        .eq("id", userId)
        .single();

      if (profile?.onboarding_completed) {
        const settings = profile.settings as { tour_completed?: boolean } | null;
        if (!settings?.tour_completed) {
          localStorage.removeItem('inphrone_tour_completed');
        }
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

  // Check session on mount
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          await handleAuthNavigation(session.user.id);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [handleAuthNavigation]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        // Small delay to ensure profile is created
        setTimeout(() => {
          handleAuthNavigation(session.user.id);
        }, 500);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleAuthNavigation]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select your role first");
      return;
    }

    const parsed = signUpSchema.safeParse({ 
      name, 
      email, 
      password, 
      confirmPassword,
      country, 
      agreeToTerms 
    });
    
    if (!parsed.success) {
      const newErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);
      toast.error(parsed.error.issues[0]?.message ?? "Please fix the form errors");
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: {
            user_type: selectedRole,
            full_name: name,
            country,
            preferred_language: "English"
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        const sendWelcomeEmail = async () => {
          try {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                type: 'welcome',
                to: email.toLowerCase().trim(),
                name: name || 'User',
                data: {}
              }
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        };
        sendWelcomeEmail();
      }

      if (data.user && data.session) {
        toast.success("🎉 Welcome to Inphrone™!", {
          description: "Your account has been created successfully."
        });
        // Navigation will be handled by onAuthStateChange
      } else if (data.user && !data.session) {
        toast.success("Account created! Please verify your email.", {
          duration: 7000,
          description: `We've sent a verification link to ${email}`
        });
        setShowRoleSelection(false);
        setSelectedRole(null);
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("User already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
      } else {
        toast.error(error.message || "Failed to sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials") || error.message.includes("Email not confirmed")) {
          setErrors({ email: "Invalid email or password" });
          toast.error("Invalid credentials. Please check your email and password.");
        } else {
          setErrors({ email: error.message });
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        const { data: deletedAccount } = await supabase
          .from("deleted_accounts_log")
          .select("email")
          .eq("email", email.toLowerCase().trim())
          .maybeSingle();

        if (deletedAccount) {
          await supabase.auth.signOut();
          setErrors({ email: "This account has been deleted. Please create a new account." });
          toast.error("This account has been deleted.");
          setLoading(false);
          return;
        }

        toast.success("Welcome back! 👋");
        // Navigation will be handled by onAuthStateChange
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Sparkles, text: "AI-Powered Insights" },
    { icon: Users, text: "Global Community" },
    { icon: Shield, text: "Secure & Private" },
    { icon: Zap, text: "Instant Rewards" },
  ];

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        {/* Floating orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative z-10 flex-col justify-between p-12">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-tight">
              INPHRONE<sup className="text-lg">™</sup>
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">People-Powered Entertainment Intelligence</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Where your voice<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                shapes entertainment
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              Join the world's first platform connecting audiences, creators, and studios through real-time entertainment intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center gap-4"
        >
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="text-sm">
            <p className="font-semibold">Trusted Globally</p>
            <p className="text-muted-foreground">Join entertainment enthusiasts worldwide</p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="mb-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-tight">
              INPHRONE<sup className="text-sm">™</sup>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">People-Powered Entertainment Intelligence</p>
          </div>

          <Card className="p-6 sm:p-8 shadow-2xl border-primary/20 backdrop-blur-xl bg-card/80">
            <AnimatePresence mode="wait">
              {!showRoleSelection ? (
                <motion.div
                  key="auth-tabs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/30 p-1 rounded-xl">
                      <TabsTrigger 
                        value="signin" 
                        className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="signup" 
                        className="text-base font-semibold rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-6 pt-6">
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Welcome back</h2>
                        <p className="text-muted-foreground text-sm">Sign in to continue your journey</p>
                      </div>

                      {/* Premium Social Auth Providers */}
                      <SocialAuthProviders mode="signin" />

                      <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className={`h-12 bg-background/50 border-2 focus:border-primary transition-colors ${errors.email ? 'border-destructive' : ''}`}
                          />
                          {errors.email && <p className="text-xs text-destructive flex items-center gap-1"><span className="inline-block w-1 h-1 rounded-full bg-destructive" />{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                            <button
                              type="button"
                              onClick={() => navigate("/forgot-password")}
                              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              autoComplete="current-password"
                              className="h-12 bg-background/50 border-2 focus:border-primary transition-colors pr-12"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-5 pt-6">
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold">Join Inphrone™</h2>
                        <p className="text-muted-foreground text-sm">
                          Select your role to get started
                        </p>
                      </div>

                      {/* Role Selection Cards - Visible Upfront */}
                      <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                        {roles.map((role, index) => (
                          <motion.div
                            key={role.value}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                          >
                            <Card
                              className={`group relative p-3 cursor-pointer transition-all duration-300 border-2 bg-card/50 hover:bg-card hover:shadow-lg ${
                                selectedRole === role.value 
                                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                                  : 'hover:border-primary/50'
                              }`}
                              onClick={() => setSelectedRole(role.value as any)}
                            >
                              <div className="flex flex-col items-center gap-2 text-center">
                                <div className={`text-2xl p-2 rounded-xl bg-gradient-to-br ${role.color} bg-opacity-10 group-hover:scale-110 transition-transform ${selectedRole === role.value ? 'scale-110' : ''}`}>
                                  {role.icon}
                                </div>
                                <div>
                                  <h3 className={`font-semibold text-xs leading-tight transition-colors ${selectedRole === role.value ? 'text-primary' : 'group-hover:text-primary'}`}>
                                    {role.label}
                                  </h3>
                                </div>
                                {selectedRole === role.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1 right-1"
                                  >
                                    <Check className="w-4 h-4 text-primary" />
                                  </motion.div>
                                )}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {/* Continue Button - Shows after role selection */}
                      <AnimatePresence>
                        {selectedRole && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10">
                              <span className="text-lg">{roles.find(r => r.value === selectedRole)?.icon}</span>
                              <span className="text-sm font-medium text-primary">{roles.find(r => r.value === selectedRole)?.label}</span>
                            </div>
                            
                            <Button
                              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
                              onClick={() => setShowRoleSelection(true)}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Continue as {roles.find(r => r.value === selectedRole)?.label}
                            </Button>
                            
                            <div className="relative py-1">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-3 text-muted-foreground">or</span>
                              </div>
                            </div>
                            
                            {/* Google Quick Sign-up */}
                            <SocialAuthProviders mode="signup" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!selectedRole && (
                        <p className="text-xs text-muted-foreground text-center">
                          Choose how you'll use Inphrone™ to continue
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </motion.div>
              ) : (
                /* Sign-up Form - Shows after role selection */
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="text-center space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowRoleSelection(false);
                        setSelectedRole(null);
                      }}
                      className="mb-2 hover:bg-primary/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Change Role
                    </Button>
                    <div className={`inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r ${roles.find(r => r.value === selectedRole)?.color} rounded-full text-primary-foreground shadow-lg`}>
                      <span className="text-2xl">{roles.find(r => r.value === selectedRole)?.icon}</span>
                      <span className="font-bold">{roles.find(r => r.value === selectedRole)?.label}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Full Name / Brand Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name or brand"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors({...errors, name: ""});
                        }}
                        required
                        autoComplete="name"
                        className={`h-11 bg-background/50 border-2 focus:border-primary transition-colors ${errors.name ? 'border-destructive' : ''}`}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email Address</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({...errors, email: ""});
                        }}
                        required
                        autoComplete="email"
                        className={`h-11 bg-background/50 border-2 focus:border-primary transition-colors ${errors.email ? 'border-destructive' : ''}`}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="8+ chars, uppercase & number"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({...errors, password: ""});
                          }}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className={`h-11 bg-background/50 border-2 focus:border-primary transition-colors pr-12 ${errors.password ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Strength: <span className={passwordStrength >= 3 ? 'text-emerald-500' : passwordStrength >= 2 ? 'text-yellow-500' : 'text-destructive'}>{strengthLabels[passwordStrength - 1] || 'Too weak'}</span>
                          </p>
                        </div>
                      )}
                      {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-sm font-medium">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                          }}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className={`h-11 bg-background/50 border-2 focus:border-primary transition-colors pr-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-xs text-primary flex items-center gap-1">
                          <Check className="w-3 h-3" /> Passwords match
                        </p>
                      )}
                      {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-country" className="text-sm font-medium">Country</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-country"
                          type="text"
                          placeholder="Your country"
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (errors.country) setErrors({...errors, country: ""});
                          }}
                          required
                          autoComplete="country"
                          className={`h-11 bg-background/50 border-2 focus:border-primary transition-colors pl-10 ${errors.country ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <Checkbox
                        id="terms"
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="terms"
                        className="text-xs leading-relaxed cursor-pointer"
                      >
                        I agree to the{" "}
                        <button type="button" onClick={() => navigate("/terms")} className="text-primary hover:underline font-medium">
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button type="button" onClick={() => navigate("/privacy-policy")} className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                      disabled={loading || !agreeToTerms}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
