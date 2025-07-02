
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId) => {
    try {
      // First, check if user exists in users table
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', userId)
        .single();

      if (userError || !userData) {
        // If user doesn't exist, create a new user record
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              auth_id: userId,
              role: 'user', // Default role
            }
          ])
          .select('role')
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      setUserRole(userData?.role || 'user');
    } catch (error) {
      console.error('Error managing user role:', error);
      setUserRole('user'); // Default to user role on error
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    signUp: async (data) => {
      const response = await supabase.auth.signUp(data);
      if (!response.error && response.data.user) {
        await fetchUserRole(response.data.user.id);
      }
      return response;
    },
    signIn: async (data) => {
      const response = await supabase.auth.signInWithPassword(data);
      if (!response.error && response.data.user) {
        await fetchUserRole(response.data.user.id);
      }
      return response;
    },
    signInWithGoogle: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    }),
    signOut: () => supabase.auth.signOut(),
    user,
    userRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
