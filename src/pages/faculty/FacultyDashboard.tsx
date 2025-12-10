import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { notes, videoClasses, assignments } from '@/data/mockData';
import { FileText, Video, ClipboardList, Users, Upload, Eye, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function FacultyDashboard() {
  const { user } = useAuth();

  const recentUploads = [
    ...notes.map(n => ({ ...n, type: 'note' as const })),
    ...videoClasses.map(v => ({ ...v, type: 'video' as const })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader 
        title={`Welcome, ${user?.name?.split(' ').slice(1).join(' ') || 'Professor'}!`}
        description="Manage your courses, upload content, and track student progress."
      />

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild variant="hero">
          <Link to="/faculty/upload-notes">
            <Upload className="mr-2 h-4 w-4" />
            Upload Notes
          </Link>
        </Button>
        <Button asChild variant="default">
          <Link to="/faculty/upload-videos">
            <Video className="mr-2 h-4 w-4" />
            Upload Video
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/faculty/assignments">
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Notes Uploaded"
          value={notes.length}
          icon={<FileText className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Video Classes"
          value={videoClasses.length}
          icon={<Video className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Active Assignments"
          value={assignments.length}
          icon={<ClipboardList className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Students Enrolled"
          value={156}
          icon={<Users className="h-6 w-6" />}
          variant="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className={`rounded-lg p-2 ${
                    item.type === 'note' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {item.type === 'note' ? (
                      <FileText className="h-5 w-5 text-primary" />
                    ) : (
                      <Video className="h-5 w-5 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(item.createdAt, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.slice(0, 4).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      12 submissions pending review
                    </p>
                  </div>
                  <Button size="sm" variant="subtle" asChild>
                    <Link to="/faculty/submissions">Review</Link>
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/faculty/submissions">View All Submissions</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">This Week's Activity</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg bg-success/10 p-3">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-sm text-muted-foreground">Student Engagement</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1.2k</p>
                <p className="text-sm text-muted-foreground">Video Views</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">342</p>
                <p className="text-sm text-muted-foreground">Notes Downloads</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
