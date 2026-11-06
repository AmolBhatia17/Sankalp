import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const authCheckRequest = useRef(0);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setAdminCheckComplete(true);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        const requestId = ++authCheckRequest.current;
        setUser(currentUser);
        setIsAdmin(false);
        setAdminCheckComplete(false);

        if (!currentUser) {
          setIsAdmin(false);
          setAdminCheckComplete(true);
          setLoading(false);
          return;
        }

        try {
          const tokenResult = await currentUser.getIdTokenResult(true);
          if (requestId !== authCheckRequest.current) return;
          setIsAdmin(tokenResult.claims.admin === true);
        } catch (error) {
          if (requestId !== authCheckRequest.current) return;
          console.error('Admin claim verification failed:', error);
          setIsAdmin(false);
        } finally {
          if (requestId === authCheckRequest.current) {
            setAdminCheckComplete(true);
            setLoading(false);
          }
        }
      },
      (error) => {
        ++authCheckRequest.current;
        console.error('Firebase Auth state error:', error);
        setUser(null);
        setIsAdmin(false);
        setAdminCheckComplete(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) {
      setUser(null);
      setIsAdmin(false);
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, adminCheckComplete, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  return context || {
    user: null,
    loading: false,
    isAdmin: false,
    adminCheckComplete: true,
    logout: async () => {},
  };
}
