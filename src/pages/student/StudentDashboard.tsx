import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { assignments, videoClasses, notes } from '@/data/mockData';
import { FileText, Video, ClipboardList, Brain, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();

  const pendingAssignments = assignments.filter(a => differenceInDays(a.deadline, new Date()) > 0);
  const urgentAssignments = pendingAssignments.filter(a => differenceInDays(a.deadline, new Date()) <= 3);

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader 
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        description="Here's what's happening with your studies today."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Available Notes"
          value={notes.length}
          icon={<FileText className="h-6 w-6" />}
        />
        <StatCard
          title="Video Classes"
          value={videoClasses.length}
          icon={<Video className="h-6 w-6" />}
        />
        <StatCard
          title="Pending Assignments"
          value={pendingAssignments.length}
          icon={<ClipboardList className="h-6 w-6" />}
          variant="accent"
        />
        <StatCard
          title="AI Sessions"
          value={12}
          icon={<Brain className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Study Assistant Card */}
        <Card variant="gradient" className="lg:col-span-2 overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="rounded-xl gradient-primary p-3">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>AI Study Assistant</CardTitle>
                  <p className="text-sm text-muted-foreground">Your personalized learning companion</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Daily Progress</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Today's Focus</p>
                  <p className="font-semibold">Binary Trees & Graphs</p>
                  <p className="text-xs text-muted-foreground mt-1">2 videos, 1 assignment</p>
                </div>
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <p className="text-sm text-muted-foreground">Upcoming Exam</p>
                  <p className="font-semibold">Data Structures</p>
                  <p className="text-xs text-muted-foreground mt-1">In 5 days</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="hero" asChild>
                  <Link to="/student/ai-assistant">Open AI Assistant</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/student/interview">Practice Interview</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Urgent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-accent" />
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No urgent deadlines!
                </p>
              ) : (
                urgentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <Clock className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(assignment.deadline, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="subtle" className="w-full mt-4" asChild>
              <Link to="/student/assignments">View All Assignments</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Recent Video Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {videoClasses.slice(0, 3).map((video) => (
                <div key={video.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">{video.facultyName}</p>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="subtle" className="w-full mt-4" asChild>
              <Link to="/student/videos">View All Videos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.slice(0, 3).map((note) => (
                <div key={note.id} className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground">{note.facultyName}</p>
                  </div>
                  <Button size="sm" variant="ghost">Download</Button>
                </div>
              ))}
            </div>
            <Button variant="subtle" className="w-full mt-4" asChild>
              <Link to="/student/notes">View All Notes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
