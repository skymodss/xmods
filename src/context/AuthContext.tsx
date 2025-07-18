import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";

// Tipovi ostaju isti
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
  const syncLock = useRef(false);

  const loginWithGoogle = () => {
    signIn("google");
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsLoggedIn(false);
    setError(null);
    syncLock.current = false;
    signOut({ redirect: false });
  };

  useEffect(() => {
    const processAuth = async () => {
      if (status === "loading") {
        setIsLoading(true);
        return;
      }

      if (status === "authenticated") {
        if (isLoggedIn) {
          setIsLoading(false);
          return;
        }
        if (syncLock.current) return;

        try {
          syncLock.current = true;
          setIsLoading(true);

          const google_id = (session.user as any)?.sub;
          const email = session.user?.email;
          const display_name = session.user?.name;

          if (google_id && email && display_name) {
            const data: WpLoginResponse = await wpSocialLogin(google_id, email, display_name);
            if (isSuccessResponse(data)) {
              localStorage.setItem("wp_jwt", data.token);
              document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
              setUser({ id: data.user_id, email: data.email, displayname: data.displayname });
              setIsLoggedIn(true);
            } else if (isErrorResponse(data)) {
              setError((data as WpAuthError).message || "Failed to sync with WordPress.");
              logout();
            } else {
              setError("Failed to sync with WordPress.");
              logout();
            }
          }
        } catch (e: any) {
          setError(e.message || "An error occurred during sync.");
          logout();
        } finally {
          syncLock.current = false;
          setIsLoading(false);
        }
        return;
      }

      if (isLoggedIn) {
        logout();
      }
      setIsLoading(false);
    };

    processAuth();
  }, [status, session, isLoggedIn]);

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
