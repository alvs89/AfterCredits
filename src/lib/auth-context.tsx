import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import { getProfileAvatar } from './profile';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authPending: boolean;
  authError: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  updateProfile: (input: { fullName: string; avatarFile?: File; removeAvatar?: boolean }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, authPending: false, authError: null,
  signIn: async () => {}, logOut: async () => {}, getToken: async () => null, updateProfile: async () => {},
});

const managedAvatarPath = (url?: string | null) => {
  const marker = '/storage/v1/object/public/media-posters/';
  const path = url?.split(marker)[1]?.split('?')[0];
  return path ? decodeURIComponent(path) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
      setLoading(false);
      return;
    }
    supabase.auth.getUser().then(({ data, error }) => {
      setUser(data.user);
      if (error) setAuthError(error.message);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    if (!isSupabaseConfigured) {
      setAuthError('Supabase is not configured yet. Add its project URL and publishable key to your environment variables.');
      return;
    }
    setAuthPending(true); setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } },
    });
    if (error) { setAuthError(error.message); setAuthPending(false); }
  };

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
  };

  const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token ?? null;

  const updateProfile = async ({ fullName, avatarFile, removeAvatar }: { fullName: string; avatarFile?: File; removeAvatar?: boolean }) => {
    if (!user) throw new Error('You must be signed in to update your profile.');

    let avatarUrl = getProfileAvatar(user);
    let uploadedPath: string | undefined;

    if (avatarFile) {
      uploadedPath = `${user.id}/profile/${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from('media-posters')
        .upload(uploadedPath, avatarFile, { contentType: avatarFile.type, cacheControl: '3600' });
      if (uploadError) throw uploadError;
      avatarUrl = supabase.storage.from('media-posters').getPublicUrl(uploadedPath).data.publicUrl;
    } else if (removeAvatar) {
      avatarUrl = null;
    }

    const profileMetadata: Record<string, unknown> = { display_name: fullName.trim() };
    if (avatarFile) {
      profileMetadata.custom_avatar_url = avatarUrl;
      profileMetadata.custom_avatar_removed = false;
    } else if (removeAvatar) {
      profileMetadata.custom_avatar_url = null;
      profileMetadata.custom_avatar_removed = true;
    }
    const { data, error } = await supabase.auth.updateUser({ data: profileMetadata });
    if (error) {
      if (uploadedPath) await supabase.storage.from('media-posters').remove([uploadedPath]);
      throw error;
    }
    const previousPath = managedAvatarPath(getProfileAvatar(user));
    if (previousPath && previousPath !== uploadedPath) await supabase.storage.from('media-posters').remove([previousPath]);
    setUser(data.user);
  };

  return <AuthContext.Provider value={{ user, loading, authPending, authError, signIn, logOut, getToken, updateProfile }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
