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
            // Promenjen URL i uklonjen GraphQL body
            const response = await fetch("/wp-json/custom/v1/validate-token", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // Body više nije potreban jer se token šalje u headeru
            });

            const result = await response.json();

            // Proveravamo da li je status OK (200) i da li postoje podaci
            if (response.ok && result.data?.viewer) {
                setUser(result.data.viewer);
                setIsLoggedIn(true);
            } else {
                // Ako server vrati grešku (npr. 403), result će sadržati poruku o grešci
                console.error("Token validation failed on server:", result.message);
                setIsLoggedIn(false);
                localStorage.removeItem("wp_jwt");
            }
        } catch (error) {
            console.error("Token validation request failed", error);
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
