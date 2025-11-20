"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { PositionTemplateValidator } from "@/validators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PositionTemplate, PositionTemplateItem } from "@prisma/client";
import {
  createPositionTemplate,
  updatePositionTemplate,
} from "@/actions";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PositionTemplateWithItems = PositionTemplate & {
  items: PositionTemplateItem[];
};

const PositionTemplateForm = ({
  initialData,
}: {
  initialData: PositionTemplateWithItems | null;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof PositionTemplateValidator>>({
    resolver: zodResolver(PositionTemplateValidator),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      items: initialData?.items
        ? initialData.items.map((item) => ({
            title: item.title,
            winnerCount: item.winnerCount,
            displayOrder: item.displayOrder,
          }))
        : [
            {
              title: "",
              winnerCount: 1,
              displayOrder: 0,
            },
          ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        description: initialData.description || "",
        items: initialData.items.map((item) => ({
          title: item.title,
          winnerCount: item.winnerCount,
          displayOrder: item.displayOrder,
        })),
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof PositionTemplateValidator>) {
    try {
      // Sort items by displayOrder before submitting
      const sortedItems = values.items.map((item, index) => ({
        ...item,
        displayOrder: index,
      }));

      let response;
      if (initialData?.id) {
        response = await updatePositionTemplate(initialData.id, {
          ...values,
          items: sortedItems,
        });
      } else {
        response = await createPositionTemplate({
          ...values,
          items: sortedItems,
        });
      }

      if (response?.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response?.success || "Template saved successfully.");
      router.push("/comelec/position-templates");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save template. Please try again.");
    }
  }

  const addPosition = () => {
    append({
      title: "",
      winnerCount: 1,
      displayOrder: fields.length,
    });
  };

  const removePosition = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("At least one position is required.");
    }
  };

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
                  Template Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g., Student Council, Class Officers"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter a descriptive name for this position template.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="Optional description of this template..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Provide additional details about this template (optional).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <FormLabel>
                  Positions <span className="text-destructive">*</span>
                </FormLabel>
                <FormDescription>
                  Add positions that will be included in this template.
                </FormDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPosition}
                disabled={isSubmitting}
              >
                <Plus className="size-4 mr-2" />
                Add Position
              </Button>
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">
                  No positions added yet. Click "Add Position" to get started.
                </p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Order</TableHead>
                      <TableHead>Position Title</TableHead>
                      <TableHead className="w-[150px]">Winner Count</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GripVertical className="size-4 text-muted-foreground" />
                            <span className="text-sm">{index + 1}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., President, Secretary"
                                    {...field}
                                    disabled={isSubmitting}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.winnerCount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value) || 1)
                                    }
                                    value={field.value}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePosition(index)}
                            disabled={isSubmitting || fields.length === 1}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PositionTemplateForm;


