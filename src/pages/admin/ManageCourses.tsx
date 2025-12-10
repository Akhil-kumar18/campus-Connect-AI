import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { courses as initialCourses, modules as initialModules } from '@/data/mockData';
import { BookOpen, Plus, ChevronDown, ChevronRight, Layers, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Course, Module } from '@/types';

export default function ManageCourses() {
  const { toast } = useToast();
  const [courses, setCourses] = useState(initialCourses);
  const [modules, setModules] = useState(initialModules);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [courseDialog, setCourseDialog] = useState(false);
  const [moduleDialog, setModuleDialog] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '' });
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const handleCreateCourse = () => {
    const course: Course = {
      id: Date.now().toString(),
      ...newCourse,
    };
    setCourses([...courses, course]);
    setCourseDialog(false);
    setNewCourse({ name: '', code: '', description: '' });
    toast({ title: 'Course created successfully!' });
  };

  const handleCreateModule = () => {
    if (!moduleDialog) return;
    const module: Module = {
      id: Date.now().toString(),
      courseId: moduleDialog,
      ...newModule,
    };
    setModules([...modules, module]);
    setModuleDialog(null);
    setNewModule({ title: '', description: '' });
    toast({ title: 'Module added successfully!' });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    setModules(modules.filter(m => m.courseId !== id));
    toast({ title: 'Course deleted', variant: 'destructive' });
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
    toast({ title: 'Module deleted', variant: 'destructive' });
  };

  return (
    <DashboardLayout requiredRole="admin">
      <PageHeader 
        title="Courses & Modules"
        description="Manage course structure and modules"
        action={
          <Button variant="hero" onClick={() => setCourseDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        }
      />

      <div className="space-y-4">
        {courses.map((course, index) => {
          const courseModules = modules.filter(m => m.courseId === course.id);
          const isExpanded = expandedCourse === course.id;

          return (
            <Card 
              key={course.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Collapsible open={isExpanded} onOpenChange={() => setExpandedCourse(isExpanded ? null : course.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="rounded-lg bg-primary/10 p-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{course.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{course.code} • {courseModules.length} modules</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModuleDialog(course.id);
                          }}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Module
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {course.description && (
                      <p className="text-sm text-muted-foreground mb-4 ml-12">{course.description}</p>
                    )}
                    <div className="ml-12 space-y-2">
                      {courseModules.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4">No modules yet. Add your first module!</p>
                      ) : (
                        courseModules.map((module) => (
                          <div 
                            key={module.id} 
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{module.title}</p>
                                {module.description && (
                                  <p className="text-xs text-muted-foreground">{module.description}</p>
                                )}
                              </div>
                            </div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive h-8 w-8"
                              onClick={() => handleDeleteModule(module.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Create Course Dialog */}
      <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="e.g., Data Structures & Algorithms"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input
                placeholder="e.g., CS201"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the course..."
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse}>
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Module Dialog */}
      <Dialog open={!!moduleDialog} onOpenChange={() => setModuleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Module Title</Label>
              <Input
                placeholder="e.g., Arrays & Linked Lists"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the module..."
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
