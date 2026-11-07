import { useContext } from 'react';
import { AuthContext } from './AuthContextBase';

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
