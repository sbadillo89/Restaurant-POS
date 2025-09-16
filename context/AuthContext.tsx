/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import type { User, AuthContextType } from '../types';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          // User is logged in, fetch their profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, username, role')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            setError("Failed to load user profile.");
            setCurrentUser(null);
          } else {
            setCurrentUser(profile as User);
          }
        } else {
          // User is logged out
          setCurrentUser(null);
        }
      } catch (e: any) {
        console.error("Critical error in onAuthStateChange:", e);
        setError("An unexpected error occurred during session validation.");
        setCurrentUser(null);
      } finally {
        // This block ensures that the loading state is always resolved,
        // preventing the app from getting stuck on the loading screen.
        setIsLoading(false);
      }
    });

    return () => {
      // Cleanup subscription on unmount
      subscription?.unsubscribe();
    };
  }, []);


  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      // apiService.login will trigger onAuthStateChange on success
      await apiService.login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(false); // Reset loading state on failure
      // Do not re-throw the error; the component will react to context state changes.
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    console.log('click on logout')
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error);
        setError('Failed to log out.');
      }
    } catch (e) {
      console.error('Unexpected error during sign out:', e);
      setError('An unexpected error occurred during logout.');
    } finally {
      // This guarantees the client-side state is cleared, making the
      // logout action immediate and reliable for the user, regardless
      // of the API call's outcome.
      setCurrentUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};