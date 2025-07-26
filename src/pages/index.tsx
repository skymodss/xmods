import { getWordPressProps, WordPressTemplate } from '@faustwp/core'
import { WordPressTemplateProps } from '../types'
import { GetStaticProps } from 'next'
import { REVALIDATE_TIME } from '@/contains/contants'

// Import custom FaustPage
import Page, { getServerSideProps as getFaustServerSideProps } from '@/pages/posts/index' // promijeni import po svom fajlu

export default function HomePage(props: WordPressTemplateProps) {
  return (
    <>
      <WordPressTemplate {...props} />
      <Page />
    </>
  )
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  // WordPressTemplate props
  const wpProps = await getWordPressProps({ ctx, revalidate: REVALIDATE_TIME })
  // FaustPage props (ako trebaš fetchovati podatke)
  // const faustProps = await getFaustServerSideProps(ctx)
  return {
    ...wpProps,
    // ...faustProps, // Dodaj ako trebaš više podataka
  }
}
