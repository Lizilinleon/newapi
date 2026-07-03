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
import { BookOpen, Download, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getDocsServiceUrl } from '@/lib/docs-url'
import { Button } from '@/components/ui/button'

const CC_SWITCH_DOWNLOADS = [
  {
    label: 'Linux',
    href: 'https://github.com/farion1231/cc-switch/releases/download/v3.16.5/CC-Switch-v3.16.5-Linux-x86_64.deb',
  },
  {
    label: 'macOS',
    href: 'https://github.com/farion1231/cc-switch/releases/download/v3.16.5/CC-Switch-v3.16.5-macOS.dmg',
  },
  {
    label: 'Windows',
    href: 'https://github.com/farion1231/cc-switch/releases/download/v3.16.5/CC-Switch-v3.16.5-Windows.msi',
  },
] as const

const MANUAL_GUIDES = [
  {
    label: 'Claude Code',
    path: 'scenarios/programming/claude-code.html',
  },
  {
    label: 'Codex CLI',
    path: 'scenarios/programming/codex-cli.html',
  },
  {
    label: 'Cursor',
    path: 'scenarios/programming/cursor.html',
  },
] as const

export function CCSwitchDownloadLinks() {
  const { t } = useTranslation()
  const docsBase = getDocsServiceUrl()

  const getManualGuideUrl = (path: string) => new URL(path, docsBase).toString()

  return (
    <div className='border-border/70 bg-muted/20 flex flex-col gap-3 rounded-lg border px-3 py-2.5 xl:flex-row xl:items-center xl:justify-between'>
      <div className='flex min-w-0 items-start gap-2.5'>
        <span className='bg-background text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border shadow-xs'>
          <ShieldCheck className='size-4' />
        </span>
        <div className='min-w-0'>
          <div className='text-sm font-medium'>
            {t('CC Switch desktop client')}
          </div>
          <p className='text-muted-foreground text-xs'>
            {t(
              'Download CC Switch to import and switch API keys directly from this table.'
            )}
          </p>
        </div>
      </div>
      <div className='grid gap-3 md:grid-cols-2 xl:shrink-0'>
        <div className='flex flex-col gap-1.5'>
          <div className='text-muted-foreground text-[11px] font-medium'>
            CC Switch
          </div>
          <div className='flex flex-wrap gap-2'>
            {CC_SWITCH_DOWNLOADS.map((item) => (
              <Button
                key={item.label}
                variant='outline'
                size='sm'
                render={
                  <a
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                <Download data-icon='inline-start' />
                {t(item.label)}
              </Button>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-1.5'>
          <div className='text-muted-foreground text-[11px] font-medium'>
            {t('Manual access')}
          </div>
          <div className='flex flex-wrap gap-2'>
            {MANUAL_GUIDES.map((item) => (
              <Button
                key={item.label}
                variant='outline'
                size='sm'
                render={
                  <a
                    href={getManualGuideUrl(item.path)}
                    target='_blank'
                    rel='noopener noreferrer'
                  />
                }
              >
                <BookOpen data-icon='inline-start' />
                {t(item.label)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
