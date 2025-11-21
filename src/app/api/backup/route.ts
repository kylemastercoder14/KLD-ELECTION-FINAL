/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { getServerSession } from "@/lib/get-session";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession();

    if (!session || session.user?.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only superadmins can backup the database." },
        { status: 403 }
      );
    }

    // Parse DATABASE_URL to get connection details
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    // Parse the Neon connection string
    const urlMatch = databaseUrl.match(
      /postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/
    );
    if (!urlMatch) {
      return NextResponse.json(
        { error: "Invalid DATABASE_URL format" },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;

    // Record backup start in database
    const backupRecord = await db.backupHistory.create({
      data: {
        action: "DB_BACKUP",
        filename,
        status: "IN_PROGRESS",
        triggeredBy: session.user.id,
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

      // Generate SQL dump
      let sqlDump = "-- PostgreSQL Database Backup\n";
      sqlDump += `-- Generated at: ${new Date().toISOString()}\n\n`;

      // Get all tables
      const tablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);

      const tables = tablesResult.rows.map((row) => row.table_name);

      // For each table, get schema and data
      for (const tableName of tables) {
        sqlDump += `\n-- Table: ${tableName}\n`;

        // Get table schema
        const schemaResult = await client.query(`
          SELECT column_name, data_type, character_maximum_length,
                 column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);

        // Get table data
        const dataResult = await client.query(`SELECT * FROM "${tableName}"`);

        if (dataResult.rows.length > 0) {
          const columns = Object.keys(dataResult.rows[0]);

          for (const row of dataResult.rows) {
            const values = columns.map((col) => {
              const val = row[col];
              if (val === null) return "NULL";
              if (typeof val === "string") {
                return `'${val.replace(/'/g, "''")}'`;
              }
              if (val instanceof Date) {
                return `'${val.toISOString()}'`;
              }
              if (typeof val === "object") {
                return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              }
              return val;
            });

            sqlDump += `INSERT INTO "${tableName}" (${columns
              .map((c) => `"${c}"`)
              .join(", ")}) VALUES (${values.join(", ")});\n`;
          }
        }
      }

      await client.end();

      // Update backup record as success
      await db.backupHistory.update({
        where: { id: backupRecord.id },
        data: { status: "SUCCESS" },
      });

      // Return SQL dump as downloadable file
      return new NextResponse(sqlDump, {
        headers: {
          "Content-Type": "application/sql",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
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
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "Failed to create backup", details: error.message },
      { status: 500 }
    );
  }
}
