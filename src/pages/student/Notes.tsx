import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Search, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/types';

interface ApiNote {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  createdAt: string;
  courseId: string;
  moduleId: string;
  faculty: { name: string };
  course: { name: string };
  module: { title: string };
}

export default function Notes() {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('campusconnect_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [notesRes, coursesRes] = await Promise.all([
          fetch('/api/notes', { headers }),
          fetch('/api/courses', { headers })
        ]);

        if (notesRes.ok && coursesRes.ok) {
          const notesData = await notesRes.json();
          const coursesData = await coursesRes.json();
          setNotes(notesData);
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || note.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="student">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader
        title="Study Notes"
        description="Access all course materials and notes uploaded by faculty"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note, index) => (
          <Card
            key={note.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {note.course?.name || 'Unknown Course'}
                </span>
              </div>
              <h3 className="mb-2 font-semibold text-lg">{note.title}</h3>
              {note.description && (
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {note.description}
                </p>
              )}
              <div className="mb-4 space-y-2 text-xs text-muted-foreground border-t pt-3">
                <p className="font-medium text-foreground">Module: {note.module?.title || 'General'}</p>
                <div className="flex justify-between items-center">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p>By: {note.faculty?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={note.fileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button variant="default" size="sm" className="w-full" asChild>
                  <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No notes found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
