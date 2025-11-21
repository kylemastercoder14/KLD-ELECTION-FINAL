/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "@/lib/get-session";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      username,
      image,
      course,
      year,
      section,
      institute,
      department,
      position,
      unit,
    } = body;

    // Get current user to check userType
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update data based on what's provided
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (username !== undefined) updateData.username = username;
    if (image !== undefined) updateData.image = image;

    // Add user-type specific fields
    if (currentUser.userType === "STUDENT") {
      if (course !== undefined) updateData.course = course;
      if (year !== undefined) updateData.year = year;
      if (section !== undefined) updateData.section = section;
    } else if (currentUser.userType === "FACULTY") {
      if (institute !== undefined) updateData.institute = institute;
      if (department !== undefined) updateData.department = department;
      if (position !== undefined) updateData.position = position;
    } else if (currentUser.userType === "NON_TEACHING") {
      if (unit !== undefined) updateData.unit = unit;
      if (position !== undefined) updateData.position = position;
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Create activity log
    await db.systemLog.create({
      data: {
        action: "PROFILE_UPDATE",
        details: `User updated their profile information`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);

    // Handle unique constraint errors (email/username already exists)
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return NextResponse.json(
        { error: `This ${field} is already taken` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
