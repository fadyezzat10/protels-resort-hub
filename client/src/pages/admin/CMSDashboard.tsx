import CMSLayout from "./CMSLayout";
import { useCMSStore } from "@/lib/cms-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Building2, Image as ImageIcon, Globe } from "lucide-react";

export default function CMSDashboard() {
  const { pages, hotels, media } = useCMSStore();

  const stats = [
    { label: "Total Pages", value: pages.length, icon: FileText, color: "bg-blue-500" },
    { label: "Resorts/Hotels", value: hotels.length, icon: Building2, color: "bg-green-500" },
    { label: "Media Files", value: media.length, icon: ImageIcon, color: "bg-purple-500" },
  ];

  return (
    <CMSLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome back, Fezzat. Here's an overview of your content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 text-white p-0.5 rounded-sm ${stat.color} bg-opacity-80`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <a href="/controlpanal/pages" className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <FileText className="w-5 h-5 mr-3 text-blue-500" />
              <div>
                <div className="font-medium">Manage Pages</div>
                <div className="text-xs text-gray-500">Edit content for static pages</div>
              </div>
            </a>
            <a href="/controlpanal/hotels" className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <Building2 className="w-5 h-5 mr-3 text-green-500" />
              <div>
                <div className="font-medium">Manage Resorts</div>
                <div className="text-xs text-gray-500">Update hotel details and rooms</div>
              </div>
            </a>
            <a href="/controlpanal/settings" className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <Globe className="w-5 h-5 mr-3 text-orange-500" />
              <div>
                <div className="font-medium">Global Settings</div>
                <div className="text-xs text-gray-500">SEO, Contacts, and Site Info</div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotels.slice(0, 3).map(hotel => (
                 <div key={hotel.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="font-medium text-sm">{hotel.name}</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
                 </div>
              ))}
              {pages.slice(0, 3).map(page => (
                 <div key={page.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <span className="font-medium text-sm">{page.title}</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{page.status}</span>
                 </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}
