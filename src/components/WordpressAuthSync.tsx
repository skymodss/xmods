import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { wpSocialLogin } from "../utils/wpSocialLogin";

/**
 * Sinhronizuje NextAuth korisnika sa WordPress-om koristeći samo Google ID.
 * Čuva dobijeni WP JWT token u localStorage.
 */
export default function WordpressAuthSync() {
  if (typeof window === "undefined") return null;

  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session?.user as any)?.sub // Google ID
    ) {
      const google_id = (session.user as any).sub;

      wpSocialLogin(google_id)
        .then((data) => {
          if (data?.token) {
            localStorage.setItem("wp_jwt", data.token);
          }
        })
        .catch((err) => {
          console.error("WP sync error:", err);
        });
    } else if (status === "unauthenticated") {
      localStorage.removeItem("wp_jwt");
    }
  }, [session, status]);

  return null;
}
