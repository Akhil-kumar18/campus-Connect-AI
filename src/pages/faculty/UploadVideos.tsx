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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Video, CheckCircle, Link as LinkIcon, Sparkles, Loader2, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function UploadVideos() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('link');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '' });
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    moduleId: '',
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem('campusconnect_token');
      const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCourses(await res.json());
    };
    fetchCourses();
  }, []);

  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  const fetchModules = async () => {
    if (!selectedCourse) return;
    const token = localStorage.getItem('campusconnect_token');
    const res = await fetch(`/api/modules?courseId=${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setModules(await res.json());
  };

  const fetchVideos = async () => {
    const token = localStorage.getItem('campusconnect_token');
    const url = selectedCourse ? `/api/videos?courseId=${selectedCourse}` : '/api/videos';
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setVideos(await res.json());
  };

  useEffect(() => {
    if (!selectedCourse) {
      setModules([]);
      return;
    }
    fetchModules();
    fetchVideos();
  }, [selectedCourse]);

  const courseModules = modules;

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
          description: 'Created from Upload Videos',
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

  const [file, setFile] = useState<File | null>(null);

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Video deleted successfully' });
        fetchVideos(); // Refresh list
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete video', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !formData.moduleId) {
      toast({ title: 'Error', description: 'Please select course and module', variant: 'destructive' });
      return;
    }

    if (uploadType === 'file' && !file) {
      toast({ title: 'Error', description: 'Please select a video file', variant: 'destructive' });
      return;
    }
    if (uploadType === 'link' && !formData.videoUrl) {
      toast({ title: 'Error', description: 'Please enter a video URL', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    try {
      const token = localStorage.getItem('campusconnect_token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('courseId', selectedCourse);
      data.append('moduleId', formData.moduleId);

      if (uploadType === 'file' && file) {
        data.append('file', file);
      } else {
        data.append('videoUrl', formData.videoUrl);
      }

      // Simulate "AI Generation" delay for UX, then upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) throw new Error('Failed to upload video');

      toast({
        title: 'Video Uploaded Successfully!',
        description: 'AI summaries have been generated automatically.',
      });

      setFormData({ title: '', videoUrl: '', moduleId: '' });
      setFile(null);
      // setSelectedCourse('');
      fetchVideos();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload video', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
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
                        {courseModules.map((module) => (
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
                            Add a new module to this course to organize videos.
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
                  <div className="rounded-lg border-2 border-dashed p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                    <Input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">
                      {file ? file.name : "Drop your video here or click to browse"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      MP4, MOV, AVI up to 500MB
                    </p>
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

              <Button type="submit" variant="default" className="w-full" disabled={isGenerating}>
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

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Existing Videos</h3>
              {videos.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No videos found for this course.</p>
              ) : (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{video.title}</p>
                          <p className="text-sm text-muted-foreground text-ellipsis overflow-hidden max-w-xs">{video.videoUrl}</p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video.id)}>
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
