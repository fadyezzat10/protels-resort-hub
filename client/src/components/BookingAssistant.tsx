import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useLocation } from "wouter";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isGreeting?: boolean;
}

const GREETING_EN = "\u{1F44B} Hi, I'm Protels Booking Assistant. How can I help you today?";
const GREETING_AR = "\u{1F44B} أهلًا، أنا مساعد الحجز الخاص بـ Protels. أقدر أساعدك في إيه؟";

function detectArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

function detectHotelFromPath(pathname: string): string | null {
  const match = pathname.match(/\/hotels\/([^/]+)/);
  if (match) return match[1];
  return null;
}

export default function BookingAssistant() {
  const { language } = useI18n();
  const [location] = useLocation();
  const siteIsArabic = language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatLang, setChatLang] = useState<"en" | "ar">(siteIsArabic ? "ar" : "en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const isRTL = chatLang === "ar";
  const currentHotel = detectHotelFromPath(location);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      const greeting = siteIsArabic ? GREETING_AR : GREETING_EN;
      setChatLang(siteIsArabic ? "ar" : "en");
      setMessages([{ role: "assistant", content: greeting, isGreeting: true }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted, siteIsArabic]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function getBotResponse(message: string): Promise<string> {
    try {
      const body: Record<string, string> = { message };
      if (currentHotel) {
        body.hotel = currentHotel;
      }
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data.reply;
    } catch (error) {
      return "حدث خطأ، حاول مرة أخرى.";
    }
  }

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userIsArabic = detectArabic(trimmed);
    if (messages.every((m) => m.isGreeting)) {
      setChatLang(userIsArabic ? "ar" : "en");
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await getBotResponse(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isRTL
            ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
            : "I apologize, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const displayMessages = messages.filter((m) => !m.isGreeting || true);

  return (
    <>
      {!isOpen && (
        <button
          data-testid="button-open-chatbot"
          onClick={() => setIsOpen(true)}
          className="chatbot-fab fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1a2744] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-full pl-5 pr-3 py-3"
          style={{ direction: siteIsArabic ? "rtl" : "ltr" }}
        >
          <span className="chatbot-fab-label text-sm font-medium whitespace-nowrap" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {siteIsArabic ? "تواصل معنا" : "Need help booking?"}
          </span>
          <div className="chatbot-fab-icon w-10 h-10 rounded-full bg-[#C8A97E]/20 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-[#C8A97E]" />
          </div>
        </button>
      )}

      {isOpen && (
        <div
          className="chatbot-window fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#C8A97E]/20"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className="chatbot-header bg-[#1a2744] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="chatbot-header-icon w-9 h-9 rounded-full bg-[#C8A97E]/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#C8A97E]" />
              </div>
              <div>
                <h3 className="chatbot-header-title font-semibold text-sm tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {isRTL ? "مساعد الحجز" : "Booking Assistant"}
                </h3>
                <p className="chatbot-header-subtitle text-[10px] text-[#C8A97E] tracking-wider uppercase">
                  {isRTL ? "بروتلز للفنادق والمنتجعات" : "Protels Hotels & Resorts"}
                </p>
              </div>
            </div>
            <button
              data-testid="button-close-chatbot"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="chatbot-messages flex-1 overflow-y-auto bg-[#f8f6f3] px-4 py-4 space-y-3">
            {displayMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  data-testid={`text-chat-message-${i}`}
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed rounded-2xl ${
                    msg.role === "user"
                      ? "bg-[#1a2744] text-white rounded-br-sm"
                      : "bg-white text-[#333] shadow-sm border border-[#e8e2d8] rounded-bl-sm"
                  }`}
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    direction: detectArabic(msg.content) ? "rtl" : "ltr",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-white text-[#999] shadow-sm border border-[#e8e2d8] px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-2 text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isRTL ? "جارٍ الكتابة..." : "Typing..."}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-bar bg-white border-t border-[#e8e2d8] px-3 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                data-testid="input-chatbot-message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRTL ? "اكتب رسالتك..." : "Type your message..."}
                className="flex-1 px-4 py-2.5 text-sm bg-[#f8f6f3] border border-[#e8e2d8] rounded-full outline-none focus:border-[#C8A97E] transition-colors placeholder:text-[#aaa]"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                disabled={isLoading}
              />
              <button
                data-testid="button-send-chatbot"
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 rounded-full bg-[#1a2744] text-[#C8A97E] flex items-center justify-center hover:bg-[#243355] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
