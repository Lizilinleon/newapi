/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useMemo, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Markdown } from '@/components/ui/markdown'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Footer } from '@/components/layout/components/footer'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'

type PublicContentPageProps = {
  activeNav?: 'about' | null
  title: string
  content?: string
  isLoading?: boolean
  emptyState?: ReactNode
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isLikelyHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

function extractRenderableHtml(rawContent: string) {
  const bodyMatch = rawContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch?.[1]) {
    return bodyMatch[1]
  }
  return rawContent
}

export function PublicContentPage({
  activeNav = null,
  title,
  content = '',
  isLoading = false,
  emptyState = null,
}: PublicContentPageProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo, logoLoaded } = useSystemConfig()

  const docsLink =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const footerColumns = [
    {
      title: '',
      links: [
        { text: t('About'), href: '/about' },
        { text: t('Docs'), href: docsLink },
      ],
    },
    {
      title: '',
      links: [
        { text: t('API Reference'), href: docsLink },
        { text: t('Get API Key'), href: '/sign-up' },
      ],
    },
    {
      title: '',
      links: [
        { text: t('User Agreement'), href: '/user-agreement' },
        { text: t('Privacy Policy'), href: '/privacy-policy' },
      ],
    },
  ]

  const rawContent = content.trim()
  const hasContent = rawContent.length > 0
  const isUrl = hasContent && isValidUrl(rawContent)
  const isHtml = hasContent && !isUrl && isLikelyHtml(rawContent)
  const renderedHtml = useMemo(
    () => (isHtml ? extractRenderableHtml(rawContent) : ''),
    [isHtml, rawContent]
  )

  const aboutNavClassName =
    activeNav === 'about'
      ? 'rounded-full bg-gradient-to-r from-orange-400/12 to-rose-500/14 px-5 py-2.5 text-rose-700 shadow-sm ring-1 ring-rose-500/10 transition dark:text-rose-200 dark:ring-rose-300/10'
      : 'rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-orange-400/12 hover:to-rose-500/14 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-200'

  return (
    <div className='from-background via-rose-50/25 to-sky-50/35 dark:via-rose-950/10 dark:to-slate-900 bg-gradient-to-br text-foreground min-h-svh overflow-x-hidden'>
      <header className='fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/68 shadow-[0_12px_44px_-28px_rgba(14,165,233,0.95)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 dark:shadow-none'>
        <div className='flex h-20 items-center justify-between px-4 md:px-8'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex items-center gap-3 rounded-full bg-white/50 py-1.5 pr-5 pl-2 shadow-sm ring-1 ring-white/70 transition hover:bg-white/75 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10'
            >
              <img
                src={logo}
                alt={systemName}
                className='size-10 rounded-xl object-contain'
                style={{ opacity: logoLoaded ? 1 : 0.65 }}
              />
              <span className='bg-gradient-to-r from-slate-900 via-blue-700 to-rose-600 bg-clip-text text-2xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-rose-200'>
                {systemName}
              </span>
            </Link>
            <nav className='hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/52 p-1.5 text-base font-semibold shadow-[0_14px_40px_-28px_rgba(14,165,233,0.95)] backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-white/5'>
              <Link
                to='/'
                className='rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-blue-500/14 hover:to-cyan-400/12 hover:text-blue-700 dark:text-slate-300 dark:hover:text-cyan-200'
              >
                {t('Home')}
              </Link>
              <Link
                to='/enterprise'
                className='rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-indigo-500/14 hover:to-rose-500/12 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200'
              >
                {t('Console')}
              </Link>
              <Link
                to='/pricing'
                className='rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-emerald-400/14 hover:via-cyan-400/12 hover:to-rose-400/12 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-200'
              >
                {t('Model Plaza')}
              </Link>
              <a
                href={docsLink}
                target='_blank'
                rel='noopener noreferrer'
                className='rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-violet-500/14 hover:to-rose-500/12 hover:text-violet-700 dark:text-slate-300 dark:hover:text-fuchsia-200'
              >
                {t('Docs')}
              </a>
              <Link to='/about' className={aboutNavClassName}>
                {t('About')}
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-2.5'>
            <LanguageSwitcher />
            <ThemeSwitch />
            <div className='flex items-center gap-2 rounded-full border border-white/70 bg-white/52 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5'>
              <Button
                variant='outline'
                className='h-11 rounded-full border-slate-300 bg-white px-6 text-base font-bold text-slate-950 shadow-sm hover:bg-slate-100 dark:border-white/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                render={<Link to='/sign-in' />}
              >
                {t('Login')}
              </Button>
              <Button
                className='h-11 rounded-full bg-slate-950 px-6 text-base font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                render={<Link to='/sign-up' />}
              >
                {t('Register')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className='pt-20'>
        {isLoading ? (
          <div className='mx-auto max-w-7xl px-4 py-10 md:px-8'>
            <div className='mx-auto flex max-w-4xl flex-col gap-4'>
              <Skeleton className='h-8 w-[45%]' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-[90%]' />
              <Skeleton className='h-4 w-[80%]' />
            </div>
          </div>
        ) : !hasContent ? (
          <div className='mx-auto max-w-7xl px-4 py-10 md:px-8'>
            {emptyState}
          </div>
        ) : isUrl ? (
          <iframe
            src={rawContent}
            className='h-[calc(100vh-5rem)] w-full border-0'
            title={title}
          />
        ) : isHtml ? (
          <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        ) : (
          <div className='mx-auto max-w-7xl px-4 py-10 md:px-8'>
            <Markdown className='prose prose-neutral dark:prose-invert max-w-none'>
              {rawContent}
            </Markdown>
          </div>
        )}
      </main>

      <Footer
        name={systemName}
        columns={footerColumns}
        className='border-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.98))] text-white'
        copyright='All rights reserved.'
        inverse
        description={[
          t('Enterprise-ready large model gateway for unified model access.'),
          t('Stable routing, account management, billing control, and compliance-ready access experience.'),
        ]}
      />
    </div>
  )
}
