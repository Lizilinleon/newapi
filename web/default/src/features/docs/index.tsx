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
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { BookOpen, FileText, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PublicLayout } from '@/components/layout'
import { Markdown } from '@/components/ui/markdown'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSystemConfig } from '@/hooks/use-system-config'
import { DEFAULT_SYSTEM_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { localDocs, type LocalDoc } from './generated-docs'

const groupLabels: Record<string, string> = {
  'api-capabilities': 'API Capabilities',
  'api-reference': 'API Reference',
  faq: 'FAQ',
  guides: 'Guides',
  scenarios: 'Scenarios',
  wiki: 'Knowledge Base',
}

type DocsSearch = {
  page?: string
}

function getServerAddress() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function replaceBrand(value: string, systemName: string) {
  const serverAddress = getServerAddress()

  return value
    .replace(/https:\/\/docs\.weelinking\.com\/docs\/?/gi, '/docs?page=')
    .replace(/https:\/\/docs\.weelinking\.com\/?/gi, '/docs')
    .replace(/https:\/\/api\.weelinking\.com/gi, serverAddress)
    .replace(/api\.weelinking\.com/gi, serverAddress.replace(/^https?:\/\//, ''))
    .replace(/\bweelinking\b/gi, systemName)
}

function getDocsByGroup(docs: LocalDoc[]) {
  return docs.reduce<Record<string, LocalDoc[]>>((groups, doc) => {
    const key = doc.group || 'guides'
    groups[key] = groups[key] ?? []
    groups[key].push(doc)
    return groups
  }, {})
}

export function DocsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/docs/' }) as DocsSearch
  const { systemName } = useSystemConfig()
  const displayName = systemName || DEFAULT_SYSTEM_NAME
  const [query, setQuery] = useState('')

  const activeDoc =
    localDocs.find((doc) => doc.id === search.page) ??
    localDocs.find((doc) => doc.id === 'index') ??
    localDocs[0]

  const visibleDocs = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return localDocs

    return localDocs.filter((doc) => {
      const haystack = `${doc.title}\n${doc.description}\n${doc.content}`.toLowerCase()
      return haystack.includes(keyword)
    })
  }, [query])

  const groupedDocs = useMemo(() => getDocsByGroup(visibleDocs), [visibleDocs])
  const renderedContent = replaceBrand(activeDoc.content, displayName)
  const renderedTitle = replaceBrand(activeDoc.title, displayName)
  const renderedDescription = replaceBrand(activeDoc.description, displayName)

  return (
    <PublicLayout showMainContainer={false}>
      <main className='from-background via-slate-950/5 to-cyan-950/10 min-h-svh bg-gradient-to-br pt-20 dark:via-slate-950 dark:to-cyan-950/30'>
        <section className='border-border/60 border-b px-4 py-8 md:px-8'>
          <div className='mx-auto flex max-w-7xl flex-col gap-4'>
            <Badge className='w-fit rounded-full px-3 py-1' variant='secondary'>
              <BookOpen className='mr-1 size-3.5' />
              {displayName}
            </Badge>
            <div className='space-y-2'>
              <h1 className='text-4xl font-black tracking-tight md:text-5xl'>
                {t('Documentation Center')}
              </h1>
              <p className='text-muted-foreground max-w-3xl text-lg'>
                {t(
                  'Use the navigation to browse API guides, integration scenarios, and model references.'
                )}
              </p>
            </div>
          </div>
        </section>

        <div className='mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[320px_minmax(0,1fr)] md:px-8'>
          <aside className='border-border/70 bg-card/72 sticky top-24 h-fit rounded-3xl border p-4 shadow-sm backdrop-blur-xl'>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('Search documentation...')}
                className='h-11 rounded-2xl pl-9'
              />
            </div>

            <ScrollArea className='mt-4 h-[calc(100vh-15rem)] pr-3'>
              <div className='space-y-5'>
                {Object.keys(groupedDocs).length === 0 ? (
                  <p className='text-muted-foreground px-2 py-8 text-center text-sm'>
                    {t('No documents found')}
                  </p>
                ) : (
                  Object.entries(groupedDocs).map(([group, docs]) => (
                    <div key={group} className='space-y-2'>
                      <p className='text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase'>
                        {groupLabels[group] ?? group}
                      </p>
                      <div className='space-y-1'>
                        {docs.map((doc) => {
                          const isActive = doc.id === activeDoc.id
                          return (
                            <button
                              key={doc.id}
                              type='button'
                              onClick={() =>
                                navigate({
                                  to: '/docs',
                                  search: { page: doc.id },
                                })
                              }
                              className={cn(
                                'flex w-full items-start gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition',
                                isActive
                                  ? 'bg-primary/12 text-primary shadow-sm'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              <FileText className='mt-0.5 size-4 shrink-0' />
                              <span className='line-clamp-2'>
                                {replaceBrand(doc.title, displayName)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </aside>

          <article className='border-border/70 bg-card/82 rounded-3xl border p-6 shadow-sm backdrop-blur-xl md:p-9'>
            <div className='mb-8 border-b pb-6'>
              <Link
                to='/docs'
                className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
              >
                {t('Back to docs home')}
              </Link>
              <h2 className='mt-3 text-3xl font-black tracking-tight md:text-4xl'>
                {renderedTitle}
              </h2>
              {renderedDescription ? (
                <p className='text-muted-foreground mt-3 text-base leading-relaxed'>
                  {renderedDescription}
                </p>
              ) : null}
            </div>
            <Markdown className='prose-base dark:prose-invert max-w-none'>
              {renderedContent}
            </Markdown>
          </article>
        </div>
      </main>
    </PublicLayout>
  )
}
