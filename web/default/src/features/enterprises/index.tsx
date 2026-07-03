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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Building2, Eye, Search, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrencyLabel } from '@/lib/currency'
import {
  formatNumber,
  formatQuota,
  formatTimestampToDate,
  parseQuotaFromDollars,
} from '@/lib/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
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
import { SectionPageLayout } from '@/components/layout'
import {
  getAdminEnterpriseAccount,
  getAdminEnterpriseAccounts,
  getAdminEnterpriseLogs,
  getAdminEnterpriseMembers,
  updateAdminEnterpriseQuota,
} from '@/features/enterprise/api'
import type { AdminEnterpriseAccount } from '@/features/enterprise/types'

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

function enterpriseStatusLabel(status: number) {
  if (status === 1) return 'Enabled'
  if (status === 2) return 'Disabled'
  return 'Unknown'
}

function enterpriseAccountStatusLabel(account: AdminEnterpriseAccount) {
  if (account.detached || account.status === 2) return 'Enterprise Disabled'
  if (account.status === 1) return 'Enterprise Enabled'
  return 'Unknown'
}

function enterpriseAccountStatusClass(account: AdminEnterpriseAccount) {
  if (account.detached || account.status === 2) {
    return 'bg-destructive/10 text-destructive'
  }
  if (account.status === 1) {
    return 'bg-success/10 text-success'
  }
  return undefined
}

function ownerText(account?: AdminEnterpriseAccount) {
  if (!account || account.detached) return '-'
  return (
    account.active_owner_username ||
    account.active_owner_email ||
    String(account.active_owner_user_id || '-')
  )
}

export function Enterprises() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [fundsOpen, setFundsOpen] = useState(false)

  const query = useQuery({
    queryKey: ['admin-enterprise-accounts-v2', keyword, page, pageSize],
    queryFn: () => getAdminEnterpriseAccounts({ keyword, page, pageSize }),
    refetchOnMount: 'always',
  })

  const pageData = query.data?.data
  const items = pageData?.items ?? []
  const total = pageData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rangeText = useMemo(() => {
    if (total === 0) return t('No records')
    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)
    return t('{{start}}-{{end}} of {{total}} records', { start, end, total })
  }, [page, pageSize, t, total])

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Enterprises')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button onClick={() => setFundsOpen(true)}>
          <Wallet data-icon='inline-start' />
          {t('Allocate enterprise funds')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <Card>
          <CardHeader>
            <CardTitle>{t('Enterprise List')}</CardTitle>
            <CardDescription>
              {t(
                'List enterprises created by users from the Enterprise API Management page.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='relative w-full sm:max-w-sm'>
                <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                <Input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value)
                    setPage(1)
                  }}
                  placeholder={t('Search enterprises')}
                  className='pl-9'
                />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-sm'>
                  {t('Per page')}
                </span>
                <NativeSelect
                  size='sm'
                  value={String(pageSize)}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((value) => (
                    <NativeSelectOption key={value} value={String(value)}>
                      {value}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className='rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Enterprise')}</TableHead>
                    <TableHead>{t('Created by')}</TableHead>
                    <TableHead>{t('Main account')}</TableHead>
                    <TableHead>{t('Members')}</TableHead>
                    <TableHead>{t('API Keys')}</TableHead>
                    <TableHead>{t('Enterprise funds')}</TableHead>
                    <TableHead>{t('Usage')}</TableHead>
                    <TableHead>{t('Created at')}</TableHead>
                    <TableHead>{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={9}>
                          <Skeleton className='h-8 w-full' />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant='icon'>
                              <Building2 />
                            </EmptyMedia>
                            <EmptyTitle>{t('No enterprises found')}</EmptyTitle>
                            <EmptyDescription>
                              {keyword.trim()
                                ? t('Try changing the search keyword.')
                                : t('No enterprises have been created yet.')}
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            <div className='font-medium'>
                              {account.name || t('Unnamed enterprise')}
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              ID: {account.id}
                            </div>
                            <Badge
                              variant='secondary'
                              className={enterpriseAccountStatusClass(account)}
                            >
                              {t(enterpriseAccountStatusLabel(account))}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            <span>{account.created_by_username || '-'}</span>
                            <span className='text-muted-foreground text-xs'>
                              {account.created_by_email || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            <span>{ownerText(account)}</span>
                            <span className='text-muted-foreground text-xs'>
                              {account.detached
                                ? t('Detached enterprise')
                                : account.active_owner_email || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(account.active_member_count)} /{' '}
                          {formatNumber(account.member_count)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(account.token_count)}
                        </TableCell>
                        <TableCell>{formatQuota(account.quota ?? 0)}</TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            <span>{formatQuota(account.used_quota)}</span>
                            <span className='text-muted-foreground text-xs'>
                              {t('{{count}} requests', {
                                count: formatNumber(account.request_count),
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatTimestampToDate(account.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            variant='outline'
                            render={
                              <Link
                                to='/enterprises/$id'
                                params={{ id: String(account.id) }}
                              />
                            }
                          >
                            <Eye data-icon='inline-start' />
                            {t('View details')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='text-muted-foreground text-sm'>{rangeText}</div>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page <= 1 || query.isFetching}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  {t('Previous page')}
                </Button>
                <span className='text-sm tabular-nums'>
                  {page} / {totalPages}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={page >= totalPages || query.isFetching}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  {t('Next page')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <EnterpriseFundsDialog open={fundsOpen} onOpenChange={setFundsOpen} />
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}

export function EnterpriseDetail(props: { id: number }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const normalizedSearch = search.trim()
  const hasValidEnterpriseId = Number.isFinite(props.id) && props.id > 0

  const accountQuery = useQuery({
    queryKey: ['admin-enterprise-account', props.id],
    queryFn: () => getAdminEnterpriseAccount(props.id),
    enabled: hasValidEnterpriseId,
  })
  const membersQuery = useQuery({
    queryKey: ['admin-enterprise-members', props.id],
    queryFn: () => getAdminEnterpriseMembers(props.id),
    enabled: hasValidEnterpriseId,
  })
  const logsQuery = useQuery({
    queryKey: [
      'admin-enterprise-logs',
      props.id,
      normalizedSearch,
      page,
      pageSize,
    ],
    queryFn: () =>
      getAdminEnterpriseLogs(props.id, {
        keyword: normalizedSearch,
        page,
        pageSize,
      }),
    enabled: hasValidEnterpriseId,
  })

  const account = accountQuery.data?.data
  const members = membersQuery.data?.data?.items ?? []
  const totals = membersQuery.data?.data?.totals
  const logs = logsQuery.data?.data?.items ?? []
  const totalLogs = logsQuery.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalLogs / pageSize))
  const safePage = Math.min(page, totalPages)

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>
        {account?.name || t('Enterprise details')}
      </SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button variant='outline' render={<Link to='/enterprises' />}>
          <ArrowLeft data-icon='inline-start' />
          {t('Back to enterprise list')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <div className='flex flex-col gap-4'>
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
            <Card>
              <CardHeader>
                <CardTitle>{t('Enterprise funds')}</CardTitle>
                <CardDescription>
                  {t('Enterprise funds available for member allocations')}
                </CardDescription>
              </CardHeader>
              <CardContent className='text-2xl font-semibold'>
                {accountQuery.isLoading ? (
                  <Skeleton className='h-8 w-24' />
                ) : (
                  formatQuota(account?.quota ?? 0)
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('Members')}</CardTitle>
                <CardDescription>{t('Active members / total')}</CardDescription>
              </CardHeader>
              <CardContent className='text-2xl font-semibold'>
                {membersQuery.isLoading ? (
                  <Skeleton className='h-8 w-24' />
                ) : (
                  `${formatNumber(totals?.active_count ?? 0)} / ${formatNumber(totals?.member_count ?? 0)}`
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('API Keys')}</CardTitle>
                <CardDescription>
                  {t('Enterprise member API keys')}
                </CardDescription>
              </CardHeader>
              <CardContent className='text-2xl font-semibold'>
                {formatNumber(account?.token_count ?? totals?.token_count ?? 0)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('Usage')}</CardTitle>
                <CardDescription>{t('Enterprise usage logs')}</CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col gap-1'>
                <span className='text-2xl font-semibold'>
                  {formatQuota(account?.used_quota ?? totals?.used_quota ?? 0)}
                </span>
                <span className='text-muted-foreground text-sm'>
                  {t('{{count}} requests', {
                    count: formatNumber(
                      account?.request_count ?? totals?.request_count ?? 0
                    ),
                  })}
                </span>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('Basic information')}</CardTitle>
              <CardDescription>
                {t('Enterprise creator and active main account.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <InfoItem
                  label={t('Enterprise')}
                  value={account?.name || '-'}
                />
                <InfoItem
                  label={t('Created by')}
                  value={
                    account?.created_by_username ||
                    account?.created_by_email ||
                    '-'
                  }
                  detail={account?.created_by_email}
                />
                <InfoItem
                  label={t('Main account')}
                  value={ownerText(account)}
                  detail={
                    account?.detached
                      ? t('Detached enterprise')
                      : account?.active_owner_email
                  }
                />
                <InfoItem
                  label={t('Created at')}
                  value={
                    account?.created_at
                      ? formatTimestampToDate(account.created_at)
                      : '-'
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Members')}</CardTitle>
              <CardDescription>
                {t('Enterprise member quota and usage overview.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersQuery.isLoading ? (
                <Skeleton className='h-40 w-full' />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Member')}</TableHead>
                      <TableHead>{t('Status')}</TableHead>
                      <TableHead>{t('Balance')}</TableHead>
                      <TableHead>{t('Allocated')}</TableHead>
                      <TableHead>{t('API Keys')}</TableHead>
                      <TableHead>{t('Usage')}</TableHead>
                      <TableHead>{t('Requests')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className='font-medium'>
                            {member.display_name || member.username || '-'}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {member.email || member.username || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {t(enterpriseStatusLabel(member.status))}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatQuota(member.quota)}</TableCell>
                        <TableCell>
                          {formatQuota(member.allocated_quota)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(member.token_count)}
                        </TableCell>
                        <TableCell>
                          {formatQuota(member.enterprise_used_quota)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(member.enterprise_request_count)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!members.length && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='text-muted-foreground h-20'
                        >
                          {t('No enterprise members')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Usage logs')}</CardTitle>
              <CardDescription>
                {t('Recent calls from all enterprise members.')}
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-4'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                <div className='relative w-full lg:max-w-sm'>
                  <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPage(1)
                    }}
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
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setPage(1)
                    }}
                  >
                    {[10, 20, 50, 100].map((size) => (
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
                      <TableHead>{t('Request ID')}</TableHead>
                      <TableHead>{t('Time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={`${log.id}-${log.created_at}`}>
                        <TableCell>{log.username || '-'}</TableCell>
                        <TableCell>{log.token_name || '-'}</TableCell>
                        <TableCell>{log.model_name || '-'}</TableCell>
                        <TableCell>{formatQuota(log.quota)}</TableCell>
                        <TableCell>{log.request_id || '-'}</TableCell>
                        <TableCell>
                          {formatTimestampToDate(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!logs.length && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-muted-foreground h-20'
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

              <div className='flex items-center justify-end gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={safePage <= 1 || logsQuery.isFetching}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  {t('Previous page')}
                </Button>
                <span className='text-sm tabular-nums'>
                  {safePage} / {totalPages}
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={safePage >= totalPages || logsQuery.isFetching}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  {t('Next page')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}

function InfoItem(props: { label: string; value: string; detail?: string }) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-muted-foreground text-sm'>{props.label}</span>
      <span className='font-medium'>{props.value}</span>
      {props.detail && (
        <span className='text-muted-foreground text-xs'>{props.detail}</span>
      )}
    </div>
  )
}

function EnterpriseFundsDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currencyLabel = getCurrencyLabel()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<AdminEnterpriseAccount | null>(null)
  const [mode, setMode] = useState<'add' | 'set'>('add')
  const [amount, setAmount] = useState('')

  const query = useQuery({
    queryKey: ['admin-enterprise-accounts-v2', 'funds-dialog', keyword, page],
    queryFn: () => getAdminEnterpriseAccounts({ keyword, page, pageSize: 6 }),
    enabled: props.open,
  })

  const enterprises = query.data?.data?.items ?? []
  const total = query.data?.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / 6))
  const amountValue = Number(amount || 0)
  const quotaValue = parseQuotaFromDollars(amountValue)
  const mutationValue = mode === 'set' ? quotaValue : Math.abs(quotaValue)
  const nextQuota =
    selected && Number.isFinite(amountValue)
      ? mode === 'set'
        ? mutationValue
        : selected.quota + mutationValue
      : selected?.quota
  const amountInvalid =
    amount.trim() === '' ||
    !Number.isFinite(amountValue) ||
    (mode === 'set' ? amountValue < 0 : amountValue <= 0)

  const mutation = useMutation({
    mutationFn: () =>
      updateAdminEnterpriseQuota(selected?.id ?? 0, {
        mode,
        quota: mutationValue,
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.message || t('Failed to update enterprise funds'))
        return
      }
      toast.success(t('Enterprise funds updated'))
      setAmount('')
      setSelected(null)
      void query.refetch()
      void queryClient.invalidateQueries({
        queryKey: ['admin-enterprise-accounts-v2'],
      })
      void queryClient.invalidateQueries({
        queryKey: ['enterprise', 'summary'],
      })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t('Failed to update enterprise funds')
      )
    },
  })

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{t('Allocate enterprise funds')}</DialogTitle>
          <DialogDescription>
            {t(
              'Administrators can search enterprises and add or set enterprise-only funds.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='relative'>
            <Search className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value)
                setPage(1)
                setSelected(null)
              }}
              placeholder={t('Search enterprises')}
              className='pl-9'
            />
          </div>

          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Enterprise')}</TableHead>
                  <TableHead>{t('Main account')}</TableHead>
                  <TableHead>{t('Enterprise funds')}</TableHead>
                  <TableHead>{t('Members')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enterprises.map((enterprise) => (
                  <TableRow
                    key={enterprise.id}
                    className={
                      selected?.id === enterprise.id ? 'bg-muted/60' : undefined
                    }
                    onClick={() => setSelected(enterprise)}
                  >
                    <TableCell>
                      <div className='font-medium'>
                        {enterprise.name || t('Unnamed enterprise')}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        ID: {enterprise.id}
                      </div>
                    </TableCell>
                    <TableCell>{ownerText(enterprise)}</TableCell>
                    <TableCell>{formatQuota(enterprise.quota ?? 0)}</TableCell>
                    <TableCell>
                      {formatNumber(enterprise.active_member_count)} /{' '}
                      {formatNumber(enterprise.member_count)}
                    </TableCell>
                  </TableRow>
                ))}
                {!enterprises.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className='text-muted-foreground h-20'
                    >
                      {query.isLoading
                        ? t('Loading...')
                        : t('No enterprises found')}
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

          <Field>
            <FieldLabel>{t('Selected enterprise')}</FieldLabel>
            <FieldDescription>
              {selected
                ? `${selected.name || t('Unnamed enterprise')} - ${formatQuota(selected.quota ?? 0)}`
                : t('Select an enterprise from the list first.')}
            </FieldDescription>
          </Field>
          <div className='grid gap-3 sm:grid-cols-[180px_1fr]'>
            <Field>
              <FieldLabel htmlFor='admin-enterprise-funds-mode'>
                {t('Set mode')}
              </FieldLabel>
              <NativeSelect
                id='admin-enterprise-funds-mode'
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as 'add' | 'set')
                }
              >
                <NativeSelectOption value='add'>
                  {t('Add amount')}
                </NativeSelectOption>
                <NativeSelectOption value='set'>
                  {t('Set balance')}
                </NativeSelectOption>
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor='admin-enterprise-funds-amount'>
                {t('Enterprise amount')} ({currencyLabel})
              </FieldLabel>
              <Input
                id='admin-enterprise-funds-amount'
                type='number'
                min={mode === 'set' ? 0 : 0.01}
                step={0.01}
                inputMode='decimal'
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder='100'
              />
              {selected && (
                <FieldDescription>
                  {t('Enterprise funds after change')}:{' '}
                  {formatQuota(nextQuota ?? 0)}
                </FieldDescription>
              )}
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => props.onOpenChange(false)}>
            {t('Cancel')}
          </Button>
          <Button
            disabled={!selected || amountInvalid || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Spinner data-icon='inline-start' />}
            {t('Save enterprise funds')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
