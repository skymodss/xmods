import React from 'react';
import {
  FaustPage,
  getNextStaticProps,
  is404,
  Page404,
} from '@faustwp/core';
import type { GetStaticPropsContext } from 'next';

export default function Page({ data }: { data: any }) {
  if (is404(data)) {
    return <Page404 />;
  }
  return <FaustPage page={data.page} />;
}

export async function getStaticProps(context: GetStaticPropsContext) {
  return getNextStaticProps(context, {
    revalidate: 1,
  });
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}
