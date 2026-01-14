import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  Globe,
  Twitter,
  ChevronDown,
  X,
} from "lucide-react";

export interface DeveloperModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ✅ FULL SAFE VERSION WITH PREMIUM IMAGE PREVIEW
export function DeveloperModal({ open, onOpenChange }: DeveloperModalProps) {
  const [imageOpen, setImageOpen] = React.useState(false);

  const developerLinks = [
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", url: "https://www.instagram.com/g_thangella_k/#" },
    { icon: <Github className="w-5 h-5" />, label: "GitHub", url: "https://github.com" },
    { icon: <Linkedin className="w-5 h-5 text-blue-600" />, label: "LinkedIn", url: "https://www.linkedin.com/in/gthangella/" },
    { icon: <Twitter className="w-5 h-5 text-blue-400" />, label: "Twitter", url: "https://twitter.com/g_thangella" },
    { icon: <Mail className="w-5 h-5 text-red-500" />, label: "Email", url: "mailto:imgtk17@gmail.com" },
    { icon: <Globe className="w-5 h-5 text-green-500" />, label: "Portfolio", url: "https://thangella-creaftech-solutions.vercel.app/" },
  ];

  return (
    <>
      {/* MAIN DEVELOPER MODAL */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92%] max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-2xl">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="relative p-8 border-b bg-gradient-to-br from-primary/15 via-background to-accent/20">
              <DialogTitle className="text-2xl text-center font-semibold">
                Meet the Developer
              </DialogTitle>
              <DialogDescription className="text-center text-sm max-w-md mx-auto">
                The mind and craft behind the Inphrone platform
              </DialogDescription>
              <ChevronDown className="absolute bottom-3 left-1/2 -translate-x-1/2 h-4 w-4 text-muted-foreground animate-bounce" />
            </DialogHeader>

            {/* Body */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
                  {/* Profile Column */}
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    {/* Clickable Image Card */}
                    <button
                      type="button"
                      onClick={() => setImageOpen(true)}
                      className="group relative w-40 h-40 mb-6 rounded-xl overflow-hidden
                                 bg-black shadow-[0_20px_40px_rgba(0,0,0,0.25)]
                                 transition-transform duration-300 hover:scale-[1.04] focus:outline-none"
                      aria-label="View profile image"
                    >
                      <img
                        src="/GTK1.png"
                        alt="G. Thangella"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 ring-1 ring-white/20 rounded-xl" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>

                    <h3 className="text-xl font-semibold">G. Thangella</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      💼 Entrepreneur{"\n"}
                      🧠 Tech Explorer{"\n"}
                      🎨 Creative Thinker{"\n"}
                      🔭 Visionary
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
                      {developerLinks.map((link, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="icon"
                          asChild
                          className="rounded-full h-9 w-9 hover:scale-110 transition-transform"
                        >
                          <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                            {link.icon}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="space-y-6 text-sm leading-relaxed">
                    <p className="text-base">
                      I design and build impactful digital products that simplify complexity.
                      Inphrone reflects my passion for entertainment-tech innovation and clean UX.
                    </p>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">Built With</h4>
                      <p className="text-muted-foreground">
                        This platform is built using modern technologies with a focus on
                        performance, scalability, and premium user experience.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">Vision</h4>
                      <p className="text-muted-foreground">
                        To become the global pulse of entertainment — where every opinion matters.
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* Footer */}
            <DialogFooter className="p-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button asChild>
                <a href="mailto:imgtk17@gmail.com" target="_blank" rel="noopener noreferrer">
                  Get in Touch
                </a>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* PREMIUM IMAGE PREVIEW MODAL */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl bg-black">
          <button
            onClick={() => setImageOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            aria-label="Close image preview"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center p-6">
            <img
              src="/GTK1.png"
              alt="Profile preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
