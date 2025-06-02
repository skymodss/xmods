import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function WordpressAuthSync() {
    if (typeof window === 'undefined') return null

    const { data: session, status } = useSession()

    useEffect(() => {
        if (
            status === 'authenticated' &&
            session?.user?.email &&
            session?.user?.name
        ) {
            // Automatski generiši username iz email-a ako ga nemaš u sessionul
            const email = session.user.email
            const name = session.user.name
            const google_id = (session.user as any).sub || ''
            const username =
                (session.user as any).username ||
                email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') // bez spec. znakova
            // Generiši random password (ili koristi custom ako ga imaš)
            const password =
                (session.user as any).password ||
                Math.random().toString(36).slice(-10)

            fetch(
                'https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        name,
                        google_id,
                        username,
                        password,
                    }),
                }
            )
                .then(res => res.json())
                .then(data => {
                    if (data?.token) {
                        localStorage.setItem('wp_jwt', data.token)
                        // Opcionalno: možeš setovati i username/password ako ti treba
                        // localStorage.setItem('wp_username', data.username)
                        // localStorage.setItem('wp_pass', data.password)
                    }
                })
                .catch(err => {
                    console.error('WP sync error:', err)
                })
        }
    }, [session, status])

    return null
}
