export async function wpSocialLogin(
  google_id: string,
  email?: string,
  display_name?: string,
  maxRetries: number = 5,
  retryDelay: number = 1000 // u milisekundama
): Promise<{ token: string; user_id: number; email: string; displayname: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(
        "https://xmods.online/wp-json/custom/v1/jwt-by-google-id",
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

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error("WP social login: invalid JSON odgovor");
      }

      // Provera da li je response OK i sadrži token
      if (res.ok && data?.token && data?.user_id) {
        if (typeof window !== "undefined") {
          localStorage.setItem("wp_jwt", data.token);
        }
        return data;
      }

      // Ako nije ok, baci grešku da bi prešao na retry
      throw new Error(data?.message || `WP social login failed (HTTP ${res.status})`);

    } catch (e) {
      if (attempt === maxRetries) {
        throw new Error("WP social login: " + (e as Error).message);
      }
      // Sačekaj pre nego što ponoviš pokušaj
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  throw new Error("WP social login: Unreachable code");
}
