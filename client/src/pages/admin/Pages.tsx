import AdminLayout from "./AdminLayout";
import { useCMSStore } from "@/lib/store";
import { Plus, Edit2, Trash2, Search, FileText } from "lucide-react";
import { useState } from "react";

export default function Pages() {
  const { pages, deletePage } = useCMSStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Pages</h2>
          <p className="text-gray-500">Manage static content pages.</p>
        </div>
        <button className="bg-brand-gold text-brand-blue px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-brand-gold/90 transition-colors">
          <Plus className="w-4 h-4" />
          Create Page
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">Page Title</th>
              <th className="px-6 py-4 font-medium text-gray-600">URL Slug</th>
              <th className="px-6 py-4 font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 font-medium text-gray-600">Last Updated</th>
              <th className="px-6 py-4 font-medium text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  {page.title}
                </td>
                <td className="px-6 py-4 text-gray-600 font-mono text-xs">{page.slug}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(page.lastUpdated).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-gray-400 hover:text-brand-blue transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deletePage(page.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
