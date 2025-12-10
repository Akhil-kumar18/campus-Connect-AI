import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { assignments, courses, modules } from '@/data/mockData';
import { ClipboardList, Plus, Calendar, Users, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function FacultyAssignments() {
  const { toast } = useToast();
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    deadline: '',
  });

  const courseModules = modules.filter(m => m.courseId === selectedCourse);

  const handleCreate = () => {
    toast({
      title: 'Assignment Created!',
      description: 'Students have been notified about the new assignment.',
    });
    setCreateDialog(false);
    setFormData({ title: '', description: '', moduleId: '', deadline: '' });
    setSelectedCourse('');
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader 
        title="Assignments"
        description="Create and manage course assignments"
        action={
          <Button variant="hero" onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment, index) => (
          <Card 
            key={assignment.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {courses.find(c => c.id === assignment.courseId)?.name}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {assignment.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due: {format(assignment.deadline, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  45 / 60 submitted
                </span>
              </div>
              <Button variant="subtle" size="sm" asChild className="w-full">
                <Link to="/faculty/submissions">
                  <Eye className="mr-2 h-4 w-4" />
                  View Submissions
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Assignment title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                placeholder="Detailed instructions for the assignment..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select 
                  value={formData.moduleId} 
                  onValueChange={(v) => setFormData({ ...formData, moduleId: v })}
                  disabled={!selectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
