"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PartylistValidators } from "@/validators";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/rich-text-editor";
import ImageUpload from "@/components/image-upload";
import { createPartyList, updatePartyList } from "@/actions";
import { Party, User } from '@prisma/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { FormDescription } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const PartylistForm = ({
  initialData,
  users,
}: {
  initialData: (Party & { head?: Pick<User, "id" | "name" | "email"> | null }) | null;
  users: Array<Pick<User, "id" | "name" | "email" | "userId">>;
}) => {
  const router = useRouter();
  const [headPopoverOpen, setHeadPopoverOpen] = useState(false);
  const form = useForm<z.infer<typeof PartylistValidators>>({
    resolver: zodResolver(PartylistValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      logo: initialData?.logoUrl || "",
      headId: initialData?.headId || null,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        logo: initialData.logoUrl || "",
        headId: initialData.headId || null,
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PartylistValidators>) {
    try {
      let response;
      if (initialData?.id) {
        // If initialData.id exists, it's an update (PUT)
        response = await updatePartyList(initialData.id, values);
      } else {
        // Otherwise, it's a new creation (POST)
        response = await createPartyList(values);
      }

      if (response.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response.success);
      router.push("/superadmin/party-list");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save party list. Please try again.");
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
                  Party Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Enter party list name (e.g. LakasKLD)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    disabled={isSubmitting}
                    placeholder="Provide any additional information here..."
                    onChangeAction={field.onChange}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Logo <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    imageCount={1}
                    maxSize={3}
                    defaultValue={field.value}
                    onImageUpload={(url) => field.onChange(url)}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="headId"
            render={({ field }) => {
              const selectedUser = users.find((user) => user.id === field.value);

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Party Head/Manager <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <Popover open={headPopoverOpen} onOpenChange={setHeadPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {selectedUser
                            ? `${selectedUser.name}${selectedUser.userId ? ` (${selectedUser.userId})` : ""} - ${selectedUser.email}`
                            : "No Head Assigned"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-w-none p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search users by name, ID, or email..." />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                field.onChange(null);
                                setHeadPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              No Head Assigned
                            </CommandItem>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.userId || ""} ${user.email}`}
                                onSelect={() => {
                                  field.onChange(user.id);
                                  setHeadPopoverOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === user.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>
                                    {user.name}
                                    {user.userId && (
                                      <span className="text-muted-foreground ml-1">
                                        ({user.userId})
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Assign a head, manager, or president for this party list. This can be changed later, and the head can resign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

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

export default PartylistForm;
