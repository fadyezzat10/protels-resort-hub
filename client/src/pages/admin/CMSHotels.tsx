import CMSLayout from "./CMSLayout";
import { useCMSStore, Hotel } from "@/lib/cms-store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Save, X, Search } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function CMSHotels() {
  const { hotels, addHotel, updateHotel, deleteHotel } = useCMSStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Empty state for new hotel
  const emptyHotel: Hotel = {
    id: "",
    name: "",
    location: "",
    image: "",
    description: { en: "", ar: "" },
    features: [],
    rooms: [],
    roomDetails: [],
    gallery: []
  };

  const [formData, setFormData] = useState<Hotel>(emptyHotel);

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (hotel: Hotel) => {
    setEditingId(hotel.id);
    setFormData(hotel);
  };

  const handleCreate = () => {
    setEditingId("new");
    setFormData({ ...emptyHotel, id: `hotel-${Date.now()}` });
  };

  const handleSave = () => {
    if (editingId === "new") {
      addHotel(formData);
    } else if (editingId) {
      updateHotel(editingId, formData);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      deleteHotel(id);
    }
  };

  const handleChange = (field: keyof Hotel, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDescChange = (lang: 'en' | 'ar', value: string) => {
    setFormData(prev => ({
      ...prev,
      description: { ...prev.description, [lang]: value }
    }));
  };

  if (editingId) {
    return (
      <CMSLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{editingId === "new" ? "Add New Property" : "Edit Property"}</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-brand-blue text-white">Save Property</Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Property Name</Label>
                  <Input value={formData.name} onChange={e => handleChange("name", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Slug / ID</Label>
                  <Input value={formData.id} onChange={e => handleChange("id", e.target.value)} disabled={editingId !== "new"} />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input value={formData.location} onChange={e => handleChange("location", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>English Description</Label>
                  <Textarea className="min-h-[150px]" value={formData.description.en} onChange={e => handleDescChange("en", e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Arabic Description</Label>
                  <Textarea className="min-h-[150px] text-right" dir="rtl" value={formData.description.ar} onChange={e => handleDescChange("ar", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Hero Image URL</Label>
                  <Input value={formData.image} onChange={e => handleChange("image", e.target.value)} />
                  {formData.image && <img src={formData.image} alt="Preview" className="h-32 object-cover rounded-md mt-2" />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Resorts & Hotels</h2>
          <p className="text-gray-500 mt-1">Manage your property portfolio</p>
        </div>
        <Button onClick={handleCreate} className="bg-brand-blue text-white gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm mb-6">
        <div className="p-4 border-b flex items-center gap-4">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            className="flex-1 outline-none text-sm" 
            placeholder="Search properties..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredHotels.map(hotel => (
          <div key={hotel.id} className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <img src={hotel.image} alt={hotel.name} className="w-16 h-16 object-cover rounded-md" />
              <div>
                <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                <p className="text-sm text-gray-500">{hotel.location}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => handleEdit(hotel)}>
                <Edit className="w-4 h-4 text-blue-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(hotel.id)}>
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          </div>
        ))}
        
        {filteredHotels.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             No properties found. Add one to get started.
           </div>
        )}
      </div>
    </CMSLayout>
  );
}
