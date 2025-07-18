import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";

// --- Svi tipovi i type guard funkcija ostaju isti ---
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
function isSuccessResponse(response: any): response is WpAuthSuccess {
  return response && typeof response.token === 'string' && response.token.length > 0;
}
function isErrorResponse(response: any): response is WpAuthError {
  return response && typeof response.message === 'string';
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
    const validateLocalToken = async (): Promise<boolean> => {
      const localToken = localStorage.getItem("wp_jwt");
      if (!localToken) return false;

      try {
        const response = await fetch("https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/validate-token", {
          method: "POST",
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localToken}` },
        });
        const result = await response.json();
        if (response.ok && result.data?.viewer) {
          setUser(result.data.viewer);
          setIsLoggedIn(true);
          return true;
        }
      } catch (e) {
        console.error("Local token validation failed", e);
      }
      localStorage.removeItem("wp_jwt");
      return false;
    };

    const syncNextAuthSession = async () => {
      if (isSyncing.current || !session) return;
      isSyncing.current = true;

      const google_id = (session.user as any)?.sub;
      const email = session.user?.email;
      const display_name = session.user?.name;

      if (google_id && email && display_name) {
        try {
          const data: WpLoginResponse = await wpSocialLogin(google_id, email, display_name);
          if (isSuccessResponse(data)) {
            localStorage.setItem("wp_jwt", data.token);
            document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
            setUser({ id: data.user_id, email: data.email, displayname: data.displayname });
            setIsLoggedIn(true);
          } else if (isErrorResponse(data)) {
            setError(data.message || "WP Sync failed.");
            logout(); // Ako WP sinhronizacija ne uspe, odjavi sve
          } else {
            setError("WP Sync failed.");
            logout();
          }
        } catch (e: any) {
          setError(e.message || "An error occurred during WP sync.");
          logout();
        }
      }
      isSyncing.current = false;
    };

    const handleAuthStateChange = async () => {
      if (status === "authenticated") {
        const localTokenIsValid = await validateLocalToken();
        if (!localTokenIsValid) {
          await syncNextAuthSession();
        }
        setIsLoading(false);
      } else if (status === "unauthenticated") {
        await validateLocalToken();
        setIsLoading(false);
      }
    };

    handleAuthStateChange();

  }, [status]);

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
