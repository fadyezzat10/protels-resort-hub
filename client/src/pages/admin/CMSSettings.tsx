import CMSLayout from "./CMSLayout";
import { useCMSStore } from "@/lib/cms-store";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

export default function CMSSettings() {
  const { settings, updateSettings } = useCMSStore();
  const [formData, setFormData] = useState(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialKey = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socials: { ...prev.socials, [socialKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <CMSLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Global Settings</h2>
          <p className="text-gray-500 mt-1">Manage site-wide configuration and SEO</p>
        </div>
        <Button onClick={handleSubmit} className="bg-brand-blue hover:bg-brand-blue/90 text-white gap-2">
          <Save className="w-4 h-4" />
          {isSaved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input name="companyName" value={formData.companyName} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Email Address</Label>
                <Input name="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Physical Address</Label>
              <Input name="address" value={formData.address} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Facebook</Label>
                <Input name="social.facebook" value={formData.socials.facebook} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Instagram</Label>
                <Input name="social.instagram" value={formData.socials.instagram} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>LinkedIn</Label>
                <Input name="social.linkedin" value={formData.socials.linkedin} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>Twitter / X</Label>
                <Input name="social.twitter" value={formData.socials.twitter} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GTM & Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Tracking (GTM)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>GTM Head Code</Label>
              <textarea 
                name="gtmHead" 
                value={formData.gtmHead} 
                onChange={handleChange}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                placeholder="<!-- Google Tag Manager --> ..."
              />
              <p className="text-xs text-gray-500">Injects inside &lt;head&gt;</p>
            </div>
            <div className="grid gap-2">
              <Label>GTM Body Code</Label>
              <textarea 
                name="gtmBody" 
                value={formData.gtmBody} 
                onChange={handleChange}
                className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
                placeholder="<!-- Google Tag Manager (noscript) --> ..."
              />
              <p className="text-xs text-gray-500">Injects after &lt;body&gt;</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
