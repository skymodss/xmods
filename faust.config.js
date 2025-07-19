import { setContext } from '@apollo/client/link/context'
import { FaustConfig, FaustPlugin, createHttpLink } from '@faustwp/core'

/**
 * @type {FaustConfig}
 */
export default new FaustConfig({
	// plugins: [], // Ako imate postojeće plugine, ostavite ih
	experimentalPlugins: [
		new FaustPlugin({
			apply(hooks) {
				hooks.addFilter(
					'apolloClientInMemoryCache',
					'ncmaz-faust-plugin-persisted-cache',
					() => {
						// Ovaj deo je verovatno već tu, ostavite ga.
						// On omogućava da se keš sačuva između sesija.
						if (typeof window === 'undefined') {
							return
						}
						try {
							const {
								WordPressBlocksViewer,
							} = require('@faustwp/blocks')
							const {
								InMemoryCache,
							} = require('@apollo/client/core')
							const {
								faustData,
							} = require('@/components/HeroSearchForm/RealestateSearchForm')

							const cache = new InMemoryCache({
								typePolicies: {
									RootQuery: {
										fields: {
											...WordPressBlocksViewer.blocksTypePolicy,
											generalSettings: {
												read(existing) {
													return (
														existing ||
														faustData.data
															?.generalSettings
													)
												},
											},
										},
									},
								},
							})

							return cache
						} catch (error) {
							console.error(error)
						}
					},
				)

				// ✅ KLJUČNI DEO - DODAVANJE AUTHORIZATION HEADERA
				hooks.addFilter(
					'apolloClientOptions',
					'ncmaz-faust-plugin-add-auth-token',
					(apolloClientOptions, context) => {
						// 1. Kreiramo standardni HTTP link
						const httpLink = createHttpLink({
							uri: context.config.apiEndpoint,
						})

						// 2. Kreiramo "auth" link koji će presretati zahteve
						const authLink = setContext((_, { headers }) => {
							// Proveravamo da li smo na klijentu (u pretraživaču)
							if (typeof window === 'undefined') {
								return { headers }
							}

							// Uzimamo token iz localStorage
							const token = localStorage.getItem('wp_jwt')

							// Vraćamo modifikovane headere
							return {
								headers: {
									...headers,
									// Ako token postoji, dodajemo ga kao 'Bearer' token
									authorization: token
										? `Bearer ${token}`
										: '',
								},
							}
						})

						// 3. Spajamo authLink i httpLink, i vraćamo ih kao nove opcije
						return {
							...apolloClientOptions,
							link: authLink.concat(httpLink),
						}
					},
				)
			},
		}),
	],
})
