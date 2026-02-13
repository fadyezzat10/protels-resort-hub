import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2, Save, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ROLES = [
  { value: "super_admin", label: "Super Admin", description: "صلاحيات كاملة" },
  { value: "content_manager", label: "Content Manager", description: "إدارة المحتوى فقط" },
  { value: "editor", label: "Editor", description: "تعديل بدون حذف" },
  { value: "viewer", label: "Viewer", description: "قراءة فقط" },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case "super_admin": return "bg-red-100 text-red-800";
    case "content_manager": return "bg-blue-100 text-blue-800";
    case "editor": return "bg-green-100 text-green-800";
    case "viewer": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getRoleLabel = (role: string) => {
  const found = ROLES.find(r => r.value === role);
  return found ? found.label : role;
};

interface UserForm {
  username: string;
  password: string;
  role: string;
  changePassword: boolean;
}

const emptyForm: UserForm = {
  username: "",
  password: "",
  role: "viewer",
  changePassword: false,
};

export default function CMSUsers() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/cms/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/cms/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/users"] });
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      toast({ title: "تم إنشاء المستخدم بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/cms/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/users"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "تم تحديث المستخدم بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/users"] });
      setDeleteId(null);
      toast({ title: "تم حذف المستخدم بنجاح" });
    },
    onError: (err: Error) =>
      toast({ title: "خطأ", description: err.message, variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowPassword(false);
    setDialogOpen(true);
  };

  const openEdit = (user: any) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      password: "",
      role: user.role,
      changePassword: false,
    });
    setShowPassword(false);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.username.trim()) {
      toast({ title: "خطأ", description: "اسم المستخدم مطلوب", variant: "destructive" });
      return;
    }

    if (editingId) {
      const data: any = { username: form.username, role: form.role };
      if (form.changePassword && form.password) {
        data.password = form.password;
      }
      if (editingId === currentUser?.id) {
        delete data.role;
      }
      updateMutation.mutate({ id: editingId, data });
    } else {
      if (!form.password.trim()) {
        toast({ title: "خطأ", description: "كلمة المرور مطلوبة", variant: "destructive" });
        return;
      }
      createMutation.mutate({
        username: form.username,
        password: form.password,
        role: form.role,
      });
    }
  };

  const isSelf = (userId: number) => currentUser?.id === userId;

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-1">إدارة المستخدمين</h2>
          <p className="text-gray-500 text-sm">إضافة وتعديل وحذف المستخدمين وصلاحياتهم</p>
        </div>
        <Button data-testid="button-add-user" onClick={openCreate} className="bg-brand-blue hover:bg-brand-blue/90">
          <Plus className="w-4 h-4 mr-2" />
          إضافة مستخدم
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-pulse">
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                  <TableCell data-testid={`text-username-${user.id}`} className="font-medium">
                    {user.username}
                    {isSelf(user.id) && (
                      <Badge variant="outline" className="ml-2 text-xs">أنت</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge data-testid={`text-role-${user.id}`} className={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell data-testid={`text-created-${user.id}`} className="text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        data-testid={`button-edit-user-${user.id}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {!isSelf(user.id) && (
                        <Button
                          data-testid={`button-delete-user-${user.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => setDeleteId(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-400 py-8">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-blue" />
              {editingId ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">اسم المستخدم *</label>
              <Input
                data-testid="input-user-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="اسم المستخدم"
              />
            </div>

            {editingId ? (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-sm font-medium">تغيير كلمة المرور</label>
                  <Button
                    data-testid="button-toggle-password"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setForm({ ...form, changePassword: !form.changePassword })}
                  >
                    {form.changePassword ? "إلغاء" : "تغيير"}
                  </Button>
                </div>
                {form.changePassword && (
                  <div className="relative">
                    <Input
                      data-testid="input-user-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="كلمة المرور الجديدة"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium mb-1.5 block">كلمة المرور *</label>
                <div className="relative">
                  <Input
                    data-testid="input-user-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="كلمة المرور"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-1.5 block">الدور</label>
              {editingId && isSelf(editingId) ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  لا يمكنك تغيير دورك الخاص
                </p>
              ) : (
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <span>{role.label}</span>
                          <span className="text-xs text-gray-400">- {role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                data-testid="button-save-user"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-brand-blue hover:bg-brand-blue/90"
              >
                <Save className="w-4 h-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button
                data-testid="button-cancel-user"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
