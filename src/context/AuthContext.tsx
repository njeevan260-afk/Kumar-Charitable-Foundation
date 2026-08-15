import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export interface UserProfile {
  id: string;
  full_name: string | null;
  email?: string | null;
  role: 'admin' | 'student';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: 'admin' | 'student' | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'admin' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    try {
      const userEmail = currentUser?.email?.trim().toLowerCase() || null;

      // 1. Check profiles by user ID
      let profileRow: any = null;
      const { data: byIdData, error: byIdError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (byIdError) {
         // ("Supabase Error fetching profile by ID:", byIdError.message, byIdError.code);
      }

      if (byIdData) {
        profileRow = byIdData;
      }

      // 2. If not found by ID or role is not admin, check by email
      if ((!profileRow || (profileRow.role !== 'admin' && profileRow.role !== 'administrator')) && userEmail) {
        const { data: byEmailData, error: byEmailError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', userEmail)
          .maybeSingle();
          
        if (byEmailError) {
           // ("Supabase Error fetching profile by Email:", byEmailError.message, byEmailError.code);
        }

        if (byEmailData) {
          profileRow = byEmailData;
          // If the profile row in DB had a different ID (e.g. manually inserted), sync/upsert it for this userId
          if (byEmailData.id !== userId) {
            try {
              await supabase.from('profiles').upsert({
                ...byEmailData,
                id: userId,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'id' });
            } catch (syncErr) {
               // ('Could not sync profile ID:', syncErr);
            }
          }
        }
      }

      // Check metadata on the profile row if available
      let rowMeta: any = profileRow?.metadata;
      if (typeof rowMeta === 'string') {
        try {
          rowMeta = JSON.parse(rowMeta);
        } catch (e) {
          rowMeta = {};
        }
      }

      // Determine role with case-insensitivity and trim
      const profileRole = profileRow?.role ? String(profileRow.role).toLowerCase().trim() : '';
      const metaRole = rowMeta?.role ? String(rowMeta.role).toLowerCase().trim() : '';
      const userMetaRole = currentUser?.user_metadata?.role ? String(currentUser.user_metadata.role).toLowerCase().trim() : '';
      const appMetaRole = currentUser?.app_metadata?.role ? String(currentUser.app_metadata.role).toLowerCase().trim() : '';

      const isAdmin =
        profileRole === 'admin' ||
        profileRole === 'administrator' ||
        metaRole === 'admin' ||
        metaRole === 'administrator' ||
        userMetaRole === 'admin' ||
        userMetaRole === 'administrator' ||
        appMetaRole === 'admin' ||
        appMetaRole === 'administrator';

      const finalRole: 'admin' | 'student' = isAdmin ? 'admin' : 'student';

      let metaName = profileRow?.full_name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name;
      if (!metaName || metaName === 'Admin') {
         const emailPrefix = currentUser?.email?.split('@')[0];
         if (emailPrefix) {
            metaName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            if (metaName.toLowerCase().startsWith('rudrakumar')) {
              metaName = 'Rudrakumar';
            }
         } else {
            metaName = isAdmin ? 'Admin' : 'Student';
         }
      }

      const metaEmail = profileRow?.email || currentUser?.email || null;

      const userProfile: UserProfile = {
        id: userId,
        full_name: metaName,
        email: metaEmail,
        role: finalRole,
      };

      setProfile(userProfile);
      setRole(finalRole);

      // If user is admin, ensure auth user_metadata is also updated with role: 'admin'
      if (isAdmin && userMetaRole !== 'admin') {
        try {
          await supabase.auth.updateUser({
            data: { role: 'admin', full_name: metaName },
          });
        } catch (e) {
          // ignore background update error
        }
      }

      // If no profile existed at all, create a minimal initial row
      if (!profileRow) {
        try {
          await supabase.from('profiles').upsert(
            {
              id: userId,
              full_name: metaName,
              email: metaEmail,
              role: finalRole,
            },
            { onConflict: 'id' }
          );
        } catch (upsertErr) {
           // ('Could not auto-create initial profile row:', upsertErr);
        }
      }
    } catch (err) {
      const rawRole = currentUser?.user_metadata?.role || currentUser?.app_metadata?.role;
      const normalizedRoleStr = rawRole ? String(rawRole).toLowerCase().trim() : '';
      const isAdmin =
        normalizedRoleStr === 'admin' ||
        normalizedRoleStr === 'administrator';

      const fallbackRole: 'admin' | 'student' = isAdmin ? 'admin' : 'student';

      setProfile({
        id: userId,
        full_name: currentUser?.user_metadata?.full_name || (isAdmin ? 'Admin' : null),
        email: currentUser?.email || null,
        role: fallbackRole,
      });
      setRole(fallbackRole);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        await fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
