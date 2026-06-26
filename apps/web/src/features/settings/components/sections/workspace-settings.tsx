import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, UserMinus, Shield, Crown } from 'lucide-react';
import { useWorkspaceSettings } from '../../hooks/use-workspace-settings';
import { useProfile } from '../../hooks/use-profile';
import type { WorkspaceRole } from '@devflow/shared';

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
};

const ROLE_ICONS: Record<WorkspaceRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: UserMinus,
  viewer: UserMinus,
};

const ASSIGNABLE_ROLES: WorkspaceRole[] = ['admin', 'member', 'viewer'];

export function WorkspaceSettings() {
  const navigate = useNavigate();
  const { data: me } = useProfile();
  const {
    workspace,
    members,
    updateWorkspace,
    inviteMember,
    updateMemberRole,
    removeMember,
    leaveWorkspace,
    deleteWorkspace,
  } = useWorkspaceSettings();

  const ws = workspace.data as {
    _id: string; name: string; description: string; icon: string; owner: string;
  } | undefined;

  const [wsForm, setWsForm] = useState({ name: '', description: '', icon: '' });
  const [wsInit, setWsInit] = useState(false);
  if (ws && !wsInit) {
    setWsForm({ name: ws.name, description: ws.description, icon: ws.icon });
    setWsInit(true);
  }

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingWs, setDeletingWs] = useState(false);
  const [leavingWs, setLeavingWs] = useState(false);
  const [savingWs, setSavingWs] = useState(false);

  const myMember = members.data?.find(
    (m) => m.user._id === me?._id,
  );
  const isOwner = myMember?.role === 'owner';

  const handleSaveWorkspace = async () => {
    setSavingWs(true);
    try {
      await updateWorkspace.mutateAsync(wsForm);
    } finally {
      setSavingWs(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteError('');
    setInviting(true);
    try {
      await inviteMember.mutateAsync({ email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail('');
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite member.');
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    setLeavingWs(true);
    try {
      await leaveWorkspace.mutateAsync();
      navigate('/dashboard', { replace: true });
    } finally {
      setLeavingWs(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (deleteConfirm !== ws?.name) return;
    setDeletingWs(true);
    try {
      await deleteWorkspace.mutateAsync();
      navigate('/dashboard', { replace: true });
    } finally {
      setDeletingWs(false);
    }
  };

  if (workspace.isLoading || members.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Workspace Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace configuration and members.
        </p>
      </div>

      {/* General */}
      <section aria-labelledby="ws-general-heading">
        <h3 id="ws-general-heading" className="text-sm font-semibold">General</h3>
        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="wsName" className="text-sm font-medium">Workspace Name</label>
            <Input
              id="wsName"
              value={wsForm.name}
              onChange={(e) => setWsForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="My Workspace"
              maxLength={50}
              disabled={!isOwner && myMember?.role !== 'admin'}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="wsDescription" className="text-sm font-medium">Description</label>
            <Textarea
              id="wsDescription"
              value={wsForm.description}
              onChange={(e) => setWsForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this workspace for?"
              rows={3}
              maxLength={500}
              disabled={!isOwner && myMember?.role !== 'admin'}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="wsIcon" className="text-sm font-medium">Icon / Emoji</label>
            <Input
              id="wsIcon"
              value={wsForm.icon}
              onChange={(e) => setWsForm((p) => ({ ...p, icon: e.target.value }))}
              placeholder="🚀"
              maxLength={10}
              disabled={!isOwner && myMember?.role !== 'admin'}
            />
          </div>
          {(isOwner || myMember?.role === 'admin') && (
            <Button onClick={handleSaveWorkspace} disabled={savingWs} size="sm">
              {savingWs ? 'Saving…' : 'Save Changes'}
            </Button>
          )}
        </div>
      </section>

      <Separator />

      {/* Members */}
      <section aria-labelledby="ws-members-heading">
        <h3 id="ws-members-heading" className="text-sm font-semibold">Members</h3>

        {/* Invite */}
        {(isOwner || myMember?.role === 'admin') && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              type="email"
              aria-label="Invite email"
              className="flex-1"
            />
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as WorkspaceRole)}>
              <SelectTrigger className="w-32" aria-label="Role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? 'Inviting…' : 'Invite'}
            </Button>
          </div>
        )}
        {inviteError && <p className="mt-2 text-sm text-destructive" role="alert">{inviteError}</p>}

        <ul className="mt-4 divide-y divide-border rounded-lg border border-border" aria-label="Members">
          {members.data?.map((m) => {
            const RoleIcon = ROLE_ICONS[m.role];
            const canManage =
              (isOwner || myMember?.role === 'admin') && m.role !== 'owner';
            return (
              <li key={m._id} className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={m.user.avatar} alt={m.user.displayName} />
                  <AvatarFallback className="text-xs">
                    {(m.user.displayName?.[0] ?? '?').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.user.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canManage ? (
                    <Select
                      value={m.role}
                      onValueChange={(v) =>
                        updateMemberRole.mutate({ memberId: m._id, role: v as WorkspaceRole })
                      }
                    >
                      <SelectTrigger className="h-7 w-24 text-xs" aria-label={`Role for ${m.user.displayName}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNABLE_ROLES.map((r) => (
                          <SelectItem key={r} value={r} className="text-xs">{ROLE_LABELS[r]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <RoleIcon className="h-3 w-3" />
                      {ROLE_LABELS[m.role]}
                    </Badge>
                  )}
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeMember.mutate(m._id)}
                      aria-label={`Remove ${m.user.displayName}`}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <Separator />

      {/* Leave / Delete */}
      <section aria-labelledby="ws-danger-heading">
        <h3 id="ws-danger-heading" className="text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h3>

        {!isOwner && (
          <div className="mt-4 rounded-lg border border-destructive/30 p-4">
            <p className="text-sm font-medium">Leave Workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You will lose access to all projects and data in this workspace.
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              disabled={leavingWs}
              onClick={handleLeave}
            >
              {leavingWs ? 'Leaving…' : 'Leave Workspace'}
            </Button>
          </div>
        )}

        {isOwner && (
          <div className="mt-4 rounded-lg border border-destructive/30 p-4 space-y-4">
            <div>
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently deletes the workspace and all its data. This cannot be undone.
              </p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="wsDeleteConfirm" className="text-sm font-medium">
                Type <span className="font-mono font-bold">{ws?.name}</span> to confirm
              </label>
              <Input
                id="wsDeleteConfirm"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={ws?.name}
                className="max-w-xs"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteConfirm !== ws?.name || deletingWs}
              onClick={handleDeleteWorkspace}
            >
              {deletingWs ? 'Deleting…' : 'Delete Workspace'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
