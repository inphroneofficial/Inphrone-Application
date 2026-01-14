import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Users, 
  ShoppingCart,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Info
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { CouponLogoImage } from "./CouponLogoImage";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Coupon {
  id: string;
  coupon_type: string;
  coupon_code?: string;
  coupon_value: number;
  merchant_name?: string;
  merchant_link?: string;
  usage_instructions?: string;
  currency_code?: string;
  description?: string;
  logo_url?: string;
  discount_type?: string;
  expires_at: string;
  status: string;
  terms_and_conditions?: string;
}

interface CouponDetailModalProps {
  coupon: Coupon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (code: string | undefined, id: string) => void;
  copiedId: string | null;
  onMarkAsUsed: (id: string) => void;
}

interface ParsedTerms {
  eligibility: string | null;
  minimumSpend: string | null;
  platform: string | null;
  paymentMethod: string | null;
  otherTerms: string[];
}

// Parse T&C into structured bullet points
function parseTermsAndConditions(tnc: string | undefined): ParsedTerms {
  const result: ParsedTerms = {
    eligibility: null,
    minimumSpend: null,
    platform: null,
    paymentMethod: null,
    otherTerms: []
  };

  if (!tnc) return result;

  const lines = tnc.split(/[.;\n]/).map(line => line.trim()).filter(Boolean);
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    
    // Check for eligibility
    if (lowerLine.includes('first order') || lowerLine.includes('new user') || lowerLine.includes('new customer')) {
      result.eligibility = 'New Users / First Order Only';
    } else if (lowerLine.includes('all user') || lowerLine.includes('all customer') || lowerLine.includes('existing')) {
      result.eligibility = 'All Users';
    }
    
    // Check for minimum spend
    const minSpendMatch = line.match(/(?:min|minimum|above|over|₹|rs\.?|inr)\s*(\d+)/i) ||
                          line.match(/(\d+)\s*(?:minimum|min|above)/i);
    if (minSpendMatch && !result.minimumSpend) {
      result.minimumSpend = `Minimum order: ₹${minSpendMatch[1]}`;
    }
    
    // Check for platform
    if (lowerLine.includes('app only') || lowerLine.includes('mobile app')) {
      result.platform = 'Mobile App Only';
    } else if (lowerLine.includes('website') || lowerLine.includes('web only')) {
      result.platform = 'Website Only';
    } else if (lowerLine.includes('android') && lowerLine.includes('ios')) {
      result.platform = 'Android & iOS App';
    } else if (lowerLine.includes('android')) {
      result.platform = 'Android App';
    } else if (lowerLine.includes('ios') || lowerLine.includes('iphone')) {
      result.platform = 'iOS App';
    }
    
    // Check for payment method
    if (lowerLine.includes('upi') || lowerLine.includes('paytm') || lowerLine.includes('gpay') || lowerLine.includes('phonepe')) {
      result.paymentMethod = 'Specific payment methods may apply';
    } else if (lowerLine.includes('credit card') || lowerLine.includes('debit card')) {
      result.paymentMethod = 'Card payments eligible';
    }
    
    // Add to other terms if not categorized and meaningful
    if (line.length > 10 && 
        !result.eligibility?.toLowerCase().includes(lowerLine.substring(0, 10)) &&
        !lowerLine.includes('terms') && 
        !lowerLine.includes('condition')) {
      if (result.otherTerms.length < 3) {
        result.otherTerms.push(line);
      }
    }
  });

  // Default eligibility if not found
  if (!result.eligibility) {
    result.eligibility = 'All Users';
  }

  return result;
}

export function CouponDetailModal({ 
  coupon, 
  open, 
  onOpenChange, 
  onCopy, 
  copiedId,
  onMarkAsUsed 
}: CouponDetailModalProps) {
  const [stepCompleted, setStepCompleted] = useState<number[]>([]);

  if (!coupon) return null;

  const daysLeft = differenceInDays(new Date(coupon.expires_at), new Date());
  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;
  const parsedTerms = parseTermsAndConditions(coupon.terms_and_conditions);
  const currencySymbol = coupon.currency_code === 'INR' ? '₹' : '$';

  const handleCopyCode = () => {
    onCopy(coupon.coupon_code, coupon.id);
    setStepCompleted(prev => prev.includes(1) ? prev : [...prev, 1]);
  };

  const handleGoToStore = () => {
    setStepCompleted(prev => prev.includes(2) ? prev : [...prev, 2]);
    // Open tracking link
    const link = coupon.merchant_link;
    if (link) {
      const url = link.startsWith('http') ? link : `https://${link}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${coupon.merchant_name}...`, {
        description: "Remember to paste your code at checkout!"
      });
    }
  };

  const getValidLink = (link: string | undefined): string => {
    if (!link) return '#';
    return link.startsWith('http') ? link : `https://${link}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-6 border-b">
          <DialogHeader>
            <div className="flex items-start gap-4">
              {/* Large Merchant Logo */}
              <div className="w-20 h-20 rounded-xl bg-background border-2 border-border shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                <CouponLogoImage 
                  src={coupon.logo_url} 
                  alt={coupon.merchant_name || 'Merchant'} 
                  className="p-2"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {coupon.merchant_name || coupon.coupon_type}
                </DialogTitle>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-sm px-3 py-1">
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.coupon_value}% OFF` 
                      : `${currencySymbol}${coupon.coupon_value} OFF`}
                  </Badge>
                  
                  {isExpiringSoon ? (
                    <Badge variant="destructive" className="animate-pulse">
                      Expires in {daysLeft} days!
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary/50">
                      <Calendar className="w-3 h-3 mr-1" />
                      Valid till {format(new Date(coupon.expires_at), "MMM dd, yyyy")}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Large Coupon Code Box */}
          {coupon.coupon_code && (
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-dashed border-primary/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Coupon Code</p>
                  <p className="font-mono text-2xl font-bold text-primary tracking-widest">
                    {coupon.coupon_code}
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleCopyCode}
                  className={`gap-2 ${copiedId === coupon.id ? 'bg-green-500 hover:bg-green-600' : ''}`}
                >
                  {copiedId === coupon.id ? (
                    <><Check className="w-5 h-5" /> Copied!</>
                  ) : (
                    <><Copy className="w-5 h-5" /> Copy Code</>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* 3-Step Usage Guide */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              How to Use This Coupon
            </h3>
            
            <div className="grid gap-3">
              {/* Step 1 */}
              <motion.div 
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  stepCompleted.includes(1) 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-border bg-muted/30'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  stepCompleted.includes(1) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-white'
                }`}>
                  {stepCompleted.includes(1) ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Copy the Coupon Code</p>
                  <p className="text-sm text-muted-foreground">
                    Click the "Copy Code" button above to copy the code to your clipboard.
                  </p>
                </div>
                {!stepCompleted.includes(1) && coupon.coupon_code && (
                  <Button size="sm" variant="outline" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                )}
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  stepCompleted.includes(2) 
                    ? 'border-green-500 bg-green-500/5' 
                    : 'border-border bg-muted/30'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  stepCompleted.includes(2) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-primary text-white'
                }`}>
                  {stepCompleted.includes(2) ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Visit {coupon.merchant_name}'s Store</p>
                  <p className="text-sm text-muted-foreground">
                    Click below to visit the store. This activates the offer and sets required tracking.
                  </p>
                </div>
                <Button size="sm" onClick={handleGoToStore} className="gap-1">
                  <ExternalLink className="w-4 h-4" /> Go to Store
                </Button>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-muted/30"
                whileHover={{ scale: 1.01 }}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Apply Code at Checkout</p>
                  <p className="text-sm text-muted-foreground">
                    Paste the code in the "Promo Code" or "Coupon" field at checkout to get your discount.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Affiliate Link Warning */}
          <Card className="p-4 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">Important for Code Validation</p>
                <p className="text-sm text-muted-foreground">
                  To ensure this code works, you <strong>must</strong> visit the store through our "Go to Store" button. 
                  This activates the offer on your browser.
                </p>
              </div>
            </div>
          </Card>

          {/* Smart T&C Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Offer Details & Eligibility
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-3">
              {/* Eligibility */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Eligibility</p>
                    <p className="font-medium">{parsedTerms.eligibility || 'All Users'}</p>
                  </div>
                </div>
              </Card>

              {/* Minimum Spend */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Minimum Spend</p>
                    <p className="font-medium">{parsedTerms.minimumSpend || 'No minimum'}</p>
                  </div>
                </div>
              </Card>

              {/* Platform */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Platform</p>
                    <p className="font-medium">{parsedTerms.platform || 'All Platforms'}</p>
                  </div>
                </div>
              </Card>

              {/* Expiry */}
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isExpiringSoon ? 'bg-red-500/10' : 'bg-orange-500/10'
                  }`}>
                    <Calendar className={`w-5 h-5 ${isExpiringSoon ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Expires</p>
                    <p className={`font-medium ${isExpiringSoon ? 'text-red-500' : ''}`}>
                      {format(new Date(coupon.expires_at), "MMM dd, yyyy")}
                      {daysLeft > 0 && ` (${daysLeft} days left)`}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Additional Terms */}
            {parsedTerms.otherTerms.length > 0 && (
              <Card className="p-4 bg-muted/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Additional Terms</p>
                <ul className="space-y-2">
                  {parsedTerms.otherTerms.map((term, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Offer Description */}
          {coupon.description && (
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
              <p className="font-medium text-primary mb-1">Offer Details</p>
              <p className="text-sm">{coupon.description}</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              size="lg" 
              onClick={handleGoToStore}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <ExternalLink className="w-5 h-5" />
              Go to {coupon.merchant_name}
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                onMarkAsUsed(coupon.id);
                onOpenChange(false);
              }}
              className="sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Used
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}