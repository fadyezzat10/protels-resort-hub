import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Image,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/controlpanal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/controlpanal/pages", label: "Pages", icon: FileText },
  { href: "/controlpanal/hotels", label: "Hotels", icon: Building2 },
  { href: "/controlpanal/blog", label: "Blog", icon: Newspaper },
  { href: "/controlpanal/media", label: "Media Library", icon: Image },
  { href: "/controlpanal/seo", label: "SEO", icon: Search },
  { href: "/controlpanal/settings", label: "Settings", icon: Settings },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/controlpanal");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLocation("/controlpanal");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-blue text-white flex flex-col transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif text-brand-gold">PROTELS CMS</h1>
            <p className="text-white/40 text-xs mt-1">Content Management</p>
          </div>
          <button
            data-testid="close-sidebar"
            className="lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
                  location === item.href
                    ? "bg-brand-gold text-brand-blue font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-gold" />
            </div>
            <div>
              <p data-testid="text-current-user" className="text-sm font-medium text-white">
                {user.username || "Admin"}
              </p>
              <p className="text-xs text-white/40 capitalize">{user.role || "admin"}</p>
            </div>
          </div>
          <button
            data-testid="button-logout"
            onClick={() => logoutMutation.mutate()}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            data-testid="open-sidebar"
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-serif text-brand-blue">PROTELS CMS</h1>
          <div className="w-9" />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
