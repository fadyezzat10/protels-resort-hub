import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, User, ArrowRight } from "lucide-react";
import logo from "@assets/سش.pngش_1770193463633.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock authentication based on requirement
    // Username: Fezzat
    // Password: Fezzat246810
    setTimeout(() => {
      if (username === "Fezzat" && password === "Fezzat246810") {
        localStorage.setItem("cms_authenticated", "true");
        localStorage.setItem("cms_user", JSON.stringify({ name: "Fezzat", role: "Super Admin" }));
        setLocation("/controlpanal/dashboard");
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="p-8 bg-brand-blue text-center">
          <img src={logo} alt="PROTELS" className="h-16 mx-auto mb-4 object-contain invert brightness-0 filter" />
          <h2 className="text-2xl font-serif text-brand-gold">CMS Login</h2>
          <p className="text-white/60 text-sm mt-2">Content Management System</p>
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
              <label className="text-sm font-medium text-gray-700 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
                  placeholder="Enter username"
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
                  placeholder="Enter password"
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
                  Access Panel <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
