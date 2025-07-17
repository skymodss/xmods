import { createContext, useContext, useState, useEffect } from "react";
// Pretpostavljam da wpSocialLogin funkcija postoji i radi kako ste zamislili
import { wpSocialLogin } from "../utils/wpSocialLogin";

// Definišemo tipove za bolju organizaciju koda (TypeScript)
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

// Kreiramo kontekst sa početnim vrednostima i ispravnim tipom
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // KLJUČNI DODATAK: Stanje za praćenje inicijalnog učitavanja
  const [isLoading, setIsLoading] = useState(true);

  // Poboljšana handleLogin funkcija da prima sve potrebne podatke
  const handleLogin = async (googleId: string, email: string, displayName: string) => {
    try {
      setError(null);
      // Vaš PHP kod očekuje i email i display_name, pa ih prosleđujemo
      const data = await wpSocialLogin(googleId, email, displayName);
      
      if (data?.token) {
        localStorage.setItem("wp_jwt", data.token);
        // Postavljamo korisnika sa svim podacima koje dobijemo nazad
        const userData = { id: data.user_id, email: data.email, displayname: data.displayname };
        setUser(userData);
        setIsLoggedIn(true);
      } else {
        setError(data?.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
      console.error(err);
    }
  };

  // Funkcija za odjavljivanje
  const logout = () => {
    localStorage.removeItem("wp_jwt");
    setUser(null);
    setIsLoggedIn(false);
  };

  // useEffect se sada izvršava samo jednom i upravlja sa isLoading stanjem
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
            // Ako token nije validan, odjavi korisnika
            logout();
          }
        } catch (error) {
          console.error("Token validation request failed", error);
          logout();
        }
      }
      // Kada se sve završi (bilo da ima tokena ili ne), gasimo učitavanje
      setIsLoading(false);
    };

    validateTokenOnLoad();
  }, []); // Prazan niz osigurava da se ovo izvrši samo jednom

  // Vrednosti koje pružamo ostatku aplikacije
  const value = { user, isLoggedIn, isLoading, error, handleLogin, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook ostaje isti, ali sada ima ispravan tip
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
