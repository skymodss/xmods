import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "../utils/wpSocialLogin";

// Tipovi ostaju nepromenjeni
interface WpAuthSuccess {
  token: string;
  user_id: number;
  email: string;
  displayname: string;
}
interface WpAuthError {
  code: string;
  message: string;
}
type WpLoginResponse = WpAuthSuccess | WpAuthError;
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
  loginWithGoogle: () => void;
  logout: () => void;
}

// Type guard funkcija ostaje nepromenjena
function isSuccessResponse(response: any): response is WpAuthSuccess {
  return response && typeof response.token === 'string' && response.token.length > 0;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();
  const isSyncing = useRef(false);

  const loginWithGoogle = () => {
    signIn("google");
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsLoggedIn(false);
    signOut({ redirect: false });
  };

  useEffect(() => {
    // --- KLJUČNA IZMENA ---
    // Funkcija sada eksplicitno vraća Promise<boolean>
    const validateTokenOnLoad = async (): Promise<boolean> => {
      const token = localStorage.getItem("wp_jwt");
      if (token) {
        try {
          const response = await fetch("/wp-json/custom/v1/validate-token", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          });
          const result = await response.json();
          if (response.ok && result.data?.viewer) {
            setUser(result.data.viewer);
            setIsLoggedIn(true);
            return true; // Vraćamo TRUE ako je token validan
          }
        } catch (error) {
          console.error("Token validation failed", error);
          // Padamo dole do `return false`
        }
      }
      // Ako token ne postoji ili nije validan, vraćamo FALSE
      return false;
    };
    // --- KRAJ IZMENE ---

    const syncAndValidate = async () => {
      setIsLoading(true);
      setError(null);
      
      // `isTokenValid` je sada ispravno tipa `boolean`
      const isTokenValid = await validateTokenOnLoad();

      if (status === "authenticated" && !isTokenValid && !isSyncing.current) {
        isSyncing.current = true;
        
        const google_id = (session?.user as any)?.sub;
        const email = session?.user?.email;
        const display_name = session?.user?.name;

        if (google_id && email && display_name) {
          try {
            const data: WpLoginResponse = await wpSocialLogin(google_id, email, display_name);
            if (isSuccessResponse(data)) {
              localStorage.setItem("wp_jwt", data.token);
              document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
              setUser({ id: data.user_id, email: data.email, displayname: data.displayname });
              setIsLoggedIn(true);
            } else {
              // --- ISPRAVKA GREŠKE ---
              // TypeScript ovde ne prepoznaje automatski tip, pa eksplicitno kastujemo:
              const errorMessage = (data as WpAuthError).message || "Login to WP backend failed.";
              setError(errorMessage);
              logout();
            }
          } catch (e: any) {
            setError(e.message || "An error occurred during WP login.");
            logout();
          } finally {
            isSyncing.current = false;
          }
        }
      } else if (status === "unauthenticated" && isTokenValid) {
        logout();
      }

      setIsLoading(false);
    };

    syncAndValidate();
  }, [status, session]);

  const value = { user, isLoggedIn, isLoading, error, loginWithGoogle, logout };

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
