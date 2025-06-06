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
        const email = session.user.email
        const name = session.user.name
        const google_id = (session.user as any).sub || ''
        const username =
            (session.user as any).username ||
            email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')

        // Učitaj WP lozinku iz localStorage ako postoji
        let savedPassword = localStorage.getItem(`wp_pass_${email}`)

        // Ako imaš sačuvanu lozinku, koristi je; ako ne, generiši novu (SAMO za prvi put)
        let password = savedPassword || Math.random().toString(36).slice(-10)

        fetch('https://xdd-a1e468.ingress-comporellon.ewp.live/wp-json/custom/v1/social-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                name,
                google_id,
                username,
                password,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data?.token) {
                    localStorage.setItem('wp_jwt', data.token)
                    localStorage.setItem('wp_username', data.username)
                }
                // Ako backend vrati lozinku za novog korisnika, upamti je!
                if (data?.password) {
                    localStorage.setItem(`wp_pass_${email}`, data.password)
                }
            })
            .catch(err => {
                console.error('WP sync error:', err)
            })
    }
}, [session, status])

    return null
}
