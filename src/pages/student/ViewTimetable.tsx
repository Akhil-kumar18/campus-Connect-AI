import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';

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

export default function ViewTimetable() {
    const [timetables, setTimetables] = useState<Timetable[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('all');

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

    const getEntriesForSlot = (day: string, time: string) => {
        return timetables.filter(t => {
            const matchesDay = t.day === day;
            const matchesTime = t.startTime === time;
            const matchesCourse = selectedCourse === 'all' || t.courseId === selectedCourse;
            return matchesDay && matchesTime && matchesCourse;
        });
    };

    return (
        <DashboardLayout requiredRole="student">
            <PageHeader
                title="Class Timetable"
                description="View your weekly class schedule"
                action={
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filter by Course" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                }
            />

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
                                                <td key={day} className="border p-1 align-top min-w-[150px]">
                                                    {entries.map(entry => (
                                                        <div
                                                            key={entry.id}
                                                            className="mb-1 p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs shadow-sm"
                                                        >
                                                            <div className="font-semibold text-primary">{entry.course.code}</div>
                                                            <div className="text-muted-foreground font-medium">{entry.course.name}</div>
                                                            <div className="text-muted-foreground mt-1 text-[10px] uppercase tracking-wider">Faculty: {entry.faculty.name}</div>
                                                            {entry.room && <div className="text-muted-foreground text-[10px]">Room: {entry.room}</div>}
                                                            <div className="text-muted-foreground mt-1 font-mono">{entry.startTime} - {entry.endTime}</div>
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
        </DashboardLayout>
    );
}
