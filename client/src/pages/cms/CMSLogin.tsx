import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/images/logo-icon.png";

export default function CMSLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: user, isLoading: checkingAuth } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  if (user && !checkingAuth) {
    setLocation("/controlpanal/dashboard");
    return null;
  }

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Login failed");
      }
      return json;
    },
    onSuccess: () => {
      window.location.href = "/controlpanal/dashboard";
    },
    onError: (err: Error) => {
      setError(err.message || "Invalid username or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-8 bg-brand-blue text-center">
          <img
            src={logo}
            alt="PROTELS"
            className="h-16 mx-auto mb-4 object-contain invert brightness-0 filter"
          />
          <h2 className="text-2xl font-serif text-brand-gold">Control Panel</h2>
          <p className="text-white/60 text-sm mt-2">
            Secure access for authorized personnel only
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-login">
            {error && (
              <div
                data-testid="text-login-error"
                className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  data-testid="input-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  data-testid="input-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              data-testid="button-login"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              {loginMutation.isPending ? (
                "Signing in..."
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-brand-blue transition-colors"
            >
              &larr; Back to Website
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
