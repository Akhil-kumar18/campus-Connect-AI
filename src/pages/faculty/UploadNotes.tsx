import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courses, modules } from '@/data/mockData';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UploadNotes() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
  });

  const courseModules = modules.filter(m => m.courseId === selectedCourse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: 'Notes Uploaded Successfully!',
      description: 'Students can now access the new study material.',
    });

    setFormData({ title: '', description: '', moduleId: '' });
    setSelectedCourse('');
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
                <Label>Upload File</Label>
                <div className="rounded-lg border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="font-medium">Drop your file here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, DOC, DOCX, PPT up to 50MB
                  </p>
                  <Input type="file" className="mt-4 max-w-xs mx-auto" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Upload Notes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
