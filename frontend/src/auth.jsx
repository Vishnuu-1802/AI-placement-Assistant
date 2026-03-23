/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";
const TOKEN_KEY = "acp_auth_token";
const USER_KEY = "acp_auth_user";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(readStoredUser);
  const [initializing, setInitializing] = useState(true);

  const setSession = (nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    setToken(nextToken || "");
    setUser(nextUser || null);
  };

  const authHeaders = (providedToken = token) =>
    providedToken ? { Authorization: `Bearer ${providedToken}` } : {};

  const signup = async ({ name, email, password }) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/signup`, { name, email, password });
    setSession(data.token, data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    setSession(data.token, data.user);
    return data.user;
  };

  const logout = () => {
    setSession("", null);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const { data } = await axios.get(`${API_BASE}/api/auth/me`, {
      headers: authHeaders(),
    });
    setSession(token, data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const { data } = await axios.put(`${API_BASE}/api/auth/me`, payload, {
      headers: authHeaders(),
    });
    setSession(token, data.user);
    return data.user;
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        setSession("", null);
      } finally {
        setInitializing(false);
      }
    };

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    token,
    user,
    initializing,
    isAuthenticated: Boolean(token && user),
    signup,
    login,
    logout,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
