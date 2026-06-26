import { useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Upload, Trash2, Globe, Linkedin, Github, Code2 } from 'lucide-react';
import { useProfile } from '../../hooks/use-profile';
import { apiClient } from '@/lib/api-client';

export function ProfileSettings() {
  const { user: clerkUser } = useUser();
  const { data: profile, isLoading, updateProfile, updateAvatar, removeAvatar } = useProfile();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    linkedinUrl: '',
    timezone: '',
    preferredLanguage: '',
    githubUsername: '',
    leetcodeUsername: '',
    portfolioUrl: '',
    skills: [] as string[],
  });

  const [initialized, setInitialized] = useState(false);
  if (profile && !initialized) {
    setForm({
      displayName: profile.displayName,
      bio: profile.bio,
      location: profile.profile.location,
      website: profile.profile.website,
      linkedinUrl: profile.profile.linkedinUrl,
      timezone: profile.profile.timezone,
      preferredLanguage: profile.profile.preferredLanguage,
      githubUsername: profile.profile.githubUsername,
      leetcodeUsername: profile.profile.leetcodeUsername,
      portfolioUrl: profile.profile.portfolioUrl,
      skills: [...profile.profile.skills],
    });
    setInitialized(true);
  }

  const set = useCallback(
    (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const addSkill = useCallback(() => {
    const tag = skillInput.trim();
    if (!tag || form.skills.includes(tag) || form.skills.length >= 20) return;
    setForm((prev) => ({ ...prev, skills: [...prev.skills, tag] }));
    setSkillInput('');
  }, [skillInput, form.skills]);

  const removeSkill = useCallback((skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await updateAvatar.mutateAsync(res.data.data.url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        displayName: form.displayName,
        bio: form.bio,
        profile: {
          location: form.location,
          website: form.website,
          linkedinUrl: form.linkedinUrl,
          timezone: form.timezone,
          preferredLanguage: form.preferredLanguage,
          githubUsername: form.githubUsername,
          leetcodeUsername: form.leetcodeUsername,
          portfolioUrl: form.portfolioUrl,
          skills: form.skills,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const avatarSrc = profile?.avatar || clerkUser?.imageUrl;
  const initials = (profile?.displayName ?? clerkUser?.fullName ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your public profile information.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatarSrc} alt={profile?.displayName} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Upload avatar"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading…' : 'Upload photo'}
            </Button>
            {profile?.avatar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAvatar.mutate()}
                disabled={removeAvatar.isPending}
                aria-label="Remove avatar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF or WebP. Max 10 MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
            aria-hidden="true"
          />
        </div>
      </div>

      <Separator />

      {/* Core fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
          <Input
            id="displayName"
            value={form.displayName}
            onChange={(e) => set('displayName', e.target.value)}
            placeholder="Your name"
            maxLength={100}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="City, Country"
            maxLength={100}
          />
        </div>
        <div className="col-span-full space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium">Bio</label>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="A short bio about yourself"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{form.bio.length}/500</p>
        </div>
      </div>

      <Separator />

      {/* Developer links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Developer Profiles</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="githubUsername" className="text-sm font-medium flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5" /> GitHub Username
            </label>
            <Input
              id="githubUsername"
              value={form.githubUsername}
              onChange={(e) => set('githubUsername', e.target.value)}
              placeholder="octocat"
              maxLength={39}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="leetcodeUsername" className="text-sm font-medium flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5" /> LeetCode Username
            </label>
            <Input
              id="leetcodeUsername"
              value={form.leetcodeUsername}
              onChange={(e) => set('leetcodeUsername', e.target.value)}
              placeholder="johndoe"
              maxLength={50}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Social links */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Links</h3>
        <div className="grid gap-4">
          {(
            [
              { id: 'portfolioUrl', label: 'Portfolio URL', icon: Globe, placeholder: 'https://yoursite.com' },
              { id: 'website', label: 'Website', icon: Globe, placeholder: 'https://example.com' },
              { id: 'linkedinUrl', label: 'LinkedIn URL', icon: Linkedin, placeholder: 'https://linkedin.com/in/yourname' },
            ] as const
          ).map(({ id, label, icon: Icon, placeholder }) => (
            <div key={id} className="space-y-1.5">
              <label htmlFor={id} className="text-sm font-medium flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" /> {label}
              </label>
              <Input
                id={id}
                type="url"
                value={form[id]}
                onChange={(e) => set(id, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Preferences */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Preferences</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="timezone" className="text-sm font-medium">Time Zone</label>
            <Input
              id="timezone"
              value={form.timezone}
              onChange={(e) => set('timezone', e.target.value)}
              placeholder="America/New_York"
              maxLength={60}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="preferredLanguage" className="text-sm font-medium">Preferred Language</label>
            <Input
              id="preferredLanguage"
              value={form.preferredLanguage}
              onChange={(e) => set('preferredLanguage', e.target.value)}
              placeholder="English"
              maxLength={50}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Skills */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Skills</h3>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Type a skill and press Enter"
            maxLength={50}
            aria-label="Add skill"
          />
          <Button variant="outline" onClick={addSkill} type="button">
            Add
          </Button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2" role="list" aria-label="Skills">
            {form.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 pr-1" role="listitem">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-0.5 rounded-sm hover:bg-muted"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{form.skills.length}/20 skills</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
