import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course, Module } from '@/types';

export default function UploadNotes() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [notes, setNotes] = useState<any[]>([]); // State for notes list
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    fileUrl: ''
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('campusconnect_token');
        const response = await fetch('/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const fetchModules = async () => {
    if (!selectedCourse) return;
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/modules?courseId=${selectedCourse}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      // If a course is selected, filter by it, otherwise fetch all (or maybe just fetch all for now for the list)
      // The backend supports filtering by courseId. 
      const url = selectedCourse ? `/api/notes?courseId=${selectedCourse}` : '/api/notes';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchModules();
      fetchNotes();
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.code) return;
    setIsCreatingCourse(true);
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });

      if (response.ok) {
        const createdCourse = await response.json();
        toast({ title: 'Success', description: 'Course created successfully' });
        setNewCourse({ name: '', code: '', description: '' });
        // Refresh courses and select the new one
        const coursesRes = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData);
          setSelectedCourse(createdCourse.id);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create course', variant: 'destructive' });
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle || !selectedCourse) return;
    setIsCreatingModule(true);
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newModuleTitle,
          description: 'Created from Upload Notes',
          courseId: selectedCourse
        })
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Module created successfully' });
        setNewModuleTitle('');
        fetchModules(); // Refresh list
      } else {
        throw new Error('Failed to create module');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create module', variant: 'destructive' });
    } finally {
      setIsCreatingModule(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Note deleted successfully' });
        fetchNotes(); // Refresh list
      } else {
        throw new Error('Failed to delete note');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse) {
      toast({ title: 'Error', description: 'Please select a course', variant: 'destructive' });
      return;
    }
    if (!formData.moduleId) {
      toast({ title: 'Error', description: 'Please select a module', variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: 'Error', description: 'Please select a file', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('campusconnect_token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('courseId', selectedCourse);
      data.append('moduleId', formData.moduleId);
      data.append('file', file);

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to upload note');
      }

      toast({
        title: 'Notes Uploaded Successfully!',
        description: 'Students can now access the new study material.',
      });

      setFormData({
        title: '',
        description: '',
        moduleId: '',
        fileUrl: ''
      });
      setFile(null);
      // Don't clear selectedCourse so the user can see the updated list for that course easily
      // setSelectedCourse(''); 
      fetchNotes(); // Refresh list
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'There was an error uploading your notes. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader
        title="Upload Notes"
        description="Share study materials with your students"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Upload New Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Binary Trees"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the notes content..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <div className="flex gap-2">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="flex-1">
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

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" title="Create new course">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Course</DialogTitle>
                          <DialogDescription>
                            Add a new course to the system.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="course-name">Course Name</Label>
                            <Input
                              id="course-name"
                              placeholder="e.g., Data Structures & Algorithms"
                              value={newCourse.name}
                              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course-code">Course Code</Label>
                            <Input
                              id="course-code"
                              placeholder="e.g., CS101"
                              value={newCourse.code}
                              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="course-description">Description (Optional)</Label>
                            <Textarea
                              id="course-description"
                              placeholder="Brief description of the course"
                              value={newCourse.description}
                              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateCourse} disabled={isCreatingCourse || !newCourse.name || !newCourse.code}>
                            {isCreatingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Course'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Module</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.moduleId}
                      onValueChange={(v) => setFormData({ ...formData, moduleId: v })}
                      disabled={!selectedCourse}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" disabled={!selectedCourse} title="Create new module">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Module</DialogTitle>
                          <DialogDescription>
                            Add a new module to this course to organize notes.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="module-title">Module Title</Label>
                            <Input
                              id="module-title"
                              placeholder="e.g., Unit 1: Introduction"
                              value={newModuleTitle}
                              onChange={(e) => setNewModuleTitle(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateModule} disabled={isCreatingModule || !newModuleTitle}>
                            {isCreatingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Module'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="rounded-lg border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium">
                    {file ? file.name : "Drop your file here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOC, DOCX, PPT up to 50MB
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Upload Notes
              </Button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Existing Notes</h3>
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No notes found for this course.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-sm text-muted-foreground">{note.module?.title || 'No Module'}</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteNote(note.id)}>
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
