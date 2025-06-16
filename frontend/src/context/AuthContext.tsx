import React, { useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";
import AuthContext, { AuthContextType } from "./AuthContextDef";

// Define the User interface locally as well for the useState hook
interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);
  // Configure axios defaults
  useEffect(() => {
    // Set up axios defaults
    axios.defaults.withCredentials = true;

    // Set up axios interceptor to handle errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized access detected, clearing token");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor on unmount
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");

      if (storedToken) {
        setToken(storedToken);
        try {
          // Configure axios with the token
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
          console.log(
            "Auth token set in axios headers:",
            storedToken.substring(0, 15) + "..."
          );

          // Fetch current user info
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("User data retrieved:", response.data);
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user data", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log(
        "Sending login request to:",
        `${import.meta.env.VITE_API_URL || "http://localhost:8900"}/auth/token`
      );

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8900";
      const response = await axios.post(
        `${apiUrl}/auth/token`,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
        }
      );

      console.log("Login response received:", response.status);

      const { access_token } = response.data;
      if (!access_token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", access_token);
      setToken(access_token);

      console.log("Token stored, configuring axios headers");

      // Configure axios with the new token
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      try {
        // Fetch current user info
        console.log("Fetching user data with new token");
        const userResponse = await axios.get(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          withCredentials: true,
        });

        console.log("User data received:", userResponse.status);
        setUser(userResponse.data);
      } catch (userError) {
        console.error("Error fetching user data after login", userError);
        // Still consider login successful even if fetching user data fails
        // We'll let the user continue but they might see limited functionality
      }
    } catch (error) {
      console.error("Login failed", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(
            "Server response:",
            error.response.status,
            error.response.data
          );
          if (error.response.status === 401) {
            throw new Error("Invalid email or password. Please try again.");
          } else {
            throw new Error(
              `Server error (${error.response.status}). Please try again.`
            );
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          throw new Error(
            "No response from server. Please check your connection."
          );
        } else {
          throw new Error(`Network error: ${error.message}`);
        }
      } else {
        throw error; // Rethrow the original error if it's not an axios error
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    try {
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        email,
        password,
        full_name: fullName,
      });

      // After registration, log the user in
      await login(email, password);
    } catch (error) {
      console.error("Registration failed", error);
      throw new Error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
