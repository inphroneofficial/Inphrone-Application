import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Trash2, Settings, Volume2, VolumeX, Mic, MicOff, Sparkles, Zap, Brain, HelpCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { ChatBotSettings } from "./ChatBotSettings";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Typing indicator with animated dots
const TypingIndicator = () => (
  <motion.div 
    className="flex gap-1.5 items-center px-4 py-3"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-2.5 h-2.5 rounded-full bg-primary"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
    <span className="text-xs text-muted-foreground ml-2">InphroneBot is thinking...</span>
  </motion.div>
);

// Animated message bubble
const MessageBubble = ({ 
  message, 
  isUser, 
  index,
  voiceEnabled,
  isSpeaking,
  onSpeak,
  onStopSpeaking
}: { 
  message: Message; 
  isUser: boolean; 
  index: number;
  voiceEnabled: boolean;
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
  onStopSpeaking: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95, y: -10 }}
    transition={{ 
      duration: 0.3, 
      delay: index * 0.05,
      type: "spring",
      stiffness: 200,
      damping: 20
    }}
    className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
  >
    {!isUser && (
      <motion.div 
        className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Bot className="h-4 w-4 text-primary-foreground" />
      </motion.div>
    )}
    <div className="flex-1 flex flex-col gap-2 max-w-[85%]">
      <motion.div 
        className={`rounded-2xl p-3.5 relative overflow-hidden ${
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20" 
            : "bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
        }`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {!isUser && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          />
        )}
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed relative z-10">{message.content}</p>
      </motion.div>
      {!isUser && voiceEnabled && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isSpeaking) {
                onStopSpeaking();
              } else {
                onSpeak(message.content);
              }
            }}
            className="h-7 w-fit text-xs gap-1.5 self-start hover:bg-primary/10 transition-colors"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="h-3 w-3 animate-pulse" />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="h-3 w-3" />
                Listen
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
    {isUser && (
      <motion.div 
        className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/20"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <User className="h-4 w-4 text-primary-foreground" />
      </motion.div>
    )}
  </motion.div>
);

// Animated suggested question button
const SuggestedQuestion = ({ question, onClick, index }: { question: string; onClick: () => void; index: number }) => (
  <motion.button
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ 
      delay: index * 0.08,
      type: "spring",
      stiffness: 200,
      damping: 20
    }}
    whileHover={{ 
      scale: 1.03, 
      boxShadow: "0 4px 20px rgba(var(--primary), 0.15)" 
    }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="group relative px-3 py-2 rounded-full text-xs font-medium bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 text-left"
  >
    <span className="relative z-10 flex items-center gap-1.5">
      <Lightbulb className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors" />
      <span className="text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
        {question}
      </span>
    </span>
  </motion.button>
);

export function ChatBot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `🎬 Welcome to InphroneBot — Your AI-Powered Entertainment Intelligence Guide!

I'm here to help you explore the world of Inphrone, the revolutionary Audience Intelligence Platform.

✨ **What I Can Help With:**
• Navigate platform features & categories
• Understand user roles (Audience, Creator, Studio, OTT, TV, Gaming, Music, Developer)
• Access real-time analytics & demographic insights
• Learn about InphroSync daily pulse check
• Master Your Turn slot competitions
• Discover rewards & gamification system

💡 **Quick Tips:**
Ask me about trending opinions, category insights, or how to maximize your Inphrone experience!

What would you like to explore today?` }
  ]);
  
  const suggestedQuestions = [
    "How does the Your Turn slot work?",
    "What is InphroSync?",
    "Show me trending categories",
    "How do rewards work?",
    "What can creators access?",
    "Explain demographic insights"
  ];
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatSize, setChatSize] = useState<"normal" | "large" | "fullscreen">("normal");
  const endRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech synthesis and recognition
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.success("Listening...");
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success("Voice captured");
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(`Voice input error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isOpen, isListening]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) return;
    const id = window.setInterval(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    return () => window.clearInterval(id);
  }, [isLoading]);

  useEffect(() => {
    const isHomePage = location.pathname === "/" || location.pathname === "";
    
    if (!isHomePage) {
      setIsVisible(false);
      setIsOpen(false);
      return;
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition < 100);
    };

    const handleMobileMenuChange = (e: CustomEvent) => {
      if (e.detail?.isOpen) {
        setIsVisible(false);
      } else {
        handleScroll();
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mobile-menu-toggle" as any, handleMobileMenuChange as any);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mobile-menu-toggle" as any, handleMobileMenuChange as any);
    };
  }, [location]);

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inphrone-chat`;
    
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: [...messages, { role: "user", content: userMessage }].slice(-6),
        model: "google/gemini-2.5-flash"
      }),
    });

    if (!resp.ok || !resp.body) {
      throw new Error("Failed to start stream");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;
    let assistantContent = "";

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: "assistant", content: assistantContent };
              return newMessages;
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Re-check authentication status before sending
    const { data: { session } } = await supabase.auth.getSession();
    const currentlyAuthenticated = !!session;

    if (!currentlyAuthenticated) {
      const insightKeywords = ['insight', 'opinion', 'trend', 'analytics', 'demographic', 'popular', 'upvote', 'data', 'statistics', 'view', 'analysis', 'report'];
      const hasInsightQuery = insightKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );

      if (hasInsightQuery) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "🔐 **Authentication Required**\n\nTo access live insights and analytics, please sign in or create an account.\n\n**Benefits of signing in:**\n• Real-time category analytics\n• Demographic breakdowns\n• Trending opinion data\n• Personalized recommendations\n\nClick **Sign In** or **Sign Up** to unlock full access!" 
        }]);
        return;
      }

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "👋 I see you're exploring Inphrone!\n\nWhile I can answer general questions, signing in unlocks:\n• **Live platform analytics**\n• **Personalized insights**\n• **Full feature access**\n\nWould you like to know more about what Inphrone offers, or ready to sign up?" 
      }]);
      return;
    }

    setIsLoading(true);

    try {
      await streamChat(userMessage);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ I encountered an issue processing your request. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (voiceEnabled) {
      speakText(text);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || !voiceEnabled) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => {
      if (voiceGender === "female") {
        return voice.name.toLowerCase().includes('female') || 
               voice.name.toLowerCase().includes('zira') ||
               voice.name.toLowerCase().includes('samantha');
      } else {
        return voice.name.toLowerCase().includes('male') || 
               voice.name.toLowerCase().includes('david') ||
               voice.name.toLowerCase().includes('alex');
      }
    });
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Voice playback error");
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in your browser");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting voice input:', error);
      toast.error("Failed to start voice input");
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      { role: "assistant", content: `🎬 Chat cleared! Ready for a fresh start.

I'm InphroneBot, your AI guide to the entertainment intelligence platform.

**Quick Actions:**
• Ask about any feature
• Explore categories & insights
• Learn about gamification
• Discover Your Turn slots

What would you like to know?` }
    ]);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence mode="wait">
        {isVisible && !isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
          >
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pulse ring animation */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/50"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="relative z-10"
              >
                <MessageCircle className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
              </motion.div>
              {/* Sparkle */}
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
              </motion.div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ perspective: "1000px" }}
            className={`fixed inset-x-2 bottom-2 md:bottom-6 md:right-6 md:left-auto z-40 w-auto max-w-full h-[75vh] md:rounded-2xl ${
              chatSize === "normal" ? "md:w-[420px] md:max-w-md md:h-[550px] md:max-h-[calc(100vh-120px)]" :
              chatSize === "large" ? "md:w-[600px] md:max-w-2xl md:h-[700px] md:max-h-[calc(100vh-120px)]" :
              "md:w-[90vw] md:h-[calc(100vh-120px)]"
            }`}
          >
            <Card className="flex flex-col h-full shadow-2xl border-0 overflow-hidden bg-background/95 backdrop-blur-xl">
              {/* Header */}
              <motion.div 
                className="relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
                <motion.div 
                  className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)]"
                  animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: "200% 100%" }}
                />
                
                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Brain className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white flex items-center gap-2">
                        InphroneBot
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Zap className="w-4 h-4 text-yellow-300" />
                        </motion.span>
                      </h3>
                      <p className="text-xs text-white/80">AI Entertainment Intelligence</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <select
                      value={chatSize}
                      onChange={(e) => setChatSize(e.target.value as any)}
                      className="hidden md:block text-xs border border-white/30 rounded-lg px-2 py-1.5 bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 font-medium cursor-pointer"
                    >
                      <option value="normal" className="bg-background text-foreground">Normal</option>
                      <option value="large" className="bg-background text-foreground">Large</option>
                      <option value="fullscreen" className="bg-background text-foreground">Fullscreen</option>
                    </select>
                    
                    {[
                      { icon: Settings, onClick: () => setSettingsOpen(true), title: "Settings" },
                      { icon: Trash2, onClick: clearChat, title: "Clear chat" },
                      { icon: X, onClick: () => setIsOpen(false), title: "Close" },
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={item.onClick}
                        className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                        title={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                      <MessageBubble
                        key={idx}
                        message={msg}
                        isUser={msg.role === "user"}
                        index={idx}
                        voiceEnabled={voiceEnabled}
                        isSpeaking={isSpeaking}
                        onSpeak={handleSpeak}
                        onStopSpeaking={stopSpeaking}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {/* Loading indicator */}
                  <AnimatePresence>
                    {isLoading && <TypingIndicator />}
                  </AnimatePresence>
                  
                  {/* Suggested questions - Only show before first user interaction */}
                  <AnimatePresence>
                    {!isLoading && messages.length === 1 && messages[0].role === 'assistant' && (
                      <motion.div 
                        className="flex flex-wrap gap-2 pt-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {suggestedQuestions.map((q, i) => (
                          <SuggestedQuestion
                            key={q}
                            question={q}
                            onClick={() => { setInput(q); }}
                            index={i}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div ref={endRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <motion.div 
                className="p-4 border-t bg-card/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="md:hidden"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                  <div className="relative flex-1">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about Inphrone..."
                      disabled={isLoading || isListening}
                      className="flex-1 pr-10 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                      style={{ fontSize: '16px' }}
                    />
                    <motion.button
                      type="button"
                      onClick={() => { isListening ? stopVoiceInput() : startVoiceInput(); }}
                      disabled={isLoading}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                        isListening ? 'bg-destructive text-destructive-foreground' : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {isListening ? <MicOff className="h-3.5 w-3.5 animate-pulse" /> : <Mic className="h-3.5 w-3.5" />}
                    </motion.button>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isLoading || !input.trim()} 
                      className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatBotSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        voiceEnabled={voiceEnabled}
        onVoiceEnabledChange={setVoiceEnabled}
        voiceGender={voiceGender}
        onVoiceGenderChange={setVoiceGender}
        voiceRate={voiceRate}
        onVoiceRateChange={setVoiceRate}
        voicePitch={voicePitch}
        onVoicePitchChange={setVoicePitch}
      />
    </>
  );
}
