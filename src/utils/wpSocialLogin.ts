export async function wpSocialLogin(email: string, name: string, google_id: string) {
  const res = await fetch('https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, google_id, username, password }),
  });
  if (!res.ok) throw new Error("WP social login failed");
  return await res.json();
}
