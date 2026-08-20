import type { User } from '@supabase/supabase-js';

export const getProfileName = (user?: User | null) =>
  user?.user_metadata.display_name ||
  user?.user_metadata.full_name ||
  user?.user_metadata.name ||
  user?.email ||
  'User';

export const getProfileAvatar = (user?: User | null): string | null => {
  if (!user || user.user_metadata.custom_avatar_removed === true) return null;
  return user.user_metadata.custom_avatar_url || user.user_metadata.avatar_url || user.user_metadata.picture || null;
};
