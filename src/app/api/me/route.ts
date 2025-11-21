import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json(user);
}
