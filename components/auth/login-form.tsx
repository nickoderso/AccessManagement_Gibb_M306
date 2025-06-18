"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNotification } from "@/components/notification-provider";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

const useNotificationFallback = () => {
  return {
    showNotification: (notification: any) => {
      console.log("Notification (fallback):", notification);
    },
  };
};

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  let notificationContext;
  try {
    notificationContext = useNotification();
  } catch (e) {
    notificationContext = useNotificationFallback();
  }
  const { showNotification } = notificationContext;

  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      setUser({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
      });

      showNotification({
        title: "Anmeldung erfolgreich",
        message: "Sie wurden erfolgreich angemeldet.",
        type: "success",
        duration: 3000,
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Bei der Anmeldung ist ein Fehler aufgetreten.";

      if (error.code === "auth/invalid-credential") {
        errorMessage = "Ungültige E-Mail oder Passwort.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Benutzer nicht gefunden.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Falsches Passwort.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Anmelden</CardTitle>
        <CardDescription>
          Melden Sie sich mit Ihren Zugangsdaten an
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <Link
                href="/reset-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Anmeldung läuft..." : "Anmelden"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Registrieren
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
