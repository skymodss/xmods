'use client'

import { usePathname } from 'next/navigation'
// Uklonili smo sve što je vezano za Apollo Client, getViewer i Redux jer ne postoje
// import { useQuery } from '@apollo/client'
// import { useDispatch } from 'react-redux'

// =================================================================
// POČETAK ISPRAVKE: Potpuno pojednostavljena verzija
// =================================================================
// Oslanjamo se samo na AuthContext, koji sigurno postoji
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer/Footer' // Ispravna putanja do Footer komponente
import Nav from '@/components/Nav/Nav' // Ispravna putanja do Nav komponente
// =================================================================
// KRAJ ISPRAVKE
// =================================================================

export default function SiteWrapperProvider({
	children,
}: {
	children: React.ReactNode
}) {
	// Dohvatamo podatke o korisniku direktno iz AuthContext-a
	const { viewer, loading } = useAuth()
	const pathname = usePathname()

	// Uklonili smo ceo useEffect blok koji je radio sa Redux-om i nepostojećim viewer-om

	return (
		<div className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
			{/* Prosleđujemo viewer i loading podatke direktno iz AuthContext-a u Nav */}
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
