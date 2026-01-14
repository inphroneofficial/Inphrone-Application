import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Handle the recovery flow - check for session from email link
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleRecovery = async () => {
      // First, listen for auth state changes (handles the redirect from email)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth event:", event, session ? "has session" : "no session");
        if (!mounted) return;
        
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true);
          if (timeoutId) clearTimeout(timeoutId);
        } else if (event === 'SIGNED_IN' && session) {
          setSessionReady(true);
          if (timeoutId) clearTimeout(timeoutId);
        }
      });

      // Check if we already have a session (user might have clicked link already)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!mounted) {
        subscription.unsubscribe();
        return;
      }

      if (error) {
        console.error("Session error:", error);
        setSessionError("Invalid or expired reset link. Please request a new one.");
        subscription.unsubscribe();
        return;
      }

      if (session) {
        setSessionReady(true);
        subscription.unsubscribe();
        return;
      }

      // Wait 3 seconds for auth state to settle, then show error if no session
      timeoutId = setTimeout(() => {
        if (mounted && !sessionReady) {
          setSessionError("Invalid or expired reset link. Please request a new password reset email.");
        }
        subscription.unsubscribe();
      }, 3000);

      return () => {
        subscription.unsubscribe();
      };
    };

    handleRecovery();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sessionReady]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = passwordSchema.safeParse({ password, confirmPassword });
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

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Password updated successfully!");
      
      // Sign out and redirect to auth page
      await supabase.auth.signOut();
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.message?.includes("Auth session missing")) {
        setSessionError("Your reset session has expired. Please request a new password reset email.");
      } else {
        toast.error(error.message || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="p-8 max-w-md w-full text-center space-y-4 shadow-2xl border-primary/30">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold">Password Updated!</h2>
          <p className="text-muted-foreground">
            Your password has been successfully updated. Redirecting to sign in...
          </p>
        </Card>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="p-8 max-w-md w-full text-center space-y-4 shadow-2xl border-destructive/30">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold">Reset Link Invalid</h2>
          <p className="text-muted-foreground">
            {sessionError}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={() => navigate("/forgot-password")} className="gradient-primary text-white">
              Request New Link
            </Button>
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Card className="p-8 max-w-md w-full text-center space-y-4 shadow-2xl border-primary/30">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Verifying reset link...</h2>
          <p className="text-muted-foreground text-sm">
            Please wait while we verify your password reset link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
        <div className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth")}
            className="mb-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent tracking-tight">
              Set New Password
            </h1>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>
        </div>

        <Card className="p-8 shadow-2xl border-primary/30 backdrop-blur-xl bg-background/80">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Must be 8+ chars with uppercase & number"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({...errors, password: ""});
                }}
                required
                minLength={8}
                autoComplete="new-password"
                className={`h-12 ${errors.password ? 'border-destructive' : ''}`}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-base">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                }}
                required
                minLength={8}
                autoComplete="new-password"
                className={`h-12 ${errors.confirmPassword ? 'border-destructive' : ''}`}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-white border-0 h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PasswordReset;
