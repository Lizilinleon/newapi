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
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { BookOpen, Monitor } from 'lucide-react'
import type React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/use-notifications'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { useTopNavLinks } from '@/hooks/use-top-nav-links'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LanguageSwitcher } from '@/components/language-switcher'
import { NotificationPopover } from '@/components/notification-popover'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { defaultTopNavLinks } from '../config/top-nav.config'
import type { TopNavLink } from '../types'
import { HeaderLogo } from './header-logo'

export interface PublicHeaderProps {
  navLinks?: TopNavLink[]
  mobileLinks?: TopNavLink[]
  navContent?: React.ReactNode
  showThemeSwitch?: boolean
  showLanguageSwitcher?: boolean
  logo?: React.ReactNode
  siteName?: string
  homeUrl?: string
  leftContent?: React.ReactNode
  rightContent?: React.ReactNode
  showNavigation?: boolean
  showAuthButtons?: boolean
  showNotifications?: boolean
  className?: string
}

export function PublicHeader(props: PublicHeaderProps) {
  const {
    navLinks = defaultTopNavLinks,
    showThemeSwitch = true,
    showLanguageSwitcher = true,
    logo: customLogo,
    siteName: customSiteName,
    homeUrl = '/',
    showAuthButtons = true,
    showNotifications = true,
    className,
  } = props

  const { t } = useTranslation()
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { status } = useStatus()
  const {
    systemName,
    logo: systemLogo,
    loading,
    logoLoaded,
  } = useSystemConfig()
  const dynamicLinks = useTopNavLinks()
  const notifications = useNotifications()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const user = auth.user
  const isAuthenticated = !!user
  const displaySiteName = customSiteName || systemName
  const links = dynamicLinks.length > 0 ? dynamicLinks : navLinks
  const docsLink = (status?.docs_link as string | undefined) || '/about'

  const navLinkClass =
    'rounded-full px-5 py-2.5 text-base font-semibold text-slate-700 transition hover:bg-gradient-to-r hover:text-blue-800 dark:text-slate-300 dark:hover:text-cyan-100'
  const loginLinkClass =
    'h-11 rounded-full border-slate-300 bg-white px-6 text-base font-bold text-slate-950 shadow-sm hover:bg-slate-100 dark:border-white/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
  const registerLinkClass =
    'h-11 rounded-full bg-slate-950 px-6 text-base font-bold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'

  const handleNavLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    link: TopNavLink
  ) => {
    if (link.disabled) {
      event.preventDefault()
      return
    }

    if (link.requiresAuth) {
      event.preventDefault()
      navigate({ to: link.href })
    }
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/68 shadow-[0_12px_44px_-28px_rgba(14,165,233,0.95)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/58 dark:shadow-none',
        className
      )}
    >
      <div className='flex h-20 items-center justify-between px-4 md:px-8'>
        <div className='flex min-w-0 items-center gap-8'>
          <Link
            to={homeUrl}
            className='flex cursor-pointer select-none items-center gap-3 rounded-full bg-white/50 py-1.5 pr-5 pl-2 shadow-sm ring-1 ring-white/70 transition hover:bg-white/75 hover:shadow-[0_18px_48px_-30px_rgba(14,165,233,0.95)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10'
            aria-label={t('Back to home')}
            title={t('Back to home')}
          >
            <div className='relative size-10 shrink-0'>
              {loading ? (
                <Skeleton className='absolute inset-0 rounded-xl' />
              ) : customLogo ? (
                customLogo
              ) : (
                <HeaderLogo
                  src={systemLogo}
                  loading={loading}
                  logoLoaded={logoLoaded}
                  className='size-10 rounded-xl object-contain'
                />
              )}
            </div>
            {loading ? (
              <Skeleton className='h-7 w-28' />
            ) : (
              <h1 className='bg-gradient-to-r from-slate-900 via-blue-700 to-rose-600 bg-clip-text text-2xl font-black tracking-tight whitespace-nowrap text-transparent dark:from-white dark:via-cyan-200 dark:to-rose-200'>
                {displaySiteName}
              </h1>
            )}
          </Link>

          <nav className='hidden items-center gap-1.5 rounded-full border border-white/70 bg-white/52 p-1.5 shadow-[0_14px_40px_-28px_rgba(14,165,233,0.95)] backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-white/5'>
            {links.map((link, i) => {
              const isActive = pathname === link.href
              const linkClassName = cn(
                navLinkClass,
                isActive && 'bg-white/65 text-blue-800 shadow-sm dark:bg-white/10 dark:text-cyan-100',
                link.disabled && 'pointer-events-none opacity-50'
              )

              if (link.external) {
                return (
                  <a
                    key={i}
                    href={link.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-disabled={link.disabled}
                    tabIndex={link.disabled ? -1 : undefined}
                    onClick={(event) => handleNavLinkClick(event, link)}
                    className={linkClassName}
                  >
                    {t(link.title)}
                  </a>
                )
              }

              return (
                <Link
                  key={i}
                  to={link.href}
                  disabled={link.disabled}
                  onClick={(event) => handleNavLinkClick(event, link)}
                  className={linkClassName}
                >
                  {t(link.title)}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className='flex items-center gap-2.5'>
          <Button
            variant='ghost'
            size='icon-lg'
            aria-label={t('Docs')}
            className='hidden rounded-full sm:inline-flex'
            render={
              docsLink.startsWith('http') ? (
                <a href={docsLink} target='_blank' rel='noopener noreferrer' />
              ) : (
                <Link to={docsLink} />
              )
            }
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
          {showLanguageSwitcher && <LanguageSwitcher />}
          {showThemeSwitch && <ThemeSwitch />}
          {showNotifications && isAuthenticated && (
            <NotificationPopover
              open={notifications.popoverOpen}
              onOpenChange={notifications.setPopoverOpen}
              unreadCount={notifications.unreadCount}
              activeTab={notifications.activeTab}
              onTabChange={notifications.setActiveTab}
              notice={notifications.notice}
              announcements={notifications.announcements}
              loading={notifications.loading}
            />
          )}
          {showAuthButtons &&
            (loading ? (
              <Skeleton className='h-12 w-40 rounded-full' />
            ) : isAuthenticated ? (
              <ProfileDropdown />
            ) : (
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
            ))}
        </div>
      </div>
    </header>
  )
}
