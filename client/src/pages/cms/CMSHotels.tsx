import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CMSLayout from "./CMSLayout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

interface HotelForm {
  slug: string;
  name: string;
  location: string;
  image: string;
  descriptionEn: string;
  descriptionAr: string;
  features: string;
  rooms: string;
  discount: string;
  mapLink: string;
  status: string;
  sortOrder: number;
}

const emptyForm: HotelForm = {
  slug: "",
  name: "",
  location: "",
  image: "",
  descriptionEn: "",
  descriptionAr: "",
  features: "",
  rooms: "",
  discount: "",
  mapLink: "",
  status: "draft",
  sortOrder: 0,
};

export default function CMSHotels() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm);

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
      setDialogOpen(false);
      setForm(emptyForm);
      toast({ title: "Hotel created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/cms/hotels/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast({ title: "Hotel updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cms/hotels/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/hotels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms/dashboard"] });
      setDeleteId(null);
      toast({ title: "Hotel deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const buildPayload = () => ({
    slug: form.slug,
    name: form.name,
    location: form.location,
    image: form.image || null,
    description: { en: form.descriptionEn, ar: form.descriptionAr },
    features: form.features ? form.features.split(",").map((s) => s.trim()).filter(Boolean) : [],
    rooms: form.rooms ? form.rooms.split(",").map((s) => s.trim()).filter(Boolean) : [],
    discount: form.discount || null,
    mapLink: form.mapLink || null,
    status: form.status,
    sortOrder: form.sortOrder,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      features: (hotel.features || []).join(", "),
      rooms: (hotel.rooms || []).join(", "),
      discount: hotel.discount || "",
      mapLink: hotel.mapLink || "",
      status: hotel.status || "draft",
      sortOrder: hotel.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  return (
    <CMSLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Hotels & Resorts</h2>
          <p className="text-gray-500">Manage hotel properties</p>
        </div>
        <Button data-testid="button-create-hotel" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Hotel
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Loading...</TableCell>
              </TableRow>
            ) : hotels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No hotels found. Add your first hotel.
                </TableCell>
              </TableRow>
            ) : (
              hotels.map((hotel: any) => (
                <TableRow key={hotel.id} data-testid={`row-hotel-${hotel.id}`}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell className="text-gray-500">{hotel.location}</TableCell>
                  <TableCell>
                    <Badge variant={hotel.status === "published" ? "default" : "secondary"}>
                      {hotel.status}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Hotel" : "Create New Hotel"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-hotel">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input
                  data-testid="input-hotel-slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="hotel-slug"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <Input
                  data-testid="input-hotel-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Hotel name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Input
                  data-testid="input-hotel-location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Image URL</label>
                <Input
                  data-testid="input-hotel-image"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Description (English)</label>
                <Textarea
                  data-testid="input-hotel-desc-en"
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  placeholder="English description"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                <Textarea
                  data-testid="input-hotel-desc-ar"
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  placeholder="Arabic description"
                  rows={4}
                  dir="rtl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Features (comma-separated)</label>
              <Input
                data-testid="input-hotel-features"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder="Pool, Spa, Restaurant, Beach"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rooms (comma-separated)</label>
              <Input
                data-testid="input-hotel-rooms"
                value={form.rooms}
                onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                placeholder="Standard, Suite, Deluxe, Family"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Discount</label>
                <Input
                  data-testid="input-hotel-discount"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="e.g. 20% off"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Map Link</label>
                <Input
                  data-testid="input-hotel-map"
                  value={form.mapLink}
                  onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
                  placeholder="Google Maps URL"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger data-testid="select-hotel-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sort Order</label>
                <Input
                  data-testid="input-hotel-sort"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-hotel"
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Hotel"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hotel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hotel? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete-hotel"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CMSLayout>
  );
}
