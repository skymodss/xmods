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
	// POČETAK ISPRAVKE: Koristimo ispravna polja iz useAuth
	// =================================================================
	const { isAuthenticated, isReady } = useAuth()
	const pathname = usePathname()

	// Kreiramo lažni 'viewer' objekat i 'loading' stanje na osnovu onoga što imamo
	// Nav komponenta očekuje ovakvu strukturu
	const viewer = isAuthenticated ? { databaseId: 1 } : null
	const loading = !isReady
	// =================================================================
	// KRAJ ISPRAVKE
	// =================================================================

	return (
		<div className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
			{/* Prosleđujemo prilagođene podatke u Nav komponentu */}
			<Nav viewer={viewer} loading={loading} />

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
