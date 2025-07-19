import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";

// Tipovi ostaju nepromenjeni
interface WpAuthSuccess {
  token: string;
  user_id: number;
  email: string;
  displayname: string;
}
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();
  const effectRunCount = useRef(0);
  const hasSynced = useRef(false);

  const loginWithGoogle = () => {
    signIn("google");
  };

  const logout = () => {
    console.log("LOGOUT: Clearing all session data.");
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsLoggedIn(false);
    hasSynced.current = false;
    signOut({ redirect: false });
  };

  useEffect(() => {
    effectRunCount.current += 1;
    console.log(`%c--- AuthContext useEffect: Run #${effectRunCount.current} ---`, 'background: #222; color: #bada55');
    console.log(`[Run #${effectRunCount.current}] Status from useSession:`, status);
    console.log(`[Run #${effectRunCount.current}] Current isLoggedIn state:`, isLoggedIn);
    console.log(`[Run #${effectRunCount.current}] Sync lock (hasSynced):`, hasSynced.current);

    const resolveAuth = async () => {
      if (status === "loading") {
        console.log(`[Run #${effectRunCount.current}] Decision: Status is 'loading'. Waiting...`);
        setIsLoading(true);
        return;
      }

      if (status === "authenticated") {
        console.log(`[Run #${effectRunCount.current}] Decision: Status is 'authenticated'.`);
        if (!isLoggedIn && !hasSynced.current) {
          console.log(`[Run #${effectRunCount.current}] Action: Needs sync. Setting sync lock to true and starting WP login.`);
          hasSynced.current = true; 

          const google_id = (session.user as any)?.sub;
          const email = session.user?.email;
          const display_name = session.user?.name;

          if (google_id && email && display_name) {
            try {
              console.log(`[Run #${effectRunCount.current}] Calling wpSocialLogin with:`, { google_id, email, display_name });
              const data = await wpSocialLogin(google_id, email, display_name);
              console.log(`[Run #${effectRunCount.current}] Received data from wpSocialLogin:`, data);
              
              if (isSuccessResponse(data)) {
                console.log(`%c[Run #${effectRunCount.current}] SUCCESS: WP sync successful. Setting user.`, 'color: green');
                localStorage.setItem("wp_jwt", data.token);
                document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
                setUser({ id: data.user_id, email: data.email, displayname: data.displayname });
                setIsLoggedIn(true);
              } else {
                console.error(`%c[Run #${effectRunCount.current}] ERROR: WP sync failed. Response was not successful.`, 'color: red', data);
                setError("Failed to sync with WordPress.");
                logout();
              }
            } catch (e: any) {
              console.error(`%c[Run #${effectRunCount.current}] CATCH ERROR: An exception occurred during wpSocialLogin.`, 'color: red', e);
              setError(e.message || "An error occurred during sync.");
              logout();
            }
          } else {
             console.error(`%c[Run #${effectRunCount.current}] ERROR: Missing Google session data.`, 'color: red', session);
          }
        } else {
            console.log(`[Run #${effectRunCount.current}] Action: No sync needed. Already logged in or sync in progress.`);
        }
      } 
      
      if (status === "unauthenticated") {
        console.log(`[Run #${effectRunCount.current}] Decision: Status is 'unauthenticated'.`);
        if (isLoggedIn) {
          console.log(`[Run #${effectRunCount.current}] Action: Mismatch found. Logging out.`);
          logout();
        }
      }
      
      console.log(`[Run #${effectRunCount.current}] Reached end of logic. Setting isLoading to false.`);
      setIsLoading(false);
    };

    resolveAuth();
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
