import React from 'react';
import {
  WordPressTemplate,
  getWordPressProps,
} from '@faustwp/core';
// Importujemo getServerSideProps umesto GetStaticProps
import type { GetServerSideProps } from 'next'; 
import type { WordPressTemplateProps } from '../types';

// Komponenta ostaje ista
export default function Page(props: WordPressTemplateProps) {
  return <WordPressTemplate {...props} />;
}

// 1. Uklonili smo celu `getStaticPaths` funkciju, uključujući i `fetchSlugs`.
//    Ona nam više nije potrebna u SSR pristupu.

// 2. Preimenovali smo `getStaticProps` u `getServerSideProps`.
//    Funkcija sada prima `GetServerSideProps` tip.
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Unutar getWordPressProps, više nam ne treba `revalidate` jer to je opcija
  // samo za statičko generisanje (ISR). Faust će to ignorisati, ali je čistije ukloniti.
  return getWordPressProps({ ctx });
};
