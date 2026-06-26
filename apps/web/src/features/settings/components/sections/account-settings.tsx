import { useState } from 'react';
import { useUser, useClerk, useSessionList, useSession } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Monitor, Smartphone } from 'lucide-react';
import { useProfile } from '../../hooks/use-profile';
import { useNavigate } from 'react-router';

export function AccountSettings() {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const { sessions } = useSessionList();
  const { session: activeSession } = useSession();
  const navigate = useNavigate();
  const { deleteAccount } = useProfile();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setPwSaving(true);
    try {
      await clerkUser?.updatePassword({ currentPassword, newPassword });
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount.mutateAsync();
      await signOut();
      navigate('/', { replace: true });
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security and sessions.
        </p>
      </div>

      {/* Personal info (read-only from Clerk) */}
      <section aria-labelledby="personal-info-heading">
        <h3 id="personal-info-heading" className="text-sm font-semibold">Personal Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Core account details are managed by Clerk.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">First Name</label>
            <Input value={clerkUser?.firstName ?? ''} readOnly className="bg-muted/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Last Name</label>
            <Input value={clerkUser?.lastName ?? ''} readOnly className="bg-muted/40" />
          </div>
          <div className="col-span-full space-y-1.5">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              value={clerkUser?.emailAddresses[0]?.emailAddress ?? ''}
              readOnly
              className="bg-muted/40"
            />
            <p className="text-xs text-muted-foreground">
              Email changes are managed through your Clerk account.
            </p>
          </div>
        </div>
      </section>

      <Separator />

      {/* Change password */}
      <section aria-labelledby="password-heading">
        <h3 id="password-heading" className="text-sm font-semibold">Change Password</h3>
        <div className="mt-4 space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {pwError && (
            <p className="text-sm text-destructive" role="alert">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="text-sm text-green-600" role="status">Password updated successfully.</p>
          )}
          <Button onClick={handleChangePassword} disabled={pwSaving} size="sm">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </Button>
        </div>
      </section>

      <Separator />

      {/* Active sessions */}
      <section aria-labelledby="sessions-heading">
        <h3 id="sessions-heading" className="text-sm font-semibold">Active Sessions</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Devices and browsers currently signed in to your account.
        </p>
        <ul className="mt-4 space-y-3" aria-label="Active sessions">
          {sessions?.map((session) => {
            const isCurrent = session.id === activeSession?.id;
            const ua = session.latestActivity?.browserName;
            const isMobile = ua?.toLowerCase().includes('mobile');
            return (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {isMobile ? (
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {session.latestActivity?.browserName ?? 'Unknown browser'}
                      {isCurrent && (
                        <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.latestActivity?.city ?? 'Unknown location'} ·{' '}
                      {session.lastActiveAt?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!isCurrent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => session.revoke()}
                    aria-label={`Revoke ${session.latestActivity?.browserName ?? 'Unknown'} session`}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            );
          })}
          {(!sessions || sessions.length === 0) && (
            <li className="text-sm text-muted-foreground">No active sessions found.</li>
          )}
        </ul>
      </section>

      <Separator />

      {/* Danger zone */}
      <section aria-labelledby="danger-heading">
        <h3 id="danger-heading" className="text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Deleting your account is permanent. All your data will be soft-deleted and cannot be
          recovered.
        </p>
        <div className="mt-4 rounded-lg border border-destructive/30 p-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="deleteConfirm" className="text-sm font-medium">
              Type <span className="font-mono font-bold">DELETE</span> to confirm
            </label>
            <Input
              id="deleteConfirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="max-w-xs"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteConfirm !== 'DELETE' || deleting}
            onClick={handleDeleteAccount}
          >
            {deleting ? 'Deleting…' : 'Delete My Account'}
          </Button>
        </div>
      </section>
    </div>
  );
}
