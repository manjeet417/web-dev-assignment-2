import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => ({
    token: localStorage.getItem("token"),
    name: localStorage.getItem("name"),
  }));

  const login = (token, name) => {
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    setSession({ token, name });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    setSession({ token: null, name: null });
  };

  return <AuthContext.Provider value={{ ...session, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
