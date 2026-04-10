import { useState, useEffect } from 'react';
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
import { ClipboardList, Plus, Calendar, Users, Eye, Edit2, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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
  code: string;
}

interface Module {
  id: string;
  title: string;
  courseId: string;
}

export default function FacultyAssignments() {
  const { toast } = useToast();
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    deadline: '',
  });

  // Edit State
  const [editDialog, setEditDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editDeadline, setEditDeadline] = useState('');

  const courseModules = modules.filter(m => m.courseId === selectedCourse);

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse);
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

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

  const fetchModules = async (courseId: string) => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/modules?courseId=${courseId}`, {
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

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          courseId: selectedCourse,
          moduleId: formData.moduleId,
          deadline: new Date(formData.deadline).toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: 'Assignment Created!',
          description: 'Students have been notified about the new assignment.',
        });
        setCreateDialog(false);
        setFormData({ title: '', description: '', moduleId: '', deadline: '' });
        setSelectedCourse('');
        fetchAssignments();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to create assignment',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment? All submissions will also be deleted.')) return;

    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({ title: 'Assignment Deleted', description: 'The assignment has been removed.' });
        fetchAssignments();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete assignment', variant: 'destructive' });
    }
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    // Format date for datetime-local input (YYYY-MM-DDThh:mm)
    const date = new Date(assignment.deadline);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    setEditDeadline(date.toISOString().slice(0, 16));
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!editingAssignment) return;
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/assignments/${editingAssignment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deadline: new Date(editDeadline).toISOString() })
      });

      if (response.ok) {
        toast({ title: 'Updated!', description: 'Deadline updated successfully.' });
        setEditDialog(false);
        fetchAssignments();
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update assignment', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader
        title="Assignments"
        description="Create and manage course assignments"
        action={
          <Button variant="default" onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        }
      />

      {loading ? (
        <div className="text-center py-8">Loading assignments...</div>
      ) : (
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
                    Due: {format(new Date(assignment.deadline), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {assignment.submissions?.length || 0} submitted
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/faculty/submissions">
                      <Eye className="mr-2 h-4 w-4" />
                      Submissions
                    </Link>
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(assignment)} title="Edit Deadline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(assignment.id)} title="Delete Assignment">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


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

      {/* Edit Assignment Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Deadline</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Deadline</Label>
              <Input
                type="datetime-local"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Deadline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout >
  );
}
