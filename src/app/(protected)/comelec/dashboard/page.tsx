/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { IconUsers, IconTrophy, IconCalendar, IconChartBar, IconShieldCheck, IconUsersGroup, IconDatabase, IconNote } from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';

interface DashboardData {
  overview: {
	totalUsers: number;
	totalCandidates: number;
	totalElections: number;
	totalVotes: number;
	totalParties: number;
	totalPositions: number;
	activeUsers: number;
	pendingUsers: number;
	activeCandidates: number;
	officialElections: number;
  };
  users: {
	byRole: Array<{ role: string; count: number }>;
	byType: Array<{ type: string; count: number }>;
	activeVsInactive: Array<{ status: string; count: number }>;
	growth: Array<{ month: string; count: number }>;
  };
  elections: {
	byStatus: Array<{ status: string; count: number }>;
	recentElections: Array<any>;
	avgVotesPerElection: string;
  };
  candidates: {
	byStatus: Array<{ status: string; count: number }>;
	approvalRate: string;
  };
  votes: {
	total: number;
	last30Days: number;
	trends: Array<{ date: string; count: number }>;
	participationRate: string;
  };
  parties: {
	total: number;
	applicationsByStatus: Array<{ status: string; count: number }>;
  };
  system: {
	recentLogs: Array<any>;
	logsByAction: Array<{ action: string; count: number }>;
  };
  backups: {
	recent: Array<any>;
	byStatus: Array<{ status: string; count: number }>;
  };
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#14b8a6', '#f97316'];

const Page = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
	const fetchDashboardData = async () => {
	  try {
		const response = await fetch('/api/admin/dashboard');
		if (!response.ok) throw new Error('Failed to fetch dashboard data');
		const result = await response.json();
		setData(result);
	  } catch (err) {
		setError(err instanceof Error ? err.message : 'An error occurred');
	  } finally {
		setLoading(false);
	  }
	};

	fetchDashboardData();
  }, []);

  if (loading) {
	return (
	  <div className="flex items-center justify-center min-h-[80vh]">
		<div className="text-center">
		  <Loader2 className='size-12 text-muted-foreground mx-auto mb-5 animate-spin' />
		  <p className="text-muted-foreground">Loading dashboard...</p>
		</div>
	  </div>
	);
  }

  if (error || !data) {
	return (
	  <div className="flex items-center justify-center min-h-screen">
		<div className="text-center">
		  <p className="text-red-500 mb-2">Error loading dashboard</p>
		  <p className="text-muted-foreground text-sm">{error}</p>
		</div>
	  </div>
	);
  }

  return (
	<div className="space-y-6">
	  <div className="flex items-center justify-between">
		<div>
		  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
		  <p className="text-muted-foreground">Comprehensive overview of your election management system</p>
		</div>
	  </div>

	  {/* Overview Statistics Cards */}
	  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Total Users</CardTitle>
			<IconUsers className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
			<p className="text-xs text-muted-foreground">
			  {data.overview.activeUsers} active • {data.overview.pendingUsers} pending
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Total Elections</CardTitle>
			<IconCalendar className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.overview.totalElections}</div>
			<p className="text-xs text-muted-foreground">
			  {data.overview.officialElections} official elections
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Total Votes</CardTitle>
			<IconNote className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.overview.totalVotes.toLocaleString()}</div>
			<p className="text-xs text-muted-foreground">
			  {data.votes.last30Days} in last 30 days
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
			<IconTrophy className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.overview.totalCandidates}</div>
			<p className="text-xs text-muted-foreground">
			  {data.candidates.approvalRate}% approval rate
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Political Parties</CardTitle>
			<IconUsersGroup className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.parties.total}</div>
			<p className="text-xs text-muted-foreground">
			  {data.parties.applicationsByStatus.reduce((sum, item) => sum + item.count, 0)} applications
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Positions</CardTitle>
			<IconShieldCheck className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.overview.totalPositions}</div>
			<p className="text-xs text-muted-foreground">
			  Across all elections
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
			<IconChartBar className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{data.votes.participationRate}%</div>
			<p className="text-xs text-muted-foreground">
			  Last 30 days
			</p>
		  </CardContent>
		</Card>

		<Card>
		  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle className="text-sm font-medium">Avg Votes/Election</CardTitle>
			<IconDatabase className="h-4 w-4 text-muted-foreground" />
		  </CardHeader>
		  <CardContent>
			<div className="text-2xl font-bold">{parseFloat(data.elections.avgVotesPerElection).toFixed(0)}</div>
			<p className="text-xs text-muted-foreground">
			  Average participation
			</p>
		  </CardContent>
		</Card>
	  </div>

	  {/* Charts Section */}
	  <div className="grid gap-4 md:grid-cols-2">
		{/* User Growth Chart */}
		<Card>
		  <CardHeader>
			<CardTitle>User Growth (Last 12 Months)</CardTitle>
			<CardDescription>Monthly user registration trends</CardDescription>
		  </CardHeader>
		  <CardContent>
			<ResponsiveContainer width="100%" height={300}>
			  <AreaChart data={data.users.growth}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="month" />
				<YAxis />
				<Tooltip />
				<Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
			  </AreaChart>
			</ResponsiveContainer>
		  </CardContent>
		</Card>

		{/* Vote Trends Chart */}
		<Card>
		  <CardHeader>
			<CardTitle>Vote Trends (Last 30 Days)</CardTitle>
			<CardDescription>Daily voting activity</CardDescription>
		  </CardHeader>
		  <CardContent>
			<ResponsiveContainer width="100%" height={300}>
			  <LineChart data={data.votes.trends}>
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey="date" />
				<YAxis />
				<Tooltip />
				<Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
			  </LineChart>
			</ResponsiveContainer>
		  </CardContent>
		</Card>
	  </div>

	  {/* Recent Elections Table */}
	  <Card>
		<CardHeader>
		  <CardTitle>Recent Elections</CardTitle>
		  <CardDescription>Latest 10 elections with participation statistics</CardDescription>
		</CardHeader>
		<CardContent>
		  <div className="overflow-x-auto">
			<table className="w-full">
			  <thead>
				<tr className="border-b">
				  <th className="text-left py-2 px-4">Title</th>
				  <th className="text-left py-2 px-4">Status</th>
				  <th className="text-center py-2 px-4">Votes</th>
				  <th className="text-center py-2 px-4">Candidates</th>
				  <th className="text-center py-2 px-4">Positions</th>
				  <th className="text-center py-2 px-4">Official</th>
				</tr>
			  </thead>
			  <tbody>
				{data.elections.recentElections.map((election) => (
				  <tr key={election.id} className="border-b hover:bg-muted/50">
					<td className="py-2 px-4 font-medium">{election.title}</td>
					<td className="py-2 px-4">
					  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
						election.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
						election.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
						election.status === 'UPCOMING' ? 'bg-yellow-100 text-yellow-800' :
						'bg-gray-100 text-gray-800'
					  }`}>
						{election.status}
					  </span>
					</td>
					<td className="text-center py-2 px-4">{election.voteCount}</td>
					<td className="text-center py-2 px-4">{election.candidateCount}</td>
					<td className="text-center py-2 px-4">{election.positionCount}</td>
					<td className="text-center py-2 px-4">
					  {election.isOfficial ? '✓' : '—'}
					</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</CardContent>
	  </Card>

	</div>
  );
};

export default Page;
