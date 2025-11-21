/* eslint-disable react-hooks/incompatible-library */
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UserValidators } from "@/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, UserRole, UserType } from "@prisma/client";
import { generatePassword } from "@/lib/utils";
import { createAccount, updateAccount } from "@/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const AccountForm = ({ initialData }: { initialData: User | null }) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUserRole = session?.user?.role as UserRole | undefined;

  // Filter roles based on current user's role
  const availableRoles = React.useMemo(() => {
    const allRoles = Object.values(UserRole);
    // If current user is ADMIN, hide SUPERADMIN role
    if (currentUserRole === "ADMIN") {
      return allRoles.filter((role) => (role !== "SUPERADMIN" && role !== "ADMIN"));
    }
    return allRoles;
  }, [currentUserRole]);

  const form = useForm<z.infer<typeof UserValidators>>({
    resolver: zodResolver(UserValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      userId: initialData?.userId || "",
      role: initialData?.role || "USER",
      userType: initialData?.userType || "STUDENT",
      password: generatePassword(),
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        userId: initialData.userId || "",
        role: initialData.role || "USER",
        userType: initialData?.userType || "STUDENT",
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof UserValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updateAccount(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createAccount(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success);
      router.push("/superadmin/accounts");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save account. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3.5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Enter full name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Student/Employee Number{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter student/employee no. (e.g. KLD-**-******)"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  You can add either employee no. (faculty or non-teaching) or
                  student no. (student)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  KLD Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter KLD email (e.g. jdelacruz@kld.edu.ph)"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Make sure to use your official KLD email address. The password
                  will be sent to this email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => {
              // Disable role field if ADMIN is editing a SUPERADMIN user
              const isEditingSuperAdmin =
                initialData?.role === "SUPERADMIN" && currentUserRole === "ADMIN";
              const isDisabled = isSubmitting || isEditingSuperAdmin;

              return (
                <FormItem>
                  <FormLabel>
                    Role <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    {...field}
                    disabled={isDisabled}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {availableRoles.map((item) => (
                        <SelectItem key={`${item}`} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditingSuperAdmin && (
                    <FormDescription className="text-amber-600 dark:text-amber-400">
                      You cannot modify the role of a SUPERADMIN user.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {form.watch("role") === "USER" && (
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    User Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    {...field}
                    disabled={isSubmitting}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {Object.values(UserType).map((item) => (
                        <SelectItem key={`${item}`} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!initialData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex rounded-md shadow-xs">
                      <Input
                        placeholder="Enter password"
                        {...field}
                        disabled
                        className="-me-px rounded-r-none shadow-none focus-visible:z-1"
                      />
                      <Button
                        variant="outline"
                        // size="sm"
                        type="button"
                        onClick={() => {
                          const newPass = generatePassword();
                          form.setValue("password", newPass, {
                            shouldValidate: true,
                          });
                        }}
                        className="rounded-l-none"
                      >
                        Generate Password
                        <RefreshCcw className="size-4" />
                        <span className="sr-only">Generate</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="ghost"
              className="w-fit"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-fit" disabled={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default AccountForm;
