import { useState, useRef, useEffect, useCallback, memo } from "react";
import { X, Send, Loader2, Bot, Sparkles, Maximize2, CheckCircle2, Languages, FileText, Search, PenLine, Globe, ImagePlus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  images?: string[];
  isGreeting?: boolean;
  toolCalls?: { name: string; args: any }[];
}

const GREETING = "👋 مرحبًا! أنا مساعد CMS الذكي.\n\nأقدر أساعدك في:\n- ✍️ كتابة محتوى احترافي\n- 🌍 ترجمة لـ 8 لغات\n- ✏️ تعديل الفنادق والصفحات والمقالات\n- 📸 تحليل الصور والسكرين شوت\n- 📊 تحليل المحتوى واقتراح تحسينات\n- 🔍 تحسين SEO\n- 📖 شرح استخدام لوحة التحكم\n\nHi! I'm your CMS AI Assistant. I can write content, translate, edit hotels/pages/blog, **analyze screenshots & images**, audit SEO, and guide you through the CMS.\n\n**You can attach images/screenshots using the 📸 button!**";

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface CMSAssistantProps {
  mode?: "floating" | "fullpage";
}

export default function CMSAssistant({ mode = "floating" }: CMSAssistantProps) {
  const [isOpen, setIsOpen] = useState(() => {
    try { return sessionStorage.getItem("cms-chat-open") === "true"; } catch { return false; }
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const floatingInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { sessionStorage.setItem("cms-chat-open", isOpen ? "true" : "false"); } catch {}
  }, [isOpen]);

  const saveChatHistory = useCallback((msgs: ChatMessage[]) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const toSave = msgs.filter(m => !m.isGreeting).map(m => ({
        role: m.role,
        content: m.content,
        ...(m.toolCalls ? { toolCalls: m.toolCalls } : {}),
      }));
      fetch("/api/chat-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: toSave }),
      }).catch(() => {});
    }, 1000);
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/chat-history", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          const greeting: ChatMessage = { role: "assistant", content: GREETING, isGreeting: true };
          const loaded: ChatMessage[] = data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            toolCalls: m.toolCalls,
          }));
          setMessages([greeting, ...loaded]);
          setHasGreeted(true);
          return true;
        }
      }
    } catch {}
    return false;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if ((mode === "fullpage" || isOpen) && !historyLoaded) {
      setHistoryLoaded(true);
      loadChatHistory().then(hadHistory => {
        if (!hadHistory && !hasGreeted) {
          setMessages([{ role: "assistant", content: GREETING, isGreeting: true }]);
          setHasGreeted(true);
        }
      });
    }
  }, [mode, isOpen, historyLoaded, hasGreeted, loadChatHistory]);

  useEffect(() => {
    if (mode === "fullpage" && inputRef.current) {
      inputRef.current.focus();
    } else if (isOpen && floatingInputRef.current) {
      floatingInputRef.current.focus();
    }
  }, [isOpen, mode]);

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 4 * 1024 * 1024;

  const processImageFile = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) return null;
    if (file.size > MAX_FILE_SIZE) {
      alert(`Image too large (max 4MB). "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB`);
      return null;
    }
    return await fileToBase64(file);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - attachedImages.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    for (const file of filesToProcess) {
      const base64 = await processImageFile(file);
      if (base64) setAttachedImages((prev) => [...prev, base64]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files) return;

    const remaining = MAX_IMAGES - attachedImages.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    for (const file of filesToProcess) {
      const base64 = await processImageFile(file);
      if (base64) setAttachedImages((prev) => [...prev, base64]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file || attachedImages.length >= MAX_IMAGES) continue;
        const base64 = await processImageFile(file);
        if (base64) setAttachedImages((prev) => [...prev, base64]);
      }
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const trimmed = (overrideText || input).trim();
    if ((!trimmed && attachedImages.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed || (attachedImages.length > 0 ? "ما رأيك في هذه الصورة؟ / What do you see in this image?" : ""),
      images: attachedImages.length > 0 ? [...attachedImages] : undefined,
    };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setAttachedImages([]);
    setIsLoading(true);

    const apiMessages = allMessages
      .filter((m) => !m.isGreeting)
      .map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.images && m.images.length > 0 ? { images: m.images } : {}),
      }));

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
      let sseBuffer = "";

      const updateAssistantMessage = (content: string, tools?: { name: string; args: any }[]) => {
        setMessages((prev) => {
          const newMsgs = [...prev];
          const lastIdx = newMsgs.length - 1;
          if (lastIdx >= 0 && newMsgs[lastIdx].role === "assistant" && !newMsgs[lastIdx].isGreeting) {
            newMsgs[lastIdx] = {
              ...newMsgs[lastIdx],
              content,
              toolCalls: tools && tools.length > 0 ? tools : newMsgs[lastIdx].toolCalls,
            };
          } else {
            newMsgs.push({
              role: "assistant",
              content,
              toolCalls: tools && tools.length > 0 ? tools : undefined,
            });
          }
          return newMsgs;
        });
      };

      const processSSELine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) return;
          if (data.error) {
            assistantContent = data.error;
            updateAssistantMessage(assistantContent);
            return;
          }
          if (data.tool_call) {
            collectedToolCalls.push({ name: data.tool_call, args: data.args });
            updateAssistantMessage(assistantContent, [...collectedToolCalls]);
          }
          if (data.content) {
            assistantContent = data.content;
            updateAssistantMessage(assistantContent, collectedToolCalls.length > 0 ? [...collectedToolCalls] : undefined);
          }
        } catch (parseErr) {
          console.warn("[CMS Assistant] Failed to parse SSE:", line, parseErr);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const parts = sseBuffer.split("\n");
        sseBuffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed) processSSELine(trimmed);
        }
      }

      if (sseBuffer.trim()) {
        processSSELine(sseBuffer.trim());
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
      setMessages(prev => {
        saveChatHistory(prev);
        return prev;
      });
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
    setAttachedImages([]);
    fetch("/api/chat-history", { method: "DELETE", credentials: "include" }).catch(() => {});
  };

  const showQuickActions = messages.length <= 1;

  const ImagePreviewBar = () => {
    if (attachedImages.length === 0) return null;
    return (
      <div className="flex gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 overflow-x-auto">
        {attachedImages.map((img, i) => (
          <div key={i} className="relative group shrink-0">
            <img
              src={img}
              alt={`Attached ${i + 1}`}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => removeImage(i)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <span className="text-[10px] text-gray-400 self-center shrink-0">
          {attachedImages.length}/5
        </span>
      </div>
    );
  };

  const InputArea = ({ compact }: { compact?: boolean }) => (
    <div
      className={compact ? "border-t border-gray-100 p-3 shrink-0" : "border-t border-gray-200 p-4 shrink-0"}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <ImagePreviewBar />
      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          data-testid={compact ? "button-attach-floating" : "button-attach-fullpage"}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || attachedImages.length >= 5}
          title="Attach image / ارفق صورة"
          className={compact ? "p-1.5 text-gray-400 hover:text-brand-gold disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-50" : "p-2 text-gray-400 hover:text-brand-gold disabled:opacity-30 transition-colors rounded-lg hover:bg-gray-50"}
        >
          <ImagePlus className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </button>
        <textarea
          data-testid={compact ? "input-cms-assistant-floating" : "input-cms-assistant-fullpage"}
          ref={compact ? floatingInputRef : inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="اكتب طلبك هنا... / Type your request... (Ctrl+V to paste screenshot)"
          rows={compact ? 1 : 2}
          className={compact ? "flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold" : "flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold"}
          disabled={isLoading}
        />
        <button
          data-testid={compact ? "button-send-floating" : "button-send-fullpage"}
          onClick={() => sendMessage()}
          disabled={(!input.trim() && attachedImages.length === 0) || isLoading}
          className={compact ? "self-end p-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" : "self-end px-4 py-2.5 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      {!compact && (
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Powered by GPT-4o Vision · Drag & drop or paste images · Can directly edit CMS content
        </p>
      )}
    </div>
  );

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
              <p className="text-white/60 text-xs">Content writing, translation, editing, image analysis & CMS guidance</p>
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

        <InputArea />
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
                <p className="text-white/50 text-[10px]">GPT-4o Vision · Content & CMS</p>
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

          <InputArea compact />
        </div>
      )}
    </>
  );
}

const MessageBubble = memo(function MessageBubble({ message, compact }: { message: ChatMessage; compact?: boolean }) {
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

        {message.images && message.images.length > 0 && (
          <div className={`flex gap-1.5 flex-wrap mb-2 ${message.images.length > 2 ? "max-h-32" : ""}`}>
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Attached ${i + 1}`}
                className={`${compact ? "w-20 h-20" : "w-28 h-28"} object-cover rounded-lg border ${isUser ? "border-white/20" : "border-gray-200"}`}
              />
            ))}
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
});
