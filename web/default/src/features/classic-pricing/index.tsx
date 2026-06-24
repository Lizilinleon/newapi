import '@douyinfe/semi-ui/react19-adapter'
import '@douyinfe/semi-ui/dist/css/semi.css'
import 'react-toastify/dist/ReactToastify.css'
import '../../../../classic/src/i18n/i18n'
import './classic-pricing.css'

import { useContext, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { BookOpen, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MemoryRouter as ClassicMemoryRouter } from 'react-router-dom'
import { UserContext, UserProvider } from '../../../../classic/src/context/User'
import {
  StatusContext,
  StatusProvider,
} from '../../../../classic/src/context/Status'
import { ThemeProvider } from '../../../../classic/src/context/Theme'
import PricingPage from '../../../../classic/src/components/table/model-pricing/layout/PricingPage'
import { API, setStatusData, showError } from '../../../../classic/src/helpers'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'

export function ClassicPricing() {
  return (
    <ClassicMemoryRouter initialEntries={[window.location.pathname]}>
      <StatusProvider>
        <UserProvider>
          <ThemeProvider>
            <ClassicPricingContent />
          </ThemeProvider>
        </UserProvider>
      </StatusProvider>
    </ClassicMemoryRouter>
  )
}

function ClassicPricingContent() {
  const [, userDispatch] = useContext(UserContext)
  const [, statusDispatch] = useContext(StatusContext)

  useEffect(() => {
    document.body.classList.add('classic-pricing-active')
    return () => document.body.classList.remove('classic-pricing-active')
  }, [])

  useEffect(() => {
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      try {
        userDispatch({ type: 'login', payload: JSON.parse(cachedUser) })
      } catch (_error) {
        localStorage.removeItem('user')
      }
    }

    API.get('/api/status')
      .then((res) => {
        const { success, data } = res.data
        if (success) {
          statusDispatch({ type: 'set', payload: data })
          setStatusData(data)
        }
      })
      .catch(() => showError('Failed to load status'))
  }, [statusDispatch, userDispatch])

  return (
    <div className='classic-pricing-shell'>
      <PricingHeader />
      <PricingPage />
    </div>
  )
}

function PricingHeader() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo, logoLoaded } = useSystemConfig()
  const docsLink =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  return (
    <header className='classic-pricing-header fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/65 shadow-[0_8px_34px_-26px_rgba(14,165,233,0.85)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-none'>
      <div className='flex h-16 items-center justify-between px-3 md:px-5'>
        <div className='flex items-center gap-7'>
          <Link
            to='/'
            className='flex items-center gap-2 rounded-full bg-white/45 py-1 pr-3 pl-1.5 shadow-sm ring-1 ring-white/70 transition hover:bg-white/70 dark:bg-white/5 dark:ring-white/10 dark:hover:bg-white/10'
          >
            <img
              src={logo}
              alt={systemName}
              className='size-8 rounded-lg object-contain'
              style={{ opacity: logoLoaded ? 1 : 0.65 }}
            />
            <span className='text-base font-bold tracking-tight'>
              {systemName}
            </span>
          </Link>
          <nav className='hidden items-center gap-1 rounded-full border border-white/70 bg-white/50 p-1 text-sm font-semibold shadow-[0_10px_34px_-24px_rgba(14,165,233,0.9)] backdrop-blur-xl md:flex dark:border-white/10 dark:bg-white/5'>
            <Link
              to='/'
              className='rounded-full px-3.5 py-1.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-blue-500/12 hover:to-cyan-400/10 hover:text-blue-800 dark:text-slate-300 dark:hover:text-cyan-100'
            >
              {t('Home')}
            </Link>
            <Link
              to='/enterprise'
              className='rounded-full px-3.5 py-1.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-indigo-500/14 hover:to-rose-500/12 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-200'
            >
              {t('Console')}
            </Link>
            <Link
              to='/pricing'
              className='rounded-full bg-gradient-to-r from-emerald-400/14 via-cyan-400/12 to-rose-400/12 px-3.5 py-1.5 text-emerald-700 shadow-sm ring-1 ring-emerald-500/10 transition hover:from-emerald-400/20 hover:via-cyan-400/18 hover:to-rose-400/18 dark:text-emerald-200 dark:ring-emerald-300/10'
            >
              {t('Model Plaza')}
            </Link>
            <a
              href={docsLink}
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-full px-3.5 py-1.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-violet-500/14 hover:to-rose-500/12 hover:text-violet-700 dark:text-slate-300 dark:hover:text-fuchsia-200'
            >
              {t('Docs')}
            </a>
            <Link
              to='/about'
              className='rounded-full px-3.5 py-1.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-orange-400/12 hover:to-rose-500/14 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-200'
            >
              {t('About')}
            </Link>
          </nav>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon' aria-label={t('Notifications')}>
            <BookOpen />
          </Button>
          <Button variant='ghost' size='icon' aria-label={t('Display')}>
            <Monitor />
          </Button>
          <LanguageSwitcher />
          <ThemeSwitch />
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='border-primary/40 text-primary hover:bg-primary/10 rounded-full px-4'
              render={<Link to='/sign-in' />}
            >
              {t('Login')}
            </Button>
            <Button
              size='sm'
              className='rounded-full px-4 shadow-sm'
              render={<Link to='/sign-up' />}
            >
              {t('Register')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

