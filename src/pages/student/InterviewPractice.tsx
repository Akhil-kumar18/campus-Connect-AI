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
  RotateCcw
} from 'lucide-react';

type SessionState = 'select' | 'answering' | 'result';

interface Question {
  id: number;
  text: string;
  answer: string;
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
  } | null>(null);

  const mockQuestions: Record<string, string[]> = {
    'Java': [
      'What is the difference between JDK, JRE, and JVM?',
      'Explain the concept of Object-Oriented Programming in Java.',
      'What is the difference between ArrayList and LinkedList?',
      'How does garbage collection work in Java?',
      'Explain the concept of multithreading in Java.',
    ],
    'Python': [
      'What are decorators in Python?',
      'Explain the difference between lists and tuples.',
      'How does memory management work in Python?',
      'What are generators and how do they work?',
      'Explain the GIL (Global Interpreter Lock).',
    ],
    'DBMS': [
      'What is normalization and why is it important?',
      'Explain the different types of SQL joins.',
      'What is ACID in database transactions?',
      'Explain the difference between clustered and non-clustered indexes.',
      'What are stored procedures and their advantages?',
    ],
    'JavaScript': [
      'Explain closures in JavaScript.',
      'What is the event loop and how does it work?',
      'What is the difference between let, const, and var?',
      'Explain prototypal inheritance.',
      'What are Promises and async/await?',
    ],
    'Operating Systems': [
      'Explain the difference between process and thread.',
      'What is deadlock and how can it be prevented?',
      'Explain virtual memory and paging.',
      'What is the difference between preemptive and non-preemptive scheduling?',
      'Explain the concept of semaphores.',
    ],
    'HR Questions': [
      'Tell me about yourself.',
      'What are your strengths and weaknesses?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
      'Describe a challenging situation you faced and how you handled it.',
    ],
  };

  const startInterview = (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    
    setTimeout(() => {
      const topicQuestions = mockQuestions[topic] || mockQuestions['Java'];
      setQuestions(topicQuestions.map((q, i) => ({ id: i, text: q, answer: '' })));
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

  const submitInterview = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setResult({
        score: 78,
        feedback: 'Good understanding of core concepts. Your explanations were clear and well-structured. Consider providing more real-world examples to strengthen your answers.',
        improvements: [
          'Include more specific code examples',
          'Discuss time and space complexity where applicable',
          'Relate concepts to practical applications',
          'Practice explaining complex topics in simpler terms',
        ],
      });
      setSessionState('result');
      setIsLoading(false);
    }, 2500);
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
                variant="interactive"
                className="animate-slide-up"
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
                      variant="hero" 
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

              <div className="flex gap-4">
                <Button variant="outline" onClick={resetSession} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Another Topic
                </Button>
                <Button variant="hero" onClick={() => startInterview(selectedTopic!)} className="flex-1">
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
