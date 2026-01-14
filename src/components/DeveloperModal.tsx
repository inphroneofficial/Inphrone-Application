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

// 🎬 CLEAR, STORY-DRIVEN DEVELOPER MODAL FOR INPHRONE
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[94%] max-w-4xl max-h-[92vh] p-0 overflow-hidden rounded-2xl">
          <div className="flex flex-col h-full">
            {/* HEADER */}
            <DialogHeader className="relative p-8 border-b bg-gradient-to-br from-primary/20 via-background to-accent/20">
              <DialogTitle className="text-2xl text-center font-semibold tracking-tight">
                🎬 Inphrone
              </DialogTitle>
              <DialogDescription className="text-center text-sm max-w-xl mx-auto">
                People-Powered Entertainment Intelligence
              </DialogDescription>
              <ChevronDown className="absolute bottom-3 left-1/2 -translate-x-1/2 h-4 w-4 text-muted-foreground animate-bounce" />
            </DialogHeader>

            {/* BODY */}
            <ScrollArea className="flex-1">
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">

                  {/* LEFT — FOUNDER CARD */}
                  <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <button
                      type="button"
                      onClick={() => setImageOpen(true)}
                      className="group relative w-44 h-44 mb-6 rounded-2xl overflow-hidden bg-black
                                 shadow-[0_25px_60px_rgba(0,0,0,0.35)]
                                 transition-transform duration-300 hover:scale-[1.04]"
                    >
                      <img
                        src="/GTK1.png"
                        alt="G. Thangella"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
                    </button>

                    <h3 className="text-xl font-semibold">G. Thangella</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Founder • Product Thinker • System Designer
                    </p>

                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      I build products at the intersection of human behavior, technology, and
                      design — with a deep focus on clarity, purpose, and long-term impact.
                    </p>

                    <div className="flex flex-wrap gap-2 mt-5 justify-center lg:justify-start">
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

                  {/* RIGHT — CLEAR PRODUCT STORY */}
                  <div className="space-y-7 text-sm leading-relaxed">
                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">What is Inphrone?</h4>
                      <p className="text-muted-foreground">
                        Inphrone is a people-powered entertainment intelligence platform.
                        It captures real audience behavior — what people actually watch, listen to,
                        and engage with — and turns it into clear, actionable insights for the
                        entertainment industry.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">Why Inphrone Exists</h4>
                      <p className="text-muted-foreground">
                        The entertainment industry often relies on delayed, biased, or surface-level
                        data. Inphrone exists to close this gap by giving audiences a direct voice
                        and providing creators, studios, and platforms with authentic,
                        real-time cultural intelligence.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">The Meaning Behind the Name</h4>
                      <p className="text-muted-foreground">
                        <strong>IN</strong> stands for Insights.
                        <br />
                        <strong>PHRONE</strong> comes from <em>Phronesis</em> — a Greek word meaning
                        practical wisdom.
                        <br />
                        Together, Inphrone represents human-driven intelligence guided by
                        real-world behavior, not assumptions.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">Who It’s For</h4>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Audiences who want their opinions to matter</li>
                        <li>Creators seeking honest feedback</li>
                        <li>Studios & OTT platforms needing real consumption insights</li>
                        <li>Music labels, gaming companies, and TV networks</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="font-semibold text-base mb-2 text-primary">Built With Intent</h4>
                      <p className="text-muted-foreground">
                        Inphrone is built using modern, scalable technologies with a strong
                        emphasis on performance, security, accessibility, and a premium
                        mobile-first experience.
                      </p>
                    </section>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <Separator />

            {/* FOOTER */}
            <DialogFooter className="p-6 flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button asChild>
                <a href="mailto:imgtk17@gmail.com" target="_blank" rel="noopener noreferrer">
                  Contact Founder
                </a>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* IMAGE PREVIEW */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl bg-black">
          <button
            onClick={() => setImageOpen(false)}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black"
            aria-label="Close image"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center p-6">
            <img
              src="/GTK1.png"
              alt="Profile preview"
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
