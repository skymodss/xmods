// Ova funkcija proverava da li imaš JWT token (Google login)
export function isGoogleJwtUser() {
  return typeof window !== "undefined" && !!localStorage.getItem('wp_jwt');
}

// Ova funkcija može da proveri da li je korisnik WP klasično logovan (preko cookie-ja)
export async function isClassicWpUser() {
  try {
    const res = await fetch('/wp-json/wp/v2/users/me', {
      credentials: 'include'
    });
    return res.ok;
  } catch {
    return false;
  }
}
