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
import { Fragment, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { DEFAULT_SYSTEM_NAME } from '@/lib/constants'

interface FooterLink {
  text: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  logo?: string
  name?: string
  description?: string | string[]
  columns?: FooterColumnProps[]
  copyright?: string
  className?: string
  inverse?: boolean
  centered?: boolean
}

function FooterLinkItem(props: { link: FooterLink }) {
  const { t } = useTranslation()
  const isExternal = props.link.href.startsWith('http')
  const label = t(props.link.text)

  if (isExternal) {
    return (
      <a
        href={props.link.href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-muted-foreground hover:text-foreground text-lg md:text-xl transition-colors duration-200'
      >
        {label}
      </a>
    )
  }

  return (
    <Link
      to={props.link.href}
      className='text-muted-foreground hover:text-foreground text-lg md:text-xl transition-colors duration-200'
    >
      {label}
    </Link>
  )
}

// Renders User Agreement / Privacy Policy links inline with the parent's
// copyright row when either is configured in System Settings → Site. Emits
// fragmented siblings so the parent flex container's gap controls spacing.
function LegalLinks(props: { leadingSeparator?: boolean }) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const items: { key: string; label: string; href: string }[] = []
  if (status?.user_agreement_enabled) {
    items.push({
      key: 'user-agreement',
      label: t('User Agreement'),
      href: '/user-agreement',
    })
  }
  if (status?.privacy_policy_enabled) {
    items.push({
      key: 'privacy-policy',
      label: t('Privacy Policy'),
      href: '/privacy-policy',
    })
  }
  if (items.length === 0) {
    return null
  }
  return (
    <>
      {items.map((item, index) => (
        <Fragment key={item.key}>
          {(props.leadingSeparator || index > 0) && (
            <span aria-hidden='true' className='text-muted-foreground/30'>
              |
            </span>
          )}
          <Link
            to={item.href}
            className='underline underline-offset-4 transition-colors duration-200 hover:text-foreground'
          >
            {item.label}
          </Link>
        </Fragment>
      ))}
    </>
  )
}

export function Footer(props: FooterProps) {
  const { t } = useTranslation()
  const {
    systemName,
    logo: systemLogo,
    footerHtml,
    demoSiteEnabled,
  } = useSystemConfig()

  const displayLogo = systemLogo || props.logo || '/logo.png'
  const displayName = systemName || props.name || DEFAULT_SYSTEM_NAME
  const descriptionLines = Array.isArray(props.description)
    ? props.description
    : props.description
      ? [props.description]
      : [t('Powerful API Management Platform')]
  const isDemoSiteMode = Boolean(demoSiteEnabled)
  const currentYear = new Date().getFullYear()
  const inverse = props.inverse === true
  const centered = props.centered === true

  const fallbackColumns = useMemo<FooterColumnProps[]>(
    () => [
      {
        title: t('footer.columns.about.title'),
        links: [
          {
            text: t('footer.columns.about.links.aboutProject'),
            href: '/about',
          },
          {
            text: t('footer.columns.about.links.contact'),
            href: '/about',
          },
          {
            text: t('footer.columns.about.links.features'),
            href: '/pricing',
          },
        ],
      },
      {
        title: t('footer.columns.docs.title'),
        links: [
          {
            text: t('footer.columns.docs.links.quickStart'),
            href: '/about',
          },
          {
            text: t('footer.columns.docs.links.installation'),
            href: '/about',
          },
          {
            text: t('footer.columns.docs.links.apiDocs'),
            href: '/about',
          },
        ],
      },
      {
        title: t('footer.columns.related.title'),
        links: [
          {
            text: t('footer.columns.related.links.oneApi'),
            href: 'https://github.com/songquanpeng/one-api',
          },
          {
            text: t('footer.columns.related.links.midjourney'),
            href: 'https://github.com/novicezk/midjourney-proxy',
          },
          {
            text: 'API Keys',
            href: '/keys',
          },
        ],
      },
    ],
    [t]
  )

  const displayColumns = props.columns ?? fallbackColumns
  const shouldShowColumns =
    displayColumns.length > 0 && (props.columns !== undefined || isDemoSiteMode)
  const footerLinkClassName = inverse
    ? '[&_a]:text-white/72 [&_a:hover]:text-white'
    : ''
  const legalRowClassName = inverse
    ? 'text-white/58'
    : 'text-muted-foreground/50'
  return (
    <footer
      className={cn('border-border/40 relative z-10 border-t', props.className)}
    >
      <div className='mx-auto max-w-7xl px-6 py-12 md:py-16'>
        <div
          className={cn(
            'flex flex-col gap-10',
            centered
              ? 'items-center text-center'
              : displayColumns.length === 1
                ? 'justify-between md:flex-row md:items-center md:gap-20'
                : 'justify-between md:flex-row md:gap-16'
          )}
        >
          {/* Brand column */}
          <div className={cn('shrink-0', centered && 'flex flex-col items-center')}>
            <Link
              to='/'
              className={cn(
                'group flex items-center gap-2.5',
                centered && 'justify-center'
              )}
            >
              <img
                src={displayLogo}
                alt={displayName}
                className='size-8 rounded-lg object-contain'
              />
              <span
                className={cn(
                  'text-2xl font-black tracking-tight sm:text-3xl',
                  inverse && 'text-white'
                )}
              >
                {displayName}
              </span>
            </Link>
            <div
              className={cn(
                'text-muted-foreground/60 mt-4 space-y-3 text-xl leading-relaxed',
                centered ? 'max-w-[820px]' : 'max-w-[420px]',
                inverse && 'text-white/68',
                centered && 'mx-auto text-center'
              )}
            >
              {descriptionLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {shouldShowColumns && (
            <div
              className={cn(
                'grid flex-1 gap-x-18 gap-y-10',
                displayColumns.length === 1
                  ? centered
                    ? 'justify-items-center'
                    : 'justify-items-center self-center'
                  : 'sm:grid-cols-2 lg:grid-cols-3 lg:justify-items-end'
              )}
            >
              {displayColumns.map((column, index) => (
                <div
                  key={index}
                  className={cn(
                    footerLinkClassName,
                    displayColumns.length === 1
                      ? centered
                        ? 'min-w-[240px] text-center'
                        : 'min-w-[240px] text-center'
                      : centered
                        ? 'min-w-[170px] text-center'
                        : 'min-w-[180px]'
                  )}
                >
                  {column.title ? (
                    <p
                      className={cn(
                        'text-muted-foreground/65 mb-4 text-base font-semibold tracking-wide uppercase',
                        inverse && 'text-white/92'
                      )}
                    >
                      {t(column.title)}
                    </p>
                  ) : null}
                  <ul
                    className={cn(
                      displayColumns.length === 1 ? 'space-y-9' : 'space-y-6'
                    )}
                  >
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <FooterLinkItem link={link} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Copyright + optional legal links; wraps on narrow screens. */}
        <div className='border-border/30 mt-12 flex flex-col items-center justify-center gap-x-3 gap-y-2 border-t pt-6 text-center'>
          <div
            className={cn(
              'flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 text-base',
              legalRowClassName
            )}
          >
            {footerHtml ? (
              <>
                <div
                  className='custom-footer max-w-full break-words text-center [&_p]:m-0 [&_p]:inline [&_span]:align-baseline [&_a]:align-baseline'
                  dangerouslySetInnerHTML={{ __html: footerHtml }}
                />
                <LegalLinks leadingSeparator />
              </>
            ) : (
              <>
                <span>
                  &copy; {currentYear} {displayName}.{' '}
                  {props.copyright ?? t('footer.defaultCopyright')}
                </span>
                <LegalLinks leadingSeparator />
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
