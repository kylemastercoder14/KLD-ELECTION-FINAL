/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { getServerSession } from "@/lib/session";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession();

    if (!session || session?.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only superadmins can restore the database." },
        { status: 403 }
      );
    }

    // Get the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".sql")) {
      return NextResponse.json(
        { error: "Invalid file type. Only .sql files are allowed." },
        { status: 400 }
      );
    }

    // Parse DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    // Get SQL content from file
    const arrayBuffer = await file.arrayBuffer();
    const sqlContent = Buffer.from(arrayBuffer).toString("utf-8");

    // Record restore start in database
    const backupRecord = await db.backupHistory.create({
      data: {
        action: "DB_RESTORE",
        filename: file.name,
        status: "IN_PROGRESS",
        triggeredBy: session.id,
      },
    });

    try {
      // Create a PostgreSQL client connection
      const client = new Client({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      await client.connect();

      // Split SQL content into individual statements
      // Note: This is a simple split that works for basic INSERT statements
      // For complex SQL with functions/triggers, you may need a more robust parser
      const statements = sqlContent
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      // Execute each statement
      for (const statement of statements) {
        if (statement) {
          try {
            await client.query(statement);
          } catch (err: any) {
            console.error(
              `Error executing statement: ${statement.substring(0, 100)}...`
            );
            console.error(err.message);
            // Continue with other statements even if one fails
          }
        }
      }

      await client.end();

      // Update backup record as success
      await db.backupHistory.update({
        where: { id: backupRecord.id },
        data: { status: "SUCCESS" },
      });

      return NextResponse.json({
        message: "Database restored successfully",
        filename: file.name,
      });
    } catch (error) {
      // Update backup record as failed
      await db.backupHistory.update({
        where: { id: backupRecord.id },
        data: { status: "FAILED" },
      });

      throw error;
    }
  } catch (error: any) {
    console.error("Restore error:", error);

    return NextResponse.json(
      { error: "Failed to restore database", details: error.message },
      { status: 500 }
    );
  }
}
