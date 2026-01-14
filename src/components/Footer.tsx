import { useState } from "react";
import { Heart, Code, Instagram, Facebook, Youtube, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeveloperModal } from "./DeveloperModal";
import { FaXTwitter, FaReddit } from "react-icons/fa6";
import { useLanguage } from "./SettingsDialog";

export function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/inphrone", label: "Instagram" },
    { icon: FaXTwitter, href: "https://x.com/inphrone", label: "X (Twitter)" },
    { icon: Youtube, href: "https://youtube.com/@inphrone", label: "YouTube" },
    { icon: FaReddit, href: "https://www.reddit.com/user/officialinphrone/", label: "Reddit" },
    { icon: Facebook, href: "https://www.facebook.com/inphrone/", label: "Facebook" },
    { icon: Send, href: "https://t.me/inphroneofficial", label: "Telegram" },
  ];

  const footerLinks = {
    company: [
      { label: t('aboutUs'), href: "/about" },
      { label: t('blog'), href: "/blog" },
      { label: t('careers'), href: "/careers" },
      { label: t('contact'), href: "/contact" },
    ],
    resources: [
      { label: t('helpCenter'), href: "/help-center" },
      { label: t('faqs'), href: "/faq" },
      { label: t('reviews'), href: "/reviews" },
      { label: t('feedback'), href: "/feedback" },
    ],
    legal: [
      { label: t('privacyPolicy'), href: "/privacy-policy" },
      { label: t('termsOfService'), href: "/terms" },
    ],
  };

  return (
    <>
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-xl mb-4">Inphrone<sup className="text-xs font-normal">™</sup></h3>
              <p className="text-sm text-muted-foreground mb-4">
                World's first People-Powered Entertainment Intelligence Platform. Where audience emotion meets creative vision.
              </p>
              <a href="mailto:inphrone@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4" />
                inphrone@gmail.com
              </a>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('company')}</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('resources')}</h4>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold mb-4">{t('legal')}</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-primary">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 pb-8 border-b">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.href}
                  variant="outline"
                  size="icon"
                  asChild
                  className="rounded-full hover:scale-110 transition-transform"
                >
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <Icon className="h-4 w-4" />
                  </a>
                </Button>
              );
            })}
          </div>

          {/* IP Protection Notice */}
          <div className="text-center py-6 space-y-3 border-b border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2026 Inphrone. All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground/80 max-w-2xl mx-auto">
              Inphrone™ and the Inphrone logo are trademarks of the platform and its founder. 
              Unauthorized use or reproduction is strictly prohibited.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <span className="text-muted-foreground/50">|</span>
              <a href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Developer Credit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground pt-4">
            <div className="text-xs text-muted-foreground/60">
              Proprietary algorithms protected under IP laws
            </div>
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 animate-pulse" />
              <span>by</span>
              <Button
                variant="link"
                className="h-auto p-0 font-semibold text-foreground"
                onClick={() => setIsModalOpen(true)}
              >
                <Code className="h-4 w-4 mr-1" />
                G. Thangella
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <DeveloperModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
