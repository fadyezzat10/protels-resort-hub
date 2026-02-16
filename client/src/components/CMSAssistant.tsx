import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Bot, Wrench, Sparkles, Maximize2, CheckCircle2, Languages, FileText, Search, PenLine, Globe } from "lucide-react";
import { useLocation } from "wouter";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isGreeting?: boolean;
  toolCalls?: { name: string; args: any }[];
}

const GREETING = "👋 مرحبًا! أنا مساعد CMS الذكي.\n\nأقدر أساعدك في:\n- ✍️ كتابة محتوى احترافي\n- 🌍 ترجمة لـ 8 لغات\n- ✏️ تعديل الفنادق والصفحات والمقالات\n- 📊 تحليل المحتوى واقتراح تحسينات\n- 🔍 تحسين SEO\n- 📖 شرح استخدام لوحة التحكم\n\nHi! I'm your CMS AI Assistant. I can write content, translate to 8 languages, edit hotels/pages/blog directly, audit SEO, and guide you through the CMS.\n\n**Try the quick actions below or just type your request!**";

function detectArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
}

const toolLabels: Record<string, { en: string; ar: string; icon: string }> = {
  update_hotel: { en: "Updating hotel", ar: "تحديث الفندق", icon: "🏨" },
  update_setting: { en: "Updating setting", ar: "تحديث الإعدادات", icon: "⚙️" },
  update_page_content: { en: "Updating page content", ar: "تحديث محتوى الصفحة", icon: "📝" },
  update_page: { en: "Updating page", ar: "تحديث الصفحة", icon: "📄" },
  update_blog_post: { en: "Updating blog post", ar: "تحديث المقالة", icon: "📰" },
  update_seo: { en: "Updating SEO", ar: "تحديث SEO", icon: "🔍" },
  get_hotels: { en: "Reading hotels", ar: "قراءة بيانات الفنادق", icon: "📖" },
  get_pages: { en: "Reading pages", ar: "قراءة الصفحات", icon: "📖" },
  get_settings: { en: "Reading settings", ar: "قراءة الإعدادات", icon: "📖" },
  get_blog_posts: { en: "Reading blog posts", ar: "قراءة المقالات", icon: "📖" },
  get_seo_settings: { en: "Auditing SEO", ar: "فحص SEO", icon: "🔍" },
  get_page_contents: { en: "Reading page contents", ar: "قراءة محتويات الصفحات", icon: "📖" },
  translate_text: { en: "Translating", ar: "ترجمة", icon: "🌍" },
  create_page: { en: "Creating page", ar: "إنشاء صفحة", icon: "➕" },
  create_blog_post: { en: "Creating blog post", ar: "إنشاء مقالة", icon: "➕" },
  bulk_translate_hotel: { en: "Bulk translating hotel", ar: "ترجمة جماعية للفندق", icon: "🌐" },
};

interface QuickAction {
  label: string;
  labelAr: string;
  prompt: string;
  icon: React.ReactNode;
}

const quickActions: QuickAction[] = [
  {
    label: "Translate All Hotels",
    labelAr: "ترجم كل الفنادق",
    prompt: "Translate all hotel descriptions to all 8 languages. Start with Crystal Beach, then Beach Club, then La Plage, then Royal Bay.",
    icon: <Globe className="w-3.5 h-3.5" />,
  },
  {
    label: "Write Blog Post",
    labelAr: "اكتب مقالة بلوج",
    prompt: "Write a new blog post about the best activities at Protels beach resorts. Create it in English and Arabic with SEO metadata.",
    icon: <PenLine className="w-3.5 h-3.5" />,
  },
  {
    label: "SEO Audit",
    labelAr: "فحص SEO",
    prompt: "Audit the current SEO settings for all pages. Check for missing meta titles, descriptions, and OG tags. Suggest improvements.",
    icon: <Search className="w-3.5 h-3.5" />,
  },
  {
    label: "Content Review",
    labelAr: "مراجعة المحتوى",
    prompt: "Review all hotels and pages. Check for missing translations, short descriptions, or incomplete content. Give me a full report.",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  {
    label: "How to use CMS",
    labelAr: "إزاي أستخدم CMS",
    prompt: "Give me a complete guide on how to use the CMS. Cover all sections: Pages, Hotels, Blog, Media, SEO, Settings, Theme, and Users.",
    icon: <Languages className="w-3.5 h-3.5" />,
  },
];

interface CMSAssistantProps {
  mode?: "floating" | "fullpage";
}

export default function CMSAssistant({ mode = "floating" }: CMSAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
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
    if ((isOpen || mode === "fullpage") && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, mode]);

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    if (!overrideText) setInput("");
    else setInput("");
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
                const lastIdx = newMsgs.length - 1;
                if (lastIdx >= 0 && newMsgs[lastIdx].role === "assistant" && !newMsgs[lastIdx].isGreeting) {
                  newMsgs[lastIdx] = { ...newMsgs[lastIdx], toolCalls: [...collectedToolCalls] };
                } else {
                  newMsgs.push({ role: "assistant", content: "", toolCalls: [...collectedToolCalls] });
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

  const showQuickActions = messages.length <= 1;

  if (mode === "fullpage") {
    return (
      <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold">CMS AI Assistant</h2>
              <p className="text-white/60 text-xs">Content writing, translation, editing & CMS guidance</p>
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

          {showQuickActions && !isLoading && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Quick Actions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    data-testid={`quick-action-${i}`}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 px-3 py-2.5 text-left text-xs bg-gray-50 hover:bg-brand-gold/10 border border-gray-200 hover:border-brand-gold/30 rounded-lg transition-all group"
                  >
                    <span className="text-brand-gold group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-gray-700 font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Working on it...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4 shrink-0">
          <div className="flex gap-2">
            <textarea
              data-testid="input-cms-assistant-fullpage"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اكتب طلبك هنا... / Type your request..."
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
              disabled={isLoading}
            />
            <button
              data-testid="button-send-fullpage"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="self-end px-4 py-2.5 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            Powered by GPT-4o · Can directly edit CMS content · Always review changes
          </p>
        </div>
      </div>
    );
  }

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
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300">
          <div className="bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-gold" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold">CMS AI Assistant</h3>
                <p className="text-white/50 text-[10px]">GPT-4o · Content & CMS</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                data-testid="button-expand-assistant"
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
                data-testid="button-close-assistant"
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

            {showQuickActions && !isLoading && (
              <div className="mt-2 space-y-1.5">
                {quickActions.slice(0, 4).map((action, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs bg-gray-50 hover:bg-brand-gold/10 border border-gray-100 hover:border-brand-gold/30 rounded-lg transition-all"
                  >
                    <span className="text-brand-gold">{action.icon}</span>
                    <span className="text-gray-600">{action.label}</span>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Working on it...</span>
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
                placeholder="اكتب سؤالك هنا... / Type here..."
                rows={1}
                className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"
                disabled={isLoading}
              />
              <button
                data-testid="button-send-floating"
                onClick={() => sendMessage()}
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
        className={`max-w-[90%] rounded-2xl ${compact ? "px-3 py-2" : "px-4 py-3"} ${
          isUser
            ? "bg-brand-blue text-white rounded-br-sm"
            : "bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100"
        }`}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1 pb-2 border-b border-gray-200/50">
            {message.toolCalls.map((tc, i) => {
              const label = toolLabels[tc.name];
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 text-[10px] ${
                    isUser ? "text-white/60" : "text-brand-gold"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{label ? `${label.icon} ${label.en}` : tc.name}</span>
                </div>
              );
            })}
          </div>
        )}
        {isUser ? (
          <div className={`${compact ? "text-xs" : "text-sm"} leading-relaxed whitespace-pre-wrap`}>
            {message.content}
          </div>
        ) : (
          <div className={`${compact ? "text-xs" : "text-sm"} leading-relaxed prose prose-sm max-w-none ${
            compact ? "prose-xs" : ""
          } prose-headings:text-gray-800 prose-headings:font-semibold prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-gray-900 prose-code:text-brand-blue prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
