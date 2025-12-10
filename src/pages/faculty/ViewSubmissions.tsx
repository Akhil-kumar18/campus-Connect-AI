import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { assignments } from '@/data/mockData';
import { Download, Eye, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

const mockSubmissions = [
  { id: '1', studentName: 'Alex Chen', email: 'alex@campus.edu', submittedAt: new Date(), status: 'submitted' },
  { id: '2', studentName: 'Maria Garcia', email: 'maria@campus.edu', submittedAt: new Date(), status: 'submitted' },
  { id: '3', studentName: 'James Wilson', email: 'james@campus.edu', submittedAt: null, status: 'pending' },
  { id: '4', studentName: 'Emily Davis', email: 'emily@campus.edu', submittedAt: new Date(), status: 'submitted' },
  { id: '5', studentName: 'Michael Lee', email: 'michael@campus.edu', submittedAt: null, status: 'pending' },
];

export default function ViewSubmissions() {
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');

  const submitted = mockSubmissions.filter(s => s.status === 'submitted');
  const pending = mockSubmissions.filter(s => s.status === 'pending');

  return (
    <DashboardLayout requiredRole="faculty">
      <PageHeader 
        title="Student Submissions"
        description="Review and download student assignment submissions"
      />

      {/* Assignment Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select an assignment" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <div className="text-center px-4 border-r">
                <p className="text-2xl font-bold text-success">{submitted.length}</p>
                <p className="text-xs text-muted-foreground">Submitted</p>
              </div>
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-accent">{pending.length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Submitted */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Submitted ({submitted.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submitted.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{submission.studentName}</p>
                            <p className="text-xs text-muted-foreground">{submission.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {submission.submittedAt && format(submission.submittedAt, 'MMM d, h:mm a')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {submitted.length > 0 && (
              <Button variant="outline" className="w-full mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download All Submissions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Pending ({pending.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pending.map((student) => (
                <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.studentName}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <Badge variant="outline" className="text-accent border-accent/30">
                    Not submitted
                  </Badge>
                </div>
              ))}
            </div>
            {pending.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
                <p>All students have submitted!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
