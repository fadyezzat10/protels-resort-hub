import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import {
  Mail,
  MailOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  Building2,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hotel: string | null;
  message: string;
  status: string;
  createdAt: string;
}

const HOTEL_LABELS: Record<string, string> = {
  general: "استفسار عام",
  "crystal-beach": "Protels Crystal Beach",
  "beach-club": "Protels Beach Club & SPA",
  "la-plage": "Protels La Plage",
  "royal-bay": "Protels Royal Bay",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CMSMessages() {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: messages = [], isLoading, refetch } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/cms/contact-submissions"],
    queryFn: async () => {
      const res = await fetch("/api/cms/contact-submissions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return [...data].sort(
        (a: ContactSubmission, b: ContactSubmission) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const markStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/cms/contact-submissions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/messages-unread-count"] });
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/contact-submissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/messages-unread-count"] });
      setDeleteId(null);
      toast({ title: "تم حذف الرسالة" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const toggleExpand = (id: number, status: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (status === "unread") {
          markStatusMutation.mutate({ id, status: "read" });
        }
      }
      return next;
    });
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif text-brand-blue flex items-center gap-3">
            <Mail className="w-6 h-6" />
            صندوق الرسائل
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} جديدة
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            رسائل نموذج التواصل من الموقع — إجمالي {messages.length} رسالة
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          data-testid="button-refresh-messages"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          تحديث
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <Mail className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 text-lg font-medium">لا توجد رسائل بعد</p>
          <p className="text-gray-400 text-sm mt-1">
            ستظهر هنا رسائل زوار الموقع عبر صفحة التواصل
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isExpanded = expanded.has(msg.id);
            const isUnread = msg.status === "unread";

            return (
              <div
                key={msg.id}
                className={`bg-white rounded-lg border transition-all ${
                  isUnread
                    ? "border-brand-blue/30 shadow-sm ring-1 ring-brand-blue/10"
                    : "border-gray-200"
                }`}
                data-testid={`message-card-${msg.id}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer select-none"
                  onClick={() => toggleExpand(msg.id, msg.status)}
                >
                  <div className="flex-shrink-0">
                    {isUnread ? (
                      <Mail className="w-5 h-5 text-brand-blue" />
                    ) : (
                      <MailOpen className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-semibold text-sm ${
                          isUnread ? "text-brand-blue" : "text-gray-700"
                        }`}
                        data-testid={`message-name-${msg.id}`}
                      >
                        {msg.name}
                      </span>
                      {isUnread && (
                        <Badge className="bg-brand-blue text-white text-[10px] px-1.5 py-0 h-4">
                          جديد
                        </Badge>
                      )}
                      {msg.hotel && msg.hotel !== "general" && (
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          — {HOTEL_LABELS[msg.hotel] || msg.hotel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {msg.email}
                      {msg.phone && <span className="ml-2">· {msg.phone}</span>}
                    </p>
                    {!isExpanded && (
                      <p className="text-sm text-gray-500 truncate mt-1">{msg.message}</p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden md:block whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">الاسم:</span>
                        <span data-testid={`message-full-name-${msg.id}`}>{msg.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">البريد:</span>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-brand-blue hover:underline"
                          data-testid={`message-email-${msg.id}`}
                        >
                          {msg.email}
                        </a>
                      </div>
                      {msg.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">الهاتف:</span>
                          <a
                            href={`tel:${msg.phone}`}
                            className="text-brand-blue hover:underline"
                            data-testid={`message-phone-${msg.id}`}
                          >
                            {msg.phone}
                          </a>
                        </div>
                      )}
                      {msg.hotel && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">الفندق:</span>
                          <span>{HOTEL_LABELS[msg.hotel] || msg.hotel}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">التاريخ:</span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">الرسالة:</p>
                      <p
                        className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                        data-testid={`message-body-${msg.id}`}
                      >
                        {msg.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          markStatusMutation.mutate({
                            id: msg.id,
                            status: msg.status === "read" ? "unread" : "read",
                          })
                        }
                        disabled={markStatusMutation.isPending}
                        data-testid={`button-toggle-status-${msg.id}`}
                      >
                        {msg.status === "read" ? (
                          <>
                            <Mail className="w-4 h-4 mr-1" />
                            وضع علامة كـ"غير مقروءة"
                          </>
                        ) : (
                          <>
                            <MailOpen className="w-4 h-4 mr-1" />
                            وضع علامة كـ"مقروءة"
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setDeleteId(msg.id)}
                        data-testid={`button-delete-message-${msg.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الرسالة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذه الخطوة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
