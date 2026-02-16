import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, Wrench, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import { useLocation } from "wouter";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isGreeting?: boolean;
  toolCalls?: { name: string; args: any }[];
}

const GREETING = "👋 مرحبًا! أنا مساعد CMS الذكي. أقدر أساعدك في كتابة المحتوى، الترجمة، تعديل بيانات الفنادق والصفحات، أو أشرحلك إزاي تستخدم لوحة التحكم.\n\nHi! I'm the CMS AI Assistant. I can help you write content, translate, edit hotel data & pages, or guide you through the CMS.";

function detectArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

const toolLabels: Record<string, string> = {
  update_hotel: "Updating hotel",
  update_setting: "Updating setting",
  update_page_content: "Updating page content",
  update_page: "Updating page",
  update_blog_post: "Updating blog post",
  update_seo: "Updating SEO",
  get_hotels: "Reading hotels data",
  get_pages: "Reading pages",
  get_settings: "Reading settings",
  get_blog_posts: "Reading blog posts",
  translate_text: "Translating",
};

interface CMSAssistantProps {
  mode?: "floating" | "fullpage";
}

export default function CMSAssistant({ mode = "floating" }: CMSAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [, setLocation] = useLocation();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (mode === "fullpage" && !hasGreeted) {
      setMessages([{ role: "assistant", content: GREETING, isGreeting: true }]);
      setHasGreeted(true);
    }
  }, [mode, hasGreeted]);

  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setMessages([{ role: "assistant", content: GREETING, isGreeting: true }]);
      setHasGreeted(true);
    }
  }, [isOpen, hasGreeted]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    const apiMessages = allMessages
      .filter((m) => !m.isGreeting)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch("/api/cms-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantContent = "";
      const collectedToolCalls: { name: string; args: any }[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.error) {
              assistantContent = data.error;
              break;
            }
            if (data.tool_call) {
              collectedToolCalls.push({ name: data.tool_call, args: data.args });
              setMessages((prev) => {
                const newMsgs = [...prev];
                const lastAssistant = newMsgs.findIndex(
                  (m, i) => i === newMsgs.length - 1 && m.role === "assistant"
                );
                if (lastAssistant >= 0) {
                  newMsgs[lastAssistant] = {
                    ...newMsgs[lastAssistant],
                    toolCalls: [...collectedToolCalls],
                  };
                } else {
                  newMsgs.push({
                    role: "assistant",
                    content: "",
                    toolCalls: [...collectedToolCalls],
                  });
                }
                return newMsgs;
              });
            }
            if (data.content) {
              assistantContent = data.content;
              setMessages((prev) => {
                const newMsgs = [...prev];
                const lastIdx = newMsgs.length - 1;
                if (lastIdx >= 0 && newMsgs[lastIdx].role === "assistant" && !newMsgs[lastIdx].isGreeting) {
                  newMsgs[lastIdx] = {
                    ...newMsgs[lastIdx],
                    content: assistantContent,
                    toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
                  };
                } else {
                  newMsgs.push({
                    role: "assistant",
                    content: assistantContent,
                    toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
                  });
                }
                return newMsgs;
              });
            }
          } catch {}
        }
      }

      if (!assistantContent && collectedToolCalls.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I couldn't generate a response. Please try again." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
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

  const clearChat = () => {
    setMessages([{ role: "assistant", content: GREETING, isGreeting: true }]);
  };

  if (mode === "fullpage") {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold">CMS AI Assistant</h2>
              <p className="text-white/60 text-xs">Content writing, translation & CMS help</p>
            </div>
          </div>
          <button
            data-testid="button-clear-chat-fullpage"
            onClick={clearChat}
            className="text-white/60 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            Clear Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <textarea
              data-testid="input-cms-assistant-fullpage"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about the CMS..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
              disabled={isLoading}
            />
            <button
              data-testid="button-send-fullpage"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="self-end px-4 py-2.5 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            AI can make mistakes. Always review changes in the CMS.
          </p>
        </div>
      </div>
    );
  }

  const chatWidth = isExpanded ? "w-[560px]" : "w-[380px]";
  const chatHeight = isExpanded ? "h-[600px]" : "h-[480px]";

  return (
    <>
      {!isOpen && (
        <button
          data-testid="button-cms-assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-brand-blue to-brand-blue/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 ${chatWidth} ${chatHeight} bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300`}
        >
          <div className="bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold">CMS AI Assistant</h3>
                <p className="text-white/50 text-[10px]">Content & CMS help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocation("/controlpanal/ai-assistant")}
                title="Open full page"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-white/70" />
              </button>
              <button
                onClick={clearChat}
                className="text-white/50 hover:text-white text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} compact />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 p-3 shrink-0">
            <div className="flex gap-2">
              <textarea
                data-testid="input-cms-assistant-floating"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا... / Type your question..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end p-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

function MessageBubble({ message, compact }: { message: ChatMessage; compact?: boolean }) {
  const isUser = message.role === "user";
  const isArabic = detectArabic(message.content);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl ${compact ? "px-3 py-2" : "px-4 py-3"} ${
          isUser
            ? "bg-brand-blue text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolCalls.map((tc, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-[10px] ${
                  isUser ? "text-white/60" : "text-brand-gold"
                }`}
              >
                <Wrench className="w-3 h-3" />
                <span>{toolLabels[tc.name] || tc.name}...</span>
              </div>
            ))}
          </div>
        )}
        <div className={`${compact ? "text-xs" : "text-sm"} leading-relaxed whitespace-pre-wrap`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
