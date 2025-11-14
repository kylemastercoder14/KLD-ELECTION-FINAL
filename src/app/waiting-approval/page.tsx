"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Clock, LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-image relative p-4">
      <div className="absolute inset-0 -z-1 bg-custom-gradient"></div>
      <Card className="w-full max-w-lg relative z-10 text-center p-6">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <Clock className="w-12 h-12 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Your Account is Pending Approval
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Thank you for registering! Your account has been successfully
            created and is now awaiting verification from the admin.
          </p>

          <div className="flex flex-col gap-2 items-center mt-6">
            <Loader2 className="animate-spin w-6 h-6" />

            <p className="text-sm text-muted-foreground">
              Approval usually takes less than 24 hours.
            </p>
          </div>

          <div className="mt-6">
            <Button
              variant="destructive"
              onClick={() => {
                signOut();
                window.location.assign("/auth/sign-in");
              }}
              className="cursor-pointer"
            >
              <LogOutIcon className="size-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
