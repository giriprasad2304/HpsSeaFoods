"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Fish, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { loginSchema } from "@/validations";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("admin@hpsseafoods.com");
  const [password, setPassword] = React.useState("admin123");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message ?? "Invalid credentials");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleFillDemo() {
    setEmail("admin@hpsseafoods.com");
    setPassword("admin123");
    setError(null);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-4 sm:p-6 relative selection:bg-primary/20">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-5 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10">
            <Fish className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">HPS SEA FOODS</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enterprise Seafood Operations & Cold-Chain ERP
            </p>
          </div>
        </div>

        {/* Credentials helper card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Demo Test Credentials
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDemo}
              className="h-7 px-2.5 text-[11px] font-medium gap-1 bg-background hover:bg-muted"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Filled!
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-primary" />
                  Auto-fill
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-background/80 p-2 border border-border/60">
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                Email
              </span>
              <span className="font-mono text-xs font-semibold text-foreground select-all">
                admin@hpsseafoods.com
              </span>
            </div>
            <div className="rounded-lg bg-background/80 p-2 border border-border/60">
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                Password
              </span>
              <span className="font-mono text-xs font-semibold text-foreground select-all">
                admin123
              </span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 bg-card shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-foreground font-semibold">Sign In to Dashboard</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your authorized staff or administrator credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/25 p-3 text-xs text-destructive animate-fade-in font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email Address
                </label>
                <Input
                  type="email"
                  placeholder="admin@hpsseafoods.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9.5 text-xs sm:text-sm bg-background font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Password
                  </label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9.5 text-xs font-mono bg-background"
                  required
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9.5 font-semibold text-xs sm:text-sm gap-2 shadow-xs"
                >
                  {loading ? "Authenticating..." : "Sign In to Operations"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Authorized Access Only
              </span>
              <span className="font-mono text-[10px]">HPS-ERP v2.4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
