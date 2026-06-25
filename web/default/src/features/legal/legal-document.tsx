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
import { useQuery } from '@tanstack/react-query'
import { FileWarning } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PublicContentPage } from '@/components/layout/components/public-content-page'
import type { LegalDocumentResponse } from './types'

type LegalDocumentProps = {
  title: string
  queryKey: string
  fetchDocument: () => Promise<LegalDocumentResponse>
  emptyMessage: string
}

export function LegalDocument({
  title,
  queryKey,
  fetchDocument,
  emptyMessage,
}: LegalDocumentProps) {
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchDocument,
    staleTime: 10 * 60 * 1000,
  })

  const rawContent = data?.data ?? ''
  const hasContent = rawContent.trim().length > 0
  const content = data?.success && hasContent ? rawContent : ''

  return (
    <PublicContentPage
      title={title}
      content={content}
      isLoading={isLoading}
      emptyState={
        <div className='mx-auto max-w-2xl py-12'>
          <div className='flex items-center gap-4 rounded-[2rem] border border-slate-200/80 bg-white/70 px-6 py-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5'>
            <div className='bg-muted rounded-2xl p-3'>
              <FileWarning className='text-muted-foreground h-5 w-5' />
            </div>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold'>{title}</h2>
              <p className='text-muted-foreground text-sm'>
                {data?.message || emptyMessage}
              </p>
            </div>
          </div>
        </div>
      }
    />
  )
}
