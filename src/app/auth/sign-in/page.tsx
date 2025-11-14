"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, User, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [studentCredentials, setStudentCredentials] = React.useState({
    studentNumber: "",
    password: "",
  });

  const urlError = searchParams.get("error");

  React.useEffect(() => {
    if (urlError) {
      setError(getErrorMessage(urlError));
    }
  }, [urlError]);

  function getErrorMessage(error: string) {
    switch (error) {
      case "OAuthCreateAccount":
        return "Unable to create account. Please contact administrator.";
      case "AccessDenied":
        return "Access denied. Only KLD Gmail accounts (@kld.edu.ph) are allowed.";
      case "Callback":
        return "There was a problem with the authentication callback.";
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "CredentialsSignin":
        return "Invalid student/employee number or password.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Let NextAuth handle the redirect - it will use the redirect callback
      await signIn("google", {
        callbackUrl: "/auth/signin-redirect", // Go to redirect handler
      });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!studentCredentials.studentNumber || !studentCredentials.password) {
      setError("Please enter both student/employee number and password.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("student-number", {
        studentNumber: studentCredentials.studentNumber,
        password: studentCredentials.password,
        redirect: false, // Keep this false for credentials to show errors
      });

      if (result?.error) {
        setError(getErrorMessage(result.error));
      } else if (result?.ok) {
        // ✅ For student login, redirect to signin-redirect handler
        router.push("/auth/signin-redirect");
      }
    } catch (error) {
      console.error("sign in error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-image relative p-4">
      <div className="absolute inset-0 -z-1 bg-custom-gradient"></div>
      <Card className="w-full max-w-lg relative z-10">
        <CardHeader className="text-center">
          <div className="w-16 h-16 relative flex items-center justify-center mx-auto">
            <Image
              src="/kld-logo.webp"
              alt="KLD Logo"
              fill
              className="size-full"
            />
          </div>
          <CardTitle className="text-2xl">KLD Election System</CardTitle>
          <CardDescription>
            Access your account to participate in and manage KLD elections.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-destructive/10 dark:bg-destructive/15 text-destructive border-destructive/30 dark:border-destructive/50">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="google">KLD Gmail</TabsTrigger>
              <TabsTrigger value="student">Student/Employee Number</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Sign in with your official KLD Gmail account</p>
              </div>
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign in with KLD Gmail"}
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                <p>Only KLD Gmail accounts (@kld.edu.ph) are allowed</p>
              </div>
            </TabsContent>

            <TabsContent value="student" className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                <p>Sign in with your student/employee number and password</p>
              </div>
              <form onSubmit={handleStudentSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentNumber">
                    Student/Employee Number{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    placeholder="Enter your student/employee number"
                    value={studentCredentials.studentNumber}
                    onChange={(e) =>
                      setStudentCredentials({
                        ...studentCredentials,
                        studentNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={studentCredentials.password}
                      onChange={(e) =>
                        setStudentCredentials({
                          ...studentCredentials,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <User className="w-4 h-4 mr-2" />
                  {loading
                    ? "Signing in..."
                    : "Sign in with Student/Employee Number"}
                </Button>
              </form>
              <div className="text-center text-xs text-muted-foreground">
                <p>Don&apos;t have an account? Contact your administrator</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
