/* eslint-disable react/no-unescaped-entities */
"use client";

import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

const errorMessages = {
  Configuration: {
    title: "Server Configuration Error",
    message:
      "There is a problem with the server configuration. Please contact the administrator.",
    canRetry: false,
  },
  AccessDenied: {
    title: "Access Denied",
    message:
      "Only students and faculty with official KLD Gmail accounts (@kld.edu.ph) can access this system.",
    canRetry: true,
  },
  Verification: {
    title: "Verification Error",
    message: "The verification token has expired or has already been used.",
    canRetry: true,
  },
  Callback: {
    title: "Authentication Error",
    message:
      "There was a problem processing your authentication. This might be due to a database connection issue.",
    canRetry: true,
  },
  "Only_@kld.edu.ph_email_addresses_are_allowed.": {
    title: "Email Domain Restriction",
    message: "Only @kld.edu.ph email addresses are allowed.",
    canRetry: true,
  },
  Default: {
    title: "Authentication Error",
    message: "An unexpected error occurred during authentication.",
    canRetry: true,
  },
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  // Decode the error parameter and normalize it
  const decodedError = errorParam
    ? decodeURIComponent(errorParam).replace(/_/g, " ")
    : null;

  // Try to match the error type, handling both encoded and decoded versions
  let errorType: keyof typeof errorMessages = "Default";

  if (errorParam) {
    // First try exact match
    if (errorParam in errorMessages) {
      errorType = errorParam as keyof typeof errorMessages;
    }
    // Then try decoded version
    else if (decodedError && decodedError in errorMessages) {
      errorType = decodedError as keyof typeof errorMessages;
    }
    // Check if it contains the email restriction message
    else if (
      errorParam.includes("kld.edu.ph") ||
      decodedError?.includes("kld.edu.ph")
    ) {
      errorType = "Only_@kld.edu.ph_email_addresses_are_allowed.";
    }
  }

  const errorInfo = errorMessages[errorType] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive-foreground" />
          </div>
          <CardTitle className="text-2xl text-destructive">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-base">
            {errorInfo.message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorType === "AccessDenied" && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Note:</strong> Make sure you're using your official KLD
                Gmail account. Personal Gmail accounts are not allowed.
              </AlertDescription>
            </Alert>
          )}

          {errorType === "Only_@kld.edu.ph_email_addresses_are_allowed." && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Email Restriction:</strong> Only users with @kld.edu.ph
                email addresses can sign in. Please use your official KLD Gmail
                account.
              </AlertDescription>
            </Alert>
          )}

          {errorType === "Callback" && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Technical Issue:</strong> This error usually indicates a
                database connection problem. Please try again in a few moments.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {errorInfo.canRetry && (
              <Button asChild className="w-full">
                <Link href="/auth/sign-in">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild className="w-full bg-transparent">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              If you continue to experience issues, please contact the system
              administrator or IT support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
