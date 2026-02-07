import AdminLayout from "./AdminLayout";
import { Search, ExternalLink } from "lucide-react";
import { useCMSStore } from "@/lib/store";

export default function Seo() {
  const { pages, hotels } = useCMSStore();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">SEO Manager</h2>
        <p className="text-gray-500">Manage search engine optimization for all pages.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg">Pages & Resources</h3>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Meta Preview</h3>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {pages.map((page) => (
            <div key={page.id} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 hover:bg-gray-50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-brand-blue">{page.title}</h4>
                  <span className="text-xs font-mono text-gray-500">{page.slug}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title</label>
                  <input 
                    defaultValue={`${page.title} | PROTELS`}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea 
                    rows={2}
                    defaultValue={`Learn more about ${page.title} at Protels Resort.`}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              {/* SERP Preview */}
              <div className="bg-white p-4 rounded border border-gray-100">
                <div className="mb-1 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  <div className="text-sm text-gray-700">protels.com › {page.slug.replace('/', '')}</div>
                </div>
                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1">
                  {page.title} | PROTELS - Luxury Hotels & Resorts
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Learn more about {page.title} at Protels Resort. Experience luxury accommodation, fine dining, and world-class amenities in our exclusive locations.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
