import { createContext, useContext, useState, useEffect } from "react";
import { wpSocialLogin } from "../utils/wpSocialLogin";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (google_id: string) => {
    const data = await wpSocialLogin(google_id);
    if (data?.token) {
      localStorage.setItem("wp_jwt", data.token);
      setUser({ email: data.email, displayname: data.displayname });
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("wp_jwt");
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, handleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
