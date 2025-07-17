import { createContext, useContext, useState, useEffect } from "react";
import { wpSocialLogin } from "../utils/wpSocialLogin";

// Definišemo tipove za oba moguća odgovora sa servera
interface WpAuthSuccess {
  token: string;
  user_id: number;
  email: string;
  displayname: string;
}

interface WpAuthError {
  code: string;
  message: string;
  data?: {
    status?: number;
  };
}

// Tip za odgovor je ili jedno ili drugo
type WpLoginResponse = WpAuthSuccess | WpAuthError;

// Definišemo tipove za korisnika i ceo kontekst
interface User {
  id: number;
  email: string;
  displayname: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  handleLogin: (googleId: string, email: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = async (googleId: string, email: string, displayName: string) => {
    try {
      setError(null);
      const data: WpLoginResponse = await wpSocialLogin(googleId, email, displayName);
      
      // Type guard: Ako objekat ima 'token' properti, onda je to WpAuthSuccess
      if ('token' in data && data.token) {
        localStorage.setItem("wp_jwt", data.token);
        const userData = { id: data.user_id, email: data.email, displayname: data.displayname };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        // --- KLJUČNA IZMENA ---
        // U ovom bloku, TypeScript SADA ZNA da je 'data' tipa WpAuthError.
        // Nije potrebna nikakva konverzija (as WpAuthError).
        const errorMessage = data.message || "Login failed. Please try again.";
        setError(errorMessage);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    setUser(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const validateTokenOnLoad = async () => {
      const token = localStorage.getItem("wp_jwt");
      if (token) {
        try {
          const response = await fetch("/wp-json/custom/v1/validate-token", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          const result = await response.json();
          if (response.ok && result.data?.viewer) {
            setUser(result.data.viewer);
            setIsLoggedIn(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token validation request failed", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    validateTokenOnLoad();
  }, []);

  const value = { user, isLoggedIn, isLoading, error, handleLogin, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
