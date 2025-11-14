/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all comprehensive statistics in parallel
    const [
      // Basic counts
      totalUsers,
      totalCandidates,
      totalElections,
      totalVotes,
      totalParties,
      totalPositions,

      // User breakdowns
      usersByRole,
      usersByType,
      activeUsers,
      pendingUsers,

      // Election breakdowns
      electionsByStatus,
      officialElections,

      // Candidate breakdowns
      candidatesByStatus,
      activeCandidates,

      // Vote participation data
      recentVotes,

      // Party applications
      partyApplicationsByStatus,

      // System logs
      recentSystemLogs,
      systemLogsByAction,

      // Backup history
      recentBackups,
      backupsByStatus,

      // Recent elections with vote counts
      electionsWithStats,

      // User growth over time (last 12 months)
      userGrowth,
    ] = await Promise.all([
      // Basic counts
      db.user.count(),
      db.candidate.count(),
      db.election.count(),
      db.vote.count(),
      db.party.count(),
      db.position.count(),

      // User breakdowns
      db.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      db.user.groupBy({
        by: ["userType"],
        _count: { userType: true },
      }),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { status: "Pending" } }),

      // Election breakdowns
      db.election.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      db.election.count({ where: { isOfficial: true } }),

      // Candidate breakdowns
      db.candidate.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      db.candidate.count({ where: { isActive: true } }),

      // Recent votes (last 30 days)
      db.vote.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
          electionId: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      // Party applications
      db.partyApplication.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Recent system logs (last 50)
      db.systemLog.findMany({
        take: 50,
        orderBy: { timestamp: "desc" },
        select: {
          id: true,
          action: true,
          timestamp: true,
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      }),

      // System logs by action type
      db.systemLog.groupBy({
        by: ["action"],
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),

      // Recent backups (last 20)
      db.backupHistory.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          filename: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Backup status distribution
      db.backupHistory.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // Elections with vote counts and participation
      db.election.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          electionStartDate: true,
          electionEndDate: true,
          voterRestriction: true,
          isOfficial: true,
          _count: {
            select: {
              votes: true,
              candidates: true,
              positions: true,
            },
          },
        },
      }),

      // User growth (last 12 months)
      db.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ]);

    // Process vote trends by day (last 30 days)
    const voteTrends = recentVotes.reduce(
      (acc: Record<string, number>, vote) => {
        const date = vote.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {}
    );

    const voteTrendsArray = Object.entries(voteTrends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate voter participation rate
    const eligibleVoters =
      usersByRole.find((u) => u.role === "USER")?._count.role || 0;
    const voterParticipationRate =
      eligibleVoters > 0
        ? ((recentVotes.length / eligibleVoters) * 100).toFixed(2)
        : "0.00";

    // Top elections by vote count
    const electionVoteMap = recentVotes.reduce(
      (acc: Record<string, number>, vote) => {
        acc[vote.electionId] = (acc[vote.electionId] || 0) + 1;
        return acc;
      },
      {}
    );

    // Format user growth data
    const formattedUserGrowth = (userGrowth as any[]).map((item: any) => ({
      month: item.month,
      count: Number(item.count),
    }));

    // Calculate average votes per election
    const avgVotesPerElection =
      totalElections > 0 ? (totalVotes / totalElections).toFixed(2) : "0.00";

    // Calculate candidate approval rate
    const approvedCandidates =
      candidatesByStatus.find((c) => c.status === "APPROVED")?._count.status ||
      0;
    const candidateApprovalRate =
      totalCandidates > 0
        ? ((approvedCandidates / totalCandidates) * 100).toFixed(2)
        : "0.00";

    return NextResponse.json({
      // Overview statistics
      overview: {
        totalUsers,
        totalCandidates,
        totalElections,
        totalVotes,
        totalParties,
        totalPositions,
        activeUsers,
        pendingUsers,
        activeCandidates,
        officialElections,
      },

      // User analytics
      users: {
        byRole: usersByRole.map((u) => ({
          role: u.role,
          count: u._count.role,
        })),
        byType: usersByType.map((u) => ({
          type: u.userType,
          count: u._count.userType,
        })),
        activeVsInactive: [
          { status: "Active", count: activeUsers },
          { status: "Inactive", count: totalUsers - activeUsers },
        ],
        growth: formattedUserGrowth,
      },

      // Election analytics
      elections: {
        byStatus: electionsByStatus.map((e) => ({
          status: e.status,
          count: e._count.status,
        })),
        recentElections: electionsWithStats.map((e) => ({
          id: e.id,
          title: e.title,
          status: e.status,
          startDate: e.electionStartDate,
          endDate: e.electionEndDate,
          isOfficial: e.isOfficial,
          voterRestriction: e.voterRestriction,
          voteCount: e._count.votes,
          candidateCount: e._count.candidates,
          positionCount: e._count.positions,
        })),
        avgVotesPerElection,
      },

      // Candidate analytics
      candidates: {
        byStatus: candidatesByStatus.map((c) => ({
          status: c.status,
          count: c._count.status,
        })),
        approvalRate: candidateApprovalRate,
      },

      // Vote analytics
      votes: {
        total: totalVotes,
        last30Days: recentVotes.length,
        trends: voteTrendsArray,
        participationRate: voterParticipationRate,
      },

      // Party analytics
      parties: {
        total: totalParties,
        applicationsByStatus: partyApplicationsByStatus.map((p) => ({
          status: p.status,
          count: p._count.status,
        })),
      },

      // System activity
      system: {
        recentLogs: recentSystemLogs.map((log) => ({
          id: log.id,
          action: log.action,
          timestamp: log.timestamp,
          userName: log.user?.name || "System",
          userRole: log.user?.role || null,
        })),
        logsByAction: systemLogsByAction.map((log) => ({
          action: log.action,
          count: log._count.action,
        })),
      },

      // Backup analytics
      backups: {
        recent: recentBackups.map((backup) => ({
          id: backup.id,
          action: backup.action,
          filename: backup.filename,
          status: backup.status,
          createdAt: backup.createdAt,
          triggeredBy: backup.user?.name || "System",
        })),
        byStatus: backupsByStatus.map((b) => ({
          status: b.status,
          count: b._count.status,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
