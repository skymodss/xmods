'use client'

import { FragmentType, useFragment } from '@/__generated__'
import AccountActionDropdown from '@/components/AccountActionDropdown/AccountActionDropdown'
import Avatar from '@/components/Avatar/Avatar'
import NcImage from '@/components/NcImage/NcImage'
import SocialsList, { TSocialsItem } from '@/components/SocialsList/SocialsList'
import SocialsShareDropdown from '@/components/SocialsShareDropdown/SocialsShareDropdown'
import { NC_USER_FULL_FIELDS_FRAGMENT } from '@/fragments'
import { getImageDataFromImageFragment } from '@/utils/getImageDataFromImageFragment'
import { GlobeAltIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import verifymem from '@/verifymem'
import VerifyIcon2 from '@/components/VerifyIcon2'

interface Props {
  className?: string
  children?: React.ReactNode
  user: FragmentType<typeof NC_USER_FULL_FIELDS_FRAGMENT>
}

const AuthorLayout: FC<Props> = ({ className = '', children, user }) => {
  const { databaseId, description, name, ncUserMeta } = useFragment(
    NC_USER_FULL_FIELDS_FRAGMENT,
    user || {},
  )
  const router = useRouter()
  const authorSlug = router.query.slug as string
  const result = verifymem.includes((name || '').toLowerCase()) ? 1 : 0

  let userSocials: TSocialsItem[] = [
    {
      name: 'Facebook',
      href: ncUserMeta?.facebookUrl || '',
      icon: (
        <svg fill="currentColor" className="h-5 w-5" height="1em" viewBox="0 0 512 512">
          <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z" />
        </svg>
      ),
    },
    // ... (ostali socials)
  ]

  userSocials = userSocials.filter((item) => !!item.href)

  return (
    <div className="">
      {/* HEADER */}
      <div className="w-full">
        <div className="container pt-[30px]">
          <div className="relative h-40 w-full md:h-60 2xl:h-72">
            {ncUserMeta?.backgroundImage?.node ? (
              <>
                {/* Sjenčana slika (blurred shadow) */}
                <NcImage
                  alt=""
                  containerClassName="absolute inset-0"
                  sizes="(max-width: 1280px) 100vw, 1536px"
                  src={getImageDataFromImageFragment(ncUserMeta?.backgroundImage?.node).sourceUrl}
                  className="h-full w-full object-cover rounded-3xl blur-xl opacity-50 scale-105"
                  aria-hidden
                  fill
                  priority
                />
                {/* Glavna slika */}
                <NcImage
                  alt={getImageDataFromImageFragment(ncUserMeta?.backgroundImage?.node).altText || ''}
                  containerClassName="absolute inset-0"
                  sizes="(max-width: 1280px) 100vw, 1536px"
                  src={getImageDataFromImageFragment(ncUserMeta?.backgroundImage?.node).sourceUrl}
                  className="h-full w-full object-cover rounded-3xl"
                  fill
                  priority
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-neutral-200/70 rounded-3xl" />
            )}
          </div>
        </div>
        <div className="container -mt-10 lg:-mt-16">
          <div className="relative flex flex-col gap-2 rounded-3xl p-5 sm:gap-5 md:flex-row md:gap-3 md:rounded-[40px] lg:gap-3 lg:p-8 xl:gap-3">
            <Avatar
              userName={name || 't'}
              imgUrl={getImageDataFromImageFragment(ncUserMeta?.featuredImage?.node).sourceUrl}
              sizeClass="w-20 h-20 text-xl sm:text-3xl lg:text-4xl lg:w-36 lg:h-36 ring-4 ring-white dark:ring-4 shadow-2xl z-0"
              priority
              sizes="150px"
            />
            <div className="flex-grow md:pt-[30px] md:pl-[5px] lg:pl-[5px] lg:pt-[50px]">
              <div className="max-w-screen-sm space-y-3.5">
                <h1 className="inline-flex items-center text-xl font-semibold sm:text-2xl md:text-3xl lg:text-4xl">
                  <span>{name}</span>
                </h1>
                {result === 1 ? (
                  <VerifyIcon2 />
                ) : (
                  <p></p>
                )}
                <span
                  className="author_description block text-sm text-neutral-500 dark:text-neutral-400"
                  dangerouslySetInnerHTML={{ __html: description || '' }}
                ></span>
                {!!ncUserMeta?.websiteUrl && (
                  <a
                    href={ncUserMeta?.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center space-x-2.5 truncate text-xs font-medium text-neutral-500 rtl:space-x-reverse dark:text-neutral-400"
                  >
                    <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-neutral-700 dark:text-neutral-300">
                      {ncUserMeta?.websiteUrl}
                    </span>
                  </a>
                )}
                <SocialsList socials={userSocials} />
                <div className="absolute top-10 right-0 end-5 start-auto flex justify-end sm:top-[36px] md:top-[36px] lg:top-[66px] gap-2">
                  <SocialsShareDropdown sizeClass="w-10 h-10" />
                  <AccountActionDropdown
                    authorSlug={authorSlug}
                    containerClassName="h-10 w-10 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    userDatabaseId={databaseId}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ====================== END HEADER ====================== */}
      {children}
    </div>
  )
}

export default AuthorLayout
