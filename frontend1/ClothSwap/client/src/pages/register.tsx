import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });
      // Auto login after registration
      await apiRequest("POST", "/api/auth/login", { email, password });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
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
          Create your ReWear account
        </h1>
        {error && (
          <p className="text-red-600 text-sm text-center border border-red-200 rounded p-2 bg-red-50">
            {error}
          </p>
        )}
        <div className="flex space-x-2">
          <div className="w-1/2 space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="w-1/2 space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
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
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account? {" "}
          <a
            href="/login"
            className="text-brand-green hover:underline font-medium"
          >
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
