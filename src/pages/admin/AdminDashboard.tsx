import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, FileText, Video, ClipboardList, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalNotes: 0,
    totalVideos: 0,
    totalAssignments: 0,
    activeUsers: 0,
    submissionRate: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('campusconnect_token');
        const res = await fetch('/api/stats/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout requiredRole="admin">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and analytics"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Total Faculty"
          value={stats.totalFaculty}
          icon={<GraduationCap className="h-6 w-6" />}
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="accent"
        />
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalNotes}</p>
              <p className="text-sm text-muted-foreground">Notes Uploaded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-accent/10 p-3">
              <Video className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVideos}</p>
              <p className="text-sm text-muted-foreground">Video Classes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-success/10 p-3">
              <ClipboardList className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAssignments}</p>
              <p className="text-sm text-muted-foreground">Assignments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submission Rate - Kept as visual example, though data is static from controller currently */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Submission Rate</h3>
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Submitted', value: stats.submissionRate || 85 },
                      { name: 'Pending', value: 100 - (stats.submissionRate || 85) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--success))" />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-2xl font-bold">{stats.submissionRate}%</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
