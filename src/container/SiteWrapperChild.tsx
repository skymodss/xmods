import React from 'react';
import { WordPressTemplate, getWordPressProps } from '@faustwp/core';
import type { GetStaticProps, GetStaticPaths } from 'next';
import type { WordPressTemplateProps } from '../types';
import { REVALIDATE_TIME } from '@/contains/contants';
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings';
import { request, gql } from 'graphql-request'; // <-- DODAJEMO OVO

export default function Page(props: WordPressTemplateProps) {
  return <WordPressTemplate {...props} />;
}

// OPTIMIZOVANA FUNKCIJA
async function fetchAllUris(): Promise<string[]> {
  const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') + '/graphql';

  // Jedan jedini GraphQL upit koji traži SVE javne postove i kategorije
  const query = gql`
    query GetAllUris {
      posts(first: 10000) { # Tražimo veliki broj da dobijemo sve
        nodes {
          uri
        }
      }
      categories(first: 1000) { # I sve kategorije
        nodes {
          uri
        }
      }
    }
  `;

  try {
    const data = await request(endpoint, query);

    // Vadimo URI-je (npr. "/moj-prvi-post/" ili "/category/saveti/")
    const postUris = data.posts.nodes.map(node => node.uri);
    const categoryUris = data.categories.nodes.map(node => node.uri);

    // Spajamo sve u jedan niz i čistimo kose crte
    let uris = [...postUris, ...categoryUris].map(uri => uri.replace(/^\/|\/$/g, ''));

    // Dodajemo demo stranice ako je potrebno
    if (IS_CHISNGHIAX_DEMO_SITE) {
        uris = [
            ...uris,
            'home-2',
            'home-3-podcast',
            'home-4-video',
            'home-5-gallery',
            'home-6',
            'search/posts/',
        ];
    }
    
    return uris;

  } catch (error) {
    console.error("Failed to fetch URIs for Static Paths:", error);
    return []; // Vraćamo prazan niz u slučaju greške
  }
}


export const getStaticPaths: GetStaticPaths = async () => {
  // Pozivamo novu, optimizovanu funkciju
  const uris = await fetchAllUris();

  const paths = uris.map(uri => ({
    params: { wordpressNode: uri.split('/') },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  return getWordPressProps({
    ctx,
    revalidate: REVALIDATE_TIME,
  });
};
