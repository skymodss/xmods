/**
 * Logovanje/sinhronizacija sa WordPress backendom koristeći Google ID, email i display_name.
 * Vraća WordPress JWT token i automatski ga snima u localStorage.
 *
 * @param google_id Google ID korisnika (obavezno)
 * @param email Email korisnika (obavezno za prvi login)
 * @param display_name Ime korisnika (opciono, lepše za WP admin)
 * @returns Promise sa {token, user_id, email, displayname}
 */
export async function wpSocialLogin(
  google_id: string,
  email?: string,
  display_name?: string
): Promise<{ token: string; user_id: number; email: string; displayname: string }> {
  let data: any;
  let res: Response;

  try {
    res = await fetch(
      "https://wordpress-1482017-5629555.cloudwaysapps.com/wp-json/custom/v1/jwt-by-google-id",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          email
            ? { google_id, email, display_name }
            : { google_id }
        ),
      }
    );
  } catch (e) {
    throw new Error("WP social login: fetch error - " + (e as Error).message);
  }

  try {
    data = await res.json();
  } catch (e) {
    throw new Error("WP social login: invalid JSON odgovor");
  }

  // WordPress REST API error (WP_Error)
  if (!res.ok || (data && data.code && data.message)) {
    throw new Error(
      data?.message || `WP social login failed (HTTP ${res.status})`More actions
    );
  }

  // Osiguraj da backend vraća očekivane podatke
  if (!data.token || !data.user_id) {
    throw new Error("WP social login: Nepotpuni podaci iz backenda");
  }

  // Automatski sačuvaj token u localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("wp_jwt", data.token);
  }

  return data;
}
