import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analytics } from '@/data/mockData';
import { Users, GraduationCap, BookOpen, FileText, Video, ClipboardList, MessageSquare, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(239, 84%, 67%)', 'hsl(16, 90%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

export default function AdminDashboard() {
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
          value={analytics.totalStudents.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Faculty"
          value={analytics.totalFaculty}
          icon={<GraduationCap className="h-6 w-6" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Active Courses"
          value={analytics.totalCourses}
          icon={<BookOpen className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Active Users"
          value={analytics.activeUsers}
          icon={<TrendingUp className="h-6 w-6" />}
          variant="accent"
        />
      </div>

      {/* Content Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.totalNotes}</p>
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
              <p className="text-2xl font-bold">{analytics.totalVideos}</p>
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
              <p className="text-2xl font-bold">{analytics.totalAssignments}</p>
              <p className="text-sm text-muted-foreground">Assignments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-warning/10 p-3">
              <MessageSquare className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analytics.communityPosts}</p>
              <p className="text-sm text-muted-foreground">Community Posts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.courseUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="course" 
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Submission Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Submitted', value: analytics.submissionRate },
                      { name: 'Pending', value: 100 - analytics.submissionRate },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
                <p className="text-3xl font-bold">{analytics.submissionRate}%</p>
                <p className="text-sm text-muted-foreground">Submitted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Most Active Students */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostActiveStudents.map((student, index) => (
                <div key={student.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full"
                        style={{ width: `${(student.activity / analytics.mostActiveStudents[0].activity) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{student.activity} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Active Faculty */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostActiveFaculty.map((faculty, index) => (
                <div key={faculty.name} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-accent text-sm font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{faculty.name}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full gradient-accent rounded-full"
                        style={{ width: `${(faculty.uploads / analytics.mostActiveFaculty[0].uploads) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{faculty.uploads} uploads</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
