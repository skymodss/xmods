export async function wpSocialLogin(
  email: string,
  name: string,
  google_id: string,
  username?: string,
  password?: string
) {
  // Automatski generiši username ako nije prosleđen
  const safeUsername =
    username ||
    email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

  // Automatski generiši random password ako nije prosleđen
  const safePassword =
    password ||
    Math.random().toString(36).slice(-10);

  const res = await fetch('https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      name,
      google_id,
      username: safeUsername,
      password: safePassword
    }),
  });

  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error("WP social login: invalid JSON odgovor");
  }

  if (!res.ok) {
    // Detaljna poruka iz backenda ako postoji
    throw new Error(
      data?.message || "WP social login failed (HTTP " + res.status + ")"
    );
  }

  // WordPress može vratiti WP_Error kao JSON sa "code" i "message"
  if (data && data.code && data.message) {
    throw new Error(`WP error: ${data.code} - ${data.message}`);
  }

  return data;
}
