import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "What is Inphrone?",
      answer: "Inphrone is the world's first Audience-Intelligence and Entertainment Insight Platform. We bridge the gap between audiences and creators by transforming audience emotions, preferences, and expectations into actionable creative intelligence across 8 entertainment categories: Film, Music, OTT, TV, YouTube, Gaming, Social Media, and App Development."
    },
    {
      question: "How does Inphrone work?",
      answer: "Each week, audiences participate in opinion polls across 8 entertainment categories. Creators, studios, OTT platforms, TV networks, gaming companies, music labels, and app developers can then explore these aggregated insights to understand what audiences want to see next before investing in production."
    },
    {
      question: "Who can use Inphrone?",
      answer: "Inphrone serves 8 user types: Audiences who want their voice heard, Content Creators seeking inspiration, Film/Production Studios planning movies, OTT platforms analyzing streaming trends, TV Networks, Music Labels, Gaming Companies, and App Developers. Each user type gets customized features, insights, and category access."
    },
    {
      question: "What are the 8 entertainment categories?",
      answer: "Inphrone covers Film (movies and cinema), Music (artists, albums, genres), OTT (streaming platforms like Netflix, Prime), TV (broadcast and cable networks), YouTube (content creators and channels), Gaming (video games and esports), Social Media (platforms and influencer trends), and App Development (mobile apps and software)."
    },
    {
      question: "What is InphroSync?",
      answer: "InphroSync is your daily entertainment pulse check. Every day, answer 3 quick questions about yesterday's entertainment experience — your mood, device used, and platform. Build streaks, earn badges, and see how your choices compare with the global audience in real-time."
    },
    {
      question: "What is Your Turn?",
      answer: "Your Turn is a gamified feature where audience members compete for 3 daily time slots (9 AM, 2 PM, 7 PM IST). When the 20-second window opens, click 'I'M IN!' — the first click wins! Winners get to ask their own entertainment question that the entire community votes on until midnight."
    },
    {
      question: "Is Inphrone free to use?",
      answer: "Yes! Creating an account and sharing opinions is completely free for audiences. All user types can access basic insights for free, with premium features available for deeper analytics and advanced filtering."
    },
    {
      question: "How is my data used?",
      answer: "Your individual opinions are aggregated anonymously to generate insights. We never sell personal information. Demographic data (age, gender, location) helps provide valuable context but is always presented in aggregated form to maintain privacy."
    },
    {
      question: "How does location detection work?",
      answer: "Inphrone uses automatic location detection to enhance your experience. When submitting opinions, your country, state, and city can be auto-detected to provide location-based insights. This helps creators understand regional preferences while keeping your data anonymous."
    },
    {
      question: "What are Wisdom Badges?",
      answer: "Wisdom Badges are rewards earned for active participation. Different badges represent milestones like contributing first opinions, maintaining InphroSync streaks, winning Your Turn slots, or having highly-upvoted insights. They showcase your engagement level and unlock special features."
    },
    {
      question: "How do weekly notifications work?",
      answer: "At the start of each week, we send notifications reminding you to share your opinions. This keeps insights fresh and relevant. You can manage notification preferences in your account settings, including email digests and push notifications."
    },
    {
      question: "Can I delete my account?",
      answer: "Yes, you can request account deletion from your profile settings. There's a 30-day grace period where you can restore your account. After that, your personal data is permanently removed while anonymized statistics are retained for platform analytics."
    },
    {
      question: "How does the upvote/like system work?",
      answer: "Audience users can upvote opinions they resonate with. Creators, studios, and other industry users can 'like' opinions to show interest. Popular opinions gain more visibility, helping identify strong audience sentiment. Engagement contributes to your rewards and badges."
    },
    {
      question: "What makes Inphrone different from review sites?",
      answer: "Unlike review sites that react to existing content, Inphrone is proactive. We capture what audiences want to see NEXT, not just what they thought about the past. This forward-looking approach guides creators before they create, saving resources and ensuring content resonates."
    },
    {
      question: "What insights can industry users access?",
      answer: "Creators, studios, OTT, TV, gaming, music, and app developer accounts can access demographic breakdowns, genre preferences, regional trends, real-time analytics, past opinion archives, and category-specific insights. Filter by age, gender, location, and content type."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about Inphrone
            </p>
          </div>

          <Card className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="p-6 bg-primary/5">
            <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Contact our support team.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center text-primary hover:underline font-medium"
            >
              Contact Support →
            </a>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
