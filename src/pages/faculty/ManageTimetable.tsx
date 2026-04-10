import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, Trash2, Edit, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Timetable {
    id: string;
    title: string;
    courseId: string;
    day: string;
    startTime: string;
    endTime: string;
    room?: string;
    course: {
        id: string;
        name: string;
        code: string;
    };
    faculty: {
        id: string;
        name: string;
    };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function ManageTimetable() {
    const { toast } = useToast();
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Timetable | null>(null);
    const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '' });
    const [formData, setFormData] = useState({
        title: '',
        courseId: '',
        day: '',
        startTime: '',
        endTime: '',
        room: ''
    });

    useEffect(() => {
        fetchTimetables();
        fetchCourses();
    }, []);

    const fetchTimetables = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const response = await fetch('/api/timetable', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setTimetables(data);
            }
        } catch (error) {
            console.error('Error fetching timetables:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const response = await fetch('/api/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.courseId || !formData.day || !formData.startTime || !formData.endTime) {
            toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
            return;
        }

        try {
            const token = localStorage.getItem('campusconnect_token');
            const url = editingEntry ? `/api/timetable/${editingEntry.id}` : '/api/timetable';
            const method = editingEntry ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({ title: 'Success', description: `Timetable entry ${editingEntry ? 'updated' : 'created'} successfully` });
                setIsDialogOpen(false);
                setEditingEntry(null);
                setFormData({ title: '', courseId: '', day: '', startTime: '', endTime: '', room: '' });
                fetchTimetables();
            } else {
                throw new Error('Failed to save timetable');
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save timetable entry', variant: 'destructive' });
        }
    };

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
                setIsCourseDialogOpen(false);
                // Refresh courses and select the new one
                const coursesRes = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    setCourses(coursesData);
                    setFormData({ ...formData, courseId: createdCourse.id });
                }
            } else {
                throw new Error('Failed to create course');
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create course', variant: 'destructive' });
        } finally {
            setIsCreatingCourse(false);
        }
    };

    const handleEdit = (entry: Timetable) => {
        setEditingEntry(entry);
        setFormData({
            title: entry.title,
            courseId: entry.courseId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room || ''
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this timetable entry?')) return;

        try {
            const token = localStorage.getItem('campusconnect_token');
            const response = await fetch(`/api/timetable/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast({ title: 'Success', description: 'Timetable entry deleted successfully' });
                fetchTimetables();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete timetable entry', variant: 'destructive' });
        }
    };

    const getEntriesForSlot = (day: string, time: string) => {
        return timetables.filter(t => t.day === day && t.startTime === time);
    };

    return (
        <DashboardLayout requiredRole="faculty">
            <PageHeader
                title="Manage Timetable"
                description="Create and manage class schedules"
                action={
                    <Button onClick={() => {
                        setEditingEntry(null);
                        setFormData({ title: '', courseId: '', day: '', startTime: '', endTime: '', room: '' });
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Entry
                    </Button>
                }
            />

            {/* Weekly Grid */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Weekly Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="border p-2 bg-muted font-semibold text-sm">Time</th>
                                    {DAYS.map(day => (
                                        <th key={day} className="border p-2 bg-muted font-semibold text-sm">{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time}>
                                        <td className="border p-2 font-medium text-sm bg-muted/50">{time}</td>
                                        {DAYS.map(day => {
                                            const entries = getEntriesForSlot(day, time);
                                            return (
                                                <td key={day} className="border p-1 align-top">
                                                    {entries.map(entry => (
                                                        <div
                                                            key={entry.id}
                                                            className="mb-1 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs"
                                                        >
                                                            <div className="font-semibold text-primary">{entry.title}</div>
                                                            <div className="text-xs text-muted-foreground">{entry.course.code}</div>
                                                            {entry.room && <div className="text-muted-foreground">Room: {entry.room}</div>}
                                                            <div className="text-muted-foreground">{entry.startTime} - {entry.endTime}</div>
                                                            <div className="flex gap-1 mt-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 px-2"
                                                                    onClick={() => handleEdit(entry)}
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 px-2 text-destructive"
                                                                    onClick={() => handleDelete(entry.id)}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit' : 'Add'} Timetable Entry</DialogTitle>
                        <DialogDescription>
                            {editingEntry ? 'Update the timetable entry details' : 'Create a new timetable entry'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                placeholder="e.g., Data Structures Lecture"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <div className="flex gap-2">
                                <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Select course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.id}>
                                                {course.code} - {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => setIsCourseDialogOpen(true)}
                                    title="Create new course"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Day</Label>
                            <Select value={formData.day} onValueChange={(v) => setFormData({ ...formData, day: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(day => (
                                        <SelectItem key={day} value={day}>{day}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Select value={formData.startTime} onValueChange={(v) => setFormData({ ...formData, startTime: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Start" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Select value={formData.endTime} onValueChange={(v) => setFormData({ ...formData, endTime: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="End" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SLOTS.map(time => (
                                            <SelectItem key={time} value={time}>{time}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Room (Optional)</Label>
                            <Input
                                placeholder="e.g., Room 101"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingEntry ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Course Creation Dialog */}
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
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
        </DashboardLayout>
    );
}
