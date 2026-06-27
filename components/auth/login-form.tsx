"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getAuthContextAction,
  signInAction,
  signOutAction,
  signUpAction,
} from "@/app/actions/auth";
import { BrandMark } from "@/components/layout/brand-mark";
import { PageHeader } from "@/components/layout/page-header";
import { InlineValidationMessage } from "@/components/ui-state/inline-validation-message";
import { LoadingState } from "@/components/ui-state/loading-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseMode } from "@/lib/backend-mode";
import type { AuthContext } from "@/services/backend/types";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [auth, setAuth] = useState<AuthContext | null>(null);
  const supabaseEnabled = isSupabaseMode();

  useEffect(() => {
    void getAuthContextAction().then((result) => {
      if (result.ok && result.data) {
        setAuth(result.data);
      }
      setCheckingAuth(false);
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === "signup"
          ? await signUpAction(email, password, displayName || email.split("@")[0])
          : await signInAction(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAuth(result.data);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMockSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInAction("alex@retroscope.dev", "mock-password");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAuth(result.data);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutAction();
    setAuth(null);
    router.refresh();
  };

  if (checkingAuth) {
    return <LoadingState variant="card" label="Checking sign-in status…" />;
  }

  if (auth) {
    return (
      <>
        <PageHeader
          eyebrow="Facilitator access"
          title={`Signed in as ${auth.profile.displayName}`}
          description={`Workspace: ${auth.workspace.name}`}
        />
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-6">
            <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <BrandMark size="lg" showTagline />
      </div>
      <PageHeader
        eyebrow="Facilitator access"
        title="Sign in"
        description={
          supabaseEnabled
            ? "Create an account or sign in to manage sessions and action boards."
            : "Use local facilitator access to run sessions in this workspace."
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {supabaseEnabled ? (mode === "signin" ? "Sign in" : "Create account") : "Facilitator sign-in"}
            </CardTitle>
            <CardDescription>
              {supabaseEnabled
                ? "Facilitators authenticate with email and password."
                : "Continue as a facilitator to run your team's retros."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {supabaseEnabled ? (
              <>
                {mode === "signup" ? (
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@team.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <InlineValidationMessage message={error} />
                <div className="flex flex-wrap gap-2">
                  <Button disabled={loading} onClick={() => void handleSubmit()}>
                    {loading ? "Signing in…" : mode === "signin" ? "Sign in" : "Create account"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                      setError(null);
                      setMode(mode === "signin" ? "signup" : "signin");
                    }}
                  >
                    {mode === "signin" ? "Need an account?" : "Already have an account?"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Continue as facilitator without account setup.
                </p>
                <InlineValidationMessage message={error} />
                <Button disabled={loading} onClick={() => void handleMockSignIn()}>
                  {loading ? "Signing in…" : "Continue as facilitator"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why sign in?</CardTitle>
            <CardDescription>
              Facilitators need a home for recurring teams and historical retros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Create and reuse retro sessions</p>
            <p>Track action items over time</p>
            <p>Share read-only action boards</p>
            <p>Participants join without an account</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
