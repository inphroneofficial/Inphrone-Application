import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
}

export function SEOHead({
  title,
  description = "Inphrone™ - World's first people-powered entertainment intelligence platform",
  keywords = "entertainment, opinions, insights, film, music, ott, tv, gaming, Inphrone",
  image = "https://inphrone.com/inphrone-logo.jpg",
  url,
  type = "website"
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title.includes("INPHRONE") || title.includes("Inphrone") 
      ? `${title} | Inphrone™` 
      : `${title} | Inphrone™ - People-Powered Entertainment Intelligence`;

    // Update or create meta tags
    const updateMetaTag = (selector: string, content: string, attr: string = "content") => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attr, content);
      }
    };

    // Standard meta tags
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[name="keywords"]', keywords);

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', image);
    updateMetaTag('meta[property="og:type"]', type);
    if (url) {
      updateMetaTag('meta[property="og:url"]', url);
    }

    // Twitter tags
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);

    // Cleanup - restore default title on unmount if needed
    return () => {
      // Title will be updated by next page, no cleanup needed
    };
  }, [title, description, keywords, image, url, type]);

  // This component doesn't render anything - it just manages document head
  return null;
}

// Page-specific SEO configurations
export const SEO_CONFIGS = {
  dashboard: {
    title: "Dashboard",
    description: "View your entertainment insights, track opinions, and earn rewards on Inphrone™.",
    keywords: "dashboard, opinions, rewards, entertainment insights, analytics"
  },
  profile: {
    title: "Your Profile",
    description: "Manage your Inphrone™ profile, view stats, and track your entertainment journey.",
    keywords: "profile, user stats, entertainment preferences, badges"
  },
  insights: {
    title: "Insights",
    description: "Discover trending entertainment insights from the global audience on Inphrone™.",
    keywords: "insights, trends, entertainment data, audience preferences, analytics"
  },
  inphrosync: {
    title: "InphroSync - Daily Pulse",
    description: "Answer 3 daily entertainment questions and see how your preferences match the world on Inphrone™.",
    keywords: "daily questions, entertainment pulse, community opinions, streaks"
  },
  yourturn: {
    title: "YourTurn - Ask the Community",
    description: "Submit questions and let the Inphrone™ community vote on what matters to you.",
    keywords: "community questions, voting, entertainment polls, slots"
  },
  hypeit: {
    title: "Hype It - Signal What You Want",
    description: "Launch 2-3 word signals to tell studios what content YOU want created. Vote 🔥 Hype or ➡️ Pass on Inphrone™.",
    keywords: "hype it, demand signals, content creation, studio feedback, voting"
  },
  category: (name: string) => ({
    title: `${name} Opinions`,
    description: `Share your opinions about ${name} and see what others think on Inphrone™.`,
    keywords: `${name.toLowerCase()}, opinions, entertainment, insights`
  }),
  about: {
    title: "About Inphrone™",
    description: "Learn about Inphrone™ - the world's first people-powered entertainment intelligence platform. Founded by Thangella Gadidamalla.",
    keywords: "about, mission, entertainment platform, audience intelligence, Thangella Gadidamalla, founder"
  },
  contact: {
    title: "Contact Us",
    description: "Get in touch with the Inphrone™ team. We'd love to hear from you!",
    keywords: "contact, support, feedback, help"
  },
  faq: {
    title: "FAQ",
    description: "Frequently asked questions about Inphrone™, InphroSync, Your Turn, Hype It, and all platform features.",
    keywords: "faq, help, questions, features, inphrosync, your turn, hype it"
  }
};
