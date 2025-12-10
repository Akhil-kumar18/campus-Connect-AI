import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { videoClasses, courses, modules } from '@/data/mockData';
import { Video, Play, Search, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { VideoClass } from '@/types';

export default function VideoClasses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoClass | null>(null);

  const filteredVideos = videoClasses.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || video.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  };

  const getModuleName = (moduleId: string) => {
    return modules.find(m => m.id === moduleId)?.title || 'Unknown Module';
  };

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader 
        title="Video Classes"
        description="Watch recorded lectures with AI-generated summaries"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
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

      {/* Videos Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video, index) => (
          <Card 
            key={video.id} 
            variant="interactive"
            className="overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-primary/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-primary/90 p-4 shadow-lg transition-transform hover:scale-110">
                  <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-2 py-1 text-xs text-background">
                {video.duration}
              </div>
              {video.summaryShort && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  AI Summary
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="mb-1 font-semibold line-clamp-1">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.facultyName}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{getModuleName(video.moduleId)}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(video.createdAt, 'MMM d')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          
          {/* Video Player Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="h-16 w-16 mx-auto text-primary mb-2" />
              <p className="text-muted-foreground">Video Player</p>
            </div>
          </div>

          {/* AI Summaries */}
          {selectedVideo?.summaryShort && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">AI-Generated Summaries</h4>
              </div>
              <Tabs defaultValue="short">
                <TabsList>
                  <TabsTrigger value="short">Quick</TabsTrigger>
                  <TabsTrigger value="medium">Standard</TabsTrigger>
                  <TabsTrigger value="long">Detailed</TabsTrigger>
                </TabsList>
                <TabsContent value="short" className="mt-4 rounded-lg bg-muted p-4">
                  <p className="text-sm">{selectedVideo.summaryShort}</p>
                </TabsContent>
                <TabsContent value="medium" className="mt-4 rounded-lg bg-muted p-4">
                  <p className="text-sm">{selectedVideo.summaryMedium}</p>
                </TabsContent>
                <TabsContent value="long" className="mt-4 rounded-lg bg-muted p-4">
                  <p className="text-sm">{selectedVideo.summaryLong}</p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Video className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No videos found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
