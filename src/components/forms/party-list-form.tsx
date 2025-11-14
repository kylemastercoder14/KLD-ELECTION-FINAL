"use client";

import React from "react";
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
import { Party } from '@prisma/client';

const PartylistForm = ({
  initialData,
}: {
  initialData: Party | null;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof PartylistValidators>>({
    resolver: zodResolver(PartylistValidators),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      logo: initialData?.logoUrl || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        logo: initialData.logoUrl || "",
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
      router.push("/comelec/party-list");
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
