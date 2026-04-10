import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { interviewTopics } from '@/data/mockData';
import {
  Brain,
  Play,
  CheckCircle,
  ArrowRight,
  Trophy,
  Target,
  Lightbulb,
  Loader2,
  RotateCcw,
  ClipboardList,
  BarChart3,
  Hash,
  Type,
  BookOpen
} from 'lucide-react';

type SessionState = 'select' | 'answering' | 'result';

interface Question {
  id: number;
  text: string;
  answer: string;
}

interface EvaluationDetail {
  question: string;
  answer: string;
  score: number;
  lengthScore: number;
  keywordScore: number;
  topicScore: number;
  matchedKeywords: string[];
  answerLength: number;
}

export default function InterviewPractice() {
  const [sessionState, setSessionState] = useState<SessionState>('select');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    improvements: string[];
    evaluation?: EvaluationDetail[];
  } | null>(null);

  const mockQuestions: Record<string, string[]> = {
    'Java': [
      'What is the difference between JDK, JRE, and JVM?',
      'Explain the concept of Object-Oriented Programming in Java.',
      'What is the difference between ArrayList and LinkedList?',
      'How does garbage collection work in Java?',
      'Explain the concept of multithreading in Java.',
      'What is the difference between an interface and an abstract class?',
      'Explain the `final` keyword in Java.',
      'What are checked and unchecked exceptions?',
      'Explain the Spring Framework and its advantages.',
      'What is the difference between HashMap and Hashtable?',
      'Explain method overloading vs method overriding.',
      'What is a Singleton class and how do you create one?',
      'What is the purpose of the `volatile` keyword?',
      'Explain the concept of Java Streams API.',
      'What is dependency injection?',
    ],
    'Python': [
      'What are decorators in Python?',
      'Explain the difference between lists and tuples.',
      'How does memory management work in Python?',
      'What are generators and how do they work?',
      'Explain the GIL (Global Interpreter Lock).',
      'What is the difference between `is` and `==`?',
      'Explain list comprehension with an example.',
      'What are Python namespaces?',
      'Explain the difference between deep and shallow copy.',
      'What is the purpose of `__init__` and `__str__`?',
      'How do you handle exceptions in Python?',
      'What are lambda functions?',
      'Explain the `with` statement and context managers.',
      'What is pickling and unpickling?',
      'Explain the difference between Django and Flask.',
    ],
    'DBMS': [
      'What is normalization and why is it important?',
      'Explain the different types of SQL joins.',
      'What is ACID in database transactions?',
      'Explain the difference between clustered and non-clustered indexes.',
      'What are stored procedures and their advantages?',
      'What is the difference between SQL and NoSQL?',
      'Explain the concept of primary key and foreign key.',
      'What is a view in SQL?',
      'Explain the concept of database locking.',
      'What is the difference between DELETE and TRUNCATE?',
      'Explain database sharding.',
      'What is the CAP theorem?',
      'Explain the difference between inner join and outer join.',
      'What is an ER diagram?',
      'Explain the concept of dirty read.',
    ],
    'JavaScript': [
      'Explain closures in JavaScript.',
      'What is the event loop and how does it work?',
      'What is the difference between let, const, and var?',
      'Explain prototypal inheritance.',
      'What are Promises and async/await?',
      'What is the difference between `null` and `undefined`?',
      'Explain the concept of hoisting.',
      'What is the difference between `==` and `===`?',
      'Explain the `this` keyword.',
      'What are arrow functions?',
      'Explain the concept of bubbling and capturing.',
      'What is strict mode in JavaScript?',
      'Explain the difference between local storage, session storage, and cookies.',
      'What is a higher-order function?',
      'Explain the concept of currying.',
    ],
    'Operating Systems': [
      'Explain the difference between process and thread.',
      'What is deadlock and how can it be prevented?',
      'Explain virtual memory and paging.',
      'What is the difference between preemptive and non-preemptive scheduling?',
      'Explain the concept of semaphores.',
      'What is a kernel?',
      'Explain the difference between paging and segmentation.',
      'What is a race condition?',
      'Explain the concept of thrashing.',
      'What is context switching?',
      'Explain the Round Robin scheduling algorithm.',
      'What is a mutex?',
      'Explain the concept of system calls.',
      'What is fragmentation in OS?',
      'Explain the Banker\'s algorithm.',
    ],
    'HR Questions': [
      'Tell me about yourself.',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
      'Describe a challenging situation you faced and how you handled it.',
      'Why do you want to leave your current job?',
      'What are your salary expectations?',
      'How do you handle stress and pressure?',
      'Describe a time you showed leadership.',
      'What is your greatest accomplishment?',
      'Do you have any questions for us?',
      'How do you handle conflict with a coworker?',
      'What motivates you?',
      'Describe your ideal work environment.',
      'Are you willing to relocate?',
    ],
  };

  const startInterview = (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);

    setTimeout(() => {
      const topicQuestions = mockQuestions[topic] || mockQuestions['Java'];
      // Shuffle and pick 5 random questions
      const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      setQuestions(selected.map((q, i) => ({ id: i, text: q, answer: '' })));
      setSessionState('answering');
      setIsLoading(false);
    }, 1500);
  };

  const handleAnswerChange = (answer: string) => {
    const updated = [...questions];
    updated[currentQuestionIndex].answer = answer;
    setQuestions(updated);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitInterview();
    }
  };

  const submitInterview = async () => {
    setIsLoading(true);
    setSessionState('result'); // Switch to view to show loading state

    try {
      const token = localStorage.getItem('campusconnect_token');
      const res = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questions,
          topic: selectedTopic
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error(error);
      // Fallback for demo if server fails (or revert to previous state)
      setSessionState('select');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setSessionState('select');
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setResult(null);
  };

  return (
    <DashboardLayout requiredRole="student">
      <PageHeader
        title="AI Interview Practice"
        description="Practice technical interviews with AI-powered evaluation"
      />

      {sessionState === 'select' && (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8 gradient-card border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <Brain className="h-10 w-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to Practice?</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a topic below to start a mock interview session. Our AI will generate relevant questions and evaluate your responses.
              </p>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-4">Choose a Topic</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {interviewTopics.map((topic, index) => (
              <Card
                key={topic}
                className="animate-slide-up hover:shadow-md transition-shadow cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => startInterview(topic)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{topic}</h4>
                      <p className="text-sm text-muted-foreground">5 questions</p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Play className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {sessionState === 'answering' && (
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Generating interview questions...</p>
              <p className="text-sm text-muted-foreground">Powered by AI</p>
            </Card>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedTopic}</Badge>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="font-medium">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
              </div>

              {/* Question Card */}
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                      {currentQuestionIndex + 1}
                    </span>
                    Interview Question
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-lg">{questions[currentQuestionIndex]?.text}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Answer</label>
                    <Textarea
                      placeholder="Type your answer here... Take your time and be thorough."
                      value={questions[currentQuestionIndex]?.answer || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="min-h-[200px]"
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button variant="ghost" onClick={resetSession}>
                      Exit Interview
                    </Button>
                    <Button
                      variant="default"
                      onClick={nextQuestion}
                      disabled={!questions[currentQuestionIndex]?.answer?.trim()}
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next Question
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Submit for Evaluation
                          <CheckCircle className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {sessionState === 'result' && result && (
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <Card className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg font-medium">Evaluating your responses...</p>
              <p className="text-sm text-muted-foreground">Our AI is analyzing your answers</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {/* Score Card */}
              <Card className="overflow-hidden">
                <div className="gradient-primary p-8 text-center text-primary-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg opacity-80">Your Score</p>
                  <p className="text-6xl font-bold">{result.score}</p>
                  <p className="text-lg opacity-80">out of 100</p>
                </div>
              </Card>

              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{result.feedback}</p>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.improvements.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Evaluation Process */}
              {result.evaluation && result.evaluation.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Evaluation Process
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Here's how your score was calculated for each question.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Scoring Criteria Overview */}
                    <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                      <p className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Scoring Criteria (per question, max 100)</p>
                      <div className="grid gap-2 sm:grid-cols-3 mt-2">
                        <div className="flex items-center gap-2 rounded-md bg-background p-2">
                          <Type className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Answer Length</p>
                            <p className="text-xs text-muted-foreground">Up to 40 pts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-background p-2">
                          <Hash className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium">Keywords Used</p>
                            <p className="text-xs text-muted-foreground">Up to 40 pts</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-background p-2">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="font-medium">Topic Mention</p>
                            <p className="text-xs text-muted-foreground">Up to 20 pts</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Per-Question Breakdown */}
                    {result.evaluation.map((evalItem, index) => (
                      <div key={index} className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm">{evalItem.question}</p>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                                Your answer: "{evalItem.answer.length > 100 ? evalItem.answer.slice(0, 100) + '...' : evalItem.answer}"
                              </p>
                            </div>
                          </div>
                          <Badge variant={evalItem.score >= 70 ? 'default' : evalItem.score >= 40 ? 'secondary' : 'destructive'}>
                            {evalItem.score}/100
                          </Badge>
                        </div>

                        {/* Score Bars */}
                        <div className="space-y-2 pl-10">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="w-28 text-muted-foreground flex items-center gap-1"><Type className="h-3 w-3 text-blue-500" /> Length ({evalItem.answerLength} chars)</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(evalItem.lengthScore / 40) * 100}%` }} />
                            </div>
                            <span className="w-12 text-right font-medium">{evalItem.lengthScore}/40</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="w-28 text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3 text-green-500" /> Keywords</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(evalItem.keywordScore / 40) * 100}%` }} />
                            </div>
                            <span className="w-12 text-right font-medium">{evalItem.keywordScore}/40</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="w-28 text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3 text-orange-500" /> Topic Bonus</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(evalItem.topicScore / 20) * 100}%` }} />
                            </div>
                            <span className="w-12 text-right font-medium">{evalItem.topicScore}/20</span>
                          </div>
                        </div>

                        {/* Matched Keywords */}
                        {evalItem.matchedKeywords.length > 0 && (
                          <div className="pl-10">
                            <p className="text-xs text-muted-foreground mb-1">Keywords detected:</p>
                            <div className="flex flex-wrap gap-1">
                              {evalItem.matchedKeywords.map((kw, ki) => (
                                <Badge key={ki} variant="outline" className="text-xs px-2 py-0">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button variant="outline" onClick={resetSession} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Another Topic
                </Button>
                <Button variant="default" onClick={() => startInterview(selectedTopic!)} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
