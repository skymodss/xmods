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
  if (!res.ok) throw new Error("WP social login failed");
  return await res.json();
}
