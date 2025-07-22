import React from 'react';
import { WordPressTemplate, getWordPressProps } from '@faustwp/core';
import type { GetStaticProps, GetStaticPaths } from 'next';
import type { WordPressTemplateProps } from '../types';
import { REVALIDATE_TIME } from '@/contains/contants';
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings';
import { request, gql } from 'graphql-request';

// --- POČETAK ISPRAVKE ---

// 1. Definišemo tipove (oblike) podataka koje očekujemo od GraphQL-a
interface UriNode {
  uri: string;
}

interface GraphQLResponse {
  posts: {
    nodes: UriNode[];
  };
  categories: {
    nodes: UriNode[];
  };
}

// --- KRAJ ISPRAVKE ---

export default function Page(props: WordPressTemplateProps) {
  return <WordPressTemplate {...props} />;
}

async function fetchAllUris(): Promise<string[]> {
  const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '') + '/graphql';

  const query = gql`
    query GetAllUris {
      posts(first: 10000) {
        nodes {
          uri
        }
      }
      categories(first: 1000) {
        nodes {
          uri
        }
      }
    }
  `;

  try {
    // --- POČETAK ISPRAVKE ---

    // 2. Kažemo `request` funkciji koji oblik podataka da očekuje (<GraphQLResponse>)
    const data = await request<GraphQLResponse>(endpoint, query);

    // --- KRAJ ISPRAVKE ---

    const postUris = data.posts.nodes.map(node => node.uri);
    const categoryUris = data.categories.nodes.map(node => node.uri);

    let uris = [...postUris, ...categoryUris].map(uri => uri.replace(/^\/|\/$/g, ''));

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
    return [];
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
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
