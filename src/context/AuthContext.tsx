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
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', userId)
        .maybeSingle();

      if (data && data.role) {
        setProfile(data);
        setRole(data.role);
        return;
      }

      // Check user metadata or app metadata
      const metaRole = (currentUser?.user_metadata?.role || currentUser?.app_metadata?.role) as 'admin' | 'student' | undefined;
      const metaName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || null;
      const metaEmail = currentUser?.email || null;
      const finalRole: 'admin' | 'student' = metaRole === 'admin' ? 'admin' : 'student';

      const userProfile: UserProfile = {
        id: userId,
        full_name: metaName,
        email: metaEmail,
        role: finalRole,
      };

      setProfile(userProfile);
      setRole(finalRole);

      // Proactively create/upsert profile row into profiles table if missing
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
        console.warn('Could not auto-create profile row in profiles table:', upsertErr);
      }
    } catch (err) {
      const metaRole = (currentUser?.user_metadata?.role || currentUser?.app_metadata?.role) as 'admin' | 'student' | undefined;
      const fallbackRole: 'admin' | 'student' = metaRole === 'admin' ? 'admin' : 'student';
      setProfile({
        id: userId,
        full_name: currentUser?.user_metadata?.full_name || null,
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
