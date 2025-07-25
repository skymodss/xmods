/**
 * Komunicira sa WordPress-om da bi prijavio ili registrovao korisnika preko Google podataka.
 * Uključuje mehanizam za ponovni pokušaj u slučaju mrežnih grešaka.
 * 
 * @param google_id - Google korisnički ID.
 * @param email - Opciono, email korisnika. Neophodan za prvu registraciju.
 * @param display_name - Opciono, ime korisnika.
 * @param avatar_url - Opciono, URL slike profila korisnika.
 * @param maxRetries - Maksimalan broj ponovnih pokušaja.
 * @param retryDelay - Vreme čekanja između pokušaja u milisekundama.
 * @returns Promise koji se rešava sa podacima o WordPress sesiji.
 */
export async function wpSocialLogin(
  google_id: string,
  email?: string,
  display_name?: string,
  avatar_url?: string, // <-- Dodat parametar za sliku
  maxRetries: number = 5,
  retryDelay: number = 1000
): Promise<{ token: string; user_id: number; email: string; displayname: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Konstruišemo telo zahteva. Ako imamo email, šaljemo sve podatke.
      const requestBody = email
        ? { google_id, email, display_name, avatar_url } // <-- avatar_url se dodaje ovde
        : { google_id };

      const res = await fetch(
        "https://xmods.online/wp-json/custom/v1/jwt-by-google-id",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        // Ako server vrati HTML (npr. 500 greška), a ne JSON.
        throw new Error(`WP social login: Neispravan JSON odgovor sa servera (HTTP ${res.status})`);
      }

      // Provera da li je response OK i sadrži token
      if (res.ok && data?.token && data?.user_id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("wp_jwt", data.token);
        }
        return data;
      }

      // Ako nije ok, baci grešku sa porukom sa servera da bi prešao na retry
      throw new Error(data?.message || `WP social login failed (HTTP ${res.status})`);

    } catch (e) {
      console.error(`Pokušaj ${attempt} nije uspeo:`, (e as Error).message);
      if (attempt === maxRetries) {
        // Ako je poslednji pokušaj, baci finalnu grešku
        throw new Error("WP social login: " + (e as Error).message);
      }
      // Sačekaj pre nego što ponoviš pokušaj
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  // Ova linija ne bi trebalo nikada da se izvrši zbog logike unutar petlje.
  throw new Error("WP social login: Neočekivana greška - petlja je završena bez rezultata.");
}
