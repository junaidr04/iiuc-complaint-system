import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Trash2, ShieldCheck, GraduationCap, Loader2, User } from 'lucide-react';
import { getAllUsers, updateUserRole, deleteUser, getDepartments } from '@/services/api';
import type { User as UserType, UserRole, Department } from '@/types/types';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  authority: 'bg-primary/10 text-primary border-primary/20',
  student: 'bg-muted text-muted-foreground border-border',
};

const UsersPage: React.FC = () => {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [u, d] = await Promise.all([getAllUsers(searchInput || undefined), getDepartments()]);
    setUsers(u);
    setDepartments(d);
    setLoading(false);
  }, [searchInput]);

  useEffect(() => { const t = setTimeout(() => fetchData(), 400); return () => clearTimeout(t); }, [fetchData]);

  const filteredUsers = filterRole === 'all' ? users : users.filter(u => u.role === filterRole);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setUpdatingId(userId);
    await updateUserRole(userId, role);
    toast.success('User role updated');
    setUpdatingId(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    await deleteUser(deleteTarget.id);
    toast.success('User deleted');
    setDeleteTarget(null);
    setActionLoading(false);
    fetchData();
  };

  const getDepartmentName = (deptId: string | null) =>
    departments.find(d => d.id === deptId)?.name ?? 'N/A';

  return (
    <AppLayout>
      <div className="max-w-5xl space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Users</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} total users</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={searchInput} onChange={e => setSearchInput(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterRole} onValueChange={v => setFilterRole(v as UserRole | 'all')}>
            <SelectTrigger className="w-36 shrink-0">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="authority">Authorities</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users list */}
        <div className="rounded-lg border border-border bg-card overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[100px]" /></td>
                      ))}
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No users found</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className={cn('hover:bg-muted/30 transition-colors', user.id === currentUser?.id && 'bg-primary/5')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={user.profile_image ?? undefined} />
                            <AvatarFallback className="text-xs bg-muted font-medium">
                              {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{user.name}{user.id === currentUser?.id && ' (you)'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {user.id === currentUser?.id ? (
                          <Badge variant="outline" className={ROLE_COLORS[user.role]}>{user.role}</Badge>
                        ) : (
                          <Select
                            value={user.role}
                            onValueChange={v => handleRoleChange(user.id, v as UserRole)}
                            disabled={updatingId === user.id}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs border-0 p-0 bg-transparent font-medium">
                              {updatingId === user.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Badge variant="outline" className={cn('cursor-pointer', ROLE_COLORS[user.role])}>{user.role}</Badge>
                              }
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="authority">Authority</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{getDepartmentName(user.department_id)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</td>
                      <td className="px-4 py-3 text-right">
                        {user.id !== currentUser?.id && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(user)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>Delete user "<strong>{deleteTarget?.name}</strong>"? This action cannot be undone and will remove all their data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default UsersPage;
