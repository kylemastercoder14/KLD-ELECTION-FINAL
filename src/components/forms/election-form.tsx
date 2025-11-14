/* eslint-disable react-hooks/incompatible-library */
"use client";

import React from "react";
import { Election, Position, VoterRestriction } from "@prisma/client";
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
import { ElectionValidators } from "@/validators";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createElection, updateElection } from "@/actions";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ElectionWithPositions = Election & {
  positions: Position[];
};

const ElectionForm = ({
  initialData,
  positionTemplates,
}: {
  initialData: ElectionWithPositions | null;
  positionTemplates: Array<{
    id: string;
    name: string;
    items: Array<{ title: string; winnerCount: number }>;
  }>;
}) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof ElectionValidators>>({
    resolver: zodResolver(ElectionValidators),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      campaignStartDate: initialData?.campaignStartDate
        ? new Date(initialData.campaignStartDate)
        : undefined,
      campaignEndDate: initialData?.campaignEndDate
        ? new Date(initialData.campaignEndDate)
        : undefined,
      electionStartDate: initialData?.electionStartDate
        ? new Date(initialData.electionStartDate)
        : undefined,
      electionEndDate: initialData?.electionEndDate
        ? new Date(initialData.electionEndDate)
        : undefined,
      positions: initialData?.positions
        ? initialData.positions.map((pos) => ({
            title: pos.title,
            winnerCount: pos.winnerCount,
          }))
        : [],
      voterRestriction: initialData?.voterRestriction || VoterRestriction.ALL,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "positions",
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        campaignStartDate: initialData.campaignStartDate
          ? new Date(initialData.campaignStartDate)
          : undefined,
        campaignEndDate: initialData.campaignEndDate
          ? new Date(initialData.campaignEndDate)
          : undefined,
        electionStartDate: initialData.electionStartDate
          ? new Date(initialData.electionStartDate)
          : undefined,
        electionEndDate: initialData.electionEndDate
          ? new Date(initialData.electionEndDate)
          : undefined,
        positions: initialData.positions.map((pos) => ({
          title: pos.title,
          winnerCount: pos.winnerCount,
        })),
        voterRestriction: initialData.voterRestriction || VoterRestriction.ALL,
      });
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof ElectionValidators>) {
    try {
      let response;
      if (initialData?.id) {
        response = await updateElection(initialData.id, values);
      } else {
        response = await createElection(values);
      }

      if (response?.error) {
        console.error("API Error:", response.error);
        toast.error(response.error || "An error occurred.");
        return;
      }

      toast.success(response?.success || "Election saved successfully.");
      router.push("/comelec/election");
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save election. Please try again.");
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = positionTemplates.find((t) => t.id === templateId);
    if (template) {
      // Clear existing positions and add template positions
      form.setValue(
        "positions",
        template.items.map((item) => ({
          title: item.title,
          winnerCount: item.winnerCount,
        }))
      );
      toast.success(`Loaded template: ${template.name}`);
    }
  };

  const addPosition = () => {
    append({
      title: "",
      winnerCount: 1,
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Election Title <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isSubmitting}
                    placeholder="Enter election title"
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
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="Enter election description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {String(form.watch("description") || "").length}/1000
                  characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="campaignStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Campaign Start Date{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value as Date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the campaign period begins.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campaignEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Campaign End Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When the campaign period ends.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
            <FormField
              control={form.control}
              name="electionStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Election Start Date{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When voting begins (must be today or in the future).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="electionEndDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Election End Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When voting ends (must be today or in the future).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="voterRestriction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Voter Restriction <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select who can vote" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">All Users</SelectItem>
                    <SelectItem value="STUDENTS">Students Only</SelectItem>
                    <SelectItem value="FACULTY">Faculty Only</SelectItem>
                    <SelectItem value="NON_TEACHING">
                      Non-Teaching Staff Only
                    </SelectItem>
                    <SelectItem value="STUDENTS_FACULTY">
                      Students and Faculty
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Restrict who can vote in this election. Students are identified
                  by having year/course/section. Faculty by
                  institute/department. Non-teaching by unit.
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
                  Add positions for this election or use a template.
                </FormDescription>
              </div>
              <div className="flex items-center gap-2">
                {positionTemplates.length > 0 && (
                  <Select
                    onValueChange={handleTemplateSelect}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Use template" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} ({template.items.length} positions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
            </div>

            {fields.length === 0 && (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-sm text-muted-foreground">
                  No positions added yet. Click &quot;Add Position&quot; or
                  select a template to get started.
                </p>
              </div>
            )}

            {fields.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
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
                            name={`positions.${index}.title`}
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
                            name={`positions.${index}.winnerCount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    {...field}
                                    disabled={isSubmitting}
                                    onChange={(e) =>
                                      field.onChange(
                                        parseInt(e.target.value) || 1
                                      )
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

export default ElectionForm;
