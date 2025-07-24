'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer/Footer' // Ispravna putanja do Footer komponente
import Nav from '@/components/Nav/Nav' // Ispravna putanja do Nav komponente

export default function SiteWrapperProvider({
	children,
}: {
	children: React.ReactNode
}) {
	// =================================================================
	// POČETAK KONAČNE ISPRAVKE:
	// Dohvatamo samo 'user' koji sigurno postoji.
	// =================================================================
	const { user } = useAuth()
	const pathname = usePathname()

	// Izvodimo 'loading' stanje. Kontekst je u stanju učitavanja
	// sve dok 'user' nije definisan (ni kao objekat, ni kao null).
	const loading = user === undefined
	// =================================================================
	// KRAJ KONAČNE ISPRAVKE
	// =================================================================

	return (
		<div className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
			{/* 
        Prosleđujemo 'user' kao 'viewer' u Nav komponentu.
        'Nav' očekuje prop pod imenom 'viewer', pa mu dodeljujemo vrednost iz 'user'.
      */}
			<Nav viewer={user} loading={loading} />

			<div
				className={`pt-16 sm:pt-20 ${
					pathname === '/' ? 'min-h-screen' : 'min-h-[70vh]'
				}`}
			>
				{children}
			</div>

			<Footer />
		</div>
	)
}
