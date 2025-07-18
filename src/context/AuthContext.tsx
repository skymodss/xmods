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
  return response && typeof response.message === 'string' && typeof response.code === 'string';
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();
  const hasSynced = useRef(false);

  const loginWithGoogle = () => {
    hasSynced.current = false;
    signIn("google");
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsLoggedIn(false);
    hasSynced.current = false;
    signOut({ redirect: false });
  };

  useEffect(() => {
    const resolveAuth = async () => {
      const localToken = localStorage.getItem("wp_jwt");
      if (localToken) {
        try {
          const response = await fetch("https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/validate-token", {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localToken}` },
          });
          if (response.ok) {
            const result = await response.json();
            setUser(result.data.viewer);
            setIsLoggedIn(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Local token validation failed, proceeding...", e);
        }
      }

      if (status === "loading") {
        return;
      }

      if (status === "authenticated") {
        if (session && !hasSynced.current) {
          hasSynced.current = true;

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
                setError((data as WpAuthError).message || "WP Sync failed.");
                logout();
              } else {
                setError("WP Sync failed.");
                logout();
              }
            } catch (e: any) {
              setError(e.message || "An error occurred during WP sync.");
              logout();
            }
          }
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("wp_jwt");
      }

      setIsLoading(false);
    };

    resolveAuth();
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
