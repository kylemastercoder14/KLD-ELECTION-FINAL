/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserMeta } from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const studentSchema = z.object({
  year: z.string().min(1, "Year is required"),
  course: z.string().min(1, "Course is required"),
  section: z.string().min(1, "Section is required"),
});

const facultySchema = z.object({
  institute: z.string().min(1, "Institute is required"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
});

const nonTeachingSchema = z.object({
  unit: z.string().min(1, "Unit is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;
type FacultyFormValues = z.infer<typeof facultySchema>;
type NonTeachingFormValues = z.infer<typeof nonTeachingSchema>;

export default function CompleteFormModal() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const user = session?.user as any;

  // Determine form schema and default values based on user type
  const formSchema =
    user?.userType === "FACULTY"
      ? facultySchema
      : user?.userType === "NON_TEACHING"
        ? nonTeachingSchema
        : studentSchema;

  const form = useForm<
    StudentFormValues | FacultyFormValues | NonTeachingFormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues:
      user?.userType === "FACULTY"
        ? { institute: "", department: "", position: "" }
        : user?.userType === "NON_TEACHING"
          ? { unit: "" }
          : { year: "", course: "", section: "" },
  });

  const onSubmit = (
    values: StudentFormValues | FacultyFormValues | NonTeachingFormValues
  ) => {
    startTransition(async () => {
      const res = await updateUserMeta(values);
      if (res.success) {
        toast.success("Profile completed successfully!");
        await update();
        router.refresh();
      } else {
        toast.error("Failed to update profile.");
      }
    });
  };

  // Only open modal if user meta is incomplete
  const showModal =
    user &&
    ((user.userType === "STUDENT" &&
      (!user.year || !user.course || !user.section)) ||
      (user.userType === "FACULTY" &&
        (!user.institute || !user.department || !user.position)) ||
      (user.userType === "NON_TEACHING" && !user.unit));

  if (!showModal) return null;

  return (
    <div className="flex flex-col w-full h-screen fixed inset-0 backdrop-blur-xl">
      <Dialog open={showModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide the missing information to continue.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-4"
            >
              {user.userType === "STUDENT" && (
                <>
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1st year">1st year</SelectItem>
                            <SelectItem value="2nd year">2nd year</SelectItem>
                            <SelectItem value="3rd year">3rd year</SelectItem>
                            <SelectItem value="4th year">4th year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Bachelor of Science in Information System">
                              Bachelor of Science in Information System
                            </SelectItem>
                            <SelectItem value="Bachelor of Science in Psychology">
                              Bachelor of Science in Psychology
                            </SelectItem>
                            <SelectItem value="Bachelor of Science in Engineering">
                              Bachelor of Science in Engineering
                            </SelectItem>
                            <SelectItem value="Bachelor of Science in Nursing">
                              Bachelor of Science in Nursing
                            </SelectItem>
                            <SelectItem value="Diploma in Midwifery">
                              Diploma in Midwifery
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BSIS401" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {user.userType === "FACULTY" && (
                <>
                  <FormField
                    control={form.control}
                    name="institute"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institute</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Institute of Mathematical and Computing Sciences" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Information System"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Professor II" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {user.userType === "NON_TEACHING" && (
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Admin Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
