import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, CheckCircle2, Mail, Save, Trash2, UserRound } from 'lucide-react';
import { UserAvatar } from '../components/auth/UserAvatar';
import { useAuth } from '../lib/auth-context';
import { cn } from '../lib/utils';
import { getProfileAvatar, getProfileName } from '../lib/profile';

export function SettingsPage({ isDarkMode }: { isDarkMode: boolean }) {
  const { user, updateProfile } = useAuth();
  const currentName = getProfileName(user);
  const currentAvatar = getProfileAvatar(user);
  const [fullName, setFullName] = useState(currentName);
  const [avatarFile, setAvatarFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string }>();

  useEffect(() => setFullName(currentName), [currentName]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (!user) return null;

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Choose a valid image file.' }); return; }
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: 'error', text: 'Profile pictures must be 5 MB or smaller.' }); return; }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(file); setPreviewUrl(URL.createObjectURL(file)); setRemoveAvatar(false); setMessage(undefined);
  };

  const handleRemoveAvatar = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setAvatarFile(undefined); setPreviewUrl(undefined); setRemoveAvatar(true); setMessage(undefined);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) { setMessage({ type: 'error', text: 'Display name must contain at least 2 characters.' }); return; }
    if (trimmedName.length > 60) { setMessage({ type: 'error', text: 'Display name must contain 60 characters or fewer.' }); return; }
    setSaving(true); setMessage(undefined);
    try {
      await updateProfile({ fullName: trimmedName, avatarFile, removeAvatar });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setAvatarFile(undefined); setPreviewUrl(undefined); setRemoveAvatar(false);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not update your profile.' });
    } finally {
      setSaving(false);
    }
  };

  const displayedAvatar = removeAvatar ? null : previewUrl || currentAvatar;
  const inputClass = cn('w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#3B82F6]', isDarkMode ? 'border-white/10 bg-white/5 text-white' : 'border-neutral-200 bg-white text-neutral-900');
  const cardClass = cn('rounded-2xl border p-6', isDarkMode ? 'border-white/10 bg-[#111318]' : 'border-neutral-200 bg-white');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <h2 className="text-xl font-bold">Profile settings</h2>
        <p className={cn('mt-1 text-sm', isDarkMode ? 'text-white/55' : 'text-neutral-500')}>Manage how your account appears in AfterCredits.</p>
      </div>

      <form onSubmit={handleSubmit} className={cardClass}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <UserAvatar name={fullName || user.email || 'User'} src={displayedAvatar} size="lg" />
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Profile picture</h3>
              <p className={cn('text-xs', isDarkMode ? 'text-white/50' : 'text-neutral-500')}>JPG, PNG, GIF, or WebP. Maximum 5 MB.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-semibold text-white hover:bg-[#2563EB]">
                <Camera className="h-4 w-4" /> Choose image
                <input type="file" accept="image/*" onChange={handleAvatar} className="sr-only" />
              </label>
              {(displayedAvatar || avatarFile) && (
                <button type="button" onClick={handleRemoveAvatar} className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold', isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-neutral-200 hover:bg-neutral-50')}>
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-medium"><UserRound className="h-4 w-4" /> Display name</label>
          <input id="profile-name" value={fullName} onChange={event => setFullName(event.target.value)} maxLength={60} autoComplete="name" className={inputClass} />
          <p className={cn('text-xs', isDarkMode ? 'text-white/45' : 'text-neutral-500')}>{fullName.length}/60 characters</p>
        </div>

        {message && (
          <div role="status" aria-live="polite" className={cn('mt-5 rounded-lg border px-3 py-2 text-sm', message.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-500' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
            {message.type === 'success' && <CheckCircle2 className="mr-2 inline h-4 w-4" />}{message.text}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>

      <section className={cardClass}>
        <h3 className="font-semibold">Account information</h3>
        <div className="mt-5">
          <div><p className={cn('flex items-center gap-2 text-xs', isDarkMode ? 'text-white/45' : 'text-neutral-500')}><Mail className="h-4 w-4" /> Account email</p><p className="mt-1 truncate text-sm font-medium">{user.email}</p></div>
        </div>
        <p className={cn('mt-5 text-xs', isDarkMode ? 'text-white/40' : 'text-neutral-400')}>Your account email is managed by Google and cannot be changed here.</p>
      </section>
    </div>
  );
}
