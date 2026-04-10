import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

export function CreateExamForm() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        courseId: 'course_123' // Hardcoded for demo, normally fetched from selected course
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast({ title: 'Exam Scheduled', description: 'Students have been notified.' });
                setFormData({ ...formData, title: '', date: '', time: '', location: '' });
            } else {
                throw new Error('Failed to create exam');
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Could not schedule exam.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Schedule New Exam</CardTitle>
                <CardDescription>Create an exam timetable and notify students instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="exam-title">Exam Title (e.g., Mid-Term)</Label>
                        <div className="relative">
                            <BookOpen className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="exam-title"
                                placeholder="Enter exam title"
                                className="pl-9"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="exam-date">Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="exam-date"
                                    type="date"
                                    className="pl-9"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="exam-time">Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="exam-time"
                                    type="time"
                                    className="pl-9"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="exam-location">Location / Room</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="exam-location"
                                placeholder="Room 302 or Online Link"
                                className="pl-9"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Scheduling...' : 'Schedule Exam & Notify Students'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
