import { createContext, useContext, useState, useEffect } from "react";
// Pretpostavljamo da ova funkcija postoji i vraća Promise<any>
import { wpSocialLogin } from "../utils/wpSocialLogin";

// Definišemo tipove za server response
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

type WpLoginResponse = WpAuthSuccess | WpAuthError;

// Definišemo tipove za naš state i context
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

// --- KLJUČNA IZMENA ---
// Kreiramo funkciju koja eksplicitno proverava da li je odgovor uspešan.
// Sintaksa `response is WpAuthSuccess` je ono što je čini "Type Guard" funkcijom.
function isSuccessResponse(response: any): response is WpAuthSuccess {
  return response && typeof response.token === 'string' && response.token.length > 0;
}
// --- KRAJ IZMENE ---

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
      
      // Sada koristimo našu novu, pouzdanu funkciju za proveru tipa
      if (isSuccessResponse(data)) {
        // Unutar ovog bloka, TS je 100% siguran da je 'data' tipa WpAuthSuccess
        localStorage.setItem("wp_jwt", data.token);
        const userData = { id: data.user_id, email: data.email, displayname: data.displayname };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        // Unutar ovog bloka, TS je 100% siguran da 'data' mora biti WpAuthError
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
          const response = await fetch("https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/validate-token", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
