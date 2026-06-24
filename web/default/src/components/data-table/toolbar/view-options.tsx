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
import * as React from 'react'
import { type Table } from '@tanstack/react-table'
import { Columns3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const { t } = useTranslation()
  const hideableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== 'undefined' && column.getCanHide()
        ),
    [table]
  )
  const visibleCount = hideableColumns.filter((column) =>
    column.getIsVisible()
  ).length

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            className='shrink-0 gap-1.5'
            aria-label={t('Display columns')}
          />
        }
      >
        <Columns3 data-icon='inline-start' />
        {t('Display columns')}
        {hideableColumns.length > 0 && (
          <span className='text-muted-foreground font-normal'>
            {visibleCount}/{hideableColumns.length}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center justify-between gap-2'>
            <span>{t('Toggle columns')}</span>
            <span className='text-muted-foreground font-normal'>
              {visibleCount}/{hideableColumns.length}
            </span>
          </DropdownMenuLabel>
          {hideableColumns.length > 0 ? (
            hideableColumns.map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className='capitalize'
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {typeof column.columnDef.header === 'string'
                    ? column.columnDef.header
                    : (column.columnDef.meta?.label ?? column.id)}
                </DropdownMenuCheckboxItem>
              )
            })
          ) : (
            <DropdownMenuItem disabled>
              {t('No columns can be hidden')}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {hideableColumns.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => table.resetColumnVisibility()}>
              {t('Reset')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
