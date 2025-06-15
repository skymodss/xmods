/**
 * Logovanje/sinhronizacija sa WordPress backendom koristeći samo Google ID.
 * Vraća WordPress JWT token.
 *
 * @param google_id Google ID korisnika (obavezno)
 * @returns Promise sa {token}
 */
export async function wpSocialLogin(google_id: string) {
  let data: any;
  let res: Response;

  try {
    res = await fetch(
      "https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/jwt-by-google-id",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ google_id }),
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
