import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Search, Trash2, Mail, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

// Updated interface to match API response (status might not be in API yet, assuming active for now or derived)
interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  // status: 'active' | 'inactive'; // API might not return status yet, assuming all are active
}

export default function ManageUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' as UserRole, password: 'password123' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const res = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const students = users.filter(u => u.role === 'student');
  const faculty = users.filter(u => u.role === 'faculty');

  const filteredUsers = (role: UserRole) => {
    return users
      .filter(u => u.role === role)
      .filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('campusconnect_token');
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        toast({ title: 'User created successfully!' });
        setCreateDialog(false);
        setNewUser({ name: '', email: '', role: 'student', password: 'password123' });
        fetchUsers();
      } else {
        const err = await res.json();
        toast({ title: 'Failed to create user', description: err.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error creating user', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('campusconnect_token');
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast({ title: 'User deleted', variant: 'destructive' });
        fetchUsers();
      } else {
        toast({ title: 'Failed to delete user', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const UserTable = ({ role }: { role: UserRole }) => (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers(role).map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant="default">
                  Active
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout requiredRole="admin">
      <PageHeader
        title="Manage Users"
        description="Add, edit, or remove students and faculty"
        action={
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="faculty" className="gap-2">
            <Users className="h-4 w-4" />
            Faculty ({faculty.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <UserTable role="student" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <UserTable role="faculty" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="john@campus.edu"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Password</Label>
              <Input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(v: UserRole) => setNewUser({ ...newUser, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
