/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import z from "zod";
import {
  UserValidators,
  PositionTemplateValidator,
  ElectionValidators,
  PartylistValidators,
} from "@/validators";
import db from "@/lib/db";
import { sendAccountToEmail } from "@/hooks/use-email-template";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUniqueCode } from "@/lib/utils";
import { combineDateAndTime } from "@/lib/date-utils";
import { revalidatePath } from "next/cache";

export async function updateUserMeta(formData: {
  year?: string | null;
  course?: string | null;
  section?: string | null;
  institute?: string | null;
  department?: string | null;
  unit?: string | null;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.user.update({
    where: { id: session.user.id },
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
  const session = await getServerSession(authOptions);
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
      session?.user?.id,
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
  values: z.infer<typeof UserValidators>
) => {
  const session = await getServerSession(authOptions);

  const validatedData = UserValidators.parse(values);
  try {
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser && existingUser.id !== id) {
      return { error: "Another account with this email already exists." };
    }

    const response = await db.user.update({
      where: { id },
      data: validatedData,
    });

    await createSystemLog(
      "Account Updated",
      session?.user?.id,
      `Updated account: ${response.email}`
    );
    return { success: "Account updated successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account. Please try again." };
  }
};

export const archiveAccount = async (id: string, isActive: boolean) => {
  const session = await getServerSession(authOptions);

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
      session?.user?.id,
      `Account ${successText}: ${response.email}`
    );

    return { success: `Account ${successText} successfully`, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update account status. Please try again." };
  }
};

export const approveUser = async (id: string) => {
  const session = await getServerSession(authOptions);

  try {
    if (!id) return { error: "Invalid account ID." };

    const response = await db.user.update({
      where: { id },
      data: { status: "Approved" },
    });

    await createSystemLog(
      "User Approved",
      session?.user?.id,
      `Approved user: ${response.email}`
    );

    return { success: "User approved successfully.", data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to approve user. Please try again." };
  }
};

export const rejectUser = async (id: string) => {
  const session = await getServerSession(authOptions);

  try {
    if (!id) return { error: "Invalid account ID." };

    const response = await db.user.update({
      where: { id },
      data: { status: "Rejected" },
    });

    await createSystemLog(
      "User Rejected",
      session?.user?.id,
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
  const session = await getServerSession(authOptions);
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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);
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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

  try {
    if (!id) return { error: "Invalid template ID." };

    const response = await db.positionTemplate.update({
      where: { id },
      data: { isActive: !isActive },
    });

    const statusText = isActive ? "deactivated" : "activated";

    await createSystemLog(
      `Position Template ${statusText}`,
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user?.id) {
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
        createdBy: session.user.id,
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
      session.user.id,
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
      return {
        error: "Validation failed. Please check your inputs.",
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
  const session = await getServerSession(authOptions);

  try {
    if (!session?.user?.id) {
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
      session.user.id,
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
      return {
        error: "Validation failed. Please check your inputs.",
      };
    }
    return {
      error: "Failed to update election. Please try again.",
    };
  }
};

export const deleteElection = async (id: string) => {
  const session = await getServerSession(authOptions);

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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

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
      session?.user?.id,
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
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "SUPERADMIN") {
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
    const XLSX = await import("xlsx");
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
      session?.user?.id,
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

export async function applyPartyAction(partyId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "You must be logged in to apply." };
    }

    const userId = session.user.id;

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
