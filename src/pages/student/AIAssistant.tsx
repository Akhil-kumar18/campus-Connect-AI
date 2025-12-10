import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Sparkles, 
  Calendar, 
  Target, 
  BookOpen, 
  Clock, 
  CheckCircle,
  FileText,
  Upload,
  Loader2,
  Brain,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIAssistant() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [summary, setSummary] = useState('');

  const handleGenerateTimetable = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: 'Timetable Generated!',
        description: 'Your personalized study timetable has been created.',
      });
    }, 2000);
  };

  const handleSummarize = () => {
    if (!noteContent.trim()) {
      toast({
        title: 'Please enter some content',
        description: 'Paste your notes to generate a summary.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setSummary(`📚 **Key Concepts:**\n\n• The main topic discusses important fundamentals\n• Several key points are highlighted for exam preparation\n• Understanding these concepts is crucial for the module\n\n✅ **Action Items:**\n• Review chapter 3 for more details\n• Practice related problems\n• Discuss unclear points in the forum`);
    }, 2500);
  };

  const dailyTasks = [
    { subject: 'Data Structures', task: 'Complete Binary Tree exercises', time: '2 hours', completed: true },
    { subject: 'DBMS', task: 'Read Chapter 5 - Normalization', time: '1.5 hours', completed: true },
    { subject: 'Web Development', task: 'Practice React hooks', time: '2 hours', completed: false },
    { subject: 'OS', task: 'Review process scheduling', time: '1 hour', completed: false },
  ];

  const pendingDeadlines = [
    { title: 'Array Operations Assignment', course: 'DSA', daysLeft: 3 },
    { title: 'SQL Query Practice', course: 'DBMS', daysLeft: 5 },
    { title: 'React Project', course: 'Web Dev', daysLeft: 10 },
  ];

  const upcomingExams = [
    { subject: 'Data Structures & Algorithms', date: 'March 15, 2024', daysLeft: 12 },
    { subject: 'Database Management', date: 'March 20, 2024', daysLeft: 17 },
  ];

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader 
        title="AI Study Assistant"
        description="Your personalized AI-powered learning companion"
        action={
          <Button variant="hero" onClick={handleGenerateTimetable} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Today's Plan
              </>
            )}
          </Button>
        }
      />

      {/* Progress Overview */}
      <Card variant="gradient" className="mb-8 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <CardContent className="relative p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Daily Progress</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold">68%</span>
                  <span className="text-sm text-success flex items-center gap-1 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </span>
                </div>
                <Progress value={68} className="mt-2 h-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="mt-2 text-3xl font-bold">2 / 4</p>
                <p className="mt-1 text-xs text-muted-foreground">Keep going! 2 more to complete</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="mt-2 text-3xl font-bold">7 days</p>
                <p className="mt-1 text-xs text-muted-foreground">Your best: 15 days</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Focus Score</p>
                <p className="mt-2 text-3xl font-bold">85</p>
                <p className="mt-1 text-xs text-muted-foreground">Excellent concentration!</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <Tabs defaultValue="timetable" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="timetable" className="gap-2">
            <Calendar className="h-4 w-4" />
            Study Timetable
          </TabsTrigger>
          <TabsTrigger value="summarizer" className="gap-2">
            <FileText className="h-4 w-4" />
            Notes Summarizer
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Tasks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Today's Study Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyTasks.map((task, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                        task.completed ? 'bg-success/5 border-success/20' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`rounded-full p-2 ${
                        task.completed ? 'bg-success/20' : 'bg-primary/10'
                      }`}>
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.task}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {task.time}
                      </div>
                      {!task.completed && (
                        <Button size="sm" variant="subtle">Start</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Deadlines */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingDeadlines.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.course}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          item.daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-muted'
                        }`}>
                          {item.daysLeft}d
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Exams */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Upcoming Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingExams.map((exam, index) => (
                      <div key={index} className="rounded-lg bg-card p-3">
                        <p className="text-sm font-medium">{exam.subject}</p>
                        <p className="text-xs text-muted-foreground">{exam.date}</p>
                        <p className="text-xs text-primary mt-1">{exam.daysLeft} days to prepare</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summarizer" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Input Your Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your notes here... The AI will generate a concise summary with key points for revision."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button 
                  className="mt-4 w-full" 
                  variant="hero"
                  onClick={handleSummarize}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="rounded-lg bg-muted p-4 min-h-[300px]">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{summary}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground">
                    <Brain className="h-12 w-12 mb-4 opacity-50" />
                    <p>Your AI-generated summary will appear here</p>
                    <p className="text-sm mt-1">Paste your notes and click generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-6">
                <Brain className="h-8 w-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Learning Pattern</h3>
                <p className="text-sm opacity-80">
                  You're most productive between 9 AM - 12 PM. Consider scheduling difficult topics during this time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-lg font-semibold mb-2">Focus Areas</h3>
                <p className="text-sm text-muted-foreground">
                  Based on your performance, spend more time on Tree Traversals and SQL Joins.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <TrendingUp className="h-8 w-8 text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">Progress Trend</h3>
                <p className="text-sm text-muted-foreground">
                  Your consistency has improved by 23% this month. Keep up the great work!
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
