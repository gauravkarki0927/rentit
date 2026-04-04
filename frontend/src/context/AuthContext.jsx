import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "./auth.context";
import { useNavigate } from "react-router-dom";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();


  // Correct API Base URL - defaults to localhost:5000
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
            }),
          );
        },
        (error) => {
          console.warn("Geolocation permission denied:", error);
          // Try to get location from localStorage as fallback
          const savedLocation = localStorage.getItem("userLocation");
          if (savedLocation) {
            setUserLocation(JSON.parse(savedLocation));
          }
        },
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
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      // Only logout if it's an authentication error (401)
      // Don't logout for other errors or verification-related issues
      if (error.response?.status === 401) {
        console.error("Authentication failed:", error);
        logout();
      } else {
        console.warn("Error fetching profile:", error);
        // Keep the user logged in even if there's a network error
        // User state will be maintained from login response
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      // Only fetch profile if we don't have user data yet
      if (!user) {
        fetchProfile();
      } else {
        // User already loaded, just mark loading as false
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

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
        console.log(res.data.user);
        localStorage.setItem("authToken", res.data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
        if (res.data.user.role === "admin") {
          return navigate("/admin", { replace: true });
        } else if (res.data.user.userType === "owner") {
          return navigate("/owner-dashboard", { replace: true });
        } else {
          return navigate("/tenant-dashboard", { replace: true });
        }
      }
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
    userType = "tenant",
    address = {},
  ) => {
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
      }

      const registrationData = {
        name,
        email,
        password,
        userType,
        address: {
          ...address,
          latitude: userLocation?.latitude,
          longitude: userLocation?.longitude,
        },
      };

      const res = await axios.post(`/auth/register`, registrationData);

      if (res.data.success) {
        return { success: true, message: res.data.message };
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

  const setAuthData = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("authToken", token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        userLocation,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
