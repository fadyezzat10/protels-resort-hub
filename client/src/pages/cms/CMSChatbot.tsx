import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings, MessageSquare, HelpCircle, Tag, Plus, Trash2, Save, Eye, EyeOff,
  ChevronDown, X, User, Phone, Mail,
} from "lucide-react";

type TabId = "settings" | "faq" | "offers" | "conversations";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "offers", label: "Offers", icon: Tag },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
];

const HOTEL_OPTIONS = [
  { value: "", label: "All Hotels (General)" },
  { value: "crystal-beach", label: "Crystal Beach Resort" },
  { value: "beach-club", label: "Beach Club & Spa" },
  { value: "la-plage", label: "La Plage – Zanzibar" },
  { value: "royal-bay", label: "Royal Bay (Coming Soon)" },
];

function SettingsTab() {
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/cms/chatbot-config"],
    queryFn: () => apiRequest("GET", "/api/cms/chatbot-config").then(r => r.json()),
  });

  const [tone, setTone] = useState("friendly");
  const [responseLength, setResponseLength] = useState("short");
  const [language, setLanguage] = useState("mirror");
  const [customInstructions, setCustomInstructions] = useState("");

  useEffect(() => {
    if (config) {
      setTone(config.tone || "friendly");
      setResponseLength(config.responseLength || "short");
      setLanguage(config.language || "mirror");
      setCustomInstructions(config.customInstructions || "");
    }
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: () => apiRequest("PUT", "/api/cms/chatbot-config", { tone, responseLength, language, customInstructions }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-config"] }),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chatbot Personality</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tone</label>
              <select
                data-testid="select-tone"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="friendly">Friendly & Warm</option>
                <option value="professional">Professional & Formal</option>
                <option value="casual">Casual & Fun</option>
                <option value="luxury">Luxury & Elegant</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Response Length</label>
              <select
                data-testid="select-response-length"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={responseLength}
                onChange={(e) => setResponseLength(e.target.value)}
              >
                <option value="short">Short (1-2 sentences)</option>
                <option value="medium">Medium (2-3 sentences)</option>
                <option value="detailed">Detailed (3-5 sentences)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Language</label>
              <select
                data-testid="select-language"
                className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="mirror">Mirror User's Language</option>
                <option value="arabic-dialect">Egyptian Arabic (عامية)</option>
                <option value="arabic-formal">Formal Arabic (فصحى)</option>
                <option value="english">English Only</option>
                <option value="bilingual">Bilingual (Arabic + English)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            data-testid="input-custom-instructions"
            placeholder="Write any additional instructions for the chatbot... Example: Always mention our special spa package. Don't discuss competitor hotels. Prioritize Crystal Beach for couples."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-400 mt-2">These instructions will be added to the chatbot's behavior rules</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          data-testid="button-save-settings"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-brand-blue hover:bg-brand-blue/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {saveMutation.isSuccess && (
        <p className="text-green-600 text-sm text-center">Settings saved successfully!</p>
      )}
    </div>
  );
}

function FaqTab() {
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ["/api/cms/chatbot-faq"],
    queryFn: () => apiRequest("GET", "/api/cms/chatbot-faq").then(r => r.json()),
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cms/chatbot-faq", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-faq"] }); setShowAdd(false); setQuestion(""); setAnswer(""); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/cms/chatbot-faq/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-faq"] }); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cms/chatbot-faq/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-faq"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/cms/chatbot-faq/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-faq"] }),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{faqs.length} FAQ entries</p>
        <Button data-testid="button-add-faq" onClick={() => setShowAdd(true)} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      {showAdd && (
        <Card className="border-brand-gold/50">
          <CardContent className="pt-4 space-y-3">
            <Input
              data-testid="input-faq-question"
              placeholder="Question (e.g., الأسعار كام؟ / What are the prices?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Textarea
              data-testid="input-faq-answer"
              placeholder="Answer the chatbot should give..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setShowAdd(false); setQuestion(""); setAnswer(""); }}>Cancel</Button>
              <Button
                data-testid="button-save-faq"
                onClick={() => createMutation.mutate({ question, answer, isActive: true, sortOrder: faqs.length })}
                disabled={!question.trim() || !answer.trim()}
                className="bg-brand-blue hover:bg-brand-blue/90"
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {faqs.map((faq: any) => (
        <Card key={faq.id} className={!faq.isActive ? "opacity-50" : ""}>
          <CardContent className="pt-4">
            {editingId === faq.id ? (
              <div className="space-y-3">
                <Input
                  data-testid={`input-edit-faq-question-${faq.id}`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Textarea
                  data-testid={`input-edit-faq-answer-${faq.id}`}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  <Button
                    onClick={() => updateMutation.mutate({ id: faq.id, data: { question, answer } })}
                    className="bg-brand-blue hover:bg-brand-blue/90"
                  >
                    Update
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-blue text-sm">Q: {faq.question}</p>
                  <p className="text-gray-600 text-sm mt-1">A: {faq.answer}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-toggle-faq-${faq.id}`}
                    onClick={() => toggleMutation.mutate({ id: faq.id, isActive: !faq.isActive })}
                    title={faq.isActive ? "Disable" : "Enable"}
                  >
                    {faq.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditingId(faq.id); setQuestion(faq.question); setAnswer(faq.answer); }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid={`button-delete-faq-${faq.id}`}
                    onClick={() => { if (confirm("Delete this FAQ?")) deleteMutation.mutate(faq.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {faqs.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No FAQ entries yet. Add questions and answers for the chatbot to use.</p>
        </div>
      )}
    </div>
  );
}

function OffersTab() {
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["/api/cms/chatbot-offers"],
    queryFn: () => apiRequest("GET", "/api/cms/chatbot-offers").then(r => r.json()),
  });

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hotelSlug, setHotelSlug] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => { setTitle(""); setDescription(""); setHotelSlug(""); setStartDate(""); setEndDate(""); };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/cms/chatbot-offers", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-offers"] }); setShowAdd(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PUT", `/api/cms/chatbot-offers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-offers"] }); setEditingId(null); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cms/chatbot-offers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-offers"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/cms/chatbot-offers/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-offers"] }),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  const OfferForm = ({ onSave, saving }: { onSave: () => void; saving: boolean }) => (
    <Card className="border-brand-gold/50">
      <CardContent className="pt-4 space-y-3">
        <Input data-testid="input-offer-title" placeholder="Offer Title (e.g., Summer Special 30% Off)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea data-testid="input-offer-description" placeholder="Offer details the chatbot will mention..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Hotel</label>
            <select data-testid="select-offer-hotel" className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={hotelSlug} onChange={(e) => setHotelSlug(e.target.value)}>
              {HOTEL_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
            <Input data-testid="input-offer-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">End Date</label>
            <Input data-testid="input-offer-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => { editingId ? setEditingId(null) : setShowAdd(false); resetForm(); }}>Cancel</Button>
          <Button data-testid="button-save-offer" onClick={onSave} disabled={!title.trim() || !description.trim() || saving} className="bg-brand-blue hover:bg-brand-blue/90">Save</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{offers.length} offers</p>
        <Button data-testid="button-add-offer" onClick={() => { setShowAdd(true); resetForm(); }} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="w-4 h-4 mr-2" /> Add Offer
        </Button>
      </div>

      {showAdd && (
        <OfferForm
          onSave={() => createMutation.mutate({ title, description, hotelSlug: hotelSlug || null, startDate: startDate || null, endDate: endDate || null, isActive: true })}
          saving={createMutation.isPending}
        />
      )}

      {offers.map((offer: any) => (
        editingId === offer.id ? (
          <OfferForm
            key={offer.id}
            onSave={() => updateMutation.mutate({ id: offer.id, data: { title, description, hotelSlug: hotelSlug || null, startDate: startDate || null, endDate: endDate || null } })}
            saving={updateMutation.isPending}
          />
        ) : (
          <Card key={offer.id} className={!offer.isActive ? "opacity-50" : ""}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-brand-blue">{offer.title}</p>
                    {offer.hotelSlug && (
                      <span className="text-xs bg-brand-gold/20 text-brand-blue px-2 py-0.5 rounded-full">
                        {HOTEL_OPTIONS.find(h => h.value === offer.hotelSlug)?.label || offer.hotelSlug}
                      </span>
                    )}
                    {!offer.hotelSlug && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">General</span>}
                  </div>
                  <p className="text-gray-600 text-sm">{offer.description}</p>
                  {(offer.startDate || offer.endDate) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {offer.startDate && `From: ${offer.startDate}`} {offer.endDate && `To: ${offer.endDate}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate({ id: offer.id, isActive: !offer.isActive })}>
                    {offer.isActive ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingId(offer.id); setTitle(offer.title); setDescription(offer.description);
                    setHotelSlug(offer.hotelSlug || ""); setStartDate(offer.startDate || ""); setEndDate(offer.endDate || "");
                  }}>Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this offer?")) deleteMutation.mutate(offer.id); }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {offers.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No offers yet. Add special offers the chatbot can mention to guests.</p>
        </div>
      )}
    </div>
  );
}

function ConversationsTab() {
  const { data: convos = [], isLoading } = useQuery({
    queryKey: ["/api/cms/chatbot-conversations"],
    queryFn: () => apiRequest("GET", "/api/cms/chatbot-conversations").then(r => r.json()),
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/cms/chatbot-conversations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-conversations"] }); queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-unseen-leads"] }); setSelectedId(null); },
  });

  const markSeenMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PUT", `/api/cms/chatbot-conversations/${id}/seen`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-conversations"] }); queryClient.invalidateQueries({ queryKey: ["/api/cms/chatbot-unseen-leads"] }); },
  });

  const handleSelectConvo = (conv: any) => {
    setSelectedId(conv.id);
    if (conv.hasLead && !conv.seen) {
      markSeenMutation.mutate(conv.id);
    }
  };

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  const filtered = convos.filter((c: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const msgs = (c.messages || []).map((m: any) => m.content).join(" ").toLowerCase();
    return msgs.includes(s) || (c.leadName || "").toLowerCase().includes(s) || (c.leadContact || "").toLowerCase().includes(s) || (c.hotelSlug || "").includes(s);
  });

  const selectedConvo = filtered.find((c: any) => c.id === selectedId);

  if (selectedConvo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedId(null)} className="text-brand-blue">
            Back to list
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this conversation?")) deleteMutation.mutate(selectedConvo.id); }}>
            <Trash2 className="w-4 h-4 text-red-500 mr-1" /> Delete
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Session: {selectedConvo.sessionId.slice(0, 20)}...</CardTitle>
                {selectedConvo.hotelSlug && <p className="text-xs text-gray-500 mt-1">Hotel: {HOTEL_OPTIONS.find(h => h.value === selectedConvo.hotelSlug)?.label || selectedConvo.hotelSlug}</p>}
              </div>
              {selectedConvo.hasLead && (
                <div className="text-right">
                  {selectedConvo.leadName && <p className="text-sm font-medium flex items-center gap-1"><User className="w-3 h-3" /> {selectedConvo.leadName}</p>}
                  {selectedConvo.leadContact && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      {selectedConvo.leadContact.includes("@") ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                      {selectedConvo.leadContact}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {(selectedConvo.messages || []).map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && <p className="text-[10px] opacity-60 mt-1">{new Date(msg.timestamp).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          data-testid="input-search-conversations"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-gray-500">{filtered.length} conversations</p>
      </div>

      {filtered.map((conv: any) => {
        const lastMsg = (conv.messages || []).slice(-1)[0];
        const msgCount = (conv.messages || []).length;
        return (
          <Card
            key={conv.id}
            data-testid={`card-conversation-${conv.id}`}
            className={`cursor-pointer hover:border-brand-blue/30 transition-colors ${conv.hasLead && !conv.seen ? "border-red-300 bg-red-50/30" : ""}`}
            onClick={() => handleSelectConvo(conv)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {conv.hasLead && !conv.seen && (
                      <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
                    )}
                    {conv.hasLead && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Lead</span>
                    )}
                    {conv.hotelSlug && (
                      <span className="text-xs bg-brand-gold/20 text-brand-blue px-2 py-0.5 rounded-full">
                        {HOTEL_OPTIONS.find(h => h.value === conv.hotelSlug)?.label || conv.hotelSlug}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{msgCount} messages</span>
                  </div>
                  {conv.hasLead && (
                    <p className="text-sm font-medium text-gray-700">
                      {conv.leadName && <span className="mr-2">{conv.leadName}</span>}
                      {conv.leadContact && <span className="text-gray-500">{conv.leadContact}</span>}
                    </p>
                  )}
                  {lastMsg && (
                    <p className="text-sm text-gray-500 truncate mt-1">{lastMsg.content?.slice(0, 100)}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString() : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{search ? "No conversations match your search" : "No conversations yet. They will appear here when guests chat with the bot."}</p>
        </div>
      )}
    </div>
  );
}

export default function CMSChatbot() {
  const [activeTab, setActiveTab] = useState<TabId>("settings");

  const { data: unseenData } = useQuery({
    queryKey: ["/api/cms/chatbot-unseen-leads"],
    queryFn: async () => {
      const res = await fetch("/api/cms/chatbot-unseen-leads", { credentials: "include" });
      if (!res.ok) return { count: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });
  const unseenCount = unseenData?.count || 0;

  return (
    <CMSLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Chatbot Management</h2>
        <p className="text-gray-500">Control how the booking assistant talks to your guests</p>
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            data-testid={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === "conversations" && unseenCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unseenCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "settings" && <SettingsTab />}
      {activeTab === "faq" && <FaqTab />}
      {activeTab === "offers" && <OffersTab />}
      {activeTab === "conversations" && <ConversationsTab />}
    </CMSLayout>
  );
}
