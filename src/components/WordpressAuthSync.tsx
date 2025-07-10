import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { wpSocialLogin } from "@/utils/wpSocialLogin";
import { useRouter } from "next/router";

/**
 * Automatski sinhronizuje NextAuth korisnika sa WordPress backendom putem Google ID-a.
 * Kada je korisnik prijavljen (Google/NextAuth), poziva WP backend, snima JWT, i preusmerava na homepage.
 *
 * - Postavi ovu komponentu na sign-up stranicu ili u _app.tsx (da radi globalno).
 */
export default function WordpressAuthSync({ redirectTo = "/" }: { redirectTo?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isSyncing = useRef(false); // Sprečava duple pozive

  useEffect(() => {
    // Čisti JWT na odjavu
    if (status === "unauthenticated") {
      localStorage.removeItem("wp_jwt");
      // Poželjno: očisti i cookie za server-side auth:
      document.cookie = "wp_jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      isSyncing.current = false;
      return;
    }

    // Samo ako je autentifikovan i imamo Google ID, a nemamo token
    if (
      status === "authenticated" &&
      session?.user &&
      (session.user as any).sub &&
      !isSyncing.current &&
      !localStorage.getItem("wp_jwt")
    ) {
      isSyncing.current = true;
      const google_id = (session.user as any).sub;
      const email = (session.user as any).email;
      const display_name =
        (session.user as any).name ||
        (session.user as any).displayName ||
        "";

      wpSocialLogin(google_id, email, display_name)
        .then((data) => {
          if (data?.token) {
            // Snimi u localStorage za frontend
            localStorage.setItem("wp_jwt", data.token);
            // Snimi i u cookie za backend (Next.js API route koristi cookie, ne localStorage!)
            document.cookie = `wp_jwt=${data.token}; path=/; secure; samesite=lax`;
            router.replace(redirectTo);
          } else {
            throw new Error("Nema tokena u odgovoru");
          }
        })
        .catch((err) => {
          console.error("WP login error:", err);
          // Poželjno: ispiši grešku korisniku
        })
        .finally(() => {
          isSyncing.current = false;
        });
    }
  }, [session, status, router, redirectTo]);

  return null;
}
