import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { getApiConfig } from "../utils/Config";

export interface UserInfo {
  name: string;
  authenticated: boolean;
  exp: number;
}

interface IAuthContext {
  isLoading: boolean;
  isAuthenticated: boolean;

  user?: UserInfo;
  login?: () => void;
  logout?: () => void;
  refreshAuth?: () => Promise<void>;
  checkTokenExpiration?: () => boolean;
}

export const AuthContext = React.createContext<IAuthContext>({
  isLoading: false,
  isAuthenticated: false,
});

export const AuthProvider = (props: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Check localStorage for persisted auth state
    const saved = localStorage.getItem("isAuthenticated");
    return saved === "true";
  });

  const [user, setUser] = useState<UserInfo | undefined>(() => {
    // Check localStorage for persisted user data
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : undefined;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const checkTokenExpiration = () => {
    if (!user?.exp) return false;

    const now = Date.now();
    const tokenExpiryTime = user.exp * 1000; // Convert from seconds to milliseconds
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes buffer

    return now >= tokenExpiryTime - fiveMinutes;
  };

  const refreshAuth = async () => {
    console.log("Refreshing authentication...");
    await getUser();
  };

  const getUser = async () => {
    // If we're already loading, don't make another call
    if (isLoading) {
      return;
    }

    const now = Date.now();

    // Check if token is expired or about to expire (within 5 minutes)
    if (user?.exp) {
      const tokenExpiryTime = user.exp * 1000; // Convert from seconds to milliseconds
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (now >= tokenExpiryTime - fiveMinutes) {
        console.log("Token is expired or about to expire, refreshing...");
        // Token is expired or about to expire, force refresh
      } else {
        // Check if we have cached data that's still valid (within last 15 minutes)
        const lastAuthCheck = localStorage.getItem("lastAuthCheck");
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds

        if (lastAuthCheck && isAuthenticated && user && now - parseInt(lastAuthCheck) < fifteenMinutes) {
          return; // Use cached data if it's less than 15 minutes old and token is not expired
        }
      }
    }

    setIsLoading(true);
    try {
      const baseUrl = `${window.origin}${getApiConfig("bff")}`;
      const userInfo = await axios
        .get(`${baseUrl}/.auth/me`)
        .then((response) => {
          return {
            name: `${response.data.name}`,
            authenticated: true,
            exp: parseInt(response.data.exp),
          };
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            console.log("Received 401, clearing auth data...");
            // Clear all auth data but don't redirect automatically
            setIsAuthenticated(false);
            setUser(undefined);
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("user");
            localStorage.removeItem("lastAuthCheck");
            return {
              name: "",
              authenticated: false,
              exp: 0,
            };
          }
          throw error; // Re-throw non-401 errors to be handled by outer catch
        });
      const authenticated = userInfo?.authenticated ?? false;
      setIsAuthenticated(authenticated);

      // Persist authentication state
      localStorage.setItem("isAuthenticated", authenticated.toString());
      localStorage.setItem("lastAuthCheck", now.toString());

      if (authenticated && userInfo) {
        setUser(userInfo);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } else {
        setUser(undefined);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to get user info:", error);
      // On error, clear auth state
      setIsAuthenticated(false);
      setUser(undefined);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("lastAuthCheck");
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    // Only fetch user data if we haven't initialized yet
    if (!hasInitialized) {
      getUser();
    }
  }, [hasInitialized]);

  // Periodic token expiration check
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      if (checkTokenExpiration()) {
        console.log("Token expired during periodic check, refreshing...");
        refreshAuth();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const login = () => {
    window.location.href = "/.auth/login";
  };

  const logout = () => {
    // Clear all auth data before redirecting
    setIsAuthenticated(false);
    setUser(undefined);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("lastAuthCheck");
    window.location.href = "/.auth/logout";
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      login,
      logout,
      refreshAuth,
      checkTokenExpiration,
    }),
    [isAuthenticated, user, isLoading],
  );

  return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>;
};
