import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analytics } from '@/data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['hsl(239, 84%, 67%)', 'hsl(16, 90%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

const weeklyData = [
  { day: 'Mon', students: 120, faculty: 25, submissions: 45 },
  { day: 'Tue', students: 150, faculty: 30, submissions: 52 },
  { day: 'Wed', students: 180, faculty: 35, submissions: 68 },
  { day: 'Thu', students: 165, faculty: 28, submissions: 55 },
  { day: 'Fri', students: 140, faculty: 22, submissions: 48 },
  { day: 'Sat', students: 90, faculty: 15, submissions: 30 },
  { day: 'Sun', students: 75, faculty: 12, submissions: 25 },
];

const monthlyGrowth = [
  { month: 'Jan', users: 800 },
  { month: 'Feb', users: 920 },
  { month: 'Mar', users: 1050 },
  { month: 'Apr', users: 1180 },
  { month: 'May', users: 1250 },
];

const contentDistribution = [
  { name: 'Notes', value: analytics.totalNotes },
  { name: 'Videos', value: analytics.totalVideos },
  { name: 'Assignments', value: analytics.totalAssignments },
];

export default function Analytics() {
  return (
    <DashboardLayout requiredRole="admin">
      <PageHeader 
        title="Platform Analytics"
        description="Detailed insights into platform usage and engagement"
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyGrowth}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(239, 84%, 67%)" 
                        fillOpacity={1} 
                        fill="url(#colorUsers)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="students" fill="hsl(239, 84%, 67%)" radius={[4, 4, 0, 0]} name="Active Students" />
                    <Bar dataKey="submissions" fill="hsl(16, 90%, 60%)" radius={[4, 4, 0, 0]} name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <p className="text-sm opacity-80">Avg. Session Duration</p>
                <p className="text-3xl font-bold mt-2">24 min</p>
                <p className="text-sm opacity-80 mt-1">+15% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Daily Active Users</p>
                <p className="text-3xl font-bold mt-2">{analytics.activeUsers}</p>
                <p className="text-sm text-success mt-1">+8% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Community Engagement</p>
                <p className="text-3xl font-bold mt-2">78%</p>
                <p className="text-sm text-success mt-1">Very Active</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="students" 
                      stroke="hsl(239, 84%, 67%)" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(239, 84%, 67%)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submissions" 
                      stroke="hsl(16, 90%, 60%)" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(16, 90%, 60%)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.courseUsage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="course" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="usage" fill="hsl(239, 84%, 67%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Binary Trees Tutorial', 'SQL Joins Explained', 'React Hooks Guide', 'OS Process Management'].map((title, index) => (
                    <div key={title} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{title}</p>
                        <div className="mt-1 h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full gradient-primary rounded-full"
                            style={{ width: `${90 - index * 15}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{(90 - index * 15) * 10} views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
