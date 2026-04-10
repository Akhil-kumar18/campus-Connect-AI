import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function NotificationsList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { toast } = useToast();
    const { isAuthenticated } = useAuth(); // Assuming auth check needed

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const token = localStorage.getItem('campusconnect_token');
            const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                toast({ title: 'Marked as read' });
            }
        } catch (err) {
            toast({ title: 'Error updating notification', variant: 'destructive' });
        }
    };

    useEffect(() => {
        if (isAuthenticated) fetchNotifications();
    }, [isAuthenticated]);

    if (notifications.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" /> Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No new notifications.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Notifications
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`flex items-start justify-between p-3 rounded-lg border ${notification.isRead ? 'bg-muted/50 opacity-70' : 'bg-card border-l-4 border-l-primary'}`}
                    >
                        <div>
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        {!notification.isRead && (
                            <Button size="icon" variant="ghost" onClick={() => markAsRead(notification.id)} title="Mark as read">
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
