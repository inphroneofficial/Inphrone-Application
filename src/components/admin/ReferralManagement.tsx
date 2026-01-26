import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Share2, Users, Gift, TrendingUp, Search, Copy, 
  ToggleLeft, ToggleRight, Trash2, Plus, RefreshCw
} from "lucide-react";

interface ReferralCode {
  id: string;
  code: string;
  user_id: string;
  is_active: boolean;
  total_uses: number;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface ReferralClaim {
  id: string;
  referral_code_id: string;
  referred_user_id: string;
  claimed_at: string;
  referred_user_name?: string;
  code?: string;
}

export function ReferralManagement() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [claims, setClaims] = useState<ReferralClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    totalClaims: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch referral codes with user info
      const { data: codesData, error: codesError } = await supabase
        .from("referral_codes")
        .select(`
          *,
          profiles!referral_codes_user_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (codesError) throw codesError;

      // Fetch referral claims
      const { data: claimsData, error: claimsError } = await supabase
        .from("referral_claims")
        .select(`
          *,
          referral_codes(code),
          profiles!referral_claims_referred_user_id_fkey(full_name)
        `)
        .order("claimed_at", { ascending: false })
        .limit(50);

      if (claimsError) throw claimsError;

      const formattedCodes: ReferralCode[] = (codesData || []).map((code: any) => ({
        id: code.id,
        code: code.code,
        user_id: code.user_id,
        is_active: code.is_active,
        total_uses: code.total_uses || 0,
        created_at: code.created_at,
        user_name: code.profiles?.full_name || 'Unknown',
        user_email: code.profiles?.email
      }));

      const formattedClaims: ReferralClaim[] = (claimsData || []).map((claim: any) => ({
        id: claim.id,
        referral_code_id: claim.referral_code_id,
        referred_user_id: claim.referred_user_id,
        claimed_at: claim.claimed_at,
        referred_user_name: claim.profiles?.full_name || 'Unknown',
        code: claim.referral_codes?.code
      }));

      setCodes(formattedCodes);
      setClaims(formattedClaims);

      // Calculate stats
      const activeCodes = formattedCodes.filter(c => c.is_active).length;
      const totalUses = formattedCodes.reduce((sum, c) => sum + c.total_uses, 0);
      
      setStats({
        totalCodes: formattedCodes.length,
        activeCodes,
        totalClaims: formattedClaims.length,
        conversionRate: formattedCodes.length > 0 ? (totalUses / formattedCodes.length) * 100 : 0
      });

    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("referral_codes")
        .update({ is_active: !currentStatus })
        .eq("id", codeId);

      if (error) throw error;

      setCodes(prev => prev.map(c => 
        c.id === codeId ? { ...c, is_active: !currentStatus } : c
      ));
      toast.success(`Code ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error("Error toggling code:", error);
      toast.error("Failed to update code status");
    }
  };

  const deleteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from("referral_codes")
        .delete()
        .eq("id", codeId);

      if (error) throw error;

      setCodes(prev => prev.filter(c => c.id !== codeId));
      toast.success("Referral code deleted");
    } catch (error) {
      console.error("Error deleting code:", error);
      toast.error("Failed to delete code");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const filteredCodes = codes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Codes</p>
                  <p className="text-3xl font-bold">{stats.totalCodes}</p>
                </div>
                <Share2 className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Codes</p>
                  <p className="text-3xl font-bold">{stats.activeCodes}</p>
                </div>
                <Users className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Claims</p>
                  <p className="text-3xl font-bold">{stats.totalClaims}</p>
                </div>
                <Gift className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Uses/Code</p>
                  <p className="text-3xl font-bold">{(stats.conversionRate / 100).toFixed(1)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Codes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Referral Codes
              </CardTitle>
              <CardDescription>Manage all referral codes in the system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search codes or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Share2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-muted-foreground">No referral codes found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(code.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{code.user_name}</p>
                          <p className="text-xs text-muted-foreground">{code.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{code.total_uses}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(code.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleCodeStatus(code.id, code.is_active)}
                          >
                            {code.is_active ? (
                              <ToggleRight className="w-5 h-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Referral Code?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the referral code "{code.code}".
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCode(code.id)}
                                  className="bg-destructive"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Claims */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Recent Claims
          </CardTitle>
          <CardDescription>Latest referral code redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {claims.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-muted-foreground">No claims yet</p>
                </div>
              ) : (
                claims.map((claim, index) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{claim.referred_user_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Used code: <code className="font-mono">{claim.code}</code>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(claim.claimed_at).toLocaleDateString()}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
