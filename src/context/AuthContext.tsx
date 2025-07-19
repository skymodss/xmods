import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";
import { useDispatch } from "react-redux";
import { setAuthorizedUser } from "@/stores/viewer/authorizedUserSlice"; // Ključni import

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
  const hasSynced = useRef(false);
  
  // 1. Dobijamo pristup Redux dispatch funkciji
  const dispatch = useDispatch();

  const loginWithGoogle = () => {
    signIn("google");
  };

  const logout = () => {
    localStorage.removeItem("wp_jwt");
    document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
    setIsLoggedIn(false);
    hasSynced.current = false;
    
    // 2. Kada se odjavimo, obaveštavamo i Redux
    dispatch(setAuthorizedUser({ isAuthenticated: false, user: null, isReady: true }));
    signOut({ redirect: false });
  };

  useEffect(() => {
    const resolveAuth = async () => {
      if (status === "loading") {
        setIsLoading(true);
        return;
      }

      if (status === "authenticated") {
        if (!isLoggedIn && !hasSynced.current) {
          hasSynced.current = true;

          const google_id = (session.user as any)?.sub;
          const email = session.user?.email;
          const display_name = session.user?.name;

          if (google_id && email && display_name) {
            try {
              const data = await wpSocialLogin(google_id, email, display_name);
              if (isSuccessResponse(data)) {
                localStorage.setItem("wp_jwt", data.token);
                document.cookie = `wp_jwt=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
                
                const wpUser = { id: data.user_id, email: data.email, displayname: data.displayname };
                setUser(wpUser);
                setIsLoggedIn(true);

                // 3. KONAČNO REŠENJE: Nakon uspešnog WP logina, šaljemo podatke Reduxu!
                dispatch(setAuthorizedUser({ 
                  isAuthenticated: true, 
                  user: {
                      databaseId: wpUser.id,
                      name: wpUser.displayname,
                      email: wpUser.email,
                      // ... dodajte ostala polja ako su potrebna temi
                  },
                  isReady: true 
                }));

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
      }
      
      setIsLoading(false);
    };

    resolveAuth();
  }, [status, session, isLoggedIn, dispatch]); // Dodajemo dispatch u dependency array

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
