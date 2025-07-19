import { setConfig } from "@faustwp/core";
import templates from "./src/wp-templates";
import possibleTypes from "./possibleTypes.json";
import { setContext } from '@apollo/client/link/context';
import { createHttpLink } from '@apollo/client';

/**
 * @type {import('@faustwp/core').FaustConfig}
 **/
export default setConfig({
  templates,
  possibleTypes,
  usePersistedQueries: true,
  // ✅ DODAJEMO NOVU OPCIJU KOJA ĆE MODIFIKOVATI APOLLO CLIENT
  client: {
    // Ova funkcija će biti pozvana da kreira Apollo Client
    create(options) {
      // 1. Kreiramo standardni HTTP link
      const httpLink = createHttpLink({
        uri: options.uri, // Koristimo URI iz Faust konfiguracije
      });

      // 2. Kreiramo "auth" link koji presreće zahteve
      const authLink = setContext((_, { headers }) => {
        // Izvršava se samo u pretraživaču
        if (typeof window === 'undefined') {
          return { headers };
        }

        // Uzimamo token iz localStorage
        const token = localStorage.getItem('wp_jwt');

        // Vraćamo modifikovane headere
        return {
          headers: {
            ...headers,
            // Ako token postoji, dodajemo ga kao 'Bearer' token
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      });

      // 3. Vraćamo nove opcije, spajajući authLink i httpLink
      return {
        ...options, // Obavezno zadržati postojeće opcije
        link: authLink.concat(httpLink),
      };
    }
  }
});
