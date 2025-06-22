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
    // Čisti signal za odjavu
    if (status === "unauthenticated") {
      localStorage.removeItem("wp_jwt");
      isSyncing.current = false;
      return;
    }

    // Samo ako je autentifikovan i imamo Google ID
    if (
      status === "authenticated" &&
      session?.user &&
      (session.user as any).sub &&
      !isSyncing.current && // Ne ponavljaj
      !localStorage.getItem("wp_jwt") // Ne šalji opet ako već imaš token
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
            localStorage.setItem("wp_jwt", data.token);
            router.replace(redirectTo);
          } else {
            throw new Error("Nema tokena u odgovoru");
          }
        })
        .catch((err) => {
          console.error("WP login error:", err);
          // Po želji: ispiši grešku korisniku
        })
        .finally(() => {
          isSyncing.current = false;
        });
    }
  }, [session, status, router, redirectTo]);

  return null;
}
