import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, CheckCircle, Clock, User, AlertCircle, Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Submission {
    id: string;
    fileUrl: string;
    submittedAt: string;
    student: {
        name: string;
        email: string;
        usn?: string;
    };
    assignment: {
        title: string;
    };
}

interface PendingStudent {
    id: string;
    name: string;
    email: string;
    usn: string | null;
}

interface Assignment {
    id: string;
    title: string;
}

export default function FacultySubmissions() {
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string>('all');

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('submitted');

    useEffect(() => {
        fetchAssignments();
        fetchSubmissions();
    }, []);

    useEffect(() => {
        if (selectedAssignment !== 'all' && activeTab === 'pending') {
            fetchPendingSubmissions(selectedAssignment);
        } else {
            fetchSubmissions();
        }
    }, [selectedAssignment, activeTab]);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const response = await fetch('/api/assignments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            }
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('campusconnect_token');

            let url = '/api/assignments/submissions';
            if (selectedAssignment !== 'all') {
                url += `?assignmentId=${selectedAssignment}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });

            if (response.ok) {
                const data = await response.json();
                setSubmissions(Array.isArray(data) ? data : []);
            } else {
                throw new Error('Failed to fetch submissions');
            }
        } catch (err: any) {
            console.error('Error fetching submissions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingSubmissions = async (assignmentId: string) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('campusconnect_token');

            const response = await fetch(`/api/assignments/${assignmentId}/pending`, {
                headers: { 'Authorization': `Bearer ${token || ''}` }
            });

            if (response.ok) {
                const data = await response.json();
                setPendingStudents(data.students || []);
            } else {
                throw new Error('Failed to fetch pending list');
            }
        } catch (err: any) {
            console.error('Error fetching pending:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const safeFormatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, h:mm a');
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <DashboardLayout requiredRole="faculty">
            <PageHeader
                title="Student Submissions"
                description="Review submissions and check pending students."
            />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
                    <div className="w-full sm:w-64">
                        <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Assignment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Assignments</SelectItem>
                                {assignments.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="submitted">Submitted ({submissions.length})</TabsTrigger>
                        <TabsTrigger value="pending" disabled={selectedAssignment === 'all'}>
                            Pending {selectedAssignment === 'all' ? '(Select Assignment)' : `(${pendingStudents.length})`}
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4">
                        {error && (
                            <Card className="border-destructive/50 bg-destructive/10 mb-4">
                                <CardContent className="pt-6 flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-5 w-5" />
                                    <p>{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <>
                                        <TabsContent value="submitted" className="m-0 border-none">
                                            {submissions.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Student</TableHead>
                                                            <TableHead>Assignment</TableHead>
                                                            <TableHead>Submitted At</TableHead>
                                                            <TableHead className="text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {submissions.map((sub) => (
                                                            <TableRow key={sub.id}>
                                                                <TableCell>
                                                                    <div>
                                                                        <p className="font-medium">{sub.student?.name || 'Unknown'}</p>
                                                                        <p className="text-xs text-muted-foreground">{sub.student?.usn || sub.student?.email}</p>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>{sub.assignment?.title || 'Unknown'}</TableCell>
                                                                <TableCell>{safeFormatDate(sub.submittedAt)}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => window.open(sub.fileUrl, '_blank')}
                                                                    >
                                                                        <Eye className="h-4 w-4 mr-2" /> View
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                    <p>No submissions found.</p>
                                                </div>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="pending" className="m-0 border-none">
                                            {pendingStudents.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Student Name</TableHead>
                                                            <TableHead>USN</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead className="text-right">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {pendingStudents.map((student) => (
                                                            <TableRow key={student.id}>
                                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                                <TableCell>{student.usn || 'N/A'}</TableCell>
                                                                <TableCell>{student.email}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="inline-flex items-center text-destructive text-sm bg-destructive/10 px-2 py-1 rounded">
                                                                        <XCircle className="h-3 w-3 mr-1" /> Pending
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-20 text-green-500" />
                                                    <p>All students have submitted! Great job.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
