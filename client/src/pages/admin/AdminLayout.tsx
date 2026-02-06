import { Link, useLocation } from "wouter";
import { Users, Mail, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users & Roles", icon: Users },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-blue text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-serif text-brand-gold">CMS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                location === item.href 
                  ? "bg-brand-gold text-brand-blue font-medium" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
