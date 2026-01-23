import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./auth.context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // Correct API Base URL - defaults to localhost:5000
  const API_BASE_URL =
    import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000/api";

  // Setup axios instance with correct base URL and CORS
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }, [API_BASE_URL]);

  // Get user's geolocation on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          localStorage.setItem(
            "userLocation",
            JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          );
        },
        (error) => {
          console.warn("Geolocation permission denied:", error);
          // Try to get location from localStorage as fallback
          const savedLocation = localStorage.getItem("userLocation");
          if (savedLocation) {
            setUserLocation(JSON.parse(savedLocation));
          }
        }
      );
    }
  }, []);

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      const res = await axios.post(`/auth/login`, {
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
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed - Please check your connection";
      console.error("Login error:", error);
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
    userType = "both",
    address = {}
  ) => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
      }

      // Include user location in registration
      const registrationData = {
        name,
        email,
        password,
        userType,
        address: {
          ...address,
          // Add geolocation if available
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
        },
      };

      const res = await axios.post(`/auth/register`, registrationData);

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
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed - Please check your connection";
      console.error("Register error:", error);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const res = await axios.put(`/auth/me`, profileData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, message: "Profile updated successfully" };
      }
      return { success: false, message: res.data.message || "Update failed" };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Profile update failed";
      console.error("Update profile error:", error);
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
        userLocation,
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
