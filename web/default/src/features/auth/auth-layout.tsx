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
import { useSystemConfig } from '@/hooks/use-system-config'
import { Skeleton } from '@/components/ui/skeleton'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='from-background via-rose-50/35 to-cyan-50/45 dark:via-rose-950/15 dark:to-slate-900 relative grid h-svh max-w-none overflow-hidden bg-gradient-to-br'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -top-28 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-300/30 via-fuchsia-300/20 to-rose-300/25 blur-3xl' />
        <div className='absolute top-1/4 -left-24 size-80 rounded-full bg-cyan-300/25 blur-3xl' />
        <div className='absolute right-[-6rem] bottom-[-4rem] size-96 rounded-full bg-rose-300/25 blur-3xl' />
        <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(14,165,233,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(244,63,94,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent_78%)]' />
      </div>
      <div
        className='absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-white/60 bg-white/55 py-1 pr-4 pl-1.5 shadow-[0_14px_40px_-28px_rgba(14,165,233,0.9)] backdrop-blur-xl sm:top-8 sm:left-8 dark:border-white/10 dark:bg-white/5'
        aria-label={systemName}
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-contain'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='bg-gradient-to-r from-slate-900 via-blue-700 to-rose-600 bg-clip-text text-xl font-bold text-transparent dark:from-white dark:via-cyan-200 dark:to-rose-200'>
            {systemName}
          </h1>
        )}
      </div>
      <div className='container relative z-10 flex items-center pt-16 sm:pt-0'>
        <div className='mx-auto flex w-full flex-col justify-center rounded-[2.25rem] border border-white/65 bg-white/62 px-6 py-10 shadow-[0_30px_96px_-46px_rgba(15,23,42,0.68)] backdrop-blur-2xl sm:w-[560px] sm:p-10 dark:border-white/10 dark:bg-slate-950/58'>
          {children}
        </div>
      </div>
    </div>
  )
}
