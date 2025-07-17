import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react"; // Importujemo i signIn/signOut
import { wpSocialLogin } from "../utils/wpSocialLogin";

// Tipovi ostaju isti kao u prethodnom rešenju
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

// Proširujemo AuthContextType sa novim funkcijama
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => void; // Funkcija koja pokreće ceo proces
  logout: () => void;
}

// Type guard funkcija je i dalje potrebna i ispravna
function isSuccessResponse(response: any): response is WpAuthSuccess {
  return response && typeof response.token === 'string' && response.token.length > 0;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Stanja iz našeg custom sistema
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Koristimo next-auth hook da osluškujemo Google login
  const { data: session, status } = useSession();
  const isSyncing = useRef(false); // Sprečava duple pozive

  // 1. FUNKCIJA KOJU ĆE POZIVATI DUGME "LOGIN WITH GOOGLE"
  const loginWithGoogle = () => {
    // Pokreće NextAuth Google popup
    signIn("google");
  };

  // 2. FUNKCIJA ZA ODJAVU KOJA ČISTI OBA SISTEMA
  const logout = () => {
    localStorage.removeItem("wp_jwt");
    setUser(null);
    setIsLoggedIn(false);
    signOut({ redirect: false }); // Odjavljuje i NextAuth sesiju u pozadini
  };

  // 3. EFEKAT KOJI RADI ISTO ŠTO I WordpressAuthSync
  useEffect(() => {
    // Funkcija za validaciju našeg custom tokena pri učitavanju stranice
    const validateTokenOnLoad = async () => {
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
            return true; // Vraćamo true ako je token validan
          }
        } catch (error) {
          console.error("Token validation failed", error);
        }
      }
      return false; // Token ne postoji ili nije validan
    };

    // Glavna logika efekta
    const syncAndValidate = async () => {
      setIsLoading(true);
      setError(null);
      
      const isTokenValid = await validateTokenOnLoad();

      // Ako je NextAuth prijavljen, a naš custom token NIJE validan (ili ne postoji)
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
              setUser({ id: data.user_id, email: data.email, displayname: data.displayname });
              setIsLoggedIn(true);
            } else {
              setError(data.message || "Login to WP backend failed.");
              logout(); // Ako WP login ne uspe, odjavi sve
            }
          } catch (e: any) {
            setError(e.message || "An error occurred during WP login.");
            logout();
          } finally {
            isSyncing.current = false;
          }
        }
      } else if (status === "unauthenticated" && isTokenValid) {
        // Ako je korisnik odjavljen sa NextAuth-a, a naš token još postoji, odjavi ga
        logout();
      }

      setIsLoading(false);
    };

    syncAndValidate();

  }, [status, session]); // Ovaj efekat zavisi od next-auth sesije


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
