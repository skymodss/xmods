import { useEffect } from "react";
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

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      (session.user as any).sub
    ) {
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

            // Prebaci korisnika na početnu (ili gde god treba)
            router.replace(redirectTo);
          }
        })
        .catch((err) => {
          // Po želji prikaži grešku korisniku
          console.error("WP login error:", err);
        });
    } else if (status === "unauthenticated") {
      localStorage.removeItem("wp_jwt");
    }
  }, [session, status, router, redirectTo]);

  return null;
}
