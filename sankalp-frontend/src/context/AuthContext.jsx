import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

import { AuthContext } from './AuthContextBase';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(!auth);
  const authCheckRequest = useRef(0);

  useEffect(() => {
    if (!auth) return undefined;

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
