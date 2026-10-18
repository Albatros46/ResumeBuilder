import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, TOKEN_KEY } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authApi
      .profile()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const applySession = useCallback((data) => {
    if (data?.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      const { token, ...profile } = data;
      setUser(profile);
    }
    return data;
  }, []);

  const login = useCallback((email, password) => authApi.login({ email, password }).then(applySession), [applySession]);
  const register = useCallback((body) => authApi.register(body).then(applySession), [applySession]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
