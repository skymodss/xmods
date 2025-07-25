import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";
import { useDispatch } from "react-redux";
import { updateAuthorizedUser, updateViewer } from "@/stores/viewer/viewerSlice";

// Tipovi i interfejsi
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

const REFRESH_FLAG_KEY = 'hasRefreshedAfterLogin';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: session, status } = useSession();
  const hasSynced = useRef(false);
  
  const dispatch = useDispatch();

  const loginWithGoogle = () => {
    signIn("google");
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.removeItem(REFRESH_FLAG_KEY);
    setUser(null);
    setIsLoggedIn(false);
    hasSynced.current = false;
    
    dispatch(updateAuthorizedUser({ isAuthenticated: false, isReady: true, loginUrl: null }));
    dispatch(updateViewer(null));
    signOut({ redirect: false });
  };

  useEffect(() => {
    const resolveAuth = async () => {
      if (status === "loading") {
        setIsLoading(true);
        return;
      }
      
      const hasRefreshed = sessionStorage.getItem(REFRESH_FLAG_KEY) === 'true';

      if (status === "authenticated") {
        if (!isLoggedIn && !hasSynced.current && !hasRefreshed) {
          hasSynced.current = true;

          const google_id = (session.user as any)?.sub;
          const email = session.user?.email;
          const display_name = session.user?.name;
          const avatar_url = session.user?.image; // Uzimamo sliku iz sesije

          if (google_id && email && display_name && avatar_url) {
            try {
              // Prosleđujemo sve podatke, uključujući i URL avatara
              const data = await wpSocialLogin(google_id, email, display_name, avatar_url);

              if (isSuccessResponse(data)) {
                localStorage.setItem("wp_jwt", data.token);
                document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
                
                const wpUser = { id: data.user_id, email: data.email, displayname: data.displayname };
                setUser(wpUser);
                setIsLoggedIn(true);

                dispatch(updateAuthorizedUser({ 
                  isAuthenticated: true, 
                  isReady: true,
                  loginUrl: null
                }));

                dispatch(updateViewer({
                  databaseId: wpUser.id,
                  name: wpUser.displayname,
                  email: wpUser.email,
                }));

                sessionStorage.setItem(REFRESH_FLAG_KEY, 'true');
                window.location.href = "/";

              } else {
                setError("Failed to sync with WordPress.");
                logout();
              }
            } catch (e: any) {
              setError(e.message || "An error occurred during sync.");
              logout();
            }
          }
        }
      } else if (status === "unauthenticated") {
        if (isLoggedIn) {
          logout();
        }
        sessionStorage.removeItem(REFRESH_FLAG_KEY);
      }
      
      setIsLoading(false);
    };

    resolveAuth();
  }, [status, session, isLoggedIn, dispatch]);

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
