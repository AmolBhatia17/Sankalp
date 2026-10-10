import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { ensureUserDoc, subscribeUser, updateUserProfile, updateUserRole } from '../lib/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          try {
            const data = await ensureUserDoc(currentUser);
            setProfile(data);
          } catch (e) {
            console.error('Failed to load user profile:', e);
            setProfile({
              role: 'student',
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state error:', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    return subscribeUser(user.uid, (data) => {
      if (data) setProfile(data);
    });
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const setUserRole = async (nextRole) => {
    setProfile((prev) => (prev ? { ...prev, role: nextRole } : { role: nextRole }));
    if (user) {
      try {
        await updateUserRole(user.uid, nextRole);
      } catch (err) {
        console.error('Failed to update role:', err);
      }
    }
  };

  const toggleRole = () =>
    setUserRole((profile?.role || 'student') === 'instructor' ? 'student' : 'instructor');

  const saveProfile = async (data) => {
    if (!user) return;
    setProfile((prev) => ({ ...prev, ...data }));
    try {
      await updateUserProfile(user.uid, data);
      const authUpdate = {};
      if (data.displayName !== undefined) authUpdate.displayName = data.displayName;
      if (data.photoURL !== undefined) authUpdate.photoURL = data.photoURL;
      if (Object.keys(authUpdate).length) {
        await updateProfile(user, authUpdate);
        setUser(auth.currentUser);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const value = {
    user,
    profile,
    role: profile?.role || 'student',
    displayName: profile?.displayName || user?.displayName || '',
    photoURL: profile?.photoURL || user?.photoURL || '',
    loading,
    logout,
    setUserRole,
    toggleRole,
    saveProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  return (
    context || {
      user: null,
      profile: null,
      role: 'student',
      displayName: '',
      photoURL: '',
      loading: false,
      logout: () => {},
      setUserRole: () => {},
      toggleRole: () => {},
      saveProfile: () => {},
    }
  );
}
