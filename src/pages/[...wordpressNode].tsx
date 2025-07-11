import React from 'react';
import {
  WordPressTemplate,
  getWordPressProps,
} from '@faustwp/core';
import type { GetStaticProps, GetStaticPaths } from 'next';
import type { WordPressTemplateProps } from '../types';
import { REVALIDATE_TIME } from '@/contains/contants';
import { IS_CHISNGHIAX_DEMO_SITE } from '@/contains/site-settings';

export default function Page(props: WordPressTemplateProps) {
  return <WordPressTemplate {...props} />;
}

async function fetchSlugs(): Promise<string[]> {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL?.replace(/\/$/, '')!;
  const [postsRes, catsRes] = await Promise.all([
    fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=50&_fields=slug`),
    fetch(`${baseUrl}/wp-json/wp/v2/categories?per_page=20&_fields=slug`),
  ]);

  const posts = (await postsRes.json()) as { slug: string }[];
  const cats = (await catsRes.json()) as { slug: string }[];

  let slugs = [
    ...posts.map(p => p.slug),
    ...cats.map(c => `category/${c.slug}`),
  ];

  if (IS_CHISNGHIAX_DEMO_SITE) {
    slugs = [
      ...slugs,
      'home-2',
      'home-3-podcast',
      'home-4-video',
      'home-5-gallery',
      'home-6',
      'search/posts/',
    ];
  }

  return slugs;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await fetchSlugs();

  const paths = slugs.map(slug => ({
    params: { wordpressNode: slug.split('/') },
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
