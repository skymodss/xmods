import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;

    if (token && typeof token === 'string') {
      const user = jwtDecode(token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('jwt', token); // Sačuvaj token za API pozive ako treba
      router.push('/');
    }
  }, [router]);

  return <p>Prijavljujem vas...</p>;
}
