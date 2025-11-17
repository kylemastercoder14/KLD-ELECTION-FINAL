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
  const validatedData = ElectionValidators.parse(values);

  try {
    if (!session?.user?.id) {
      return { error: "You must be logged in to create an election." };
    }

    const response = await db.election.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        campaignStartDate: validatedData.campaignStartDate,
        campaignEndDate: validatedData.campaignEndDate,
        electionStartDate: validatedData.electionStartDate,
        electionEndDate: validatedData.electionEndDate,
        voterRestriction: validatedData.voterRestriction,
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
      `Election created: ${validatedData.title}`
    );

    revalidatePath("/comelec/election");

    return { success: "Election created successfully.", data: response };
  } catch (error) {
    console.error(error);
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
  const validatedData = ElectionValidators.parse(values);

  try {
    if (!session?.user?.id) {
      return { error: "You must be logged in to update an election." };
    }

    // Check if election exists
    const existingElection = await db.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return { error: "Election not found." };
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
        campaignStartDate: validatedData.campaignStartDate,
        campaignEndDate: validatedData.campaignEndDate,
        electionStartDate: validatedData.electionStartDate,
        electionEndDate: validatedData.electionEndDate,
        voterRestriction: validatedData.voterRestriction,
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
      `Election updated: ${response.title}`
    );

    revalidatePath("/comelec/election");

    return {
      success: "Election updated successfully.",
      data: response,
    };
  } catch (error) {
    console.error(error);
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

    revalidatePath("/comelec/election");

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
      },
    });

    revalidatePath("/comelec/party-list");

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
      },
    });

    revalidatePath("/comelec/party-list");

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

    revalidatePath("/comelec/party-list");

    return { success: `Party ${successText} successfully`, data: response };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update party status. Please try again." };
  }
};

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
