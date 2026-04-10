import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ClipboardList, Upload, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  courseId: string;
  moduleId: string;
  facultyId: string;
  createdAt: string;
  updatedAt: string;
  faculty: { name: string };
  submissions: any[];
}

interface Course {
  id: string;
  name: string;
}

interface Module {
  id: string;
  title: string;
}

export default function StudentAssignments() {
  const [submitDialog, setSubmitDialog] = useState<Assignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
    fetchModules();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/modules', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  };

  const getModuleName = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.title || 'Unknown Module';
  };

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const daysLeft = differenceInDays(deadlineDate, new Date());
    const hoursLeft = differenceInHours(deadlineDate, new Date());

    if (hoursLeft < 0) return { label: 'Overdue', variant: 'destructive' as const };
    if (daysLeft <= 1) return { label: `${hoursLeft}h left`, variant: 'destructive' as const };
    if (daysLeft <= 3) return { label: `${daysLeft}d left`, variant: 'warning' as const };
    return { label: `${daysLeft}d left`, variant: 'secondary' as const };
  };

  const handleSubmit = async () => {
    if (!submitDialog || !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('campusconnect_token');
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`/api/assignments/${submitDialog.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: 'Assignment Submitted!',
          description: 'Your assignment has been submitted successfully.',
        });
        setSubmitDialog(null);
        setSelectedFile(null);
        fetchAssignments();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to submit assignment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit assignment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingAssignments = assignments.filter(a => !a.submissions || a.submissions.length === 0);
  const completedAssignments = assignments.filter(a => a.submissions && a.submissions.length > 0);

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader
        title="Assignments"
        description="View and submit your assignments"
      />

      {loading ? (
        <div className="text-center py-8">Loading assignments...</div>
      ) : (
        <>
          {/* Pending Assignments */}
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="h-5 w-5 text-accent" />
              Pending Assignments ({pendingAssignments.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pendingAssignments.map((assignment, index) => {
                const status = getDeadlineStatus(assignment.deadline);
                return (
                  <Card
                    key={assignment.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-accent/10 p-2">
                            <ClipboardList className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{assignment.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">{getCourseName(assignment.courseId)}</p>
                          </div>
                        </div>
                        <Badge variant={status.variant === 'warning' ? 'outline' : status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {assignment.description}
                      </p>
                      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {format(new Date(assignment.deadline), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => setSubmitDialog(assignment)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Assignment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Completed Assignments */}
          {completedAssignments.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <CheckCircle className="h-5 w-5 text-success" />
                Completed ({completedAssignments.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="bg-success/5 border-success/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-success/10 p-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted on {format(new Date(assignment.submissions[0].submittedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {assignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No assignments yet</h3>
              <p className="text-sm text-muted-foreground">
                Assignments will appear here when posted by faculty
              </p>
            </div>
          )}
        </>
      )}

      {/* Submit Dialog */}
      <Dialog open={!!submitDialog} onOpenChange={() => {
        setSubmitDialog(null);
        setSelectedFile(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium">{submitDialog?.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{submitDialog?.description}</p>
              {submitDialog && (
                <p className="text-xs text-muted-foreground mt-2">
                  Due: {format(new Date(submitDialog.deadline), 'MMMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Upload your submission</Label>
              <div className="rounded-lg border-2 border-dashed p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : 'Drag and drop your file here, or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX up to 10MB
                </p>
                <Input
                  type="file"
                  className="mt-4"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSubmitDialog(null);
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !selectedFile}>
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
