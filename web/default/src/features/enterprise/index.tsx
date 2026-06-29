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
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Building2,
  CircleDollarSign,
  KeyRound,
  ListFilter,
  Plus,
  Search,
  ShieldCheck,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks'
import { getCurrencyLabel } from '@/lib/currency'
import {
  formatNumber,
  formatQuota,
  formatTimestampToDate,
  parseQuotaFromDollars,
  quotaUnitsToDollars,
} from '@/lib/format'
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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DISABLED_ROW_DESKTOP,
  DISABLED_ROW_MOBILE,
  DataTablePage,
} from '@/components/data-table'
import { SectionPageLayout } from '@/components/layout'
import { ApiKeysDeleteDialog } from '@/features/keys/components/api-keys-delete-dialog'
import { ApiKeysMutateDrawer } from '@/features/keys/components/api-keys-mutate-drawer'
import {
  ApiKeysProvider,
  useApiKeys,
} from '@/features/keys/components/api-keys-provider'
import { useApiKeysColumns } from '@/features/keys/components/api-keys-columns'
import { DataTableBulkActions } from '@/features/keys/components/data-table-bulk-actions'
import { CCSwitchDialog } from '@/features/keys/components/dialogs/cc-switch-dialog'
import { createApiKey } from '@/features/keys/api'
import {
  API_KEY_STATUS,
  API_KEY_STATUS_OPTIONS,
} from '@/features/keys/constants'
import type { ApiKey } from '@/features/keys/types'
import {
  acceptEnterpriseInvitation,
  allocateEnterpriseMemberQuota,
  createEnterpriseAccount,
  createEnterpriseMember,
  dissolveEnterprise,
  getEnterpriseLogs,
  getEnterpriseMemberTokens,
  getEnterpriseOwnerTokens,
  getEnterpriseSummary,
  leaveEnterprise,
  removeEnterpriseMember,
  transferEnterpriseQuota,
  updateEnterpriseMember,
} from './api'
import type {
  EnterpriseCreateAccountPayload,
  EnterpriseCreateMemberPayload,
  EnterpriseMember,
  EnterpriseSummary,
} from './types'

const ENTERPRISE_QUERY_KEY = ['enterprise', 'summary'] as const
const MEMBER_STATUS = {
  active: 1,
  disabled: 2,
  removed: 3,
} as const

type CreateMemberForm = EnterpriseCreateMemberPayload
type CreateAccountForm = EnterpriseCreateAccountPayload
type QuotaAllocationMode = 'set' | 'add'
type EnterpriseSection = 'overview' | 'members' | 'member-api' | 'usage-logs'

const ENTERPRISE_SECTIONS: EnterpriseSection[] = [
  'overview',
  'members',
  'member-api',
  'usage-logs',
]

function getEnterpriseSectionFromPath(pathname: string): EnterpriseSection {
  const segment = pathname.match(/^\/enterprise\/([^/]+)/)?.[1]
  return ENTERPRISE_SECTIONS.includes(segment as EnterpriseSection)
    ? (segment as EnterpriseSection)
    : 'overview'
}

function useEnterpriseSection(allowedSections: EnterpriseSection[]) {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (location) => location.pathname })
  const section = getEnterpriseSectionFromPath(pathname)
  const safeSection = allowedSections.includes(section) ? section : 'overview'
  const setSection = (nextSection: EnterpriseSection) => {
    void navigate({ to: `/enterprise/${nextSection}` as never })
  }
  return { section: safeSection, setSection }
}

function getEnterpriseSectionTitle(
  section: EnterpriseSection,
  t: (key: string) => string
) {
  if (section === 'members') return t('Member management')
  if (section === 'member-api') return t('API Keys')
  if (section === 'usage-logs') return t('Usage logs')
  return t('Overview')
}

function getEnterpriseRootTitle(t: (key: string) => string) {
  return t('Enterprise')
}

const emptyCreateForm: CreateMemberForm = {
  display_name: '',
  email: '',
}

const emptyCreateAccountForm: CreateAccountForm = {
  name: '',
}

function memberStatusLabel(status: number) {
  if (status === MEMBER_STATUS.active) return 'Active'
  if (status === MEMBER_STATUS.disabled) return 'Disabled'
  return 'Removed'
}

function memberStatusVariant(
  status: number
): 'secondary' | 'destructive' | 'outline' {
  if (status === MEMBER_STATUS.active) return 'secondary'
  if (status === MEMBER_STATUS.disabled) return 'destructive'
  return 'outline'
}

function isQuotaNearLimit(member: EnterpriseMember) {
  if (member.allocated_quota <= 0 || member.quota <= 0) return false
  return member.quota <= member.allocated_quota * member.quota_warning_threshold
}

function StatCard(props: {
  title: string
  value: React.ReactNode
  description: string
  icon: React.ComponentType<{ className?: string }>
  danger?: boolean
  footer?: React.ReactNode
}) {
  const Icon = props.icon
  return (
    <Card
      className={
        props.danger ? 'border-destructive/40 bg-destructive/5' : undefined
      }
    >
      <CardHeader>
        <CardTitle className={props.danger ? 'text-destructive' : undefined}>
          {props.title}
        </CardTitle>
        <CardDescription>{props.description}</CardDescription>
        <CardAction>
          <Icon
            className={
              props.danger
                ? 'text-destructive size-4'
                : 'text-muted-foreground size-4'
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div
          className={
            props.danger
              ? 'text-destructive text-2xl font-semibold tabular-nums'
              : 'text-2xl font-semibold tabular-nums'
          }
        >
          {props.value}
        </div>
        {props.footer}
      </CardContent>
    </Card>
  )
}

function EnterpriseSkeleton() {
  return (
    <div className='flex flex-col gap-4'>
      <div className='grid gap-4 md:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-36' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
          <Skeleton className='h-4 w-60' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-44 w-full' />
        </CardContent>
      </Card>
    </div>
  )
}

function CreateMemberDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateMemberForm>(emptyCreateForm)

  const mutation = useMutation({
    mutationFn: createEnterpriseMember,
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Enterprise invitation email sent'))
      setForm(emptyCreateForm)
      props.onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })

  const updateField = (field: keyof CreateMemberForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate(form)
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>{t('Invite enterprise member')}</DialogTitle>
            <DialogDescription>
              {t(
                'Send an invitation email. The member joins only after opening the email link with their own account.'
              )}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='enterprise-member-email'>
                {t('Member email')}
              </FieldLabel>
              <Input
                id='enterprise-member-email'
                type='email'
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder={t('name@example.com')}
                required
              />
              <FieldDescription>
                {t(
                  'The invitation is sent by email. It does not add the member until they accept the link.'
                )}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor='enterprise-member-display-name'>
                {t('Organization display name')}
              </FieldLabel>
              <Input
                id='enterprise-member-display-name'
                value={form.display_name}
                onChange={(event) =>
                  updateField('display_name', event.target.value)
                }
                placeholder={t('Use account display name by default')}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => props.onOpenChange(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Invite member')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CreateAccountDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CreateAccountForm>(emptyCreateAccountForm)

  const mutation = useMutation({
    mutationFn: createEnterpriseAccount,
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Organization created'))
      setForm(emptyCreateAccountForm)
      props.onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    mutation.mutate({ name: form.name.trim() })
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <DialogHeader>
            <DialogTitle>{t('Create organization')}</DialogTitle>
            <DialogDescription>
              {t(
                'Use your own account balance as the organization fund pool, then allocate quota to child members.'
              )}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='enterprise-account-name'>
                {t('Organization name')}
              </FieldLabel>
              <Input
                id='enterprise-account-name'
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder={t('My organization')}
                required
              />
              <FieldDescription>
                {t(
                  'Members can only spend quota you explicitly allocate from this account.'
                )}
              </FieldDescription>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => props.onOpenChange(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Create organization')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function QuotaAllocationDialog(props: {
  member: EnterpriseMember | null
  ownerQuota: number
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currencyLabel = getCurrencyLabel()
  const [displayAmount, setDisplayAmount] = useState('')
  const [threshold, setThreshold] = useState('20')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [allocationMode, setAllocationMode] =
    useState<QuotaAllocationMode>('set')

  useEffect(() => {
    if (!props.member) return
    setAllocationMode('set')
    setDisplayAmount(
      String(Number(quotaUnitsToDollars(props.member.quota ?? 0).toFixed(2)))
    )
    setThreshold(
      String(Math.round((props.member.quota_warning_threshold || 0.2) * 100))
    )
  }, [props.member])

  const mutation = useMutation({
    mutationFn: (input: {
      id: number
      allocatedQuota: number
      threshold: number
    }) =>
      allocateEnterpriseMemberQuota(input.id, {
        allocated_quota: input.allocatedQuota,
        warning_threshold: input.threshold,
      }),
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Member quota updated'))
      setConfirmOpen(false)
      props.onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })

  const inputAmount = Number(displayAmount || 0)
  const inputQuota = parseQuotaFromDollars(inputAmount)
  const currentMemberQuota = props.member?.quota ?? 0
  const targetQuota =
    allocationMode === 'add' ? currentMemberQuota + inputQuota : inputQuota
  const thresholdPercent = Number(threshold || 0)
  const safeThresholdPercent = Math.min(100, Math.max(0, thresholdPercent))
  const delta = targetQuota - currentMemberQuota
  const ownerAfter = props.ownerQuota - delta
  const amountInvalid =
    !Number.isFinite(inputAmount) ||
    inputAmount < 0 ||
    (allocationMode === 'add' && inputAmount <= 0)

  const handleAllocationModeChange = (value: string[]) => {
    const nextMode = value[0] as QuotaAllocationMode | undefined
    if (!nextMode || nextMode === allocationMode) return
    setAllocationMode(nextMode)
    setDisplayAmount(
      nextMode === 'set'
        ? String(
            Number(quotaUnitsToDollars(props.member?.quota ?? 0).toFixed(2))
          )
        : ''
    )
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!props.member || amountInvalid || ownerAfter < 0) return
    setConfirmOpen(true)
  }

  const handleConfirmAllocation = () => {
    if (!props.member || amountInvalid || ownerAfter < 0) return
    mutation.mutate({
      id: props.member.id,
      allocatedQuota: Math.max(0, Math.trunc(targetQuota)),
      threshold: safeThresholdPercent / 100,
    })
  }

  return (
    <>
      <Dialog
        open={Boolean(props.member)}
        onOpenChange={(open) => props.onOpenChange(open)}
      >
        <DialogContent className='sm:max-w-lg'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <DialogHeader>
              <DialogTitle>{t('Quota allocation')}</DialogTitle>
              <DialogDescription>
                {t(
                  'Set the member balance directly, or add funds on top of the current member balance.'
                )}
              </DialogDescription>
            </DialogHeader>
            <ToggleGroup
              value={[allocationMode]}
              onValueChange={handleAllocationModeChange}
              variant='outline'
              size='sm'
              className='w-full'
            >
              <ToggleGroupItem value='set' className='flex-1'>
                {t('Set balance')}
              </ToggleGroupItem>
              <ToggleGroupItem value='add' className='flex-1'>
                {t('Add amount')}
              </ToggleGroupItem>
            </ToggleGroup>
            {props.member && (
              <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
                <div>
                  <div className='text-muted-foreground'>
                    {t('Current member balance')}
                  </div>
                  <div className='font-medium'>
                    {formatQuota(props.member.quota)}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>
                    {t('Enterprise funds')}
                  </div>
                  <div className='font-medium'>
                    {formatQuota(props.ownerQuota)}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>{t('Change')}</div>
                  <div className='font-medium'>
                    {delta >= 0 ? '+' : ''}
                    {formatQuota(delta)}
                  </div>
                </div>
                <div>
                  <div className='text-muted-foreground'>
                    {t('Enterprise funds after change')}
                  </div>
                  <div
                    className={
                      ownerAfter < 0
                        ? 'text-destructive font-medium'
                        : 'font-medium'
                    }
                  >
                    {formatQuota(ownerAfter)}
                  </div>
                </div>
              </div>
            )}
            <FieldGroup>
              <Field data-invalid={amountInvalid || undefined}>
                <FieldLabel htmlFor='enterprise-member-quota'>
                  {allocationMode === 'add'
                    ? t('Amount to add')
                    : t('Target member balance')}
                  {` (${currencyLabel})`}
                </FieldLabel>
                <Input
                  id='enterprise-member-quota'
                  type='number'
                  min={0}
                  step={0.01}
                  inputMode='decimal'
                  value={displayAmount}
                  onChange={(event) => setDisplayAmount(event.target.value)}
                  aria-invalid={amountInvalid || undefined}
                  required
                />
                <FieldDescription>
                  {allocationMode === 'add'
                    ? t(
                        'Enter the amount to add in the displayed currency. The system converts it to internal quota and saves the new target balance.'
                      )
                    : t(
                        'Enter the allocation in the displayed currency. The system converts it to internal quota automatically.'
                      )}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor='enterprise-member-quota-warning'>
                  {t('Warning threshold percent')}
                </FieldLabel>
                <Input
                  id='enterprise-member-quota-warning'
                  type='number'
                  min={0}
                  max={100}
                  step={1}
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                />
                <FieldDescription>
                  {t(
                    'A warning appears when the remaining member balance falls below this percentage of the allocated quota.'
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => props.onOpenChange(false)}
              >
                {t('Cancel')}
              </Button>
              <Button
                type='submit'
                disabled={mutation.isPending || amountInvalid || ownerAfter < 0}
              >
                {mutation.isPending && <Spinner data-icon='inline-start' />}
                {t('Save quota')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive'>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>{t('Confirm quota allocation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This update will change the following balances.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
            <div>
              <div className='text-muted-foreground'>{t('Member')}</div>
              <div className='font-medium'>
                {props.member?.display_name ||
                  props.member?.username ||
                  props.member?.email ||
                  '-'}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('Set mode')}</div>
              <div className='font-medium'>
                {allocationMode === 'add' ? t('Add amount') : t('Set balance')}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Member balance before')}
              </div>
              <div className='font-medium'>
                {formatQuota(currentMemberQuota)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Member balance after')}
              </div>
              <div className='font-medium'>{formatQuota(targetQuota)}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('Change')}</div>
              <div className='font-medium'>
                {delta >= 0 ? '+' : ''}
                {formatQuota(delta)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Warning threshold percent')}
              </div>
              <div className='font-medium'>{safeThresholdPercent}%</div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Enterprise funds before')}
              </div>
              <div className='font-medium'>{formatQuota(props.ownerQuota)}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Enterprise funds after')}
              </div>
              <div className='font-medium'>{formatQuota(ownerAfter)}</div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={mutation.isPending}
              onClick={handleConfirmAllocation}
            >
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Confirm allocation')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TransferEnterpriseFundsDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  personalQuota: number
  enterpriseQuota: number
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currencyLabel = getCurrencyLabel()
  const [amount, setAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  const amountValue = Number(amount || 0)
  const quotaValue = parseQuotaFromDollars(amountValue)
  const amountInvalid =
    amount.trim() === '' ||
    !Number.isFinite(amountValue) ||
    amountValue <= 0 ||
    quotaValue <= 0
  const personalAfter = props.personalQuota - quotaValue
  const enterpriseAfter = props.enterpriseQuota + quotaValue

  const mutation = useMutation({
    mutationFn: () => transferEnterpriseQuota({ quota: quotaValue }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || t('Failed to transfer enterprise funds'))
        return
      }
      toast.success(t('Enterprise funds transferred'))
      setAmount('')
      setConfirmOpen(false)
      props.onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Failed to transfer enterprise funds')
      )
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (amountInvalid || personalAfter < 0) return
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (amountInvalid || personalAfter < 0) return
    mutation.mutate()
  }

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <DialogHeader>
              <DialogTitle>{t('Transfer personal balance')}</DialogTitle>
              <DialogDescription>
                {t(
                  'Move part of your personal balance into your enterprise fund pool for member allocation.'
                )}
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
              <div>
                <div className='text-muted-foreground'>
                  {t('Personal balance')}
                </div>
                <div className='font-medium'>
                  {formatQuota(props.personalQuota)}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground'>
                  {t('Enterprise funds')}
                </div>
                <div className='font-medium'>
                  {formatQuota(props.enterpriseQuota)}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground'>
                  {t('Personal balance after transfer')}
                </div>
                <div
                  className={
                    personalAfter < 0 ? 'text-destructive font-medium' : 'font-medium'
                  }
                >
                  {formatQuota(personalAfter)}
                </div>
              </div>
              <div>
                <div className='text-muted-foreground'>
                  {t('Enterprise funds after transfer')}
                </div>
                <div className='font-medium'>{formatQuota(enterpriseAfter)}</div>
              </div>
            </div>

            <FieldGroup>
              <Field data-invalid={(amountInvalid || personalAfter < 0) || undefined}>
                <FieldLabel htmlFor='enterprise-transfer-amount'>
                  {t('Transfer amount')} ({currencyLabel})
                </FieldLabel>
                <Input
                  id='enterprise-transfer-amount'
                  type='number'
                  min={0}
                  step={0.01}
                  inputMode='decimal'
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  aria-invalid={(amountInvalid || personalAfter < 0) || undefined}
                  required
                />
                <FieldDescription>
                  {t(
                    'This amount is deducted from your personal balance and added to enterprise-only funds.'
                  )}
                </FieldDescription>
                {personalAfter < 0 && (
                  <FieldDescription className='text-destructive'>
                    {t('Personal balance is insufficient.')}
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => props.onOpenChange(false)}
              >
                {t('Cancel')}
              </Button>
              <Button
                type='submit'
                disabled={mutation.isPending || amountInvalid || personalAfter < 0}
              >
                {mutation.isPending && <Spinner data-icon='inline-start' />}
                {t('Save transfer')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive'>
              <TriangleAlert />
            </AlertDialogMedia>
            <AlertDialogTitle>
              {t('Confirm enterprise funds transfer')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'This operation cannot be undone from this page. To return enterprise funds to a personal balance later, please contact an administrator.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
            <div>
              <div className='text-muted-foreground'>{t('Transfer amount')}</div>
              <div className='font-medium'>{formatQuota(quotaValue)}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('Direction')}</div>
              <div className='font-medium'>
                {t('Personal balance to enterprise funds')}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Personal balance before')}
              </div>
              <div className='font-medium'>
                {formatQuota(props.personalQuota)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Personal balance after transfer')}
              </div>
              <div className='font-medium'>{formatQuota(personalAfter)}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Enterprise funds before')}
              </div>
              <div className='font-medium'>
                {formatQuota(props.enterpriseQuota)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Enterprise funds after transfer')}
              </div>
              <div className='font-medium'>{formatQuota(enterpriseAfter)}</div>
            </div>
          </div>
          <div className='border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm'>
            {t(
              'Please confirm carefully: transferred funds become enterprise-only funds and cannot be withdrawn by the user.'
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={mutation.isPending}
              onClick={handleConfirm}
            >
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Confirm transfer')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type EnterpriseExitMode = 'leave' | 'dissolve'

function EnterpriseExitDialog(props: {
  mode: EnterpriseExitMode
  open: boolean
  onOpenChange: (open: boolean) => void
  blocked: boolean
  blockers: string[]
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isDissolve = props.mode === 'dissolve'
  const mutation = useMutation({
    mutationFn: isDissolve ? dissolveEnterprise : leaveEnterprise,
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(
        isDissolve ? t('Enterprise dissolved') : t('Left enterprise')
      )
      setConfirmOpen(false)
      props.onOpenChange(false)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })

  const actionLabel = isDissolve
    ? t('Dissolve enterprise')
    : t('Leave enterprise')
  const blockedReason =
    props.blockers.length > 0
      ? props.blockers.join(' / ')
      : t('There is remaining balance or unused allocated quota.')

  return (
    <>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{actionLabel}</DialogTitle>
            <DialogDescription>
              {isDissolve
                ? t(
                    'Dissolving disconnects your account and immediately removes all members from this enterprise. Enterprise data is retained in the background.'
                  )
                : t(
                    'Leaving only disconnects your account from this enterprise. Your historical usage is retained.'
                  )}
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-3'>
            {props.blocked ? (
              <div className='border-destructive/30 bg-destructive/10 text-destructive flex gap-3 rounded-lg border p-3 text-sm'>
                <TriangleAlert className='mt-0.5 size-4 shrink-0' />
                <div className='flex flex-col gap-1'>
                  <span className='font-medium'>
                    {t('This action is currently unavailable')}
                  </span>
                  <span>{blockedReason}</span>
                  <span>
                    {t('Please contact an administrator to handle it.')}
                  </span>
                </div>
              </div>
            ) : (
              <div className='border-destructive/30 bg-destructive/10 text-destructive flex gap-3 rounded-lg border p-3 text-sm'>
                <TriangleAlert className='mt-0.5 size-4 shrink-0' />
                <div>
                  {t(
                    'This is a sensitive action. You will need to confirm once more before it takes effect.'
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => props.onOpenChange(false)}>
              {t('Cancel')}
            </Button>
            <Button
              variant='destructive'
              disabled={props.blocked}
              onClick={() => setConfirmOpen(true)}
            >
              {actionLabel}
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
            <AlertDialogTitle>{t('Confirm sensitive action')}</AlertDialogTitle>
            <AlertDialogDescription>
              {isDissolve
                ? t(
                    'Are you sure you want to dissolve this enterprise relationship and remove all members? This cannot be undone from this dialog.'
                  )
                : t(
                    'Are you sure you want to leave this enterprise? This cannot be undone from this dialog.'
                  )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function MembersTable(props: {
  members: EnterpriseMember[]
  selectedMemberId: number | null
  onSelectMember: (member: EnterpriseMember | null) => void
  onAllocateMember: (member: EnterpriseMember) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [memberToDisable, setMemberToDisable] =
    useState<EnterpriseMember | null>(null)

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; status: number }) =>
      updateEnterpriseMember(input.id, { status: input.status }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || t('Failed to update enterprise member'))
        return
      }
      toast.success(t('Enterprise member updated'))
      setMemberToDisable(null)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })
  const removeMutation = useMutation({
    mutationFn: removeEnterpriseMember,
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Enterprise member removed'))
      props.onSelectMember(null)
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
    },
  })

  const normalizedSearch = search.trim().toLowerCase()
  const filteredMembers = useMemo(() => {
    if (!normalizedSearch) return props.members
    return props.members.filter((member) =>
      [
        member.display_name,
        member.username,
        member.email,
        member.group,
        member.status ? t(memberStatusLabel(member.status)) : '',
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    )
  }, [normalizedSearch, props.members, t])
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = filteredMembers.length ? (safePage - 1) * pageSize + 1 : 0
  const pageEnd = Math.min(safePage * pageSize, filteredMembers.length)
  const paginatedMembers = filteredMembers.slice(pageStart - 1, pageEnd)

  useEffect(() => {
    setPage(1)
  }, [normalizedSearch, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  if (!props.members.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Users className='size-6' />
          </EmptyMedia>
          <EmptyTitle>{t('No enterprise members')}</EmptyTitle>
          <EmptyDescription>
            {t('Invite an existing account to start assigning API quota.')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
        <div className='relative w-full lg:max-w-sm'>
          <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('Search members')}
            className='pl-9'
          />
        </div>
        <div className='flex items-center gap-2 text-sm'>
          <span className='text-muted-foreground'>{t('Members per page')}</span>
          <NativeSelect
            size='sm'
            value={String(pageSize)}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <NativeSelectOption key={size} value={size}>
                {size}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Member')}</TableHead>
            <TableHead>{t('Status')}</TableHead>
            <TableHead>{t('API Keys')}</TableHead>
            <TableHead>{t('Balance')}</TableHead>
            <TableHead>{t('Usage')}</TableHead>
            <TableHead>{t('Requests')}</TableHead>
            <TableHead>{t('Group')}</TableHead>
            <TableHead className='text-right'>{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className='flex min-w-48 flex-col gap-1'>
                  <span className='font-medium'>{member.display_name}</span>
                  <span className='text-muted-foreground text-xs'>
                    {member.username}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={memberStatusVariant(member.status)}>
                  {t(memberStatusLabel(member.status))}
                </Badge>
              </TableCell>
              <TableCell>{formatNumber(member.token_count)}</TableCell>
              <TableCell>
                <div className='flex flex-col gap-1'>
                  <span>{formatQuota(member.quota)}</span>
                  <span className='text-muted-foreground text-xs'>
                    {t('Allocated')}: {formatQuota(member.allocated_quota)}
                  </span>
                  {isQuotaNearLimit(member) && (
                    <span className='text-destructive inline-flex items-center gap-1 text-xs'>
                      <TriangleAlert className='size-3' />
                      {t('Near quota limit')}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatQuota(member.enterprise_used_quota)}</TableCell>
              <TableCell>
                {formatNumber(member.enterprise_request_count)}
              </TableCell>
              <TableCell>{member.group || '-'}</TableCell>
              <TableCell>
                <div className='flex justify-end gap-2'>
                  <Button
                    size='sm'
                    variant={
                      props.selectedMemberId === member.id
                        ? 'secondary'
                        : 'outline'
                    }
                    onClick={() => props.onSelectMember(member)}
                  >
                    <ListFilter data-icon='inline-start' />
                    {t('Inspect')}
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => props.onAllocateMember(member)}
                  >
                    <CircleDollarSign data-icon='inline-start' />
                    {t('Allocate quota')}
                  </Button>
                  {member.status === MEMBER_STATUS.active ? (
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={updateMutation.isPending}
                      onClick={() => setMemberToDisable(member)}
                    >
                      {t('Disable')}
                    </Button>
                  ) : (
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={updateMutation.isPending}
                      onClick={() =>
                        updateMutation.mutate({
                          id: member.id,
                          status: MEMBER_STATUS.active,
                        })
                      }
                    >
                      {t('Enable')}
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='destructive'
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(member.id)}
                  >
                    {t('Remove')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!paginatedMembers.length && (
            <TableRow>
              <TableCell colSpan={8} className='text-muted-foreground h-24'>
                {t('No members match your search.')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='text-muted-foreground text-sm'>
          {t('Showing {{start}}-{{end}} of {{total}} members', {
            start: pageStart,
            end: pageEnd,
            total: filteredMembers.length,
          })}
        </div>
        <div className='flex items-center justify-end gap-2'>
          <span className='text-muted-foreground text-sm'>
            {t('Page {{page}} of {{total}}', {
              page: safePage,
              total: totalPages,
            })}
          </span>
          <Button
            size='sm'
            variant='outline'
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {t('Previous page')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {t('Next page')}
          </Button>
        </div>
      </div>
      </div>
      <AlertDialog
        open={Boolean(memberToDisable)}
        onOpenChange={(open) => !open && setMemberToDisable(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Disable enterprise member?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Disabling this member will return their remaining allocation to the enterprise balance, clear their allocated quota, and disable their company-billed API keys.'
              )}{' '}
              {memberToDisable && (
                <span className='font-medium'>
                  {t('Remaining allocation')}: {formatQuota(memberToDisable.quota)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>
              {t('Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={updateMutation.isPending || !memberToDisable}
              onClick={() => {
                if (!memberToDisable) return
                updateMutation.mutate({
                  id: memberToDisable.id,
                  status: MEMBER_STATUS.disabled,
                })
              }}
            >
              {updateMutation.isPending && <Spinner data-icon='inline-start' />}
              {t('Disable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function EnterpriseStats(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const balanceWarning = props.summary.balance_warning
  const balanceIsLow = Boolean(balanceWarning?.is_low)

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      <StatCard
        title={t('Enterprise balance')}
        value={formatQuota(props.summary.enterprise?.quota ?? 0)}
        description={t('Enterprise funds available for member allocations')}
        icon={Building2}
        danger={balanceIsLow}
        footer={
          balanceWarning?.enabled ? (
            <div
              className={
                balanceIsLow
                  ? 'text-destructive mt-2 text-xs font-medium'
                  : 'text-muted-foreground mt-2 text-xs'
              }
            >
              {t('Remaining {{current}}%, warning below {{threshold}}%', {
                current: Number(balanceWarning.remaining_percent || 0).toFixed(
                  2
                ),
                threshold: balanceWarning.threshold_percent,
              })}
            </div>
          ) : null
        }
      />
      <StatCard
        title={t('Members')}
        value={
          <Link
            to='/enterprise/$section'
            params={{ section: 'members' }}
            className='hover:text-primary focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2'
          >
            {formatNumber(props.summary.totals.active_count)} /{' '}
            {formatNumber(props.summary.totals.member_count)}
          </Link>
        }
        description={t('Active members over total members')}
        icon={Users}
      />
      <StatCard
        title={t('Member API keys')}
        value={
          <Link
            to='/enterprise/$section'
            params={{ section: 'member-api' }}
            className='hover:text-primary focus-visible:ring-ring rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2'
          >
            {formatNumber(props.summary.totals.token_count)}
          </Link>
        }
        description={t('Keys owned by enterprise members')}
        icon={KeyRound}
      />
      <StatCard
        title={t('Enterprise usage')}
        value={formatQuota(props.summary.totals.used_quota)}
        description={t('Usage generated by all members')}
        icon={ShieldCheck}
      />
    </div>
  )
}

function MemberSelector(props: {
  members: EnterpriseMember[]
  selectedMemberId: number | null
  onSelectMember: (member: EnterpriseMember | null) => void
  allowAll?: boolean
}) {
  const { t } = useTranslation()
  const value = props.selectedMemberId ? String(props.selectedMemberId) : 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Select member')}</CardTitle>
        <CardDescription>
          {props.allowAll
            ? t('Filter this section by one member or review all members.')
            : t(
                'Choose a member before viewing their company-billed API keys.'
              )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor='enterprise-member-select'>
            {t('Member')}
          </FieldLabel>
          <NativeSelect
            id='enterprise-member-select'
            value={value}
            disabled={!props.members.length}
            onChange={(event) => {
              if (event.target.value === 'all') {
                props.onSelectMember(null)
                return
              }
              const member = props.members.find(
                (item) => item.id === Number(event.target.value)
              )
              props.onSelectMember(member ?? null)
            }}
          >
            {props.allowAll && (
              <NativeSelectOption value='all'>
                {t('All members')}
              </NativeSelectOption>
            )}
            {!props.allowAll && !props.selectedMemberId && (
              <NativeSelectOption value='all'>
                {t('Select a member')}
              </NativeSelectOption>
            )}
            {props.members.map((member) => (
              <NativeSelectOption key={member.id} value={String(member.id)}>
                {member.display_name || member.username || member.email}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </CardContent>
    </Card>
  )
}

function MemberApiKeysPanel(props: {
  member: EnterpriseMember | null
}) {
  return (
    <ApiKeysProvider>
      <MemberApiKeysPanelContent member={props.member} />
    </ApiKeysProvider>
  )
}

function MemberApiKeysPanelContent(props: {
  member: EnterpriseMember | null
}) {
  const { t } = useTranslation()
  const { refreshTrigger } = useApiKeys()
  const tokensQuery = useQuery({
    queryKey: ['enterprise', 'member-tokens', props.member?.id, refreshTrigger],
    queryFn: () => getEnterpriseMemberTokens(props.member?.id ?? 0),
    enabled: Boolean(props.member),
  })
  const tokens = tokensQuery.data?.data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Member API keys')}</CardTitle>
        <CardDescription>
          {props.member
            ? t('Masked API key metadata for the selected member.')
            : t('Select a member to inspect API key metadata.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!props.member ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <KeyRound className='size-6' />
              </EmptyMedia>
              <EmptyTitle>{t('No member selected')}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : tokensQuery.isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Status')}</TableHead>
                <TableHead>{t('Quota')}</TableHead>
                <TableHead>{t('Last used')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((token) => (
                <TableRow key={token.id}>
                  <TableCell>{token.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={token.status === 1 ? 'secondary' : 'outline'}
                    >
                      {token.status === 1 ? t('Active') : t('Disabled')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {token.unlimited_quota
                      ? t('Unlimited')
                      : formatQuota(token.remain_quota)}
                  </TableCell>
                  <TableCell>
                    {formatTimestampToDate(token.accessed_time)}
                  </TableCell>
                </TableRow>
              ))}
              {!tokens.length && (
                <TableRow>
                  <TableCell colSpan={4} className='text-muted-foreground'>
                    {t('No API keys found for this member.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function OwnerPersonalApiKeysPanel(props: { enterpriseId: number }) {
  return (
    <ApiKeysProvider>
      <OwnerPersonalApiKeysPanelContent enterpriseId={props.enterpriseId} />
    </ApiKeysProvider>
  )
}

function OwnerPersonalApiKeysPanelContent(props: {
  enterpriseId: number
}) {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, resolvedKey, refreshTrigger } =
    useApiKeys()
  const columns = useApiKeysColumns()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [tokenFilterInput, setTokenFilterInput] = useState('')
  const debouncedTokenFilter = useDebounce(tokenFilterInput, 500)
  const statusFilter =
    (
      columnFilters.find((filter) => filter.id === 'status')
        ?.value as string[] | undefined
    )?.[0] ?? ''

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, debouncedTokenFilter, statusFilter])

  const tokensQuery = useQuery({
    queryKey: [
      'enterprise',
      'owner-company-billed-tokens',
      props.enterpriseId,
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      debouncedTokenFilter,
      statusFilter,
      refreshTrigger,
    ],
    queryFn: () =>
      getEnterpriseOwnerTokens({
        enterpriseId: props.enterpriseId,
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        keyword: globalFilter.trim(),
        token: debouncedTokenFilter.trim(),
        status: statusFilter,
      }),
    enabled: props.enterpriseId > 0,
    placeholderData: (previousData) => previousData,
  })
  const tokens = (tokensQuery.data?.data?.items ?? []) as ApiKey[]
  const total = tokensQuery.data?.data?.total ?? 0

  const table = useReactTable({
    data: tokens,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Company-billed API keys')}</CardTitle>
        <CardDescription>
          {t('Only API keys charged to your organization allocation are shown here.')}
        </CardDescription>
        <CardAction>
          <Button size='sm' onClick={() => setOpen('create')}>
            <Plus data-icon='inline-start' />
            {t('Create API Key')}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <DataTablePage
          table={table}
          columns={columns}
          isLoading={tokensQuery.isLoading}
          isFetching={tokensQuery.isFetching}
          emptyTitle={t('No API Keys Found')}
          emptyDescription={t('No company-billed API keys yet.')}
          skeletonKeyPrefix='owner-company-api-keys-skeleton'
          toolbarProps={{
            searchPlaceholder: t('Filter by name...'),
            additionalSearch: (
              <Input
                placeholder={t('Filter by API key...')}
                aria-label={t('Filter by API key...')}
                value={tokenFilterInput}
                onChange={(event) => setTokenFilterInput(event.target.value)}
                className='w-full sm:w-50 lg:w-60'
              />
            ),
            hasAdditionalFilters: Boolean(tokenFilterInput),
            onReset: () => setTokenFilterInput(''),
            filters: [
              {
                columnId: 'status',
                title: t('Status'),
                options: API_KEY_STATUS_OPTIONS,
                singleSelect: true,
              },
            ],
          }}
          getRowClassName={(row, ctx) =>
            row.original.status !== API_KEY_STATUS.ENABLED
              ? ctx.isMobile
                ? DISABLED_ROW_MOBILE
                : DISABLED_ROW_DESKTOP
              : undefined
          }
          bulkActions={<DataTableBulkActions table={table} />}
        />
      </CardContent>
      <ApiKeysMutateDrawer
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        currentRow={open === 'update' ? currentRow || undefined : undefined}
        initialEnterpriseId={props.enterpriseId}
        lockEnterpriseId
        createApiKeyFn={(data) =>
          createApiKey({ ...data, enterprise_id: props.enterpriseId })
        }
      />
      <ApiKeysDeleteDialog />
      <CCSwitchDialog
        open={open === 'cc-switch'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        tokenKey={resolvedKey}
      />
    </Card>
  )
}

function EnterpriseUsageLogsPanel(props: { member: EnterpriseMember | null }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const normalizedSearch = search.trim()

  const logsQuery = useQuery({
    queryKey: [
      'enterprise',
      'logs',
      props.member?.id ?? 'all',
      normalizedSearch,
      page,
      pageSize,
    ],
    queryFn: () =>
      getEnterpriseLogs({
        memberId: props.member?.id,
        keyword: normalizedSearch,
        page,
        pageSize,
      }),
  })
  const logs = logsQuery.data?.data?.items ?? []
  const total = logsQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = total ? (safePage - 1) * pageSize + 1 : 0
  const pageEnd = Math.min(safePage * pageSize, total)

  useEffect(() => {
    setPage(1)
  }, [normalizedSearch, pageSize, props.member?.id])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Enterprise usage logs')}</CardTitle>
        <CardDescription>
          {props.member
            ? t('Recent member calls using allocated quota.')
            : t('Recent calls from all enterprise members.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div className='relative w-full lg:max-w-sm'>
              <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('Search usage logs')}
                className='pl-9'
              />
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <span className='text-muted-foreground'>
                {t('Logs per page')}
              </span>
              <NativeSelect
                size='sm'
                value={String(pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[5, 10, 20, 50].map((size) => (
                  <NativeSelectOption key={size} value={size}>
                    {size}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          {logsQuery.isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Member')}</TableHead>
                  <TableHead>{t('API Key')}</TableHead>
                  <TableHead>{t('Model')}</TableHead>
                  <TableHead>{t('Usage')}</TableHead>
                  <TableHead>{t('Time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={`${log.id}-${log.created_at}`}>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.token_name || '-'}</TableCell>
                    <TableCell>{log.model_name || '-'}</TableCell>
                    <TableCell>{formatQuota(log.quota)}</TableCell>
                    <TableCell>
                      {formatTimestampToDate(log.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
                {!logs.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='text-muted-foreground h-24'
                    >
                      {normalizedSearch
                        ? t('No usage logs match your search.')
                        : t('No enterprise usage logs yet.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-muted-foreground text-sm'>
              {t('Showing {{start}}-{{end}} of {{total}} logs', {
                start: pageStart,
                end: pageEnd,
                total,
              })}
            </div>
            <div className='flex items-center justify-end gap-2'>
              <span className='text-muted-foreground text-sm'>
                {t('Page {{page}} of {{total}}', {
                  page: safePage,
                  total: totalPages,
                })}
              </span>
              <Button
                size='sm'
                variant='outline'
                disabled={safePage <= 1 || logsQuery.isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                {t('Previous page')}
              </Button>
              <Button
                size='sm'
                variant='outline'
                disabled={safePage >= totalPages || logsQuery.isLoading}
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                {t('Next page')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompanyBilledKeysCard(props: { enterpriseId: number; memberId: number }) {
  return (
    <ApiKeysProvider>
      <CompanyBilledKeysCardContent
        enterpriseId={props.enterpriseId}
        memberId={props.memberId}
      />
    </ApiKeysProvider>
  )
}

function CompanyBilledKeysCardContent(props: {
  enterpriseId: number
  memberId: number
}) {
  const { t } = useTranslation()
  const { open, setOpen, currentRow, resolvedKey, refreshTrigger } =
    useApiKeys()
  const columns = useApiKeysColumns()
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [tokenFilterInput, setTokenFilterInput] = useState('')
  const debouncedTokenFilter = useDebounce(tokenFilterInput, 500)
  const statusFilter =
    (
      columnFilters.find((filter) => filter.id === 'status')
        ?.value as string[] | undefined
    )?.[0] ?? ''

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [globalFilter, debouncedTokenFilter, statusFilter])

  const tokensQuery = useQuery({
    queryKey: [
      'enterprise',
      'current-member-tokens',
      props.enterpriseId,
      props.memberId,
      pagination.pageIndex,
      pagination.pageSize,
      globalFilter,
      debouncedTokenFilter,
      statusFilter,
      refreshTrigger,
    ],
    queryFn: () =>
      getEnterpriseMemberTokens(props.memberId, {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        keyword: globalFilter.trim(),
        token: debouncedTokenFilter.trim(),
        status: statusFilter,
      }),
    enabled: props.enterpriseId > 0 && props.memberId > 0,
    placeholderData: (previousData) => previousData,
  })
  const tokens = (tokensQuery.data?.data?.items ?? []) as ApiKey[]
  const total = tokensQuery.data?.data?.total ?? 0

  const table = useReactTable({
    data: tokens,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn: () => true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
  })

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>
            {t('Company-billed API keys')}
          </h2>
          <p className='text-muted-foreground text-sm'>
            {t(
              'Only API keys charged to your organization allocation are shown here.'
            )}
          </p>
        </div>
        <div className='shrink-0'>
          <Button size='sm' onClick={() => setOpen('create')}>
            <Plus data-icon='inline-start' />
            {t('Create API Key')}
          </Button>
        </div>
      </div>

      <DataTablePage
        table={table}
        columns={columns}
        isLoading={tokensQuery.isLoading}
        isFetching={tokensQuery.isFetching}
        emptyTitle={t('No API Keys Found')}
        emptyDescription={t('No company-billed API keys yet.')}
        skeletonKeyPrefix='company-api-keys-skeleton'
        toolbarProps={{
          searchPlaceholder: t('Filter by name...'),
          additionalSearch: (
            <Input
              placeholder={t('Filter by API key...')}
              aria-label={t('Filter by API key...')}
              value={tokenFilterInput}
              onChange={(event) => setTokenFilterInput(event.target.value)}
              className='w-full sm:w-50 lg:w-60'
            />
          ),
          hasAdditionalFilters: Boolean(tokenFilterInput),
          onReset: () => setTokenFilterInput(''),
          filters: [
            {
              columnId: 'status',
              title: t('Status'),
              options: API_KEY_STATUS_OPTIONS,
              singleSelect: true,
            },
          ],
        }}
        getRowClassName={(row, ctx) =>
          row.original.status !== API_KEY_STATUS.ENABLED
            ? ctx.isMobile
              ? DISABLED_ROW_MOBILE
              : DISABLED_ROW_DESKTOP
            : undefined
        }
        bulkActions={<DataTableBulkActions table={table} />}
      />

      <ApiKeysMutateDrawer
        open={open === 'create' || open === 'update'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        currentRow={open === 'update' ? currentRow || undefined : undefined}
        initialEnterpriseId={props.enterpriseId}
        lockEnterpriseId
      />
      <ApiKeysDeleteDialog />
      <CCSwitchDialog
        open={open === 'cc-switch'}
        onOpenChange={(isOpen) => !isOpen && setOpen(null)}
        tokenKey={resolvedKey}
      />
    </div>
  )
}

function OwnerOverview(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const enterprise = props.summary.enterprise
  const owner = props.summary.owner

  return (
    <div className='flex flex-col gap-4'>
      <EnterpriseStats summary={props.summary} />
      <Card>
        <CardHeader>
          <CardTitle>{t('Basic information')}</CardTitle>
          <CardDescription>
            {t('Overview of this organization and its main account.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Organization name')}
              </span>
              <span className='font-medium'>{enterprise?.name || '-'}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Main account')}
              </span>
              <span className='font-medium'>
                {owner?.display_name || owner?.username || '-'}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Email')}
              </span>
              <span className='font-medium'>{owner?.email || '-'}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Created at')}
              </span>
              <span className='font-medium'>
                {formatTimestampToDate(enterprise?.created_at ?? 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OwnerMembersSection(props: {
  summary: EnterpriseSummary
  currentMember: EnterpriseMember | null
  onSelectMember: (member: EnterpriseMember | null) => void
  onAllocateMember: (member: EnterpriseMember) => void
}) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Member management')}</CardTitle>
        <CardDescription>
          {t(
            'Members keep their own API keys. Allocate balance from the owner account to limit each member.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MembersTable
          members={props.summary.members}
          selectedMemberId={props.currentMember?.id ?? null}
          onSelectMember={props.onSelectMember}
          onAllocateMember={props.onAllocateMember}
        />
      </CardContent>
    </Card>
  )
}

function OwnerMemberApiSection(props: {
  enterpriseId: number
  members: EnterpriseMember[]
  ownerUserId: number
  currentMember: EnterpriseMember | null
  onSelectMember: (member: EnterpriseMember | null) => void
}) {
  const memberAccounts = props.members.filter(
    (member) => member.member_user_id !== props.ownerUserId
  )
  const selectedMember =
    memberAccounts.find((member) => member.id === props.currentMember?.id) ??
    null

  return (
    <div className='flex flex-col gap-4'>
      <OwnerPersonalApiKeysPanel enterpriseId={props.enterpriseId} />
      <MemberSelector
        members={memberAccounts}
        selectedMemberId={selectedMember?.id ?? null}
        onSelectMember={props.onSelectMember}
      />
      <MemberApiKeysPanel
        member={selectedMember}
      />
    </div>
  )
}

function OwnerUsageLogsSection(props: {
  members: EnterpriseMember[]
  currentMember: EnterpriseMember | null
  onSelectMember: (member: EnterpriseMember | null) => void
}) {
  return (
    <div className='flex flex-col gap-4'>
      <MemberSelector
        members={props.members}
        selectedMemberId={props.currentMember?.id ?? null}
        onSelectMember={props.onSelectMember}
        allowAll
      />
      <EnterpriseUsageLogsPanel member={props.currentMember} />
    </div>
  )
}

function OwnerView(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const { section, setSection } = useEnterpriseSection(ENTERPRISE_SECTIONS)
  const [createOpen, setCreateOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [dissolveOpen, setDissolveOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<EnterpriseMember | null>(
    null
  )
  const [quotaMember, setQuotaMember] = useState<EnterpriseMember | null>(null)

  const currentMember = useMemo(() => {
    if (!selectedMember) return null
    return (
      props.summary.members.find((member) => member.id === selectedMember.id) ??
      selectedMember
    )
  }, [props.summary.members, selectedMember])

  const dissolveBlockers = useMemo(() => {
    const blockers: string[] = []
    if ((props.summary.enterprise?.quota ?? 0) > 0) {
      blockers.push(t('Enterprise still has remaining funds'))
    }
    if (props.summary.members.some((member) => member.quota > 0)) {
      blockers.push(t('Enterprise members still have remaining balance'))
    }
    return blockers
  }, [props.summary.enterprise?.quota, props.summary.members, t])

  const renderSection = () => {
    if (section === 'members') {
      return (
        <OwnerMembersSection
          summary={props.summary}
          currentMember={currentMember}
          onSelectMember={(member) => {
            setSelectedMember(member)
            if (member) setSection('member-api')
          }}
          onAllocateMember={setQuotaMember}
        />
      )
    }
    if (section === 'member-api') {
      return (
        <OwnerMemberApiSection
          enterpriseId={props.summary.enterprise?.id ?? 0}
          members={props.summary.members}
          ownerUserId={props.summary.owner?.id ?? 0}
          currentMember={currentMember}
          onSelectMember={setSelectedMember}
        />
      )
    }
    if (section === 'usage-logs') {
      return (
        <OwnerUsageLogsSection
          members={props.summary.members}
          currentMember={currentMember}
          onSelectMember={setSelectedMember}
        />
      )
    }
    return <OwnerOverview summary={props.summary} />
  }

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {getEnterpriseSectionTitle(section, t)}
        </SectionPageLayout.Title>
        {section === 'overview' && (
          <SectionPageLayout.Actions>
            <Button variant='outline' onClick={() => setTransferOpen(true)}>
              <CircleDollarSign data-icon='inline-start' />
              {t('Transfer enterprise funds')}
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus data-icon='inline-start' />
              {t('Invite member')}
            </Button>
            <Button variant='destructive' onClick={() => setDissolveOpen(true)}>
              <TriangleAlert data-icon='inline-start' />
              {t('Dissolve enterprise')}
            </Button>
          </SectionPageLayout.Actions>
        )}
        <SectionPageLayout.Content>{renderSection()}</SectionPageLayout.Content>
      </SectionPageLayout>
      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TransferEnterpriseFundsDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        personalQuota={props.summary.owner?.quota ?? 0}
        enterpriseQuota={props.summary.enterprise?.quota ?? 0}
      />
      <EnterpriseExitDialog
        mode='dissolve'
        open={dissolveOpen}
        onOpenChange={setDissolveOpen}
        blocked={dissolveBlockers.length > 0}
        blockers={dissolveBlockers}
      />
      <QuotaAllocationDialog
        member={
          quotaMember
            ? (props.summary.members.find(
                (member) => member.id === quotaMember.id
              ) ?? quotaMember)
            : null
        }
        ownerQuota={props.summary.enterprise?.quota ?? 0}
        onOpenChange={(open) => {
          if (!open) setQuotaMember(null)
        }}
      />
    </>
  )
}

function MemberOverview(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const member = props.summary.member

  return (
    <div className='flex flex-col gap-4'>
      <Card>
        <CardHeader>
          <CardTitle>{t('You are an enterprise member')}</CardTitle>
          <CardDescription>
            {t(
              'Your API keys remain under your account and consume your allocated member balance.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Main account')}
              </span>
              <span className='font-medium'>
                {props.summary.owner?.display_name ||
                  props.summary.owner?.username ||
                  '-'}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Your API keys')}
              </span>
              <Link
                to='/enterprise/$section'
                params={{ section: 'member-api' }}
                className='hover:text-primary focus-visible:ring-ring w-fit rounded-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2'
              >
                {formatNumber(member?.token_count ?? 0)}
              </Link>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-sm'>
                {t('Your balance')}
              </span>
              <span className='font-medium'>
                {formatQuota(member?.quota ?? 0)}
              </span>
              {member && isQuotaNearLimit(member) && (
                <span className='text-destructive inline-flex items-center gap-1 text-xs'>
                  <TriangleAlert className='size-3' />
                  {t('Near quota limit')}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Create your own organization')}</CardTitle>
          <CardDescription>
            {t(
              'To create your own organization, leave the current organization first.'
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

function MemberView(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const { section } = useEnterpriseSection([
    'overview',
    'member-api',
    'usage-logs',
  ])
  const [leaveOpen, setLeaveOpen] = useState(false)
  const leaveBlockers = useMemo(() => {
    const member = props.summary.member
    const blockers: string[] = []
    if ((member?.quota ?? 0) > 0) {
      blockers.push(t('Member account still has remaining balance'))
    }
    return blockers
  }, [props.summary.member, t])

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {getEnterpriseSectionTitle(section, t)}
        </SectionPageLayout.Title>
        {section === 'overview' && (
          <SectionPageLayout.Actions>
            <Button variant='destructive' onClick={() => setLeaveOpen(true)}>
              <TriangleAlert data-icon='inline-start' />
              {t('Leave enterprise')}
            </Button>
          </SectionPageLayout.Actions>
        )}
        <SectionPageLayout.Content>
          {section === 'usage-logs' ? (
            <EnterpriseUsageLogsPanel member={props.summary.member ?? null} />
          ) : section === 'member-api' ? (
            <CompanyBilledKeysCard
              enterpriseId={props.summary.enterprise?.id ?? 0}
              memberId={props.summary.member?.id ?? 0}
            />
          ) : (
            <MemberOverview summary={props.summary} />
          )}
        </SectionPageLayout.Content>
      </SectionPageLayout>
      <EnterpriseExitDialog
        mode='leave'
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        blocked={leaveBlockers.length > 0}
        blockers={leaveBlockers}
      />
    </>
  )
}

function NoEnterpriseView(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {getEnterpriseRootTitle(t)}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <Button onClick={() => setCreateOpen(true)}>
            <Building2 data-icon='inline-start' />
            {t('Create organization')}
          </Button>
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <Card>
            <CardHeader>
              <CardTitle>{t('Create your organization')}</CardTitle>
              <CardDescription>
                {t(
                  'Turn your account balance into an organization fund pool for family, team, or enterprise members.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-[1fr_auto] md:items-center'>
                <div className='space-y-3'>
                  <div className='text-muted-foreground text-sm'>
                    {t('Your current balance')}
                  </div>
                  <div className='text-3xl font-semibold tabular-nums'>
                    {formatQuota(props.summary.owner?.quota ?? 0)}
                  </div>
                  <p className='text-muted-foreground text-sm'>
                    {t(
                      'After creating an organization, you can create child members and allocate part of this balance to each member.'
                    )}
                  </p>
                </div>
                <Button size='lg' onClick={() => setCreateOpen(true)}>
                  <Plus data-icon='inline-start' />
                  {t('Create organization')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </SectionPageLayout.Content>
      </SectionPageLayout>
      <CreateAccountDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

export function Enterprise() {
  const { t } = useTranslation()
  const inviteToken =
    typeof window === 'undefined'
      ? ''
      : new URLSearchParams(window.location.search).get('invite_token') || ''

  const { data, isLoading } = useQuery({
    queryKey: ENTERPRISE_QUERY_KEY,
    queryFn: getEnterpriseSummary,
    enabled: !inviteToken,
  })

  if (inviteToken) {
    return <EnterpriseInvitationAccept token={inviteToken} />
  }

  if (isLoading) {
    return (
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {getEnterpriseRootTitle(t)}
        </SectionPageLayout.Title>
        <SectionPageLayout.Content>
          <EnterpriseSkeleton />
        </SectionPageLayout.Content>
      </SectionPageLayout>
    )
  }

  if (!data?.success || !data.data) {
    return (
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {getEnterpriseRootTitle(t)}
        </SectionPageLayout.Title>
        <SectionPageLayout.Content>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <Building2 className='size-6' />
              </EmptyMedia>
              <EmptyTitle>{t('Enterprise data unavailable')}</EmptyTitle>
              <EmptyDescription>
                {data?.message || t('Please refresh and try again.')}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </SectionPageLayout.Content>
      </SectionPageLayout>
    )
  }

  if (data.data.mode === 'member') {
    return <MemberView summary={data.data} />
  }

  if (data.data.mode === 'none') {
    return <NoEnterpriseView summary={data.data} />
  }

  return <OwnerView summary={data.data} />
}

export function EnterpriseInvitationAccept(props: { token?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: acceptEnterpriseInvitation,
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Enterprise invitation accepted'))
      void queryClient.invalidateQueries({ queryKey: ENTERPRISE_QUERY_KEY })
      void navigate({ to: '/enterprise' })
    },
  })

  useEffect(() => {
    if (props.token && !mutation.isPending && !mutation.isSuccess) {
      mutation.mutate(props.token)
    }
  }, [mutation, props.token])

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>
        {t('Accept enterprise invitation')}
      </SectionPageLayout.Title>
      <SectionPageLayout.Content>
        <Card>
          <CardHeader>
            <CardTitle>{t('Accept enterprise invitation')}</CardTitle>
            <CardDescription>
              {props.token
                ? t('We are accepting your invitation. Please wait.')
                : t('Invitation token is missing.')}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            {mutation.isPending && (
              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                <Spinner />
                {t('Accepting invitation')}
              </div>
            )}
            {mutation.data && !mutation.data.success && (
              <div className='text-destructive text-sm'>
                {mutation.data.message || t('Failed to accept invitation')}
              </div>
            )}
            {!props.token && (
              <Button className='w-fit' render={<Link to='/enterprise' />}>
                {t('Back to enterprise')}
              </Button>
            )}
          </CardContent>
        </Card>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}
