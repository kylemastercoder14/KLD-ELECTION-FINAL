import { UserRole, UserType, VoterRestriction } from "@prisma/client";
import z from "zod";

export const ElectionPositionValidator = z.object({
  title: z.string().min(1, { message: "Position title is required." }),
  winnerCount: z
    .number()
    .int()
    .min(1, { message: "Winner count must be at least 1." }),
});

const dateSchema = z.date();

export const ElectionValidators = z
  .object({
    title: z.string().min(1, { message: "Title is required." }),
    description: z
      .string()
      .min(1, { message: "Description is required." })
      .max(1000, { message: "Description must be less than 1000 characters." }),
    campaignStartDate: dateSchema,
    campaignEndDate: dateSchema,
    electionStartDate: dateSchema,
    electionEndDate: dateSchema,
    positions: z
      .array(ElectionPositionValidator)
      .min(1, { message: "At least one position is required." })
      .max(50, { message: "Maximum 50 positions allowed per election." }),
    voterRestriction: z.nativeEnum(VoterRestriction),
  })
  .refine(
    (data) =>
      data.electionStartDate >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Election start date must be today or in the future.",
      path: ["electionStartDate"],
    }
  )
  .refine((data) => data.campaignStartDate < data.campaignEndDate, {
    message: "Campaign end date must be after campaign start date.",
    path: ["campaignEndDate"],
  })
  .refine((data) => data.electionStartDate < data.electionEndDate, {
    message: "Election end date must be after election start date.",
    path: ["electionEndDate"],
  })
  .refine((data) => data.campaignEndDate <= data.electionStartDate, {
    message: "Campaign must end before or on election start date.",
    path: ["campaignEndDate"],
  });

export const UserValidators = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z
    .string()
    .min(1, { message: "KLD email is required." })
    .email({ message: "Invalid email address." })
    .regex(/^[A-Za-z0-9._%+-]+@kld\.edu\.ph$/, {
      message: "Email must be a valid KLD email (@kld.edu.ph).",
    }),
  userId: z
    .string()
    .min(1, { message: "Student/employee number is required." }),
  role: z.enum(UserRole),
  userType: z.enum(UserType).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export const PositionTemplateItemValidator = z.object({
  title: z.string().min(1, { message: "Position title is required." }),
  winnerCount: z
    .number()
    .int()
    .min(1, { message: "Winner count must be at least 1." }),
  displayOrder: z.number().int().default(0),
});

export const PositionTemplateValidator = z.object({
  name: z
    .string()
    .min(1, { message: "Template name is required." })
    .max(100, { message: "Template name must be less than 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional(),
  items: z
    .array(PositionTemplateItemValidator)
    .min(1, { message: "At least one position is required in the template." })
    .max(50, { message: "Maximum 50 positions allowed per template." }),
});

export const PartylistValidators = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(3000, { message: "Description must be less than 3000 characters." })
    .optional(),
  logo: z.string().min(1, { message: "Logo is required." }),
});

export const studentSchema = z.object({
  year: z.string().min(1, "Year is required"),
  course: z.string().min(1, "Course is required"),
  section: z.string().min(1, "Section is required"),
});

export const facultySchema = z.object({
  institute: z.string().min(1, "Institute is required"),
  department: z.string().min(1, "Department is required"),
});

export const nonTeachingSchema = z.object({
  unit: z.string().min(1, "Unit is required"),
});
