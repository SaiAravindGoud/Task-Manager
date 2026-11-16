
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      const accessToken = localStorage.getItem("tm_access");

      if (!accessToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me/");

        if (active) {
          setUser(response.data);
        }
      } catch {
        localStorage.removeItem("tm_access");
        localStorage.removeItem("tm_refresh");

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    const handleLogout = () => {
      if (active) setUser(null);
    };

    window.addEventListener("auth:logout", handleLogout);

    return () => {
      active = false;
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login/", {
      email,
      password,
    });

    localStorage.setItem("tm_access", response.data.access);
    localStorage.setItem("tm_refresh", response.data.refresh);

    setUser(response.data.user);

    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post(
      "/auth/register/",
      formData
    );

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("tm_access");
    localStorage.removeItem("tm_refresh");
    setUser(null);
  };

  const refreshUser = async () => {
    const response = await api.get("/auth/me/");
    setUser(response.data);
    return response.data;
  };

  const changePassword = async (formData) => {
    const response = await api.post(
      "/auth/change-password/",
      formData
    );

    return response.data;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}
