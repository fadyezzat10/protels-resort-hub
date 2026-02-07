import AdminLayout from "./AdminLayout";
import { Upload, Image as ImageIcon, Trash2 } from "lucide-react";

export default function Media() {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Media Library</h2>
          <p className="text-gray-500">Manage images and documents.</p>
        </div>
        <button className="bg-brand-blue text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-brand-blue/90 transition-colors">
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 text-center mb-8">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Drop files here or click to upload</h3>
        <p className="text-gray-500 text-sm">Support for JPG, PNG, WebP</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Mock Gallery */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={`https://picsum.photos/seed/${i}/400/400`} 
              alt="Media" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
