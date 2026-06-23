import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AzureAI,
  Claude,
  Cohere,
  DeepSeek,
  Gemini,
  Grok,
  Hunyuan,
  Midjourney,
  Minimax,
  Moonshot,
  OpenAI,
  Qwen,
  Spark,
  Suno,
  Volcengine,
  Wenxin,
  XAI,
  Xinference,
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
import { Button } from '@/components/ui/button'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitcher } from '@/components/language-switcher'

const endpoints = ['/v1/chat/completions', '/v1/responses', '/v1/embeddings']

const providerIcons = [
  Moonshot,
  OpenAI,
  XAI,
  Zhipu.Color,
  Volcengine.Color,
  Cohere.Color,
  Claude,
  Gemini.Color,
  Grok,
  Suno,
  Qwen.Color,
  DeepSeek.Color,
  Spark.Color,
  Midjourney,
  Hunyuan.Color,
  AzureAI.Color,
  Wenxin.Color,
  Minimax.Color,
  Xinference,
]

export function LegacyHome() {
  const { t } = useTranslation()
  const { status } = useStatus()
  const { systemName, logo, logoLoaded } = useSystemConfig()
  const [endpointIndex, setEndpointIndex] = useState(0)
  const serverAddress = useMemo(
    () =>
      (status?.server_address as string | undefined) ||
      `${window.location.origin}`,
    [status?.server_address]
  )
  const docsLink =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'
  const endpoint = endpoints[endpointIndex % endpoints.length]

  const copyServerAddress = async () => {
    await navigator.clipboard.writeText(serverAddress)
    toast.success(t('Copied to clipboard'))
  }

  return (
    <div className='from-background via-rose-50/25 to-sky-50/35 dark:via-rose-950/10 dark:to-slate-900 bg-gradient-to-br text-foreground min-h-svh overflow-x-hidden'>
      <header className='fixed inset-x-0 top-0 z-50 border-b border-white/40 bg-white/65 shadow-[0_8px_34px_-26px_rgba(14,165,233,0.85)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-none'>
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
                className='rounded-full bg-gradient-to-r from-blue-500/12 to-cyan-400/10 px-3.5 py-1.5 text-blue-800 shadow-sm ring-1 ring-blue-500/10 transition hover:from-blue-500/18 hover:to-cyan-400/16 dark:text-cyan-100 dark:ring-cyan-300/10'
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
                className='rounded-full px-3.5 py-1.5 text-slate-700 transition hover:bg-gradient-to-r hover:from-emerald-400/14 hover:via-cyan-400/12 hover:to-rose-400/12 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-200'
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

      <main className='relative pt-14'>
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
                {t('Unified')}
              </span>
              <br />
              <span className='bg-gradient-to-r from-blue-600 via-cyan-500 via-45% to-orange-500 bg-[length:190%_100%] bg-clip-text text-transparent dark:from-blue-300 dark:via-cyan-200 dark:to-orange-200'>
                {t('Large Model API Gateway')}
              </span>
            </h1>
            <p className='mt-7 text-lg text-slate-600 md:text-xl dark:text-slate-300'>
              {t('Access multiple models by only replacing the base URL:')}
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
                render={<Link to='/enterprise' />}
              >
                <Play data-icon='inline-start' />
                {t('Get API Key')}
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='h-12 rounded-full border-white/70 bg-white/60 px-6 text-base font-bold shadow-[0_16px_36px_-24px_rgba(14,165,233,0.75)] backdrop-blur hover:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15'
                render={
                  <a href={docsLink} target='_blank' rel='noopener noreferrer' />
                }
              >
                <FileText data-icon='inline-start' />
                {t('Docs')}
              </Button>
            </div>

            <div className='mt-24 w-full'>
              <p className='bg-gradient-to-r from-slate-500 via-sky-600 to-violet-600 bg-clip-text text-xl text-transparent md:text-2xl dark:from-slate-300 dark:via-cyan-200 dark:to-fuchsia-300'>
                {t('Supports many large model providers')}
              </p>
              <div className='mx-auto mt-9 flex max-w-4xl flex-wrap items-center justify-center gap-7 rounded-[2rem] bg-white/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur md:gap-10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'>
                {providerIcons.map((Icon, index) => (
                  <div
                    key={index}
                    className='flex size-10 items-center justify-center md:size-12'
                  >
                    <Icon size={40} />
                  </div>
                ))}
                <span className='text-xl font-black'>30+</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
