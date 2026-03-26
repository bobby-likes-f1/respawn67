import { useState } from "react";
import type { SubmitEventHandler } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRound, Lock, Eye, EyeOff } from "lucide-react";
import { login, saveSession } from "@/lib/auth";
import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Log In | Respawn67" },
    { name: "description", content: "Log in to your Respawn67 account." },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      saveSession({ token: result.token, user: result.user });
      navigate("/games");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="Respawn67" className="h-10 w-10" />
            <span className="text-2xl font-pixel tracking-tighter">RESPAWN67</span>
          </Link>
          <p className="text-muted-foreground text-sm">Welcome back, Tarnished.</p>
        </div>

        {/* Card */}
        <Card className="bg-abyss-900 border border-abyss-700 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Log in</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username or Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90">
                Email
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="pl-9 bg-abyss-800 border-abyss-600 focus:border-azure-500 focus:ring-azure-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground/90">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-azure-400 hover:text-azure-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-abyss-800 border-abyss-600 focus:border-azure-500 focus:ring-azure-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-azure-600 to-azure-500 hover:from-azure-500 hover:to-azure-400 border border-azure-400/50 shadow-[0_0_15px_rgba(26,133,255,0.4)] text-white font-bold disabled:opacity-60"
              size="lg"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-abyss-700 pt-4 flex justify-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-azure-400 hover:text-azure-300 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
