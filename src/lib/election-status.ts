import db from "@/lib/db";
import { ElectionStatus } from "@prisma/client";

/**
 * Synchronize election.status with electionStartDate / electionEndDate.
 *
 * Rules (ignoring CANCELLED which is manually controlled):
 * - BEFORE start  -> UPCOMING
 * - BETWEEN start/end (inclusive) -> ONGOING
 * - AFTER end     -> COMPLETED
 */
export async function syncElectionStatusesToNow() {
  const now = new Date();

  // We keep CANCELLED elections untouched so manual overrides are respected.
  await db.$transaction([
    // Upcoming: starts in the future
    db.election.updateMany({
      where: {
        status: { not: ElectionStatus.CANCELLED },
        electionStartDate: { gt: now },
      },
      data: {
        status: ElectionStatus.UPCOMING,
      },
    }),

    // Ongoing: within the election window (inclusive)
    db.election.updateMany({
      where: {
        status: { not: ElectionStatus.CANCELLED },
        electionStartDate: { lte: now },
        electionEndDate: { gte: now },
      },
      data: {
        status: ElectionStatus.ONGOING,
      },
    }),

    // Completed: already ended
    db.election.updateMany({
      where: {
        status: { not: ElectionStatus.CANCELLED },
        electionEndDate: { lt: now },
      },
      data: {
        status: ElectionStatus.COMPLETED,
      },
    }),
  ]);
}
