import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/student/StudentDashboard";
import Notes from "./pages/student/Notes";
import VideoClasses from "./pages/student/VideoClasses";
import StudentAssignments from "./pages/student/Assignments";
import AIAssistant from "./pages/student/AIAssistant";
import InterviewPractice from "./pages/student/InterviewPractice";
import ViewTimetable from "./pages/student/ViewTimetable";
import Community from "./pages/Community";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import UploadNotes from "./pages/faculty/UploadNotes";
import UploadVideos from "./pages/faculty/UploadVideos";
import FacultyAssignments from "./pages/faculty/FacultyAssignments";
import FacultySubmissions from "./pages/faculty/FacultySubmissions";
import ManageTimetable from "./pages/faculty/ManageTimetable";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageCourses from "./pages/admin/ManageCourses";
import Analytics from "./pages/admin/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route path="/auth" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <Auth />} />

      {/* Root redirect */}
      <Route path="/" element={
        isAuthenticated
          ? <Navigate to={`/${user?.role}`} replace />
          : <Navigate to="/auth" replace />
      } />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
      <Route path="/student/videos" element={<ProtectedRoute><VideoClasses /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute><StudentAssignments /></ProtectedRoute>} />
      <Route path="/student/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
      <Route path="/student/interview" element={<ProtectedRoute><InterviewPractice /></ProtectedRoute>} />
      <Route path="/student/timetable" element={<ProtectedRoute><ViewTimetable /></ProtectedRoute>} />

      {/* Faculty Routes */}
      <Route path="/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/faculty/upload-notes" element={<ProtectedRoute><UploadNotes /></ProtectedRoute>} />
      <Route path="/faculty/upload-videos" element={<ProtectedRoute><UploadVideos /></ProtectedRoute>} />
      <Route path="/faculty/assignments" element={<ProtectedRoute><FacultyAssignments /></ProtectedRoute>} />
      <Route path="/faculty/submissions" element={<ProtectedRoute><FacultySubmissions /></ProtectedRoute>} />
      <Route path="/faculty/timetable" element={<ProtectedRoute><ManageTimetable /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

      {/* Community (shared) */}
      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
