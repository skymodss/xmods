export async function wpSocialLogin(
  email: string,
  name: string,
  google_id: string,
  username?: string,
  password?: string
) {
  // Prvo - ako već imaš zapamćenu WP lozinku za korisnika, koristi je!
  let storedPassword = typeof window !== "undefined" ? localStorage.getItem(`wp_pass_${email}`) : undefined;

  // Samo ako NEMAŠ, generiši novu
  const safePassword =
    password ||
    storedPassword ||
    Math.random().toString(36).slice(-10);

  const safeUsername =
    username ||
    email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

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
    throw new Error(
      data?.message || "WP social login failed (HTTP " + res.status + ")"
    );
  }

  if (data && data.code && data.message) {
    throw new Error(`WP error: ${data.code} - ${data.message}`);
  }

  // Ako backend vrati password (samo kod novog korisnika!), zapamti ga
  if (typeof window !== "undefined" && data?.password) {
    localStorage.setItem(`wp_pass_${email}`, data.password);
  }

  return data;
}
