import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // ISPRAVAN import

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;

    if (token && typeof token === 'string') {
      const user = jwtDecode(token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    }
  }, [router]);

  return <p>Prijavljujem vas...</p>;
}
