import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => localStorage.getItem("authToken") || "";

const clearUserSessionData = () => {
  // Current dashboard analysis should not leak between users.
  localStorage.removeItem("analysis");

  // Remove any old frontend-only cached analysis data if it exists.
  localStorage.removeItem("selectedAnalysis");
  localStorage.removeItem("currentAnalysis");
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);

  const login = ({ user: loggedInUser, token: authToken }) => {
    clearUserSessionData();

    setUser(loggedInUser);
    setToken(authToken);

    localStorage.setItem("authUser", JSON.stringify(loggedInUser));
    localStorage.setItem("authToken", authToken);
  };

  const logout = () => {
    clearUserSessionData();

    setUser(null);
    setToken("");

    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
