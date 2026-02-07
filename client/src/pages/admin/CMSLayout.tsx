import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("cms_authenticated");
    if (!isAuthenticated) {
      setLocation("/controlpanal");
    }
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("cms_authenticated");
    localStorage.removeItem("cms_user");
    setLocation("/controlpanal");
  };

  const navItems = [
    { href: "/controlpanal/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/controlpanal/pages", label: "Pages", icon: FileText },
    { href: "/controlpanal/hotels", label: "Resorts/Hotels", icon: Building2 },
    { href: "/controlpanal/media", label: "Media Library", icon: ImageIcon },
    { href: "/controlpanal/settings", label: "Global Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-blue text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-serif text-brand-gold tracking-wide">CMS Panel</h1>
          <p className="text-xs text-white/50 mt-1">v1.0.0 • Super Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium",
                location.startsWith(item.href)
                  ? "bg-brand-gold text-brand-blue shadow-md" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            </Link>
          ))}
          
          <div className="pt-4 mt-4 border-t border-white/10">
            <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-md text-white/70 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium">
               <Globe className="w-4 h-4" />
               View Website
            </a>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-300 hover:text-red-100 hover:bg-red-500/10 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-auto min-h-screen bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
