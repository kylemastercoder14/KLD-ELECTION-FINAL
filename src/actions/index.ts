/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import * as XLSX from "xlsx";
import {
  UserValidators,
  PositionTemplateValidator,
  ElectionValidators,
  PartylistValidators,
  LoginValidators,
} from "@/validators";
import db from "@/lib/db";
import {
  OfficialResultsPosition,
  OfficialResultsTurnout,
  sendAccountToEmail,
  sendOfficialResultsToEmail,
} from "@/hooks/use-email-template";
import { getServerSession } from "@/lib/session";
import { generateUniqueCode } from "@/lib/utils";
import { combineDateAndTime } from "@/lib/date-utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserType } from "@prisma/client";
import { FormState } from "@/lib/utils";
import { ROLE_CONFIG, UserRole } from "@/lib/config";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function setAuthCookie(
  user: { id: string; role: UserRole; userType?: UserType | null },
  remember: boolean
) {
  const token = jwt.sign(
    { id: user.id, role: user.role, userType: user.userType },
    JWT_SECRET,
    {
      expiresIn: remember ? "30d" : "1d",
    }
  );

  (await cookies()).set("kld-election-auth-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
  });
}

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<FormState> {
  try {
    const validatedFields = LoginValidators.safeParse({
      userId: formData.get("userId"),
      password: formData.get("password"),
      remember: formData.get("remember") === "on",
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Missing Fields. Failed to Login.",
      };
    }

    const { userId, password, remember } = validatedFields.data;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return {
        errors: { userId: ["Invalid student/employee number or password"] },
        message: "Invalid credentials",
      };
    }

    const passwordMatch = password === user.password;

    if (!passwordMatch) {
      return {
        errors: { password: ["Invalid username or password"] },
        message: "Invalid credentials",
      };
    }

    if (!user.isActive) {
      return {
        errors: { userId: ["Account is not active"] },
        message:
          "Your account is not active. Please contact the administrator.",
      };
    }

    await setAuthCookie(
      { id: user.id, role: user.role, userType: user.userType },
      remember ?? false
    );

    // Get redirect URL from form data if it exists
    const redirectUrl = formData.get("redirect")?.toString() || "";

    // Default to role-specific dashboard
    let finalRedirect: (typeof ROLE_CONFIG)[UserRole]["dashboard"] =
      ROLE_CONFIG[user.role as UserRole].dashboard;

    // Use redirect URL only if it's valid for the user's role and matches a known dashboard
    if (
      redirectUrl &&
      redirectUrl === ROLE_CONFIG[user.role as UserRole].dashboard
    ) {
      finalRedirect =
        redirectUrl as (typeof ROLE_CONFIG)[UserRole]["dashboard"];
    }

    return {
      success: true,
      message: "Login successful",
      user: { role: user.role, id: user.id, userType: user.userType },
      redirect: finalRedirect,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "An error occurred while logging in",
      errors: {},
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();

    // Clear the session cookie
    cookieStore.delete("kld-election-auth-session");

    return {
      success: true,
      message: "Logout successful",
      redirect: "/auth/sign-in",
    };
  } catch (error) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: "An error occurred while logging out",
    };
  }
}

export async function updateUserMeta(formData: {
  year?: string | null;
  course?: string | null;
  section?: string | null;
  institute?: string | null;
  department?: string | null;
  unit?: string | null;
}) {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { id: session.id },
    data: {
      year: formData.year,
      course: formData.course,
      section: formData.section,
      institute: formData.institute,
      department: formData.department,
      unit: formData.unit,
    },
  });

  return { success: true };
}

async function createSystemLog(
  action: string,
  performedBy?: string | null,
  details?: string
) {
  try {
    await db.systemLog.create({
      data: {
        action,
        userId: performedBy ?? null,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to create system log:", error);
  }
}

export const createAccount = async (values: z.infer<typeof UserValidators>) => {
  const session = await getServerSession();
  const validatedData = UserValidators.parse(values);

  try {
    const existingEmail = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      return { error: "An account with this email already exists." };
    }

    const existingUserId = await db.user.findUnique({
      where: { userId: validatedData.userId },
    });

    if (existingUserId) {
      return {
        error: "An account with this Student/Employee No. already exists.",
      };
    }

    const response = await db.user.create({
      data: {
        ...validatedData,
        status: "Approved",
      },
    });

    await sendAccountToEmail(
      validatedData.email,
      validatedData.name,
      validatedData.password,
      validatedData.userId
    );

    await createSystemLog(
      "Account Created",
      session?.id,
      `Account created: ${validatedData.email}`
    );

    return { success: "Account created successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create account. Please try again." };
  }
};

export const updateAccount = async (
  id: string,
  values: Partial<z.infer<typeof UserValidators>>
) => {
  const session = await getServerSession();

  // Create a validator that makes password optional
  const UpdateUserValidators = UserValidators.extend({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  });

  const validatedData = UpdateUserValidators.parse(values);
  try {
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser && existingUser.id !== id) {
      return { error: "Another account with this email already exists." };
    }

    // Only include password in update if it's provided
    const updateData: Partial<z.infer<typeof UserValidators>> = {
      name: validatedData.name,
      email: validatedData.email,
      userId: validatedData.userId,
      role: validatedData.role,
      userType: validatedData.userType,
    };

    // Only add password if it was provided
    if (validatedData.password) {
      updateData.password = validatedData.password;
    }

    const response = await db.user.update({
      where: { id },
      data: updateData,
    });

    await createSystemLog(
      "Account Updated",
      session?.id,
      `Updated account: ${response.email}`
    );
    return { success: "Account updated successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account. Please try again." };
  }
};

export const archiveAccount = async (id: string, isActive: boolean) => {
  const session = await getServerSession();

  try {
    if (!id) {
      return { error: "Invalid account ID." };
    }

    const response = await db.user.update({
      where: { id },
      data: { isActive: !isActive },
    });

    const successText = isActive ? "archived" : "restored";

    await createSystemLog(
      `Account ${successText}`,
      session?.id,
      `Account ${successText}: ${response.email}`
    );

    return { success: `Account ${successText} successfully`, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account status. Please try again." };
  }
};

export const approveUser = async (id: string) => {
  const session = await getServerSession();

  try {
    if (!id) return { error: "Invalid account ID." };

    const response = await db.user.update({
      where: { id },
      data: { status: "Approved" },
    });

    await createSystemLog(
      "User Approved",
      session?.id,
      `Approved user: ${response.email}`
    );

    return { success: "User approved successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to approve user. Please try again." };
  }
};

export const rejectUser = async (id: string) => {
  const session = await getServerSession();

  try {
    if (!id) return { error: "Invalid account ID." };

    const response = await db.user.update({
      where: { id },
      data: { status: "Rejected" },
    });

    await createSystemLog(
      "User Rejected",
      session?.id,
      `Rejected user: ${response.email}`
    );

    return { success: "User rejected successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to reject user. Please try again." };
  }
};

// PositionTemplate CRUD operations
export const createPositionTemplate = async (
  values: z.infer<typeof PositionTemplateValidator>
) => {
  const session = await getServerSession();
  const validatedData = PositionTemplateValidator.parse(values);

  try {
    const existingTemplate = await db.positionTemplate.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTemplate) {
      return { error: "A template with this name already exists." };
    }

    const response = await db.positionTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        items: {
          create: validatedData.items.map((item, index) => ({
            title: item.title,
            winnerCount: item.winnerCount,
            displayOrder: item.displayOrder ?? index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    await createSystemLog(
      "Position Template Created",
      session?.id,
      `Template created: ${validatedData.name}`
    );

    return {
      success: "Position template created successfully.",
      data: response,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to create position template. Please try again.",
    };
  }
};

export const updatePositionTemplate = async (
  id: string,
  values: z.infer<typeof PositionTemplateValidator>
) => {
  const session = await getServerSession();
  const validatedData = PositionTemplateValidator.parse(values);

  try {
    const existingTemplate = await db.positionTemplate.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTemplate && existingTemplate.id !== id) {
      return { error: "Another template with this name already exists." };
    }

    // Delete existing items and create new ones
    await db.positionTemplateItem.deleteMany({
      where: { templateId: id },
    });

    const response = await db.positionTemplate.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        items: {
          create: validatedData.items.map((item, index) => ({
            title: item.title,
            winnerCount: item.winnerCount,
            displayOrder: item.displayOrder ?? index,
          })),
        },
      },
      include: {
        items: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    await createSystemLog(
      "Position Template Updated",
      session?.id,
      `Template updated: ${response.name}`
    );

    return {
      success: "Position template updated successfully.",
      data: response,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update position template. Please try again.",
    };
  }
};

export const deletePositionTemplate = async (id: string) => {
  const session = await getServerSession();

  try {
    if (!id) return { error: "Invalid template ID." };

    const template = await db.positionTemplate.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!template) {
      return { error: "Template not found." };
    }

    await db.positionTemplate.delete({
      where: { id },
    });

    await createSystemLog(
      "Position Template Deleted",
      session?.id,
      `Template deleted: ${template.name}`
    );

    return { success: "Position template deleted successfully." };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to delete position template. Please try again.",
    };
  }
};

export const togglePositionTemplateStatus = async (
  id: string,
  isActive: boolean
) => {
  const session = await getServerSession();

  try {
    if (!id) return { error: "Invalid template ID." };

    const response = await db.positionTemplate.update({
      where: { id },
      data: { isActive: !isActive },
    });

    const statusText = isActive ? "deactivated" : "activated";

    await createSystemLog(
      `Position Template ${statusText}`,
      session?.id,
      `Template ${statusText}: ${response.name}`
    );

    return {
      success: `Position template ${statusText} successfully`,
      data: response,
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update template status. Please try again.",
    };
  }
};

// Election archive/restore
export const archiveElection = async (id: string, isActive: boolean) => {
  const session = await getServerSession();

  try {
    if (!id) {
      return { error: "Invalid election ID." };
    }

    const response = await db.election.update({
      where: { id },
      data: { isActive: !isActive },
    });

    const successText = isActive ? "archived" : "restored";

    await createSystemLog(
      `Election ${successText}`,
      session?.id,
      `Election ${successText}: ${response.title}`
    );

    return { success: `Election ${successText} successfully`, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update election status. Please try again." };
  }
};

// Election CRUD operations
export const createElection = async (
  values: z.infer<typeof ElectionValidators>
) => {
  const session = await getServerSession();

  try {
    if (!session?.id) {
      return { error: "You must be logged in to create an election." };
    }

    const validatedData = ElectionValidators.parse(values);

    // Combine dates with times
    const campaignStartDateTime = validatedData.campaignStartDate
      ? combineDateAndTime(
          validatedData.campaignStartDate,
          validatedData.campaignStartTime
        )
      : undefined;

    const campaignEndDateTime = validatedData.campaignEndDate
      ? combineDateAndTime(
          validatedData.campaignEndDate,
          validatedData.campaignEndTime
        )
      : undefined;

    const electionStartDateTime = combineDateAndTime(
      validatedData.electionStartDate,
      validatedData.electionStartTime
    );

    const electionEndDateTime = combineDateAndTime(
      validatedData.electionEndDate,
      validatedData.electionEndTime
    );

    // Generate unique code if specialized
    let uniqueCode: string | null = null;
    if (validatedData.isSpecialized) {
      // Ensure the code is unique
      let isUnique = false;
      while (!isUnique) {
        uniqueCode = generateUniqueCode();
        const existing = await db.election.findUnique({
          where: { uniqueCode: uniqueCode ?? undefined },
        });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    const response = await db.election.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        campaignStartDate: campaignStartDateTime,
        campaignEndDate: campaignEndDateTime,
        electionStartDate: electionStartDateTime,
        electionEndDate: electionEndDateTime,
        voterRestriction: validatedData.voterRestriction,
        isSpecialized: validatedData.isSpecialized || false,
        uniqueCode: uniqueCode,
        createdBy: session.id,
        positions: {
          create: validatedData.positions.map((position) => ({
            title: position.title,
            winnerCount: position.winnerCount,
          })),
        },
      },
      include: {
        positions: true,
      },
    });

    await createSystemLog(
      "Election Created",
      session.id,
      `Election created: ${validatedData.title}${uniqueCode ? ` (Code: ${uniqueCode})` : ""}`
    );

    revalidatePath("/comelec/election");

    return {
      success: "Election created successfully.",
      data: response,
      uniqueCode: uniqueCode,
    };
  } catch (error) {
    console.error("Create election error:", error);
    if (error instanceof z.ZodError) {
      const details = error.issues
        .map((issue) => {
          const field = issue.path.join(".") || "form";
          return `${field}: ${issue.message}`;
        })
        .join(" | ");
      return {
        error: `Validation failed: ${details}`,
      };
    }
    return {
      error: "Failed to create election. Please try again.",
    };
  }
};

export const updateElection = async (
  id: string,
  values: z.infer<typeof ElectionValidators>
) => {
  const session = await getServerSession();

  try {
    if (!session?.id) {
      return { error: "You must be logged in to update an election." };
    }

    const validatedData = ElectionValidators.parse(values);

    // Check if election exists
    const existingElection = await db.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return { error: "Election not found." };
    }

    // Combine dates with times
    const campaignStartDateTime = validatedData.campaignStartDate
      ? combineDateAndTime(
          validatedData.campaignStartDate,
          validatedData.campaignStartTime
        )
      : undefined;

    const campaignEndDateTime = validatedData.campaignEndDate
      ? combineDateAndTime(
          validatedData.campaignEndDate,
          validatedData.campaignEndTime
        )
      : undefined;

    const electionStartDateTime = combineDateAndTime(
      validatedData.electionStartDate,
      validatedData.electionStartTime
    );

    const electionEndDateTime = combineDateAndTime(
      validatedData.electionEndDate,
      validatedData.electionEndTime
    );

    // Handle unique code for specialized elections
    let uniqueCode: string | null = existingElection.uniqueCode;

    if (validatedData.isSpecialized) {
      // If specialized but doesn't have a code, generate one
      if (!uniqueCode) {
        let isUnique = false;
        while (!isUnique) {
          uniqueCode = generateUniqueCode();
          const existing = await db.election.findUnique({
            where: { uniqueCode },
          });
          if (!existing) {
            isUnique = true;
          }
        }
      }
      // If already has code, keep it
    } else {
      // If not specialized, remove the code
      uniqueCode = null;
    }

    // Delete existing positions and create new ones
    await db.position.deleteMany({
      where: { electionId: id },
    });

    const response = await db.election.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        campaignStartDate: campaignStartDateTime,
        campaignEndDate: campaignEndDateTime,
        electionStartDate: electionStartDateTime,
        electionEndDate: electionEndDateTime,
        voterRestriction: validatedData.voterRestriction,
        isSpecialized: validatedData.isSpecialized || false,
        uniqueCode: uniqueCode,
        positions: {
          create: validatedData.positions.map((position) => ({
            title: position.title,
            winnerCount: position.winnerCount,
          })),
        },
      },
      include: {
        positions: true,
      },
    });

    await createSystemLog(
      "Election Updated",
      session.id,
      `Election updated: ${response.title}${uniqueCode ? ` (Code: ${uniqueCode})` : ""}`
    );

    revalidatePath("/comelec/election");

    return {
      success: "Election updated successfully.",
      data: response,
      uniqueCode: uniqueCode,
    };
  } catch (error) {
    console.error("Update election error:", error);
    if (error instanceof z.ZodError) {
      const details = error.issues
        .map((issue) => {
          const field = issue.path.join(".") || "form";
          return `${field}: ${issue.message}`;
        })
        .join(" | ");
      return {
        error: `Validation failed: ${details}`,
      };
    }
    return {
      error: "Failed to update election. Please try again.",
    };
  }
};

export const markElectionAsOfficial = async (id: string) => {
  const session = await getServerSession();

  try {
    if (!session?.id) {
      return {
        error: "You must be logged in to mark an election as official.",
      };
    }

    // Check if user has permission (COMELEC or POLL_WATCHER)
    const userRole = session.role;
    if (userRole !== "COMELEC" && userRole !== "POLL_WATCHER") {
      return {
        error: "You do not have permission to mark elections as official.",
      };
    }

    // Check if election exists with full details
    const electionWithDetails = await db.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            votes: true,
            candidates: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                votes: true,
              },
            },
          },
        },
        votes: true,
      },
    });

    if (!electionWithDetails) {
      return { error: "Election not found." };
    }
    const election = electionWithDetails;

    // Update election to official
    const response = await db.election.update({
      where: { id },
      data: {
        isOfficial: true,
        status: "COMPLETED", // Ensure status is COMPLETED
      },
    });

    const electionData = election;

    // Build position result summaries
    const positionResults: OfficialResultsPosition[] =
      electionData.positions.map((position) => {
        const sortedCandidates = [...position.candidates].sort(
          (a, b) => b.votes.length - a.votes.length
        );

        const winners = sortedCandidates
          .slice(0, position.winnerCount)
          .map((candidate) => ({
            candidateName: candidate.user?.name || "Unknown Candidate",
            voteCount: candidate.votes.length,
            partyName: undefined,
          }));

        return {
          positionTitle: position.title,
          winners,
          totalVotes: position.votes.length,
        };
      });

    // Build voter filter
    const voterFilter: any = { role: "USER" };
    switch (election.voterRestriction) {
      case "STUDENTS":
        voterFilter.userType = "STUDENT";
        break;
      case "FACULTY":
        voterFilter.userType = "FACULTY";
        break;
      case "NON_TEACHING":
        voterFilter.userType = "NON_TEACHING";
        break;
      case "STUDENTS_FACULTY":
        voterFilter.OR = [{ userType: "STUDENT" }, { userType: "FACULTY" }];
        break;
      case "ALL":
      default:
        break;
    }

    const voters = await db.user.findMany({
      where: voterFilter,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const votersWhoVoted = Array.from(
      new Set(electionData.votes.map((vote) => vote.voterId))
    );

    const turnout: OfficialResultsTurnout = {
      totalVoters: voters.length,
      votedCount: votersWhoVoted.length,
      percentage:
        voters.length > 0
          ? ((votersWhoVoted.length / voters.length) * 100).toFixed(1)
          : "0.0",
    };

    const announcementDate = new Date().toLocaleString("en-PH", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // Send notifications to all eligible voters (fire and forget)
    const emailPromises = voters.map((voter) =>
      sendOfficialResultsToEmail(
        voter.email,
        voter.name || "KLD Voter",
        election.title,
        announcementDate,
        positionResults,
        turnout,
        "Visit the EMS portal for the detailed canvassing report."
      )
    );
    void Promise.allSettled(emailPromises);

    await createSystemLog(
      "Election Marked as Official",
      session.id,
      `Election marked as official: ${response.title} by ${userRole}`
    );

    revalidatePath("/poll-watcher/election");
    revalidatePath("/comelec/election");
    revalidatePath(`/poll-watcher/election/${id}/results`);
    revalidatePath(`/comelec/election/${id}/results`);

    return {
      success: "Election marked as official successfully.",
      data: response,
    };
  } catch (error) {
    console.error("Mark election as official error:", error);
    return {
      error: "Failed to mark election as official. Please try again.",
    };
  }
};

export const deleteElection = async (id: string) => {
  const session = await getServerSession();

  try {
    if (!id) return { error: "Invalid election ID." };

    const election = await db.election.findUnique({
      where: { id },
    });

    if (!election) {
      return { error: "Election not found." };
    }

    await db.election.delete({
      where: { id },
    });

    await createSystemLog(
      "Election Deleted",
      session?.id,
      `Election deleted: ${election.title}`
    );

    return { success: "Election deleted successfully." };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to delete election. Please try again.",
    };
  }
};

export const createPartyList = async (
  values: z.infer<typeof PartylistValidators>
) => {
  try {
    const validatedData = PartylistValidators.parse(values);

    const existingParty = await db.party.findFirst({
      where: { name: validatedData.name },
    });
    if (existingParty)
      return { error: "A party-list with this name already exists." };

    const response = await db.party.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        logoUrl: validatedData.logo,
        headId: validatedData.headId || null,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: "Party-list created successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create party-list. Please try again." };
  }
};

export const updatePartyList = async (
  id: string,
  values: z.infer<typeof PartylistValidators>
) => {
  try {
    const validatedData = PartylistValidators.parse(values);

    const party = await db.party.findUnique({ where: { id } });
    if (!party) return { error: "Party-list not found." };

    // Check if name is being changed to something that exists
    const existingParty = await db.party.findFirst({
      where: { name: validatedData.name },
    });
    if (existingParty && existingParty.id !== id)
      return { error: "A party-list with this name already exists." };

    const response = await db.party.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        logoUrl: validatedData.logo,
        headId: validatedData.headId || null,
      },
      include: {
        head: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: "Party-list updated successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update party-list. Please try again." };
  }
};

// Election archive/restore
export const archivePartyList = async (id: string, isActive: boolean) => {
  const session = await getServerSession();

  try {
    if (!id) {
      return { error: "Invalid party ID." };
    }

    const response = await db.party.update({
      where: { id },
      data: { isActive: !isActive },
    });

    const successText = isActive ? "archived" : "restored";

    await createSystemLog(
      `Party ${successText}`,
      session?.id,
      `Party ${successText}: ${response.name}`
    );

    return { success: `Party ${successText} successfully`, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update party status. Please try again." };
  }
};

export async function updatePartyApplicationStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    const existing = await db.partyApplication.findUnique({ where: { id } });
    if (!existing) return { success: false, message: "Application not found." };

    await db.partyApplication.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/comelec/party-list");

    return {
      success: true,
      message: `Application ${status.toLowerCase()} successfully.`,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update application status." };
  }
}

export const bulkCreateUsers = async (fileBase64: string, fileName: string) => {
  const session = await getServerSession();

  if (!session || session?.role !== "SUPERADMIN") {
    return { error: "Unauthorized. Only superadmins can bulk create users." };
  }

  try {
    // Validate file type by extension
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = fileName
      .substring(fileName.lastIndexOf("."))
      .toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return {
        error:
          "Invalid file type. Please upload an Excel file (.xlsx or .xls).",
      };
    }

    // Parse Excel file

    const buffer = Buffer.from(fileBase64, "base64");
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!data || data.length === 0) {
      return { error: "Excel file is empty or invalid." };
    }

    // Expected columns
    const expectedColumns = [
      "email",
      "userId",
      "name",
      "role",
      "userType",
      "status",
      "year",
      "course",
      "section",
      "institute",
      "department",
      "position",
      "unit",
    ];

    // Validate columns exist
    const firstRow = data[0] as Record<string, unknown>;
    const missingColumns = expectedColumns.filter((col) => !(col in firstRow));
    if (missingColumns.length > 0) {
      return {
        error: `Missing required columns: ${missingColumns.join(", ")}`,
      };
    }

    const errors: Array<{ row: number; error: string }> = [];
    const createdUsers: string[] = [];
    const defaultPassword = "password123";

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, unknown>;
      const rowNumber = i + 2; // +2 because Excel rows start at 1 and we have a header

      try {
        // Extract and clean data
        const email = String(row.email || "").trim();
        const userId = String(row.userId || "").trim();
        const name = String(row.name || "").trim();
        const role = String(row.role || "USER")
          .trim()
          .toUpperCase();
        const userType = String(row.userType || "STUDENT")
          .trim()
          .toUpperCase();
        const status = String(row.status || "Approved").trim();

        // Validate required fields
        if (!email || !userId || !name) {
          errors.push({
            row: rowNumber,
            error: "Missing required fields: email, userId, or name",
          });
          continue;
        }

        // Validate email format
        if (!email.includes("@kld.edu.ph")) {
          errors.push({
            row: rowNumber,
            error: `Invalid email format: ${email} (must be @kld.edu.ph)`,
          });
          continue;
        }

        // Validate role
        const validRoles = [
          "SUPERADMIN",
          "ADMIN",
          "COMELEC",
          "POLL_WATCHER",
          "USER",
        ];
        if (!validRoles.includes(role)) {
          errors.push({
            row: rowNumber,
            error: `Invalid role: ${role}`,
          });
          continue;
        }

        // Validate userType
        const validUserTypes = ["STUDENT", "FACULTY", "NON_TEACHING"];
        if (!validUserTypes.includes(userType)) {
          errors.push({
            row: rowNumber,
            error: `Invalid userType: ${userType}`,
          });
          continue;
        }

        // Check for duplicates
        const existingEmail = await db.user.findUnique({
          where: { email },
        });
        if (existingEmail) {
          errors.push({
            row: rowNumber,
            error: `Email already exists: ${email}`,
          });
          continue;
        }

        const existingUserId = await db.user.findUnique({
          where: { userId },
        });
        if (existingUserId) {
          errors.push({
            row: rowNumber,
            error: `User ID already exists: ${userId}`,
          });
          continue;
        }

        // Extract optional fields
        const year = row.year ? String(row.year).trim() : null;
        const course = row.course ? String(row.course).trim() : null;
        const section = row.section ? String(row.section).trim() : null;
        const institute = row.institute ? String(row.institute).trim() : null;
        const department = row.department
          ? String(row.department).trim()
          : null;
        const position = row.position ? String(row.position).trim() : null;
        const unit = row.unit ? String(row.unit).trim() : null;

        // Create user
        const user = await db.user.create({
          data: {
            email,
            userId,
            name,
            password: defaultPassword,
            role: role as any,
            userType: userType as any,
            status,
            isActive: true,
            year: userType === "STUDENT" ? year : null,
            course: userType === "STUDENT" ? course : null,
            section: userType === "STUDENT" ? section : null,
            institute: userType === "FACULTY" ? institute : null,
            department: userType === "FACULTY" ? department : null,
            position: userType === "FACULTY" ? position : null,
            unit: userType === "NON_TEACHING" ? unit : null,
          },
        });

        createdUsers.push(user.email);

        // Send email notification (optional, can be async)
        try {
          await sendAccountToEmail(email, name, defaultPassword, userId);
        } catch (emailError) {
          console.error(`Failed to send email to ${email}:`, emailError);
          // Don't fail the entire operation if email fails
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Create system log
    await createSystemLog(
      "Bulk Account Creation",
      session?.id,
      `Created ${createdUsers.length} user(s) from Excel file. ${errors.length} error(s).`
    );

    return {
      success: `Successfully created ${createdUsers.length} user(s).`,
      createdCount: createdUsers.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Bulk create error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process Excel file. Please check the format and try again.",
    };
  }
};

export async function updateCandidateStatus(
  id: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    await db.candidate.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/comelec/party-list");

    return {
      success: true,
      message: `Candidate ${status.toLowerCase()} successfully.`,
    };
  } catch (error) {
    console.error("Failed to update candidate status:", error);
    return { success: false, message: "Failed to update candidate status." };
  }
}

export const archiveCandidate = async (id: string, isActive: boolean) => {
  const session = await getServerSession();

  try {
    if (!id) {
      return { error: "Invalid candidate ID." };
    }

    const response = await db.candidate.update({
      where: { id },
      data: { isActive: !isActive },
      include: {
        user: true,
        position: true,
        election: true,
      },
    });

    const successText = isActive ? "archived" : "restored";

    await createSystemLog(
      `Candidate ${successText}`,
      session?.id,
      `Candidate ${response.user?.name || response.id} ${successText} for position ${response.position.title}`
    );

    revalidatePath("/comelec/candidates");

    return {
      success: `Candidate ${successText} successfully.`,
      data: response,
    };
  } catch (error) {
    console.error("Archive candidate error:", error);
    return { error: "Failed to update candidate status. Please try again." };
  }
};

export async function applyPartyAction(partyId: string) {
  try {
    const session = await getServerSession();
    if (!session?.id) {
      return { success: false, message: "You must be logged in to apply." };
    }

    const userId = session.id;

    // Check if already applied or a member
    const existing = await db.partyApplication.findFirst({
      where: { userId, partyId },
    });

    if (existing) {
      return {
        success: false,
        message: "You have already applied or are a member of this party.",
      };
    }

    // Create application
    await db.partyApplication.create({
      data: {
        userId,
        partyId,
        status: "PENDING",
      },
    });

    revalidatePath("/user/party-list");

    return {
      success: true,
      message: "Application submitted! Please wait for COMELEC approval.",
    };
  } catch (error) {
    console.error("Apply party error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function removePartyApplication(partyId: string) {
  try {
    const session = await getServerSession();
    if (!session?.id) {
      return { success: false, message: "You must be logged in to remove your application." };
    }

    const userId = session.id;

    // Check if application exists
    const existing = await db.partyApplication.findFirst({
      where: { userId, partyId },
    });

    if (!existing) {
      return {
        success: false,
        message: "You don't have an application for this party.",
      };
    }

    // Delete the application
    await db.partyApplication.delete({
      where: { id: existing.id },
    });

    revalidatePath("/user/party-list");

    return {
      success: true,
      message: "Application removed successfully. You can now apply to another party.",
    };
  } catch (error) {
    console.error("Remove party application error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function withdrawCandidacy(candidateId: string) {
  try {
    const session = await getServerSession();
    if (!session?.id) {
      return { success: false, message: "You must be logged in to withdraw your candidacy." };
    }

    const userId = session.id;

    // Check if candidacy exists and belongs to the user
    const candidate = await db.candidate.findUnique({
      where: { id: candidateId },
      include: {
        election: true,
        votes: true,
      },
    });

    if (!candidate) {
      return {
        success: false,
        message: "Candidacy application not found.",
      };
    }

    if (candidate.userId !== userId) {
      return {
        success: false,
        message: "You are not authorized to withdraw this candidacy.",
      };
    }

    // Check if election has started (optional: prevent withdrawal after election starts)
    const now = new Date();
    const electionStarted = candidate.election.electionStartDate <= now;

    // Check if votes have been cast
    const hasVotes = candidate.votes.length > 0;

    // Delete the candidate (votes will be cascade deleted)
    await db.candidate.delete({
      where: { id: candidateId },
    });

    revalidatePath("/user/candidacy-application");
    revalidatePath(`/user/election/${candidate.electionId}`);

    let message = "Candidacy withdrawn successfully. You can now apply to another position.";
    if (hasVotes) {
      message = "Candidacy withdrawn successfully. All votes cast for you have been removed.";
    }

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("Withdraw candidacy error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function addCandidateManually(
  electionId: string,
  userId: string,
  positionId: string,
  platform: string,
  imageUrl?: string
) {
  try {
    const session = await getServerSession();
    if (!session?.id) {
      return { success: false, message: "You must be logged in to add candidates." };
    }

    // Check if election exists and is specialized
    const election = await db.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return {
        success: false,
        message: "Election not found.",
      };
    }

    if (!election.isSpecialized) {
      return {
        success: false,
        message: "This feature is only available for specialized elections.",
      };
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    // Check if position exists in this election
    const position = await db.position.findFirst({
      where: {
        id: positionId,
        electionId: electionId,
      },
    });

    if (!position) {
      return {
        success: false,
        message: "Position not found in this election.",
      };
    }

    // Check if user is already a candidate in this election
    const existingCandidate = await db.candidate.findFirst({
      where: {
        electionId,
        userId,
      },
    });

    if (existingCandidate) {
      return {
        success: false,
        message: "This user is already a candidate in this election.",
      };
    }

    // Because of the unique constraint on Candidate.userId,
    // a user can only be a candidate in ONE election overall.
    const existingInOtherElection = await db.candidate.findFirst({
      where: {
        userId,
      },
      include: {
        election: true,
        position: true,
      },
    });

    if (existingInOtherElection) {
      return {
        success: false,
        message: `This user is already a candidate for "${existingInOtherElection.election.title}" (${existingInOtherElection.position.title}). A user can only be a candidate in one election at a time.`,
      };
    }

    // Create candidate - automatically approve for specialized elections
    const candidate = await db.candidate.create({
      data: {
        userId,
        electionId,
        positionId,
        platform: platform || "No platform provided.",
        imageUrl: imageUrl || null,
        status: "APPROVED", // Auto-approve for specialized elections
      },
    });

    await createSystemLog(
      "Candidate Added Manually",
      session.id,
      `Added candidate: ${user.name} to position ${position.title} in election ${election.title}`
    );

    revalidatePath(`/comelec/election/${electionId}`);
    revalidatePath(`/comelec/election/${electionId}/manage-candidates`);

    return {
      success: true,
      message: "Candidate added successfully.",
      data: candidate,
    };
  } catch (error) {
    console.error("Add candidate manually error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
