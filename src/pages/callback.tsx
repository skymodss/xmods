// npm install jwt-decode ako nisi
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      try {
        const user = jwtDecode(token);
        console.log('✅ JWT korisnik:', user); // { id, email, iat, exp }

        // Tu možeš: spremiti usera u state, localStorage, context...
        localStorage.setItem('user', JSON.stringify(user));

        // Redirect na homepage ili dashboard
        router.push('/');
      } catch (err) {
        console.error('❌ Neispravan token', err);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, []);

  return <p>Prijava u tijeku...</p>;
}
