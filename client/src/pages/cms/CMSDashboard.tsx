import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import CMSLayout from "./CMSLayout";
import {
  FileText,
  Building2,
  Image,
  Users,
  Plus,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CMSDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/cms/dashboard"],
  });

  return (
    <CMSLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-serif text-brand-blue mb-2">Dashboard</h2>
        <p className="text-gray-500">Overview of your website content</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Pages"
              value={stats?.totalPages ?? 0}
              subtitle={`${stats?.publishedPages ?? 0} published · ${stats?.draftPages ?? 0} draft`}
              icon={FileText}
              color="blue"
            />
            <StatsCard
              title="Hotels"
              value={stats?.totalHotels ?? 0}
              subtitle="Resorts & properties"
              icon={Building2}
              color="green"
            />
            <StatsCard
              title="Media Files"
              value={stats?.totalMedia ?? 0}
              subtitle="Images & documents"
              icon={Image}
              color="purple"
            />
            <StatsCard
              title="Users"
              value={stats?.totalUsers ?? 0}
              subtitle="Admin accounts"
              icon={Users}
              color="yellow"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-lg mb-4 text-brand-blue">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/controlpanal/pages">
                <Button
                  data-testid="button-quick-new-page"
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Plus className="w-5 h-5 text-brand-blue" />
                  <span className="text-sm font-medium">Create New Page</span>
                </Button>
              </Link>
              <Link href="/controlpanal/hotels">
                <Button
                  data-testid="button-quick-new-hotel"
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Building2 className="w-5 h-5 text-brand-blue" />
                  <span className="text-sm font-medium">Add New Hotel</span>
                </Button>
              </Link>
              <Link href="/controlpanal/media">
                <Button
                  data-testid="button-quick-upload-media"
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Upload className="w-5 h-5 text-brand-blue" />
                  <span className="text-sm font-medium">Upload Media</span>
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </CMSLayout>
  );
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: any;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    yellow: "bg-yellow-100 text-yellow-700",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`} className="text-2xl font-bold text-brand-blue mb-1">
          {value}
        </h3>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
