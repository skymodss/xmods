const { setContext } = require('@apollo/client/link/context');
const { createHttpLink } = require('@apollo/client');
const { FaustConfig, FaustPlugin } = require('@faustwp/core');

/**
 * @type {import('@faustwp/core').FaustConfig}
 */
module.exports = new FaustConfig({
  // Ako ste imali druge plugine ovde, slobodno ih vratite.
  experimentalPlugins: [
    new FaustPlugin({
      apply(hooks) {
        // Ovaj hook dodaje autorizacijski header u svaki API zahtev.
        hooks.addFilter(
          'apolloClientOptions',
          'addAuthToken',
          (apolloClientOptions, context) => {
            const httpLink = createHttpLink({
              uri: context.config.apiEndpoint,
            });

            const authLink = setContext((_, { headers }) => {
              // Ovaj kod se izvršava samo u pretraživaču gde postoji localStorage.
              if (typeof window === 'undefined') {
                return { headers };
              }

              // Uzimamo token koji smo sačuvali u AuthContext-u.
              const token = localStorage.getItem('wp_jwt');

              // Vraćamo header-e nazad u kontekst kako bi ih httpLink pročitao.
              return {
                headers: {
                  ...headers,
                  authorization: token ? `Bearer ${token}` : '',
                },
              };
            });

            // Povezujemo authLink i httpLink.
            return {
              ...apolloClientOptions,
              link: authLink.concat(httpLink),
            };
          },
        );
      },
    }),
  ],
});
