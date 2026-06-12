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
import {
  Building2,
  KeyRound,
  ListFilter,
  LogIn,
  Plus,
  ShieldCheck,
  Undo2,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { formatNumber, formatQuota, formatTimestampToDate } from '@/lib/format'
import { SectionPageLayout } from '@/components/layout'
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
import {
  createEnterpriseMember,
  devLoginEnterpriseMember,
  devReturnEnterpriseOwner,
  getEnterpriseLogs,
  getEnterpriseMemberTokens,
  getEnterpriseSummary,
  removeEnterpriseMember,
  updateEnterpriseMember,
} from './api'
import type {
  EnterpriseCreateMemberPayload,
  EnterpriseDevSessionUser,
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

const emptyCreateForm: CreateMemberForm = {
  username: '',
  password: '',
  display_name: '',
  email: '',
  group: '',
}

function switchBrowserSession(user: EnterpriseDevSessionUser | undefined) {
  if (!user || typeof window === 'undefined') return
  window.localStorage.setItem('uid', String(user.id))
  window.location.assign('/enterprise')
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

function StatCard(props: {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const Icon = props.icon
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
        <CardAction>
          <Badge variant='outline'>
            <Icon className='size-3' />
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-semibold tabular-nums'>
          {props.value}
        </div>
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
      toast.success(t('Enterprise member created'))
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
            <DialogTitle>{t('Create enterprise member')}</DialogTitle>
            <DialogDescription>
              {t(
                'The member will have their own login and API keys, while usage is billed to the enterprise owner.'
              )}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='enterprise-member-username'>
                {t('Username')}
              </FieldLabel>
              <Input
                id='enterprise-member-username'
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='enterprise-member-password'>
                {t('Initial password')}
              </FieldLabel>
              <Input
                id='enterprise-member-password'
                type='password'
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={8}
                maxLength={20}
                required
              />
              <FieldDescription>
                {t('Password length must be between 8 and 20 characters.')}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor='enterprise-member-display-name'>
                {t('Display name')}
              </FieldLabel>
              <Input
                id='enterprise-member-display-name'
                value={form.display_name}
                onChange={(event) =>
                  updateField('display_name', event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='enterprise-member-email'>
                {t('Email')}
              </FieldLabel>
              <Input
                id='enterprise-member-email'
                type='email'
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='enterprise-member-group'>
                {t('Group')}
              </FieldLabel>
              <Input
                id='enterprise-member-group'
                value={form.group}
                onChange={(event) => updateField('group', event.target.value)}
                placeholder={t('Use owner group by default')}
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
              {t('Create member')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MembersTable(props: {
  members: EnterpriseMember[]
  selectedMemberId: number | null
  onSelectMember: (member: EnterpriseMember | null) => void
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; status: number }) =>
      updateEnterpriseMember(input.id, { status: input.status }),
    onSuccess: (res) => {
      if (!res.success) return
      toast.success(t('Enterprise member updated'))
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
  const devLoginMutation = useMutation({
    mutationFn: devLoginEnterpriseMember,
    onSuccess: (res) => {
      if (!res.success || !res.data) return
      toast.success(t('Viewing as member'))
      switchBrowserSession(res.data)
    },
  })

  if (!props.members.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <Users className='size-6' />
          </EmptyMedia>
          <EmptyTitle>{t('No enterprise members')}</EmptyTitle>
          <EmptyDescription>
            {t('Create a member account to start centralizing API billing.')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('Member')}</TableHead>
          <TableHead>{t('Status')}</TableHead>
          <TableHead>{t('API Keys')}</TableHead>
          <TableHead>{t('Usage')}</TableHead>
          <TableHead>{t('Requests')}</TableHead>
          <TableHead>{t('Group')}</TableHead>
          <TableHead className='text-right'>{t('Actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.members.map((member) => (
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
            <TableCell>{formatQuota(member.enterprise_used_quota)}</TableCell>
            <TableCell>{formatNumber(member.enterprise_request_count)}</TableCell>
            <TableCell>{member.group || '-'}</TableCell>
            <TableCell>
              <div className='flex justify-end gap-2'>
                <Button
                  size='sm'
                  variant={
                    props.selectedMemberId === member.id ? 'secondary' : 'outline'
                  }
                  onClick={() => props.onSelectMember(member)}
                >
                  <ListFilter data-icon='inline-start' />
                  {t('Inspect')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={devLoginMutation.isPending}
                  onClick={() => devLoginMutation.mutate(member.id)}
                >
                  <LogIn data-icon='inline-start' />
                  {t('View as member')}
                </Button>
                {member.status === MEMBER_STATUS.active ? (
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: member.id,
                        status: MEMBER_STATUS.disabled,
                      })
                    }
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
      </TableBody>
    </Table>
  )
}

function MemberInspector(props: { member: EnterpriseMember | null }) {
  const { t } = useTranslation()
  const tokensQuery = useQuery({
    queryKey: ['enterprise', 'member-tokens', props.member?.id],
    queryFn: () => getEnterpriseMemberTokens(props.member?.id ?? 0),
    enabled: Boolean(props.member),
  })
  const logsQuery = useQuery({
    queryKey: ['enterprise', 'logs', props.member?.id ?? 'all'],
    queryFn: () => getEnterpriseLogs({ memberId: props.member?.id }),
  })

  const tokens = tokensQuery.data?.data?.items ?? []
  const logs = logsQuery.data?.data?.items ?? []

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('Enterprise usage logs')}</CardTitle>
          <CardDescription>
            {props.member
              ? t('Recent member calls billed to the enterprise owner.')
              : t('Recent calls from all enterprise members.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsQuery.isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Member')}</TableHead>
                  <TableHead>{t('Model')}</TableHead>
                  <TableHead>{t('Usage')}</TableHead>
                  <TableHead>{t('Time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.username}</TableCell>
                    <TableCell>{log.model_name || '-'}</TableCell>
                    <TableCell>{formatQuota(log.quota)}</TableCell>
                    <TableCell>{formatTimestampToDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
                {!logs.length && (
                  <TableRow>
                    <TableCell colSpan={4} className='text-muted-foreground'>
                      {t('No enterprise usage logs yet.')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function OwnerView(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<EnterpriseMember | null>(
    null
  )

  const currentMember = useMemo(() => {
    if (!selectedMember) return null
    return (
      props.summary.members.find((member) => member.id === selectedMember.id) ??
      selectedMember
    )
  }, [props.summary.members, selectedMember])

  return (
    <>
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {t('Enterprise API management')}
        </SectionPageLayout.Title>
        <SectionPageLayout.Actions>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus data-icon='inline-start' />
            {t('Create member')}
          </Button>
        </SectionPageLayout.Actions>
        <SectionPageLayout.Content>
          <div className='flex flex-col gap-4'>
            <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
              <StatCard
                title={t('Enterprise balance')}
                value={formatQuota(props.summary.owner?.quota ?? 0)}
                description={t('Shared balance for member API calls')}
                icon={Building2}
              />
              <StatCard
                title={t('Members')}
                value={`${formatNumber(props.summary.totals.active_count)} / ${formatNumber(props.summary.totals.member_count)}`}
                description={t('Active members over total members')}
                icon={Users}
              />
              <StatCard
                title={t('Member API keys')}
                value={formatNumber(props.summary.totals.token_count)}
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

            <Card>
              <CardHeader>
                <CardTitle>{t('Members')}</CardTitle>
                <CardDescription>
                  {t(
                    'Members keep their own API keys. Their successful API usage is billed to this owner account.'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MembersTable
                  members={props.summary.members}
                  selectedMemberId={currentMember?.id ?? null}
                  onSelectMember={setSelectedMember}
                />
              </CardContent>
            </Card>

            <MemberInspector member={currentMember} />
          </div>
        </SectionPageLayout.Content>
      </SectionPageLayout>
      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

function MemberView(props: { summary: EnterpriseSummary }) {
  const { t } = useTranslation()
  const member = props.summary.member
  const returnMutation = useMutation({
    mutationFn: devReturnEnterpriseOwner,
    onSuccess: (res) => {
      if (!res.success || !res.data) return
      toast.success(t('Returned to owner'))
      switchBrowserSession(res.data)
    },
  })

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>
        {t('Enterprise API management')}
      </SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button
          variant='outline'
          disabled={returnMutation.isPending}
          onClick={() => returnMutation.mutate()}
        >
          <Undo2 data-icon='inline-start' />
          {t('Return to owner')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <div className='flex flex-col gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('You are an enterprise member')}</CardTitle>
              <CardDescription>
                {t(
                  'Your API keys remain under your account. Successful usage is billed to the enterprise owner.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground text-sm'>
                    {t('Enterprise owner')}
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
                  <span className='font-medium'>
                    {formatNumber(member?.token_count ?? 0)}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground text-sm'>
                    {t('Your enterprise usage')}
                  </span>
                  <span className='font-medium'>
                    {formatQuota(member?.enterprise_used_quota ?? 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Member actions')}</CardTitle>
              <CardDescription>
                {t('Create and rotate your own API keys from the API Keys page.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant='outline' render={<Link to='/keys' />}>
                <KeyRound data-icon='inline-start' />
                {t('Open API Keys')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}

export function Enterprise() {
  const { t } = useTranslation()
  const { data, isLoading } = useQuery({
    queryKey: ENTERPRISE_QUERY_KEY,
    queryFn: getEnterpriseSummary,
  })

  if (isLoading) {
    return (
      <SectionPageLayout>
        <SectionPageLayout.Title>
          {t('Enterprise API management')}
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
          {t('Enterprise API management')}
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

  return <OwnerView summary={data.data} />
}
