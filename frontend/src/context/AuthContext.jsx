import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./auth.context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`);
      if (res.data.success) setUser(res.data.user);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("authToken", res.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: res.data.message || "Login failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name,
    email,
    password,
    confirmPassword,
    userType = "both"
  ) => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
      }

      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        userType,
      });

      if (res.data.success) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem("authToken", res.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        return { success: true, message: "Registration successful" };
      }
      return {
        success: false,
        message: res.data.message || "Registration failed",
      };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const res = await axios.put(`${API_BASE_URL}/auth/me`, profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: res.data.message || "Update failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Profile update failed";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
