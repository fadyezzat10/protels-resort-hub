import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, Mail, ArrowRight } from "lucide-react";
import logo from "@/assets/images/logo-icon.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock authentication
    setTimeout(() => {
      if ((email === "admin@protels.com" && password === "admin123") || 
          (email === "Fezzat" && password === "Fezzat246810")) {
        localStorage.setItem("isAdmin", "true");
        setLocation("/admin/dashboard");
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-8 bg-brand-blue text-center">
          <img src={logo} alt="PROTELS" className="h-16 mx-auto mb-4 object-contain invert brightness-0 filter" />
          <h2 className="text-2xl font-serif text-brand-gold">Admin Portal</h2>
          <p className="text-white/60 text-sm mt-2">Secure access for authorized personnel only</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Email / Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  placeholder="admin@protels.com or Fezzat"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-brand-blue text-white font-medium py-3 rounded-lg hover:bg-brand-blue/90 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? "Authenticating..." : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-brand-blue transition-colors">
              &larr; Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
