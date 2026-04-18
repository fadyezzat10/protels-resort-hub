import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Mail,
  Hotel,
  UtensilsCrossed,
  Star,
  Link2,
  Languages,
  BedDouble,
  Info,
  Palette,
  Video,
  ListOrdered,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface RoomDetail {
  name: string;
  size?: string;
  bed?: string;
  view?: string;
  amenities?: string[];
  description?: string;
  features?: string[];
  images?: string[];
}

interface DiningInfo {
  main?: { name: string; desc: string; hours: string };
  specialty?: { name: string; desc: string }[];
  bars?: string[];
}

interface HotelForm {
  slug: string;
  name: string;
  location: string;
  image: string;
  descriptionEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionDe: string;
  descriptionEs: string;
  descriptionRu: string;
  features: string[];
  rooms: string[];
  discount: string;
  dining: DiningInfo;
  roomDetails: RoomDetail[];
  gallery: string[];
  mapLink: string;
  bookingLink: string;
  phone: string;
  mobile: string;
  email: string;
  emailReservations: string;
  emailSales: string;
  mapEmbed: string;
  mapShareUrl: string;
  address: string;
  status: string;
  sortOrder: number;
  heroVideo: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  tabConfig: { id: string; label: string; visible: boolean; order: number }[];
  ratings: { platform: string; rating: number; maxRating: number; reviewCount: number; reviewUrl: string }[];
  tripAdvisorRank: string;
}

const emptyForm: HotelForm = {
  slug: "",
  name: "",
  location: "",
  image: "",
  descriptionEn: "",
  descriptionAr: "",
  descriptionFr: "",
  descriptionDe: "",
  descriptionEs: "",
  descriptionRu: "",
  features: [],
  rooms: [],
  discount: "",
  dining: { main: undefined, specialty: [], bars: [] },
  roomDetails: [],
  gallery: [],
  mapLink: "",
  bookingLink: "",
  phone: "",
  mobile: "",
  email: "",
  emailReservations: "",
  emailSales: "",
  mapEmbed: "",
  mapShareUrl: "",
  address: "",
  status: "draft",
  sortOrder: 0,
  heroVideo: "",
  theme: { primaryColor: "", secondaryColor: "", accentColor: "" },
  tabConfig: [
    { id: "overview", label: "Overview", visible: true, order: 1 },
    { id: "rooms", label: "Rooms", visible: true, order: 2 },
    { id: "dining", label: "Dining", visible: true, order: 3 },
    { id: "gallery", label: "Gallery", visible: true, order: 4 },
    { id: "features", label: "Features", visible: true, order: 5 },
    { id: "location", label: "Location", visible: true, order: 6 },
  ],
  ratings: [],
  tripAdvisorRank: "",
};

const FEATURE_SUGGESTIONS = [
  "Private Beach",
  "Swimming Pool",
  "Spa & Wellness",
  "Wi-Fi",
  "Kids Club",
  "Fitness Center",
  "Water Sports",
  "Diving Center",
  "Restaurant",
  "Bar & Lounge",
  "Room Service",
  "Airport Transfer",
  "Concierge",
  "Parking",
  "Laundry Service",
  "Entertainment",
  "Aquapark",
  "Garden",
  "Terrace",
  "Air Conditioning",
];

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

function toEmbedUrl(url: string): { embed: string; warning: string | null } {
  const trimmed = url.trim();
  if (!trimmed) return { embed: "", warning: null };

  if (trimmed.includes("maps.app.goo.gl") || trimmed.includes("goo.gl/maps")) {
    return {
      embed: trimmed,
      warning: "روابط maps.app.goo.gl المختصرة لا تدعم التضمين. افتح الرابط في المتصفح ثم اختر: Share → Embed a map → انسخ قيمة src من الـ iframe.",
    };
  }

  if (trimmed.includes("output=embed")) {
    return { embed: trimmed, warning: null };
  }

  if (trimmed.match(/maps\.google\.|google\.com\/maps/)) {
    const separator = trimmed.includes("?") ? "&" : "?";
    return { embed: trimmed + separator + "output=embed", warning: null };
  }

  return {
    embed: trimmed,
    warning: "تأكد أن الرابط من Google Maps وينتهي بـ &output=embed حتى تعمل المعاينة.",
  };
}

export default function CMSHotels() {
  const { toast } = useToast();
  const [view, setView] = useState<"list" | "editor">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm);
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());
  const [featureInput, setFeatureInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  const { data: hotels = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/hotels"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/cms/hotels", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setView("list");
      setForm(emptyForm);
      setEditingId(null);
      toast({ title: "تم إنشاء الفندق بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/cms/hotels/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
      setView("list");
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "تم تحديث الفندق بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/hotels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setDeleteId(null);
      toast({ title: "تم حذف الفندق بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const buildPayload = () => ({
    slug: form.slug,
    name: form.name,
    location: form.location,
    image: form.image || null,
    description: {
      en: form.descriptionEn,
      ar: form.descriptionAr,
      fr: form.descriptionFr,
      de: form.descriptionDe,
      es: form.descriptionEs,
      ru: form.descriptionRu,
    },
    features: form.features,
    rooms: form.roomDetails.length > 0 ? form.roomDetails.map((r) => r.name) : form.rooms,
    discount: form.discount || null,
    dining: form.dining,
    roomDetails: form.roomDetails,
    gallery: form.gallery,
    mapLink: form.mapLink || null,
    bookingLink: form.bookingLink || null,
    phone: form.phone || null,
    mobile: form.mobile || null,
    email: form.email || null,
    emailReservations: form.emailReservations || null,
    emailSales: form.emailSales || null,
    mapEmbed: form.mapEmbed || null,
    mapShareUrl: form.mapShareUrl || null,
    address: form.address || null,
    status: form.status,
    sortOrder: form.sortOrder,
    heroVideo: form.heroVideo || null,
    theme: (form.theme.primaryColor || form.theme.secondaryColor || form.theme.accentColor) ? form.theme : null,
    tabConfig: form.tabConfig.length > 0 ? { tabs: form.tabConfig } : null,
    ratings: form.ratings.length > 0 ? form.ratings : null,
    tripAdvisorRank: form.tripAdvisorRank || null,
  });

  const handleSubmit = () => {
    if (!form.name || !form.slug) {
      toast({
        title: "خطأ",
        description: "الاسم والرابط مطلوبان",
        variant: "destructive",
      });
      return;
    }
    const payload = buildPayload();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (hotel: any) => {
    setEditingId(hotel.id);
    setForm({
      slug: hotel.slug || "",
      name: hotel.name || "",
      location: hotel.location || "",
      image: hotel.image || "",
      descriptionEn: hotel.description?.en || "",
      descriptionAr: hotel.description?.ar || "",
      descriptionFr: hotel.description?.fr || "",
      descriptionDe: hotel.description?.de || "",
      descriptionEs: hotel.description?.es || "",
      descriptionRu: hotel.description?.ru || "",
      features: hotel.features || [],
      rooms: hotel.rooms || [],
      discount: hotel.discount || "",
      dining: hotel.dining || { main: undefined, specialty: [], bars: [] },
      roomDetails: hotel.roomDetails || [],
      gallery: hotel.gallery || [],
      mapLink: hotel.mapLink || "",
      bookingLink: hotel.bookingLink || "",
      phone: hotel.phone || "",
      mobile: hotel.mobile || "",
      email: hotel.email || "",
      emailReservations: hotel.emailReservations || "",
      emailSales: hotel.emailSales || "",
      mapEmbed: hotel.mapEmbed || "",
      mapShareUrl: hotel.mapShareUrl || "",
      address: hotel.address || "",
      status: hotel.status || "draft",
      sortOrder: hotel.sortOrder || 0,
      heroVideo: hotel.heroVideo || "",
      theme: hotel.theme || { primaryColor: "", secondaryColor: "", accentColor: "" },
      tabConfig: hotel.tabConfig?.tabs || [
        { id: "overview", label: "Overview", visible: true, order: 1 },
        { id: "rooms", label: "Rooms", visible: true, order: 2 },
        { id: "dining", label: "Dining", visible: true, order: 3 },
        { id: "gallery", label: "Gallery", visible: true, order: 4 },
        { id: "features", label: "Features", visible: true, order: 5 },
        { id: "location", label: "Location", visible: true, order: 6 },
      ],
      ratings: hotel.ratings || [],
      tripAdvisorRank: (hotel as any).tripAdvisorRank || "",
    });
    setExpandedRooms(new Set());
    setView("editor");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExpandedRooms(new Set());
    setView("editor");
  };

  const toggleRoom = (index: number) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addRoom = () => {
    const newRooms = [
      ...form.roomDetails,
      { name: "", size: "", bed: "", view: "", amenities: [], description: "", features: [], images: [] },
    ];
    setForm({ ...form, roomDetails: newRooms });
    setExpandedRooms((prev) => new Set(prev).add(newRooms.length - 1));
  };

  const updateRoom = (index: number, field: string, value: any) => {
    const newRooms = [...form.roomDetails];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setForm({ ...form, roomDetails: newRooms });
  };

  const removeRoom = (index: number) => {
    setForm({
      ...form,
      roomDetails: form.roomDetails.filter((_, i) => i !== index),
    });
    setExpandedRooms((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  const addRoomImage = (roomIndex: number, url: string) => {
    if (!url.trim()) return;
    const newRooms = [...form.roomDetails];
    newRooms[roomIndex] = {
      ...newRooms[roomIndex],
      images: [...(newRooms[roomIndex].images || []), url.trim()],
    };
    setForm({ ...form, roomDetails: newRooms });
  };

  const removeRoomImage = (roomIndex: number, imgIndex: number) => {
    const newRooms = [...form.roomDetails];
    newRooms[roomIndex] = {
      ...newRooms[roomIndex],
      images: (newRooms[roomIndex].images || []).filter((_, i) => i !== imgIndex),
    };
    setForm({ ...form, roomDetails: newRooms });
  };

  const addFeature = (feature: string) => {
    const trimmed = feature.trim();
    if (trimmed && !form.features.includes(trimmed)) {
      setForm({ ...form, features: [...form.features, trimmed] });
    }
    setFeatureInput("");
  };

  const removeFeature = (feature: string) => {
    setForm({ ...form, features: form.features.filter((f) => f !== feature) });
  };

  const addGalleryImage = () => {
    if (galleryInput.trim()) {
      setForm({ ...form, gallery: [...form.gallery, galleryInput.trim()] });
      setGalleryInput("");
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm({ ...form, gallery: form.gallery.filter((_, i) => i !== index) });
  };

  const addSpecialtyRestaurant = () => {
    const specialty = [...(form.dining.specialty || []), { name: "", desc: "" }];
    setForm({ ...form, dining: { ...form.dining, specialty } });
  };

  const removeSpecialtyRestaurant = (index: number) => {
    const specialty = (form.dining.specialty || []).filter((_, i) => i !== index);
    setForm({ ...form, dining: { ...form.dining, specialty } });
  };

  const updateSpecialty = (index: number, field: string, value: string) => {
    const specialty = [...(form.dining.specialty || [])];
    specialty[index] = { ...specialty[index], [field]: value };
    setForm({ ...form, dining: { ...form.dining, specialty } });
  };

  const addBar = () => {
    setForm({ ...form, dining: { ...form.dining, bars: [...(form.dining.bars || []), ""] } });
  };

  const removeBar = (index: number) => {
    const bars = (form.dining.bars || []).filter((_, i) => i !== index);
    setForm({ ...form, dining: { ...form.dining, bars } });
  };

  const updateBar = (index: number, value: string) => {
    const bars = [...(form.dining.bars || [])];
    bars[index] = value;
    setForm({ ...form, dining: { ...form.dining, bars } });
  };

  if (view === "editor") {
    return (
      <CMSLayout>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              data-testid="button-back-to-list"
              variant="ghost"
              size="sm"
              onClick={() => {
                setView("list");
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للقائمة
            </Button>
            <h2 className="text-2xl font-serif text-brand-blue">
              {editingId ? "تعديل الفندق" : "إنشاء فندق جديد"}
            </h2>
          </div>
          <Button
            data-testid="button-save-hotel"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            <Save className="w-4 h-4 mr-2" />
            {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ الفندق"}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-gray-100 p-1 rounded-lg mb-6">
            <TabsTrigger data-testid="tab-basic" value="basic" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Info className="w-3.5 h-3.5" />
              المعلومات الأساسية
            </TabsTrigger>
            <TabsTrigger data-testid="tab-descriptions" value="descriptions" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Languages className="w-3.5 h-3.5" />
              الوصف
            </TabsTrigger>
            <TabsTrigger data-testid="tab-images" value="images" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ImageIcon className="w-3.5 h-3.5" />
              الصور
            </TabsTrigger>
            <TabsTrigger data-testid="tab-rooms" value="rooms" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <BedDouble className="w-3.5 h-3.5" />
              الغرف
            </TabsTrigger>
            <TabsTrigger data-testid="tab-dining" value="dining" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              المطاعم
            </TabsTrigger>
            <TabsTrigger data-testid="tab-features" value="features" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Star className="w-3.5 h-3.5" />
              المميزات
            </TabsTrigger>
            <TabsTrigger data-testid="tab-links" value="links" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Link2 className="w-3.5 h-3.5" />
              الروابط
            </TabsTrigger>
            <TabsTrigger data-testid="tab-video" value="video" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Video className="w-3.5 h-3.5" />
              الفيديو
            </TabsTrigger>
            <TabsTrigger data-testid="tab-theme" value="theme" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Palette className="w-3.5 h-3.5" />
              الألوان
            </TabsTrigger>
            <TabsTrigger data-testid="tab-tabconfig" value="tabconfig" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ListOrdered className="w-3.5 h-3.5" />
              التبويبات
            </TabsTrigger>
            <TabsTrigger data-testid="tab-ratings" value="ratings" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Star className="w-3.5 h-3.5" />
              التقييمات
            </TabsTrigger>
            <TabsTrigger data-testid="tab-contact" value="contact" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Phone className="w-3.5 h-3.5" />
              التواصل
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">المعلومات الأساسية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الاسم *</label>
                  <Input
                    data-testid="input-hotel-name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: !editingId || !f.slug ? generateSlug(name) : f.slug,
                      }));
                    }}
                    placeholder="اسم الفندق"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الرابط (Slug) *</label>
                  <Input
                    data-testid="input-hotel-slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="hotel-slug"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الموقع</label>
                  <Input
                    data-testid="input-hotel-location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="المدينة، البلد"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الحالة</label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger data-testid="select-hotel-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">ترتيب العرض</label>
                  <Input
                    data-testid="input-hotel-sort"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">الخصم</label>
                  <Input
                    data-testid="input-hotel-discount"
                    value={form.discount}
                    onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    placeholder="مثال: 15% OFF"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Descriptions */}
          <TabsContent value="descriptions">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">الوصف بجميع اللغات</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇬🇧 English</label>
                  <Textarea
                    data-testid="input-hotel-desc-en"
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    placeholder="English description"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇸🇦 العربية</label>
                  <Textarea
                    data-testid="input-hotel-desc-ar"
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                    placeholder="الوصف بالعربية"
                    rows={4}
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇫🇷 Français</label>
                  <Textarea
                    data-testid="input-hotel-desc-fr"
                    value={form.descriptionFr}
                    onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                    placeholder="Description en français"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇩🇪 Deutsch</label>
                  <Textarea
                    data-testid="input-hotel-desc-de"
                    value={form.descriptionDe}
                    onChange={(e) => setForm({ ...form, descriptionDe: e.target.value })}
                    placeholder="Beschreibung auf Deutsch"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇪🇸 Español</label>
                  <Textarea
                    data-testid="input-hotel-desc-es"
                    value={form.descriptionEs}
                    onChange={(e) => setForm({ ...form, descriptionEs: e.target.value })}
                    placeholder="Descripción en español"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">🇷🇺 Русский</label>
                  <Textarea
                    data-testid="input-hotel-desc-ru"
                    value={form.descriptionRu}
                    onChange={(e) => setForm({ ...form, descriptionRu: e.target.value })}
                    placeholder="Описание на русском"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Images */}
          <TabsContent value="images">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">الصور</h3>

              <div>
                <label className="text-sm font-medium mb-1.5 block">الصورة الرئيسية</label>
                <Input
                  data-testid="input-hotel-image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="رابط الصورة الرئيسية (https://...)"
                />
                {form.image && (
                  <div className="mt-3">
                    <img
                      src={form.image}
                      alt="Main preview"
                      className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <label className="text-sm font-medium mb-3 block">معرض الصور</label>
                <div className="flex gap-2 mb-4">
                  <Input
                    data-testid="input-gallery-url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="رابط الصورة"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGalleryImage();
                      }
                    }}
                  />
                  <Button
                    data-testid="button-add-gallery-image"
                    type="button"
                    variant="outline"
                    onClick={addGalleryImage}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {form.gallery.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {form.gallery.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                            (e.target as HTMLImageElement).className =
                              "w-full h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center";
                          }}
                        />
                        <button
                          data-testid={`button-remove-gallery-${index}`}
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-400 truncate mt-1">{url}</p>
                      </div>
                    ))}
                  </div>
                )}
                {form.gallery.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">لم تتم إضافة صور بعد</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Room Details */}
          <TabsContent value="rooms">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-semibold text-brand-blue">تفاصيل الغرف</h3>
                <Button data-testid="button-add-room" type="button" variant="outline" size="sm" onClick={addRoom}>
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة غرفة
                </Button>
              </div>

              {form.roomDetails.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">لا توجد غرف. اضغط "إضافة غرفة" للبدء.</p>
              )}

              {form.roomDetails.map((room, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleRoom(index)}
                    data-testid={`room-header-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <BedDouble className="w-4 h-4 text-brand-blue" />
                      <span className="font-medium">{room.name || `غرفة ${index + 1}`}</span>
                      {room.size && <span className="text-xs text-gray-400">({room.size})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid={`button-remove-room-${index}`}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRoom(index);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      {expandedRooms.has(index) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedRooms.has(index) && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">اسم الغرفة</label>
                          <Input
                            data-testid={`input-room-name-${index}`}
                            value={room.name}
                            onChange={(e) => updateRoom(index, "name", e.target.value)}
                            placeholder="Standard Room"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">المساحة</label>
                          <Input
                            data-testid={`input-room-size-${index}`}
                            value={room.size || ""}
                            onChange={(e) => updateRoom(index, "size", e.target.value)}
                            placeholder="30 m²"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">نوع السرير</label>
                          <Input
                            data-testid={`input-room-bed-${index}`}
                            value={room.bed || ""}
                            onChange={(e) => updateRoom(index, "bed", e.target.value)}
                            placeholder="King Bed"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">الإطلالة</label>
                          <Input
                            data-testid={`input-room-view-${index}`}
                            value={room.view || ""}
                            onChange={(e) => updateRoom(index, "view", e.target.value)}
                            placeholder="Sea View"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">الوصف</label>
                        <Textarea
                          data-testid={`input-room-desc-${index}`}
                          value={room.description || ""}
                          onChange={(e) => updateRoom(index, "description", e.target.value)}
                          placeholder="وصف الغرفة..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">وسائل الراحة (مفصولة بفواصل)</label>
                        <Input
                          data-testid={`input-room-amenities-${index}`}
                          value={(room.amenities || []).join(", ")}
                          onChange={(e) =>
                            updateRoom(
                              index,
                              "amenities",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Balcony, Air Conditioning, Wi-Fi"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">مميزات الغرفة (مفصولة بفواصل)</label>
                        <Input
                          data-testid={`input-room-features-${index}`}
                          value={(room.features || []).join(", ")}
                          onChange={(e) =>
                            updateRoom(
                              index,
                              "features",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          placeholder="Non-Smoking, Shower, Bathtub"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">صور الغرفة</label>
                        <RoomImageInput roomIndex={index} onAdd={addRoomImage} />
                        {(room.images || []).length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                            {(room.images || []).map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="relative group">
                                <img
                                  src={imgUrl}
                                  alt={`Room ${index + 1} img ${imgIdx + 1}`}
                                  className="w-full h-16 object-cover rounded border border-gray-200"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                                <button
                                  type="button"
                                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeRoomImage(index, imgIdx)}
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 5: Dining */}
          <TabsContent value="dining">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">المطاعم والمقاهي</h3>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">المطعم الرئيسي</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">الاسم</label>
                    <Input
                      data-testid="input-dining-main-name"
                      value={form.dining.main?.name || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dining: {
                            ...form.dining,
                            main: { ...form.dining.main!, name: e.target.value, desc: form.dining.main?.desc || "", hours: form.dining.main?.hours || "" },
                          },
                        })
                      }
                      placeholder="اسم المطعم الرئيسي"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">ساعات العمل</label>
                    <Input
                      data-testid="input-dining-main-hours"
                      value={form.dining.main?.hours || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dining: {
                            ...form.dining,
                            main: { ...form.dining.main!, name: form.dining.main?.name || "", desc: form.dining.main?.desc || "", hours: e.target.value },
                          },
                        })
                      }
                      placeholder="07:00 – 22:00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">الوصف</label>
                  <Textarea
                    data-testid="input-dining-main-desc"
                    value={form.dining.main?.desc || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dining: {
                          ...form.dining,
                          main: { ...form.dining.main!, name: form.dining.main?.name || "", desc: e.target.value, hours: form.dining.main?.hours || "" },
                        },
                      })
                    }
                    placeholder="وصف المطعم الرئيسي"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">المطاعم المتخصصة</h4>
                  <Button data-testid="button-add-specialty" type="button" variant="outline" size="sm" onClick={addSpecialtyRestaurant}>
                    <Plus className="w-4 h-4 mr-1" />
                    إضافة
                  </Button>
                </div>
                {(form.dining.specialty || []).map((rest, index) => (
                  <div key={index} className="flex gap-3 items-start border border-gray-100 rounded-lg p-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        data-testid={`input-specialty-name-${index}`}
                        value={rest.name}
                        onChange={(e) => updateSpecialty(index, "name", e.target.value)}
                        placeholder="اسم المطعم"
                      />
                      <Textarea
                        data-testid={`input-specialty-desc-${index}`}
                        value={rest.desc}
                        onChange={(e) => updateSpecialty(index, "desc", e.target.value)}
                        placeholder="وصف المطعم"
                        rows={2}
                      />
                    </div>
                    <Button
                      data-testid={`button-remove-specialty-${index}`}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecialtyRestaurant(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {(form.dining.specialty || []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">لا توجد مطاعم متخصصة</p>
                )}
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">البارات</h4>
                  <Button data-testid="button-add-bar" type="button" variant="outline" size="sm" onClick={addBar}>
                    <Plus className="w-4 h-4 mr-1" />
                    إضافة
                  </Button>
                </div>
                {(form.dining.bars || []).map((bar, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      data-testid={`input-bar-${index}`}
                      value={bar}
                      onChange={(e) => updateBar(index, e.target.value)}
                      placeholder="اسم البار"
                    />
                    <Button
                      data-testid={`button-remove-bar-${index}`}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBar(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {(form.dining.bars || []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">لا توجد بارات</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 6: Features */}
          <TabsContent value="features">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">مميزات الفندق</h3>

              <div>
                <label className="text-sm font-medium mb-1.5 block">إضافة ميزة</label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-feature"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="اكتب ميزة واضغط Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature(featureInput);
                      }
                    }}
                  />
                  <Button
                    data-testid="button-add-feature"
                    type="button"
                    variant="outline"
                    onClick={() => addFeature(featureInput)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-sm px-3 py-1.5 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors"
                      onClick={() => removeFeature(feature)}
                      data-testid={`badge-feature-${feature.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      {feature}
                      <X className="w-3 h-3 ml-1.5" />
                    </Badge>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">اقتراحات شائعة:</p>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_SUGGESTIONS.filter((s) => !form.features.includes(s)).map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-brand-blue hover:text-white transition-colors"
                      onClick={() => addFeature(suggestion)}
                      data-testid={`suggestion-${suggestion.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 7: Links */}
          <TabsContent value="links">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">الروابط</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  رابط خرائط جوجل
                </label>
                <Input
                  data-testid="input-hotel-map"
                  value={form.mapLink}
                  onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                />
                {form.mapLink && (
                  <a
                    href={form.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-blue hover:underline mt-2 inline-block"
                  >
                    فتح في خرائط جوجل ↗
                  </a>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  رابط الحجز الخاص بالفندق
                </label>
                <Input
                  data-testid="input-hotel-booking-link"
                  value={form.bookingLink}
                  onChange={(e) => setForm({ ...form, bookingLink: e.target.value })}
                  placeholder="https://protels.book-onlinenow.net/..."
                />
                <p className="text-xs text-gray-400 mt-1">رابط صفحة الحجز الخاصة بهذا الفندق. لو فاضي هيستخدم الرابط العام من الإعدادات.</p>
                {form.bookingLink && (
                  <a
                    href={form.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-blue hover:underline mt-2 inline-block"
                  >
                    فتح صفحة الحجز ↗
                  </a>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">فيديو الصفحة الرئيسية</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block">رابط الفيديو (MP4)</label>
                <Input
                  data-testid="input-hotel-hero-video"
                  value={form.heroVideo}
                  onChange={(e) => setForm({ ...form, heroVideo: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-gray-400 mt-1">رابط فيديو MP4 يظهر في خلفية صفحة الفندق. ارفع الفيديو أولاً في مكتبة الوسائط.</p>
              </div>
              {form.heroVideo && (
                <div className="mt-4">
                  <label className="text-sm font-medium mb-1.5 block">معاينة الفيديو</label>
                  <video src={form.heroVideo} controls muted className="w-full max-w-lg rounded-lg border" />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="theme">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">ألوان مخصصة لهذا الفندق</h3>
              <p className="text-sm text-gray-500">اتركها فارغة لاستخدام الألوان العامة للموقع</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">اللون الأساسي</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.theme.primaryColor || "#1a2744"}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      data-testid="input-hotel-theme-primary"
                      value={form.theme.primaryColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, primaryColor: e.target.value } })}
                      placeholder="اللون الأساسي (مثلاً #1a2744)"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">اللون الثانوي</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.theme.secondaryColor || "#c4a96a"}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      data-testid="input-hotel-theme-secondary"
                      value={form.theme.secondaryColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, secondaryColor: e.target.value } })}
                      placeholder="اللون الثانوي (مثلاً #c4a96a)"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">لون التمييز</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={form.theme.accentColor || "#e8d5b0"}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, accentColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Input
                      data-testid="input-hotel-theme-accent"
                      value={form.theme.accentColor}
                      onChange={(e) => setForm({ ...form, theme: { ...form.theme, accentColor: e.target.value } })}
                      placeholder="لون التمييز (مثلاً #e8d5b0)"
                    />
                  </div>
                </div>
              </div>
              {(form.theme.primaryColor || form.theme.secondaryColor || form.theme.accentColor) && (
                <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: form.theme.primaryColor || '#1a2744' }}>
                  <h4 className="font-serif text-lg" style={{ color: form.theme.secondaryColor || '#c4a96a' }}>معاينة الألوان</h4>
                  <p className="text-sm mt-1" style={{ color: '#ffffff' }}>هكذا ستظهر ألوان صفحة الفندق</p>
                  <button className="mt-2 px-4 py-2 rounded text-sm font-medium" style={{ backgroundColor: form.theme.accentColor || '#e8d5b0', color: form.theme.primaryColor || '#1a2744' }}>زر تجريبي</button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm({ ...form, theme: { primaryColor: "", secondaryColor: "", accentColor: "" } })}
              >
                إعادة تعيين الألوان
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tabconfig">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">إعدادات التبويبات</h3>
              <p className="text-sm text-gray-500">تحكم في ترتيب وإظهار/إخفاء التبويبات في صفحة الفندق</p>
              <div className="space-y-2">
                {[...form.tabConfig].sort((a, b) => a.order - b.order).map((tab, idx) => (
                  <div key={tab.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium flex-1">{tab.label}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => {
                          const sorted = [...form.tabConfig].sort((a, b) => a.order - b.order);
                          if (idx > 0) {
                            const temp = sorted[idx].order;
                            sorted[idx].order = sorted[idx - 1].order;
                            sorted[idx - 1].order = temp;
                            setForm({ ...form, tabConfig: sorted });
                          }
                        }}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={idx === form.tabConfig.length - 1}
                        onClick={() => {
                          const sorted = [...form.tabConfig].sort((a, b) => a.order - b.order);
                          if (idx < sorted.length - 1) {
                            const temp = sorted[idx].order;
                            sorted[idx].order = sorted[idx + 1].order;
                            sorted[idx + 1].order = temp;
                            setForm({ ...form, tabConfig: sorted });
                          }
                        }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = form.tabConfig.map((t) =>
                            t.id === tab.id ? { ...t, visible: !t.visible } : t
                          );
                          setForm({ ...form, tabConfig: updated });
                        }}
                      >
                        {tab.visible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ratings">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-semibold text-brand-blue">تقييمات المنصات</h3>
                <Button
                  type="button"
                  size="sm"
                  data-testid="button-add-rating"
                  onClick={() => {
                    setForm({
                      ...form,
                      ratings: [...form.ratings, { platform: "google", rating: 0, maxRating: 5, reviewCount: 0, reviewUrl: "" }],
                    });
                  }}
                  className="bg-brand-blue hover:bg-brand-blue/90"
                >
                  <Plus className="w-4 h-4 mr-1" /> إضافة تقييم
                </Button>
              </div>
              <p className="text-sm text-gray-500">أضف تقييمات الفندق من المنصات المختلفة (Google, TripAdvisor, HolidayCheck)</p>
              {form.ratings.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p>لا توجد تقييمات بعد. اضغط "إضافة تقييم" لإضافة أول تقييم.</p>
                </div>
              )}
              <div className="space-y-4">
                {form.ratings.map((rating, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-brand-blue">تقييم #{idx + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        data-testid={`button-remove-rating-${idx}`}
                        onClick={() => {
                          const updated = form.ratings.filter((_, i) => i !== idx);
                          setForm({ ...form, ratings: updated });
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">المنصة</label>
                        <Select
                          value={rating.platform}
                          onValueChange={(val) => {
                            const updated = [...form.ratings];
                            updated[idx] = { ...updated[idx], platform: val, maxRating: val === "holidaycheck" ? 6 : 5 };
                            setForm({ ...form, ratings: updated });
                          }}
                        >
                          <SelectTrigger data-testid={`select-platform-${idx}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                            <SelectItem value="holidaycheck">HolidayCheck</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">التقييم (من {rating.maxRating})</label>
                        <Input
                          data-testid={`input-rating-${idx}`}
                          type="number"
                          step="0.1"
                          min="0"
                          max={rating.maxRating}
                          value={rating.rating}
                          onChange={(e) => {
                            const updated = [...form.ratings];
                            updated[idx] = { ...updated[idx], rating: parseFloat(e.target.value) || 0 };
                            setForm({ ...form, ratings: updated });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">عدد التقييمات</label>
                        <Input
                          data-testid={`input-review-count-${idx}`}
                          type="number"
                          min="0"
                          value={rating.reviewCount}
                          onChange={(e) => {
                            const updated = [...form.ratings];
                            updated[idx] = { ...updated[idx], reviewCount: parseInt(e.target.value) || 0 };
                            setForm({ ...form, ratings: updated });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">رابط صفحة التقييمات</label>
                        <Input
                          data-testid={`input-review-url-${idx}`}
                          value={rating.reviewUrl}
                          onChange={(e) => {
                            const updated = [...form.ratings];
                            updated[idx] = { ...updated[idx], reviewUrl: e.target.value };
                            setForm({ ...form, ratings: updated });
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TripAdvisor Rank */}
              <div className="border-t pt-5 mt-2">
                <h4 className="text-sm font-semibold text-brand-blue mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#00AF87" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/>
                    <circle cx="8.5" cy="11.5" r="2.5"/>
                    <circle cx="15.5" cy="11.5" r="2.5"/>
                    <path d="M12 7c-1.5 0-2.9.5-4 1.3L9.5 10c.7-.6 1.6-1 2.5-1s1.8.4 2.5 1l1.5-1.7C15 7.5 13.6 7 12 7z"/>
                  </svg>
                  ترتيب TripAdvisor (Travellers' Choice)
                </h4>
                <p className="text-xs text-gray-400 mb-2">مثال: Ranked #2 of 15 Hotels in Marsa Alam</p>
                <input
                  type="text"
                  data-testid="input-tripadvisor-rank"
                  value={form.tripAdvisorRank}
                  onChange={(e) => setForm({ ...form, tripAdvisorRank: e.target.value })}
                  placeholder="Ranked #1 of 24 Hotels in Marsa Alam"
                  dir="ltr"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Contact */}
          <TabsContent value="contact">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-brand-blue border-b pb-3">معلومات التواصل</h3>
              <p className="text-sm text-gray-500">هذه المعلومات ستظهر في صفحة "الموقع والتواصل" الخاصة بالفندق وصفحة التواصل الرئيسية.</p>

              {/* Address */}
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-gold" />
                  العنوان الكامل
                </label>
                <Input
                  data-testid="input-hotel-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="مثال: 20 Km North of Marsa Alam, Red Sea 84721, Egypt"
                  dir="ltr"
                />
              </div>

              {/* Phone + Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-gold" />
                    رقم التليفون الثابت
                  </label>
                  <Input
                    data-testid="input-hotel-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+20 65 338 0063"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-brand-gold" />
                    رقم الموبايل
                  </label>
                  <Input
                    data-testid="input-hotel-mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+20 150 092 5579"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Email Reservations + Sales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-gold" />
                    إيميل الحجوزات
                  </label>
                  <Input
                    data-testid="input-hotel-email-reservations"
                    value={form.emailReservations}
                    onChange={(e) => setForm({ ...form, emailReservations: e.target.value })}
                    placeholder="reservation@protels.com"
                    dir="ltr"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-brand-gold" />
                    إيميل المبيعات
                  </label>
                  <Input
                    data-testid="input-hotel-email-sales"
                    value={form.emailSales}
                    onChange={(e) => setForm({ ...form, emailSales: e.target.value })}
                    placeholder="sales@protels.com"
                    dir="ltr"
                    type="email"
                  />
                </div>
              </div>

              {/* Map Embed + Map Share URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    رابط خريطة Google (للتضمين)
                  </label>
                  <Textarea
                    data-testid="input-hotel-map-embed"
                    value={form.mapEmbed}
                    onChange={(e) => {
                      const { embed } = toEmbedUrl(e.target.value);
                      setForm({ ...form, mapEmbed: embed });
                    }}
                    placeholder="https://maps.google.com/maps?cid=XXXX&output=embed"
                    dir="ltr"
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Google Maps → Share → Embed a map → انسخ قيمة الـ src</p>
                  {form.mapEmbed && toEmbedUrl(form.mapEmbed).warning && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-start gap-2">
                      <span className="shrink-0">⚠️</span>
                      <span>{toEmbedUrl(form.mapEmbed).warning}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-gold" />
                    رابط فتح في Google Maps
                  </label>
                  <Textarea
                    data-testid="input-hotel-map-share-url"
                    value={form.mapShareUrl}
                    onChange={(e) => setForm({ ...form, mapShareUrl: e.target.value })}
                    placeholder="https://www.google.com/maps?q=25.235576,34.795265"
                    dir="ltr"
                    rows={3}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">الرابط اللي بيفتح الخريطة في Google Maps مباشرة</p>
                </div>
              </div>

              {form.mapEmbed && (() => {
                const { warning } = toEmbedUrl(form.mapEmbed);
                return (
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-600">معاينة الخريطة:</p>
                    {warning ? (
                      <div className="h-48 w-full bg-gray-100 rounded border flex flex-col items-center justify-center gap-3 text-center px-6">
                        <span className="text-3xl">🗺️</span>
                        <p className="text-sm text-gray-500">المعاينة غير متاحة — الرابط غير صالح للتضمين</p>
                        <p className="text-xs text-gray-400">اتبع التعليمات أعلاه للحصول على رابط التضمين الصحيح</p>
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-gray-100 overflow-hidden rounded border">
                        <iframe
                          src={form.mapEmbed}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Hotel Map Preview"
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">الفنادق والمنتجعات</h2>
          <p className="text-gray-500">إدارة العقارات الفندقية</p>
        </div>
        <Button data-testid="button-create-hotel" onClick={openCreate} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="w-4 h-4 mr-2" /> فندق جديد
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">الصورة</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : hotels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  لا توجد فنادق. أضف فندقك الأول.
                </TableCell>
              </TableRow>
            ) : (
              hotels.map((hotel: any) => (
                <TableRow key={hotel.id} data-testid={`row-hotel-${hotel.id}`}>
                  <TableCell>
                    {hotel.image ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Hotel className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell className="text-gray-500">{hotel.location}</TableCell>
                  <TableCell>
                    <Badge variant={hotel.status === "published" ? "default" : "secondary"}>
                      {hotel.status === "published" ? "منشور" : "مسودة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{hotel.sortOrder ?? 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      data-testid={`button-edit-hotel-${hotel.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(hotel)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`button-delete-hotel-${hotel.id}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(hotel.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفندق</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الفندق؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-hotel"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}

function RoomImageInput({ roomIndex, onAdd }: { roomIndex: number; onAdd: (roomIndex: number, url: string) => void }) {
  const [url, setUrl] = useState("");
  return (
    <div className="flex gap-2">
      <Input
        data-testid={`input-room-image-${roomIndex}`}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="رابط صورة الغرفة"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd(roomIndex, url);
            setUrl("");
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onAdd(roomIndex, url);
          setUrl("");
        }}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
