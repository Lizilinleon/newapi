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
import type {
  ApiKeyMeta,
  ApiResponse,
  EnterpriseCreateMemberPayload,
  EnterpriseDevSessionUser,
  EnterpriseLog,
  EnterpriseMember,
  EnterpriseSummary,
  PageData,
} from './types'

export async function getEnterpriseSummary(): Promise<
  ApiResponse<EnterpriseSummary>
> {
  const res = await api.get('/api/enterprise/summary')
  return res.data
}

export async function createEnterpriseMember(
  data: EnterpriseCreateMemberPayload
): Promise<ApiResponse<EnterpriseMember>> {
  const res = await api.post('/api/enterprise/members', data)
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

export async function devLoginEnterpriseMember(
  id: number
): Promise<ApiResponse<EnterpriseDevSessionUser>> {
  const res = await api.post(`/api/enterprise/dev/members/${id}/login`)
  return res.data
}

export async function devReturnEnterpriseOwner(): Promise<
  ApiResponse<EnterpriseDevSessionUser>
> {
  const res = await api.post('/api/enterprise/dev/owner/login')
  return res.data
}

export async function getEnterpriseMemberTokens(
  id: number
): Promise<ApiResponse<PageData<ApiKeyMeta>>> {
  const res = await api.get(`/api/enterprise/members/${id}/tokens`, {
    params: { p: 1, size: 20 },
  })
  return res.data
}

export async function getEnterpriseLogs(params: {
  memberId?: number
  page?: number
  pageSize?: number
}): Promise<ApiResponse<PageData<EnterpriseLog>>> {
  const query = new URLSearchParams()
  query.set('p', String(params.page ?? 1))
  query.set('size', String(params.pageSize ?? 20))
  query.set('type', '2')
  if (params.memberId) query.set('member_id', String(params.memberId))

  const res = await api.get(`/api/enterprise/logs?${query.toString()}`)
  return res.data
}
