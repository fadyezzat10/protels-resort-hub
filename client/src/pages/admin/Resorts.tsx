import AdminLayout from "./AdminLayout";
import { useCMSStore } from "@/lib/store";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { useState } from "react";

export default function Resorts() {
  const { hotels, deleteHotel } = useCMSStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHotels = hotels.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Resorts & Hotels</h2>
          <p className="text-gray-500">Manage property listings and details.</p>
        </div>
        <button className="bg-brand-gold text-brand-blue px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-brand-gold/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search properties..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img 
                src={hotel.image} 
                alt={hotel.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
                {hotel.status}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-brand-blue mb-1">{hotel.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{hotel.location}</p>
              
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button className="p-2 text-gray-500 hover:text-brand-blue hover:bg-blue-50 rounded-full transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteHotel(hotel.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
