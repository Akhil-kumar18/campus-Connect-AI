export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
}

export interface Note {
  id: string;
  facultyId: string;
  facultyName: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  fileUrl: string;
  createdAt: Date;
}

export interface VideoClass {
  id: string;
  facultyId: string;
  facultyName: string;
  courseId: string;
  moduleId: string;
  title: string;
  videoUrl: string;
  thumbnail?: string;
  summaryShort?: string;
  summaryMedium?: string;
  summaryLong?: string;
  duration?: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  facultyId: string;
  facultyName: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  deadline: Date;
  fileUrl?: string;
  createdAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl: string;
  submittedAt: Date;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  answers: Answer[];
  createdAt: Date;
}

export interface Answer {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  text: string;
  upvotes: number;
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  answerId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface InterviewSession {
  id: string;
  studentId: string;
  topic: string;
  questions: string[];
  answers: string[];
  evaluation?: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  createdAt: Date;
}

export interface TimetableEntry {
  id: string;
  studentId: string;
  date: Date;
  subjects: string[];
  tasks: string[];
  pendingAssignments: string[];
  exams: { subject: string; date: Date }[];
}

export interface Analytics {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalNotes: number;
  totalVideos: number;
  totalAssignments: number;
  submissionRate: number;
  activeUsers: number;
  communityPosts: number;
  mostActiveStudents: { name: string; activity: number }[];
  mostActiveFaculty: { name: string; uploads: number }[];
  courseUsage: { course: string; usage: number }[];
}
