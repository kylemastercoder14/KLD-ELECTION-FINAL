"use client";

import React, { useActionState } from "react";
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
import { Button } from "@/components/ui/button";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { FormState, initialState } from "@/lib/utils";
import { loginAction } from "@/actions";
import { Checkbox } from "@/components/ui/checkbox";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="cursor-pointer w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Signing in
        </>
      ) : (
        <>
          Sign in with Student/Employee Number
        </>
      )}
    </Button>
  );
}

const Client = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [state, formAction] = useActionState<FormState, FormData>(
    loginAction,
    initialState
  );

  React.useEffect(() => {
    if (state?.success) {
      setIsRedirecting(true);
      const timer = setTimeout(() => {
        router.push(state.redirect!);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  return (
    <>
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}

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
            {state?.message && !state.success && (
              <Alert className="bg-destructive/10 dark:bg-destructive/15 text-destructive border-destructive/30 dark:border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{state.message}</AlertTitle>
              </Alert>
            )}

            <div className="space-y-4">
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentNumber">
                    Student/Employee Number{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="studentNumber"
                    type="text"
                    name="userId"
                    placeholder="Enter your student/employee number"
                    required
                  />
                  {state?.errors?.userId && (
                    <p className="text-sm text-red-500">
                      {state.errors.userId[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                  {state?.errors?.password && (
                    <p className="text-sm text-red-500">
                      {state.errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    className="rounded-none"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember Me
                  </Label>
                </div>

                <SubmitButton />
              </form>
              <div className="text-center text-xs text-muted-foreground">
                <p>Don&apos;t have an account? Contact your administrator</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Client;
