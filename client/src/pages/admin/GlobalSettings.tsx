import AdminLayout from "./AdminLayout";
import { useCMSStore } from "@/lib/store";
import { useState } from "react";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GlobalSettings() {
  const { settings, updateSettings } = useCMSStore();
  const [formData, setFormData] = useState(settings);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    updateSettings(formData);
    toast({
      title: "Settings Saved",
      description: "Global site settings have been updated successfully.",
    });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-brand-blue mb-2">Global Settings</h2>
          <p className="text-gray-500">Manage site-wide configuration and details.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-brand-blue text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-brand-blue/90 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Company Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-6 text-brand-blue">Company Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-6 text-brand-blue">Social Media Links</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input 
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input 
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input 
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* GTM Configuration */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-xl font-bold mb-6 text-brand-blue">Google Tag Manager (GTM)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Head Code</label>
              <p className="text-xs text-gray-500 mb-2">Injects inside &lt;head&gt; tag</p>
              <textarea 
                name="gtmHead"
                value={formData.gtmHead}
                onChange={handleChange}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                placeholder="<!-- Google Tag Manager -->..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Code</label>
              <p className="text-xs text-gray-500 mb-2">Injects after &lt;body&gt; tag</p>
              <textarea 
                name="gtmBody"
                value={formData.gtmBody}
                onChange={handleChange}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                placeholder="<!-- Google Tag Manager (noscript) -->..."
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
