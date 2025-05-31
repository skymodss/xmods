import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ OVO JE ISPRAVNO

type JwtPayload = {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
};

export default function CallbackPage() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token); // ✅ Ispravno pozivanje
        console.log("✅ JWT korisnik:", decoded);
        setUser(decoded);
        localStorage.setItem("user", JSON.stringify(decoded));
      } catch (err: any) {
        console.error("❌ Neispravan JWT:", err.message);
        setError("Token nije valjan.");
      }
    } else {
      setError("Token nije pronađen u URL-u.");
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">JWT Callback</h1>
      {error && <p className="text-red-600">{error}</p>}
      {user ? (
        <div className="space-y-2">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        !error && <p>Obrada tokena...</p>
      )}
    </div>
  );
}
