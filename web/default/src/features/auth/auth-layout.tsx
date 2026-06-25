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
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { BookOpen, Monitor } from 'lucide-react'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useStatus } from '@/hooks/use-status'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeSwitch } from '@/components/theme-switch'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo, loading, logoLoaded } = useSystemConfig()
  const docsLink =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  const navLinkClass =
    'rounded-full px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-gradient-to-r hover:text-blue-800 dark:text-slate-300 dark:hover:text-cyan-100'
  const loginLinkClass =
    'h-11 rounded-full border-slate-300 bg-white px-6 text-base font-bold text-slate-950 shadow-sm hover:bg-slate-100 dark:border-white/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
  const registerLinkClass =
    'h-11 rounded-full bg-slate-950 px-6 text-base font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'

  return (
    <div className='from-background via-rose-50/35 to-cyan-50/45 dark:via-rose-950/15 dark:to-slate-900 relative min-h-svh max-w-none overflow-x-hidden bg-gradient-to-br'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-28 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-300/30 via-fuchsia-300/20 to-rose-300/25 blur-3xl' />
        <div className='absolute top-1/4 -left-24 size-80 rounded-full bg-cyan-300/25 blur-3xl' />
        <div className='absolute right-[-6rem] bottom-[-4rem] size-96 rounded-full bg-rose-300/25 blur-3xl' />
        <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(14,165,233,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent_78%)]' />
      </div>

      <header className='fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/68 shadow-[0_12px_44px_-28px_rgba(14,165,233,0.95)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 dark:shadow-none'>
        <div className='flex h-20 items-center justify-between px-4 md:px-8'>
          <div className='flex items-center gap-8'>
            <Link
              to='/'
              className='flex cursor-pointer select-none items-center gap-3 rounded-full bg-white/50 py-1.5 pr-5 pl-2 shadow-sm ring-1 ring-white/70 transition hover:bg-white/75 hover:shadow-[0_18px_48px_-30px_rgba(14,165,233,0.95)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10'
              aria-label={t('Back to home')}
              title={t('Back to home')}
            >
              <div className='relative size-10'>
                {loading ? (
                  <Skeleton className='absolute inset-0 rounded-xl' />
                ) : (
                  <img
                    src={logo}
                    alt={t('Logo')}
                    className='size-10 rounded-xl object-contain'
                    style={{ opacity: logoLoaded ? 1 : 0.65 }}
                  />
                )}
              </div>
              {loading ? (
                <Skeleton className='h-7 w-28' />
              ) : (
                <h1 className='bg-gradient-to-r from-slate-900 via-blue-700 to-rose-600 bg-clip-text text-2xl font-black tracking-tight text-transparent dark:from-white dark:via-cyan-200 dark:to-rose-200'>
                  {systemName}
                </h1>
              )}
            </Link>

            <nav className='hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/52 p-1.5 shadow-[0_14px_40px_-28px_rgba(14,165,233,0.95)] backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-white/5'>
              <Link
                to='/'
                className={cn(
                  navLinkClass,
                  'hover:from-blue-500/12 hover:to-cyan-400/10'
                )}
              >
                {t('Home')}
              </Link>
              <Link
                to='/enterprise'
                className={cn(
                  navLinkClass,
                  'hover:from-indigo-500/14 hover:to-rose-500/12 hover:text-indigo-700'
                )}
              >
                {t('Console')}
              </Link>
              <Link
                to='/pricing'
                className={cn(
                  navLinkClass,
                  'hover:from-emerald-400/14 hover:via-cyan-400/12 hover:to-rose-400/12 hover:text-emerald-700'
                )}
              >
                {t('Model Plaza')}
              </Link>
              <a
                href={docsLink}
                target='_blank'
                rel='noopener noreferrer'
                className={cn(
                  navLinkClass,
                  'hover:from-violet-500/14 hover:to-rose-500/12 hover:text-violet-700'
                )}
              >
                {t('Docs')}
              </a>
              <Link
                to='/about'
                className={cn(
                  navLinkClass,
                  'hover:from-orange-400/12 hover:to-rose-500/14 hover:text-rose-700'
                )}
              >
                {t('About')}
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-2.5'>
            <Button
              variant='ghost'
              size='icon-lg'
              aria-label={t('Notifications')}
              className='hidden rounded-full sm:inline-flex'
            >
              <BookOpen />
            </Button>
            <Button
              variant='ghost'
              size='icon-lg'
              aria-label={t('Display')}
              className='hidden rounded-full sm:inline-flex'
            >
              <Monitor />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitch />
            <div className='flex items-center gap-2 rounded-full border border-white/70 bg-white/52 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5'>
              <Button
                variant='outline'
                className={loginLinkClass}
                render={<Link to='/sign-in' />}
              >
                {t('Login')}
              </Button>
              <Button
                className={registerLinkClass}
                render={<Link to='/sign-up' />}
              >
                {t('Register')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='container relative z-10 flex min-h-svh items-center pt-28 pb-10 sm:pt-32'>
        <div className='mx-auto flex w-full flex-col justify-center rounded-[2.5rem] border border-white/65 bg-white/64 px-7 py-11 shadow-[0_34px_108px_-48px_rgba(15,23,42,0.72)] backdrop-blur-2xl sm:w-[640px] sm:p-12 dark:border-white/10 dark:bg-slate-950/58 [&_button]:text-base [&_input]:h-12 [&_input]:text-base'>
          {children}
        </div>
      </div>
    </div>
  )
}
