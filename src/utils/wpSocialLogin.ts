/**
 * Logovanje/sinhronizacija sa WordPress backendom koristeći Google ID, email i display_name.
 * Vraća WordPress JWT token.
 *
 * @param google_id Google ID korisnika (obavezno)
 * @param email Email korisnika (obavezno za prvi login)
 * @param display_name Ime korisnika (opciono, lepše za WP admin)
 * @returns Promise sa {token}
 */
export async function wpSocialLogin(
  google_id: string,
  email?: string,
  display_name?: string
) {
  let data: any;
  let res: Response;

  try {
    res = await fetch(
      "https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/jwt-by-google-id",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_id, email, display_name }),
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

  if (!res.ok) {
    throw new Error(
      data?.message || "WP social login failed (HTTP " + res.status + ")"
    );
  }

  if (data && data.code && data.message) {
    throw new Error(`WP error: ${data.code} - ${data.message}`);
  }

  return data;
}
