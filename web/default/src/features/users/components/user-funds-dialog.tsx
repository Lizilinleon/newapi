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
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrencyLabel } from '@/lib/currency'
import { formatQuota, parseQuotaFromDollars } from '@/lib/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adjustUserQuota, searchUsers } from '../api'
import type { QuotaAdjustMode, User } from '../types'

function formatSignedQuota(value: number) {
  return `${value >= 0 ? '+' : ''}${formatQuota(value)}`
}

export function UserFundsDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currencyLabel = getCurrencyLabel()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [mode, setMode] = useState<QuotaAdjustMode>('add')
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const usersQuery = useQuery({
    queryKey: ['users', 'funds-dialog', keyword, page],
    queryFn: () =>
      searchUsers({
        keyword,
        p: page,
        page_size: 6,
      }),
    enabled: props.open,
  })

  const users = usersQuery.data?.data?.items ?? []
  const total = usersQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 6))
  const amountValue = Number(amount || 0)
  const quotaValue = parseQuotaFromDollars(amountValue)
  const mutationValue =
    mode === 'override'
      ? parseQuotaFromDollars(amountValue)
      : Math.abs(quotaValue)
  const selectedAfter =
    !selectedUser || !Number.isFinite(amountValue)
      ? selectedUser?.quota
      : mode === 'add'
        ? selectedUser.quota + mutationValue
        : mode === 'subtract'
          ? selectedUser.quota - mutationValue
          : mutationValue
  const selectedDelta =
    selectedUser && selectedAfter !== undefined
      ? selectedAfter - selectedUser.quota
      : 0
  const amountInvalid =
    amount.trim() === '' ||
    !Number.isFinite(amountValue) ||
    (mode !== 'override' && amountValue <= 0) ||
    (mode === 'override' && amountValue < 0)

  const mutation = useMutation({
    mutationFn: () =>
      adjustUserQuota({
        id: selectedUser?.id ?? 0,
        action: 'add_quota',
        mode,
        value: mutationValue,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || t('Failed to update user funds'))
        return
      }
      toast.success(t('User funds updated'))
      setConfirmOpen(false)
      setAmount('')
      setSelectedUser(null)
      void usersQuery.refetch()
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({
        queryKey: ['enterprise', 'summary'],
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Failed to update user funds')
      )
    },
  })

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    setPage(1)
    setSelectedUser(null)
  }

  const handleSubmit = () => {
    if (!selectedUser || amountInvalid || mutation.isPending) return
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!selectedUser || amountInvalid || mutation.isPending) return
    mutation.mutate()
  }

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>{t('Manage user funds')}</DialogTitle>
            <DialogDescription>
              {t(
                'Administrators can search users and add, subtract, or set their account balance.'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-4'>
            <div className='relative'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                value={keyword}
                onChange={(event) => handleKeywordChange(event.target.value)}
                placeholder={t('Search users by username or email')}
                className='pl-9'
              />
            </div>

            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('User')}</TableHead>
                    <TableHead>{t('Email')}</TableHead>
                    <TableHead>{t('Balance')}</TableHead>
                    <TableHead>{t('Role')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={
                        selectedUser?.id === user.id ? 'bg-muted/60' : undefined
                      }
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell>
                        <div className='font-medium'>
                          {user.display_name || user.username}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          @{user.username}
                        </div>
                      </TableCell>
                      <TableCell>{user.email || '-'}</TableCell>
                      <TableCell>{formatQuota(user.quota)}</TableCell>
                      <TableCell>
                        <Badge variant='outline'>{user.role}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-muted-foreground h-20'
                      >
                        {usersQuery.isLoading
                          ? t('Loading...')
                          : t('No users found.')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground text-sm'>
                {t('Page {{page}} of {{total}}', { page, total: totalPages })}
              </span>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  {t('Previous page')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  {t('Next page')}
                </Button>
              </div>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>{t('Selected user')}</FieldLabel>
                <FieldDescription>
                  {selectedUser
                    ? `${selectedUser.display_name || selectedUser.username} - ${formatQuota(selectedUser.quota)}`
                    : t('Select a user from the list first.')}
                </FieldDescription>
              </Field>
              <div className='grid gap-3 sm:grid-cols-[160px_1fr]'>
                <Field>
                  <FieldLabel htmlFor='admin-user-funds-mode'>
                    {t('Set mode')}
                  </FieldLabel>
                  <NativeSelect
                    id='admin-user-funds-mode'
                    value={mode}
                    onChange={(event) =>
                      setMode(event.target.value as QuotaAdjustMode)
                    }
                  >
                    <NativeSelectOption value='add'>
                      {t('Add amount')}
                    </NativeSelectOption>
                    <NativeSelectOption value='subtract'>
                      {t('Subtract amount')}
                    </NativeSelectOption>
                    <NativeSelectOption value='override'>
                      {t('Set balance')}
                    </NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor='admin-user-funds-amount'>
                    {t('Amount')} ({currencyLabel})
                  </FieldLabel>
                  <Input
                    id='admin-user-funds-amount'
                    type='number'
                    min={mode === 'override' ? 0 : 0.01}
                    step={0.01}
                    inputMode='decimal'
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder='100'
                  />
                  {selectedUser && (
                    <FieldDescription>
                      {t('Balance after change')}:{' '}
                      {formatQuota(selectedAfter ?? 0)}
                    </FieldDescription>
                  )}
                </Field>
              </div>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => props.onOpenChange(false)}>
              {t('Cancel')}
            </Button>
            <Button
              disabled={!selectedUser || amountInvalid || mutation.isPending}
              onClick={handleSubmit}
            >
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Save funds')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive'>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>{t('Confirm user fund update')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This update will change the following balances.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
            <div>
              <div className='text-muted-foreground'>{t('User')}</div>
              <div className='font-medium'>
                {selectedUser?.display_name || selectedUser?.username || '-'}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('Email')}</div>
              <div className='font-medium'>{selectedUser?.email || '-'}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('Set mode')}</div>
              <div className='font-medium'>
                {mode === 'add'
                  ? t('Add amount')
                  : mode === 'subtract'
                    ? t('Subtract amount')
                    : t('Set balance')}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Input amount')} ({currencyLabel})
              </div>
              <div className='font-medium'>
                {Number.isFinite(amountValue)
                  ? amountValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : '-'}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Current balance')}
              </div>
              <div className='font-medium'>
                {formatQuota(selectedUser?.quota ?? 0)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('New balance')}</div>
              <div className='font-medium'>
                {formatQuota(selectedAfter ?? 0)}
              </div>
            </div>
            <div className='sm:col-span-2'>
              <div className='text-muted-foreground'>{t('Change')}</div>
              <div className='font-medium'>
                {formatSignedQuota(selectedDelta)}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={mutation.isPending}
              onClick={handleConfirm}
            >
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Confirm update')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
