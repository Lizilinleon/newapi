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
import { api } from '@/lib/api'
import type { ApiKey, ApiKeyFormData } from '@/features/keys/types'
import type {
  AdminEnterpriseAccount,
  AdminEnterpriseMembersData,
  ApiKeyMeta,
  ApiResponse,
  EnterpriseAllocateQuotaPayload,
  EnterpriseAccount,
  EnterpriseCreateAccountPayload,
  EnterpriseCreateMemberPayload,
  EnterpriseLog,
  EnterpriseMember,
  EnterpriseSummary,
  EnterpriseTransferQuotaPayload,
  PageData,
} from './types'

export async function getEnterpriseSummary(): Promise<
  ApiResponse<EnterpriseSummary>
> {
  const res = await api.get('/api/enterprise/summary')
  return res.data
}

export async function createEnterpriseAccount(
  data: EnterpriseCreateAccountPayload
): Promise<ApiResponse<EnterpriseAccount>> {
  const res = await api.post('/api/enterprise/account', data)
  return res.data
}

export async function createEnterpriseMember(
  data: EnterpriseCreateMemberPayload
): Promise<ApiResponse<EnterpriseMember>> {
  const res = await api.post('/api/enterprise/members', data)
  return res.data
}

export async function acceptEnterpriseInvitation(
  token: string
): Promise<ApiResponse<EnterpriseMember>> {
  const res = await api.post('/api/enterprise/invitations/accept', { token })
  return res.data
}

export async function allocateEnterpriseMemberQuota(
  id: number,
  data: EnterpriseAllocateQuotaPayload
): Promise<ApiResponse<EnterpriseMember>> {
  const res = await api.post(`/api/enterprise/members/${id}/quota`, data)
  return res.data
}

export async function updateEnterpriseMember(
  id: number,
  data: { status?: number; display_name?: string }
): Promise<ApiResponse<EnterpriseMember>> {
  const res = await api.patch(`/api/enterprise/members/${id}`, data)
  return res.data
}

export async function removeEnterpriseMember(
  id: number
): Promise<ApiResponse<null>> {
  const res = await api.delete(`/api/enterprise/members/${id}`)
  return res.data
}

export async function leaveEnterprise(): Promise<ApiResponse<null>> {
  const res = await api.post('/api/enterprise/membership/leave')
  return res.data
}

export async function dissolveEnterprise(): Promise<ApiResponse<null>> {
  const res = await api.post('/api/enterprise/account/dissolve')
  return res.data
}

export async function transferEnterpriseQuota(
  data: EnterpriseTransferQuotaPayload
): Promise<ApiResponse<EnterpriseSummary>> {
  const res = await api.post('/api/enterprise/account/funds', data)
  return res.data
}

export async function getEnterpriseMemberTokens(
  id: number,
  params: {
    page?: number
    pageSize?: number
    keyword?: string
    token?: string
    status?: string
  } = {}
): Promise<ApiResponse<PageData<ApiKeyMeta>>> {
  const query = new URLSearchParams()
  query.set('p', String(params.page ?? 1))
  query.set('size', String(params.pageSize ?? 20))
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.token) query.set('token', params.token)
  if (params.status) query.set('status', params.status)
  const res = await api.get(`/api/enterprise/members/${id}/tokens`, {
    params: Object.fromEntries(query.entries()),
  })
  return res.data
}

export async function getEnterpriseOwnerTokens(params: {
  enterpriseId?: number
  page?: number
  pageSize?: number
  keyword?: string
  token?: string
  status?: string
} = {}): Promise<ApiResponse<PageData<ApiKeyMeta>>> {
  const query = new URLSearchParams()
  query.set('p', String(params.page ?? 1))
  query.set('size', String(params.pageSize ?? 20))
  if (params.enterpriseId) {
    query.set('enterprise_id', String(params.enterpriseId))
  }
  if (params.keyword) query.set('keyword', params.keyword)
  if (params.token) query.set('token', params.token)
  if (params.status) query.set('status', params.status)
  try {
    const res = await api.get('/api/enterprise/account/tokens', {
      params: Object.fromEntries(query.entries()),
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error
    return {
      success: true,
      data: {
        items: [],
        total: 0,
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
      } as PageData<ApiKeyMeta>,
    }
  }
}

export async function createEnterpriseMemberToken(
  id: number,
  data: ApiKeyFormData
): Promise<ApiResponse<ApiKey>> {
  const res = await api.post(`/api/enterprise/members/${id}/tokens`, data)
  return res.data
}

export async function getEnterpriseLogs(params: {
  memberId?: number
  keyword?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PageData<EnterpriseLog>>> {
  const query = new URLSearchParams()
  query.set('p', String(params.page ?? 1))
  query.set('size', String(params.pageSize ?? 20))
  query.set('type', '2')
  if (params.memberId) query.set('member_id', String(params.memberId))
  if (params.keyword) query.set('keyword', params.keyword)

  const res = await api.get(`/api/enterprise/logs?${query.toString()}`)
  return res.data
}

export async function getAdminEnterpriseAccounts(params: {
  keyword?: string
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PageData<AdminEnterpriseAccount>>> {
  const buildQuery = (pageSize: number) => {
    const query = new URLSearchParams()
    query.set('p', String(params.page ?? 1))
    query.set('page_size', String(pageSize))
    query.set('_t', String(Date.now()))
    if (params.keyword) query.set('keyword', params.keyword)
    return query.toString()
  }

  const request = async (pageSize: number) => {
    const queryString = buildQuery(pageSize)
    try {
      const res = await api.get(`/api/admin/enterprises?${queryString}`, {
        skipErrorHandler: true,
        disableDuplicate: true,
      })
      return res.data
    } catch (error: any) {
      if (error?.response?.status !== 404) throw error
      const res = await api.get(
        `/api/enterprise/admin/accounts?${queryString}`,
        {
          skipErrorHandler: true,
          disableDuplicate: true,
        }
      )
      return res.data
    }
  }

  const requestedPageSize = params.pageSize ?? 20
  const result = await request(requestedPageSize)
  const isEmptyDefaultRequest =
    requestedPageSize === 20 &&
    !params.keyword?.trim() &&
    result?.success &&
    result?.data?.total === 0

  if (!isEmptyDefaultRequest) {
    return result
  }

  const retry = await request(100)
  if (!retry?.success || !retry.data || retry.data.total === 0) {
    return result
  }

  return {
    ...retry,
    data: {
      ...retry.data,
      items: retry.data.items.slice(0, requestedPageSize),
      page_size: requestedPageSize,
    },
  }
}

export async function updateAdminEnterpriseQuota(
  id: number,
  data: { mode: 'add' | 'set'; quota: number }
): Promise<ApiResponse<AdminEnterpriseAccount>> {
  const res = await api.post(`/api/admin/enterprises/${id}/quota`, data, {
    skipErrorHandler: true,
  })
  return res.data
}

export async function getAdminEnterpriseAccount(
  id: number
): Promise<ApiResponse<AdminEnterpriseAccount>> {
  try {
    const res = await api.get(`/api/admin/enterprises/${id}`, {
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error
    const res = await api.get(`/api/enterprise/admin/accounts/${id}`, {
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  }
}

export async function getAdminEnterpriseMembers(
  id: number
): Promise<ApiResponse<AdminEnterpriseMembersData>> {
  try {
    const res = await api.get(`/api/admin/enterprises/${id}/members`, {
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error
    const res = await api.get(`/api/enterprise/admin/accounts/${id}/members`, {
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  }
}

export async function getAdminEnterpriseLogs(
  id: number,
  params: {
    keyword?: string
    page?: number
    pageSize?: number
  }
): Promise<ApiResponse<PageData<EnterpriseLog>>> {
  const query = new URLSearchParams()
  query.set('p', String(params.page ?? 1))
  query.set('size', String(params.pageSize ?? 20))
  query.set('type', '2')
  if (params.keyword) query.set('keyword', params.keyword)

  try {
    const res = await api.get(`/api/admin/enterprises/${id}/logs?${query}`, {
      skipErrorHandler: true,
      disableDuplicate: true,
    })
    return res.data
  } catch (error: any) {
    if (error?.response?.status !== 404) throw error
    const res = await api.get(
      `/api/enterprise/admin/accounts/${id}/logs?${query}`,
      {
        skipErrorHandler: true,
        disableDuplicate: true,
      }
    )
    return res.data
  }
}
