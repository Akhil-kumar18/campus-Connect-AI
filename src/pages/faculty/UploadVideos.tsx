import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses, modules } from '@/data/mockData';
import { Upload, Video, CheckCircle, Link as LinkIcon, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function UploadVideos() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('link');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    moduleId: '',
  });

  const courseModules = modules.filter(m => m.courseId === selectedCourse);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate AI summary generation
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Video Uploaded Successfully!',
        description: 'AI summaries have been generated automatically.',
      });

      setFormData({ title: '', videoUrl: '', moduleId: '' });
      setSelectedCourse('');
    }, 3000);
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader 
        title="Upload Video Class"
        description="Share video lectures with AI-powered summaries"
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Upload New Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Binary Trees - Complete Tutorial"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
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

              <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as 'file' | 'link')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link" className="gap-2">
                    <LinkIcon className="h-4 w-4" />
                    YouTube Link
                  </TabsTrigger>
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="link" className="space-y-2 mt-4">
                  <Label htmlFor="videoUrl">YouTube Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  />
                </TabsContent>

                <TabsContent value="file" className="mt-4">
                  <div className="rounded-lg border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">Drop your video here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      MP4, MOV, AVI up to 500MB
                    </p>
                    <Input type="file" className="mt-4 max-w-xs mx-auto" accept="video/*" />
                  </div>
                </TabsContent>
              </Tabs>

              {/* AI Summary Info */}
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">AI-Powered Summaries</p>
                    <p className="text-sm text-muted-foreground">
                      Our AI will automatically generate short, medium, and detailed summaries of your video content to help students study more effectively.
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating AI Summaries...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
