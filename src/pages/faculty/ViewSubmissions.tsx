import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
}

interface Submission {
  id: string;
  fileUrl: string;
  submittedAt: string;
  student: {
    name: string;
    email: string;
  };
  assignment: {
    title: string;
  };
}

export default function ViewSubmissions() {
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSubmissions(selectedAssignment || undefined);
  }, [selectedAssignment]);

  const fetchData = async () => {
    await Promise.all([fetchAssignments(), fetchSubmissions()]);
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const response = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
      setAssignments([]);
    }
  };

  const fetchSubmissions = async (assignmentId?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('campusconnect_token');
      const url = assignmentId
        ? `/api/assignments/submissions?assignmentId=${assignmentId}`
        : '/api/assignments/submissions';

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token || ''}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader
        title="Student Submissions"
        description="Review and download student assignment submissions"
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="All assignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All assignments</SelectItem>
                  {assignments.filter(a => a && a.id).map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title || 'Untitled'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-center px-4">
              <p className="text-2xl font-bold text-success">{submissions.length}</p>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : submissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{sub.student?.name || 'Unknown Student'}</p>
                          <p className="text-xs text-muted-foreground">{sub.student?.email || 'No Email'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{sub.assignment?.title || 'Unknown Assignment'}</TableCell>
                    <TableCell>{sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM d, h:mm a') : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(sub.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p>No submissions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
