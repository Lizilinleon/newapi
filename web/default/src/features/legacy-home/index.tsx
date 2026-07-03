import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Baichuan,
  DeepSeek,
  Hunyuan,
  Minimax,
  Moonshot,
  Qwen,
  SenseNova,
  Spark,
  Stepfun,
  Volcengine,
  Wenxin,
  Yi,
  Zhipu,
} from '@lobehub/icons'
import {
  BookOpen,
  Copy,
  FileText,
  Monitor,
  Play,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { getDocsServiceUrl } from '@/lib/docs-url'
import { Footer } from '@/components/layout/components/footer'
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useHomePageContent } from '@/features/home/hooks'

const endpoints = ['/v1/chat/completions', '/v1/responses', '/v1/embeddings']

const providerIcons = [
  Moonshot,
  Zhipu.Color,
  Volcengine.Color,
  Qwen.Color,
  DeepSeek.Color,
  Spark.Color,
  Hunyuan.Color,
  Wenxin.Color,
  Minimax.Color,
  Baichuan.Color,
  Yi.Color,
  Stepfun.Color,
  SenseNova.Color,
]

type HomeHeroOverrides = {
  titleTop?: string
  titleBottom?: string
  subtitle?: string
  serverAddress?: string
  endpoints?: string[]
  primaryButtonText?: string
  primaryButtonUrl?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
  providersTitle?: string
}

function parseHomeHeroOverrides(content: string): HomeHeroOverrides {
  const trimmed = content.trim()
  if (!trimmed) return {}

  try {
    const parsed = JSON.parse(trimmed)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const endpoints = Array.isArray(parsed.endpoints)
        ? parsed.endpoints.filter(
            (value): value is string =>
              typeof value === 'string' && value.trim().length > 0
          )
        : undefined

      return {
        titleTop:
          typeof parsed.titleTop === 'string' ? parsed.titleTop.trim() : '',
        titleBottom:
          typeof parsed.titleBottom === 'string'
            ? parsed.titleBottom.trim()
            : '',
        subtitle:
          typeof parsed.subtitle === 'string' ? parsed.subtitle.trim() : '',
        serverAddress:
          typeof parsed.serverAddress === 'string'
            ? parsed.serverAddress.trim()
            : '',
        endpoints,
        primaryButtonText:
          typeof parsed.primaryButtonText === 'string'
            ? parsed.primaryButtonText.trim()
            : '',
        primaryButtonUrl:
          typeof parsed.primaryButtonUrl === 'string'
            ? parsed.primaryButtonUrl.trim()
            : '',
        secondaryButtonText:
          typeof parsed.secondaryButtonText === 'string'
            ? parsed.secondaryButtonText.trim()
            : '',
        secondaryButtonUrl:
          typeof parsed.secondaryButtonUrl === 'string'
            ? parsed.secondaryButtonUrl.trim()
            : '',
        providersTitle:
          typeof parsed.providersTitle === 'string'
            ? parsed.providersTitle.trim()
            : '',
      }
    }
  } catch {
    // Fall back to plain text line mapping for quick admin edits.
  }

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    titleTop: lines[0] ?? '',
    titleBottom: lines[1] ?? '',
    subtitle: lines[2] ?? '',
    providersTitle: lines[3] ?? '',
  }
}

export function LegacyHome() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo, logoLoaded } = useSystemConfig()
  const { content: homePageContent } = useHomePageContent()
  const [endpointIndex, setEndpointIndex] = useState(0)
  const heroOverrides = useMemo(
    () => parseHomeHeroOverrides(homePageContent),
    [homePageContent]
  )
  const serverAddress = useMemo(
    () =>
      heroOverrides.serverAddress ||
      (status?.server_address as string | undefined) ||
      `${window.location.origin}`,
    [heroOverrides.serverAddress, status?.server_address]
  )
  const docsLink = getDocsServiceUrl()
  const displayEndpoints =
    heroOverrides.endpoints?.length ? heroOverrides.endpoints : endpoints
  const endpoint = displayEndpoints[endpointIndex % displayEndpoints.length]
  const titleTop = heroOverrides.titleTop || t('Unified')
  const titleBottom =
    heroOverrides.titleBottom || t('Large Model API Gateway')
  const subtitle =
    heroOverrides.subtitle ||
    t('Access multiple models by only replacing the base URL:')
  const primaryButtonText = heroOverrides.primaryButtonText || t('Get API Key')
  const primaryButtonUrl = heroOverrides.primaryButtonUrl || '/enterprise'
  const secondaryButtonText = heroOverrides.secondaryButtonText || t('Docs')
  const secondaryButtonUrl = heroOverrides.secondaryButtonUrl || docsLink
  const providersTitle =
    heroOverrides.providersTitle || t('Supports many large model providers')
  const primaryButtonIsExternal = /^https?:\/\//i.test(primaryButtonUrl)
  const secondaryButtonIsExternal = /^https?:\/\//i.test(secondaryButtonUrl)
  const copyServerAddress = async () => {
    await navigator.clipboard.writeText(serverAddress)
    toast.success(t('Copied to clipboard'))
  }

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
                className='rounded-full bg-gradient-to-r from-blue-500/12 to-cyan-400/10 px-5 py-2.5 text-blue-800 shadow-sm ring-1 ring-blue-500/10 transition hover:from-blue-500/18 hover:to-cyan-400/16 dark:text-cyan-100 dark:ring-cyan-300/10'
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
              <Link
                to='/about'
                className='rounded-full px-5 py-2.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-orange-400/12 hover:to-rose-500/14 hover:text-rose-700 dark:text-slate-300 dark:hover:text-rose-200'
              >
                {t('About')}
              </Link>
            </nav>
          </div>

          <div className='flex items-center gap-2.5'>
            <Button
              variant='ghost'
              size='icon-lg'
              className='hidden rounded-full sm:inline-flex'
              aria-label={t('Docs')}
              render={
                <a href={docsLink} target='_blank' rel='noopener noreferrer' />
              }
            >
              <BookOpen />
            </Button>
            <Button variant='ghost' size='icon-lg' className='hidden rounded-full sm:inline-flex' aria-label={t('Display')}>
              <Monitor />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitch />
            <div className='flex items-center gap-2 rounded-full border border-white/70 bg-white/52 p-1.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5'>
              <Button
                variant='outline'
                className='h-11 rounded-full border-slate-300 bg-white px-6 text-base font-bold text-slate-950 shadow-sm hover:bg-slate-100 dark:border-white/20 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200'
                render={<Link to='/enterprise' />}
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

      <main className='relative pt-20'>
        <section className='relative isolate overflow-hidden border-b border-sky-100/70 px-4 pt-12 pb-16 md:pt-20 md:pb-24 dark:border-white/10'>
          <div className='pointer-events-none absolute inset-0 -z-10'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(99,102,241,0.22),transparent_34%),radial-gradient(circle_at_35%_42%,rgba(34,211,238,0.24),transparent_30%),radial-gradient(circle_at_68%_36%,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_58%_62%,rgba(244,63,94,0.10),transparent_26%)] dark:bg-[radial-gradient(circle_at_50%_8%,rgba(99,102,241,0.26),transparent_34%),radial-gradient(circle_at_35%_42%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_68%_36%,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_58%_62%,rgba(244,63,94,0.09),transparent_26%)]' />
            <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_52%_at_50%_24%,black,transparent_76%)]' />
            <div className='absolute top-4 left-1/2 size-[620px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-300/35 via-cyan-200/35 to-rose-200/25 blur-3xl' />
            <div className='absolute top-52 left-[18%] size-[360px] rounded-full bg-teal-300/30 blur-3xl' />
            <div className='absolute top-28 right-[16%] size-[420px] rounded-full bg-fuchsia-300/25 blur-3xl' />
          </div>

          <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
            <h1 className='relative text-[clamp(3rem,7vw,6rem)] leading-[0.96] font-black tracking-tight drop-shadow-[0_12px_40px_rgba(59,130,246,0.18)]'>
              <span className='bg-gradient-to-br from-slate-950 via-violet-700 via-45% to-rose-600 bg-[length:170%_100%] bg-clip-text text-transparent dark:from-white dark:via-fuchsia-200 dark:to-rose-200'>
                {titleTop}
              </span>
              <br />
              <span className='bg-gradient-to-r from-blue-600 via-cyan-500 via-45% to-orange-500 bg-[length:190%_100%] bg-clip-text text-transparent dark:from-blue-300 dark:via-cyan-200 dark:to-orange-200'>
                {titleBottom}
              </span>
            </h1>
            <p className='mt-7 text-lg text-slate-600 md:text-xl dark:text-slate-300'>
              {subtitle}
            </p>

            <div className='mt-7 flex w-full max-w-xl items-center gap-3 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-left shadow-[0_18px_60px_-28px_rgba(14,165,233,0.75)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/65'>
              <span className='min-w-0 flex-1 truncate text-base'>
                {serverAddress}
              </span>
              <button
                type='button'
                className='hidden font-semibold text-blue-600 transition-colors hover:text-violet-600 sm:inline dark:text-cyan-300 dark:hover:text-fuchsia-300'
                onClick={() =>
                  setEndpointIndex((current) => current + 1)
                }
              >
                {endpoint}
              </button>
              <Button
                size='icon-sm'
                variant='ghost'
                aria-label={t('Copy')}
                onClick={copyServerAddress}
              >
                <Copy />
              </Button>
            </div>

            <div className='mt-9 flex flex-wrap items-center justify-center gap-3'>
              <Button
                size='lg'
                className='h-12 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-7 text-base font-bold shadow-[0_16px_36px_-18px_rgba(37,99,235,0.9)] hover:opacity-95'
                render={
                  primaryButtonIsExternal ? (
                    <a
                      href={primaryButtonUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    />
                  ) : (
                    <Link to={primaryButtonUrl} />
                  )
                }
              >
                <Play data-icon='inline-start' />
                {primaryButtonText}
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='h-12 rounded-full border-white/70 bg-white/60 px-6 text-base font-bold shadow-[0_16px_36px_-24px_rgba(14,165,233,0.75)] backdrop-blur hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15'
                render={
                  secondaryButtonIsExternal ? (
                    <a
                      href={secondaryButtonUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                    />
                  ) : (
                    <Link to={secondaryButtonUrl} />
                  )
                }
              >
                <FileText data-icon='inline-start' />
                {secondaryButtonText}
              </Button>
            </div>

            <div className='mt-24 w-full'>
              <p className='bg-gradient-to-r from-slate-500 via-sky-600 to-violet-600 bg-clip-text text-xl text-transparent md:text-2xl dark:from-slate-300 dark:via-cyan-200 dark:to-fuchsia-300'>
                {providersTitle}
              </p>
              <div className='mx-auto mt-9 flex max-w-5xl flex-nowrap items-center justify-between gap-4 overflow-hidden rounded-[2rem] bg-white/30 px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur sm:gap-5 md:px-7 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'>
                {providerIcons.map((Icon, index) => (
                  <div
                    key={index}
                    className='flex size-8 shrink-0 items-center justify-center sm:size-9 md:size-10'
                  >
                    <Icon size={34} />
                  </div>
                ))}
                <span className='shrink-0 text-lg font-black md:text-xl'>30+</span>
              </div>
            </div>
          </div>
        </section>
        <Footer
          name={systemName}
          columns={[]}
          className='border-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.98))] text-white'
          copyright='All rights reserved.'
          inverse
          description={[
            t('Enterprise-ready large model gateway for unified model access.'),
            t('Stable routing, account management, billing control, and compliance-ready access experience.'),
          ]}
        />
      </main>
    </div>
  )
}
