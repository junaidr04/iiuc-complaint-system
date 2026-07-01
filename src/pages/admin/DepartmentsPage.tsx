import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UserCheck, Loader2, Building2 } from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment, assignAuthority, getAllUsers } from '@/services/api';
import type { Department, User } from '@/types/types';
import AppLayout from '@/components/layouts/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface DeptForm { name: string; description: string; }

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [authorities, setAuthorities] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [assignTarget, setAssignTarget] = useState<Department | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<DeptForm>({ name: '', description: '' });
  const [assignAuthorityId, setAssignAuthorityId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [depts, users] = await Promise.all([getDepartments(), getAllUsers()]);
    setDepartments(depts);
    setAuthorities(users.filter(u => u.role === 'authority' || u.role === 'admin'));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    setActionLoading(true);
    await createDepartment({ name: form.name.trim(), description: form.description.trim() || undefined });
    toast.success('Department created');
    setCreateOpen(false);
    setForm({ name: '', description: '' });
    setActionLoading(false);
    fetchData();
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setActionLoading(true);
    await updateDepartment(editTarget.id, { name: form.name.trim(), description: form.description.trim() });
    toast.success('Department updated');
    setEditTarget(null);
    setActionLoading(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    await deleteDepartment(deleteTarget.id);
    toast.success('Department deleted');
    setDeleteTarget(null);
    setActionLoading(false);
    fetchData();
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setActionLoading(true);
    await assignAuthority(assignTarget.id, assignAuthorityId || null);
    toast.success('Authority assigned');
    setAssignTarget(null);
    setAssignAuthorityId('');
    setActionLoading(false);
    fetchData();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Departments</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{departments.length} departments</p>
          </div>
          <Button onClick={() => { setForm({ name: '', description: '' }); setCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />New Department
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map(dept => (
              <div key={dept.id} className="rounded-lg border border-border bg-card p-5 card-shadow space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{dept.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTarget(dept); setForm({ name: dept.name, description: dept.description ?? '' }); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(dept)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {dept.description && <p className="text-xs text-muted-foreground line-clamp-2">{dept.description}</p>}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    {dept.assigned_authority ? (
                      <span className="flex items-center gap-1"><UserCheck className="h-3 w-3 text-primary" />{(dept.assigned_authority as User).name}</span>
                    ) : (
                      <span className="text-muted-foreground/60">No authority assigned</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setAssignTarget(dept); setAssignAuthorityId(dept.assigned_authority_id ?? ''); }}>
                    Assign
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>New Department</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name <span className="text-destructive">*</span></Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Department name" /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" rows={3} className="resize-none" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={actionLoading}>{actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="resize-none" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={actionLoading}>{actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>Delete "<strong>{deleteTarget?.name}</strong>"? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign dialog */}
      <Dialog open={!!assignTarget} onOpenChange={() => setAssignTarget(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>Assign Authority</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">Assign an authority to manage <strong>{assignTarget?.name}</strong>.</p>
            <div className="space-y-1.5">
              <Label>Authority</Label>
              <Select value={assignAuthorityId} onValueChange={setAssignAuthorityId}>
                <SelectTrigger><SelectValue placeholder="Select authority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (unassign)</SelectItem>
                  {authorities.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={actionLoading}>{actionLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default DepartmentsPage;
