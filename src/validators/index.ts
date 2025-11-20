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

    // Optional campaign dates - will be combined with time
    campaignStartDate: dateSchema.optional(),
    campaignEndDate: dateSchema.optional(),
    campaignStartTime: z.string().optional(),
    campaignEndTime: z.string().optional(),

    // Election dates required - will be combined with time
    electionStartDate: dateSchema,
    electionEndDate: dateSchema,
    electionStartTime: z.string(),
    electionEndTime: z.string(),

    isSpecialized: z.boolean().optional(),

    positions: z
      .array(ElectionPositionValidator)
      .min(1, { message: "At least one position is required." })
      .max(50, { message: "Maximum 50 positions allowed per election." }),

    voterRestriction: z.nativeEnum(VoterRestriction),
  })

  // Election Start Date must be today or future
  .refine(
    (data) =>
      data.electionStartDate >= new Date(new Date().setHours(0, 0, 0, 0)),
    {
      message: "Election start date must be today or in the future.",
      path: ["electionStartDate"],
    }
  )

  // Campaign start < campaign end (only if both exist)
  .refine(
    (data) => {
      if (!data.campaignStartDate || !data.campaignEndDate) return true;

      const startDateTime = new Date(data.campaignStartDate);
      const endDateTime = new Date(data.campaignEndDate);

      if (data.campaignStartTime) {
        const [startHour, startMin] = data.campaignStartTime.split(":");
        startDateTime.setHours(parseInt(startHour), parseInt(startMin));
      }

      if (data.campaignEndTime) {
        const [endHour, endMin] = data.campaignEndTime.split(":");
        endDateTime.setHours(parseInt(endHour), parseInt(endMin));
      }

      return startDateTime < endDateTime;
    },
    {
      message: "Campaign end date/time must be after campaign start date/time.",
      path: ["campaignEndDate"],
    }
  );

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
  userType: z.enum(UserType),
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
  headId: z.string().uuid().optional().nullable(),
});
