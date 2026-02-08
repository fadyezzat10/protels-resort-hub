import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isGreeting?: boolean;
}

const GREETING_EN = "Welcome to Protels Hotels & Resorts. I'm your personal booking assistant. How may I help you find the perfect getaway today?";
const GREETING_AR = "أهلاً وسهلاً بكم في فنادق ومنتجعات بروتلز. أنا مساعدكم الشخصي للحجز. كيف يمكنني مساعدتكم في إيجاد العطلة المثالية اليوم؟";

function detectArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

export default function BookingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setMessages([
        { role: "assistant", content: GREETING_EN, isGreeting: true },
        { role: "assistant", content: GREETING_AR, isGreeting: true },
      ]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userIsArabic = detectArabic(trimmed);
    if (messages.every((m) => m.isGreeting)) {
      setIsRTL(userIsArabic);
    }

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    const apiMessages = allMessages
      .filter((m) => !m.isGreeting)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/booking-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("Failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let lineBuffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split("\n");
          lineBuffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmedLine.slice(6));
                if (data.content) {
                  assistantContent += data.content;
                  const finalContent = assistantContent;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "assistant", content: finalContent };
                    return updated;
                  });
                }
                if (data.error) {
                  assistantContent = data.error;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "assistant", content: data.error };
                    return updated;
                  });
                }
              } catch {}
            }
          }
        }

        if (lineBuffer.trim().startsWith("data: ")) {
          try {
            const data = JSON.parse(lineBuffer.trim().slice(6));
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }

      if (assistantContent && !isRTL) {
        const responseIsArabic = detectArabic(assistantContent);
        if (responseIsArabic) setIsRTL(true);
      }
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

  const displayMessages = messages.filter((m) => {
    if (!m.isGreeting) return true;
    if (messages.some((msg) => !msg.isGreeting)) {
      return isRTL ? detectArabic(m.content) : !detectArabic(m.content);
    }
    return true;
  });

  return (
    <>
      {!isOpen && (
        <button
          data-testid="button-open-chatbot"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a2744] text-[#C8A97E] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
          aria-label="Open booking assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#C8A97E]/20"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <div className="bg-[#1a2744] text-white px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C8A97E]/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#C8A97E]" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wide" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {isRTL ? "مساعد الحجز" : "Booking Assistant"}
                </h3>
                <p className="text-[10px] text-[#C8A97E] tracking-wider uppercase">
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

          <div className="flex-1 overflow-y-auto bg-[#f8f6f3] px-4 py-4 space-y-3">
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

          <div className="bg-white border-t border-[#e8e2d8] px-3 py-3 flex-shrink-0">
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
