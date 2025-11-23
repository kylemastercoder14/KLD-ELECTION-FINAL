/* eslint-disable react-hooks/incompatible-library */
"use client";

import React, { useState } from "react";
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
import {
  CalendarIcon,
  Plus,
  Trash2,
  GripVertical,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getLocalTime } from "@/lib/date-utils";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(
    initialData?.uniqueCode || null
  );
  const [copied, setCopied] = useState(false);

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
      campaignStartTime: getLocalTime(initialData?.campaignStartDate),
      campaignEndTime: getLocalTime(initialData?.campaignEndDate),
      electionStartTime: getLocalTime(initialData?.electionStartDate),
      electionEndTime: getLocalTime(initialData?.electionEndDate),
      positions: initialData?.positions
        ? initialData.positions.map((pos) => ({
            title: pos.title,
            winnerCount: pos.winnerCount,
          }))
        : [],
      voterRestriction: initialData?.voterRestriction || VoterRestriction.ALL,
      isSpecialized: initialData?.isSpecialized || false,
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
        campaignStartTime: getLocalTime(initialData?.campaignStartDate),
        campaignEndTime: getLocalTime(initialData?.campaignEndDate),
        electionStartTime: getLocalTime(initialData?.electionStartDate),
        electionEndTime: getLocalTime(initialData?.electionEndDate),
        positions: initialData.positions.map((pos) => ({
          title: pos.title,
          winnerCount: pos.winnerCount,
        })),
        voterRestriction: initialData.voterRestriction || VoterRestriction.ALL,
        isSpecialized: initialData?.isSpecialized || false,
      });
      setGeneratedCode(initialData.uniqueCode || null);
    }
  }, [initialData, form]);

  const { isSubmitting } = form.formState;
  const isSpecialized = form.watch("isSpecialized");

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

      // If specialized and has unique code, show share dialog
      if (response?.uniqueCode) {
        setGeneratedCode(response.uniqueCode);
        setShareDialogOpen(true);
      } else {
        router.push("/superadmin/election");
      }
    } catch (error) {
      console.error("Form submission failed:", error);
      toast.error("Failed to save election. Please try again.");
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = positionTemplates.find((t) => t.id === templateId);
    if (template) {
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

  const getShareableLink = () => {
    return `http://localhost:3000/election/${generatedCode}/vote-now`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareableLink());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
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
              <div className="grid lg:grid-cols-5 grid-cols-1 gap-3.5">
                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="campaignStartDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign Start Date{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                </div>
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="campaignStartTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign Start Time{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Time the campaign begins.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-5 grid-cols-1 gap-3.5">
                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="campaignEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign End Date{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
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
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="campaignEndTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Campaign End Time{" "}
                          <span className="text-muted-foreground">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Time the campaign ends.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 grid-cols-1 gap-3.5">
              <div className="grid lg:grid-cols-5 grid-cols-1 gap-3.5">
                <div className="lg:col-span-3">
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
                </div>
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="electionStartTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Election Start Time{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Time the election begins.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid lg:grid-cols-5 grid-cols-1 gap-3.5">
                <div className="lg:col-span-3">
                  <FormField
                    control={form.control}
                    name="electionEndDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Election End Date{" "}
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
                <div className="lg:col-span-2">
                  <FormField
                    control={form.control}
                    name="electionEndTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Election End Time{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Time the election ends.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="voterRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Voter Restriction{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
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
                    Restrict who can vote in this election. Students are
                    identified by having year/course/section. Faculty by
                    institute/department. Non-teaching by unit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isSpecialized"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Label className="hover:bg-green-50 dark:hover:bg-green-950 flex items-start gap-2 rounded-lg border p-3 has-aria-checked:border-green-600 has-aria-checked:bg-green-50 dark:has-aria-checked:border-green-900 dark:has-aria-checked:bg-green-950">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white dark:data-[state=checked]:border-green-700 dark:data-[state=checked]:bg-green-700"
                      />
                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Specialized Election
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Enable this if the election is exclusive to an
                          organization or specific subgroup. A unique access
                          code will be generated.
                        </p>
                      </div>
                    </Label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSpecialized && generatedCode && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Shareable Link</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share this link with voters for specialized election
                      access
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShareDialogOpen(true)}
                  >
                    <Share2 className="size-4 mr-2" />
                    Share Link
                  </Button>
                </div>
              </div>
            )}

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
                        <TableHead className="w-[150px]">
                          Winner Count
                        </TableHead>
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

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Election Link</DialogTitle>
            <DialogDescription>
              Share this unique link with voters to access the specialized
              election.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input readOnly value={getShareableLink()} className="flex-1" />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium mb-1">Access Code</p>
              <p className="text-2xl font-bold font-mono">{generatedCode}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShareDialogOpen(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShareDialogOpen(false);
                  router.push("/comelec/election");
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ElectionForm;
