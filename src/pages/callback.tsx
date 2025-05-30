import { useRouter } from 'next/router';
import { useEffect } from 'react';
import jwt_decode from 'jwt-decode';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;

    if (token && typeof token === 'string') {
      const user = jwt_decode(token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    }
  }, [router]);

  return <p>Prijavljujem vas...</p>;
}
