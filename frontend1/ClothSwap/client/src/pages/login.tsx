import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", { email, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 bg-white shadow-md rounded-lg p-8"
      >
        <h1 className="text-2xl font-semibold text-center text-slate-800">
          Sign In to ReWear
        </h1>
        {error && (
          <p className="text-red-600 text-sm text-center border border-red-200 rounded p-2 bg-red-50">
            {error}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-green hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Don't have an account? {" "}
          <a
            href="/register"
            className="text-brand-green hover:underline font-medium"
          >
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
