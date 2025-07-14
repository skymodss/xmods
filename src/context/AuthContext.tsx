import { createContext, useContext, useState, useEffect } from "react";
import { wpSocialLogin } from "../utils/wpSocialLogin";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (google_id: string) => {
    try {
      const data = await wpSocialLogin(google_id);
      if (data?.token) {
        localStorage.setItem("wp_jwt", data.token);
        setUser({ email: data.email, displayname: data.displayname });
        setIsLoggedIn(true);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error(err);
    }
  };

  const validateToken = async () => {
    const token = localStorage.getItem("wp_jwt");
    if (token) {
      try {
        const response = await fetch("/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `query ValidateToken { viewer { id email } }`,
          }),
        });
        const result = await response.json();
        if (result.data?.viewer) {
          setUser(result.data.viewer);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("wp_jwt");
        }
      } catch (error) {
        console.error("Token validation failed", error);
        setIsLoggedIn(false);
        localStorage.removeItem("wp_jwt");
      }
    }
  };

  useEffect(() => {
    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, handleLogin, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
