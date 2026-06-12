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

export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  data?: T
}

export type PageData<T> = {
  items: T[]
  total: number
  page: number
  page_size: number
}

export type EnterpriseAccount = {
  id: number
  owner_user_id: number
  name: string
  status: number
  created_at: number
  updated_at: number
}

export type EnterpriseOwner = {
  id: number
  username: string
  display_name: string
  email: string
  quota: number
  used_quota: number
  status: number
}

export type EnterpriseMember = {
  id: number
  enterprise_id: number
  owner_user_id: number
  member_user_id: number
  role: string
  status: number
  display_name: string
  created_at: number
  updated_at: number
  username: string
  email: string
  user_status: number
  group: string
  quota: number
  used_quota: number
  request_count: number
  token_count: number
  enterprise_used_quota: number
  enterprise_request_count: number
}

export type EnterpriseTotals = {
  member_count: number
  active_count: number
  token_count: number
  used_quota: number
  request_count: number
}

export type EnterpriseSummary = {
  mode: 'owner' | 'member'
  enterprise?: EnterpriseAccount
  owner?: EnterpriseOwner
  member?: EnterpriseMember
  members: EnterpriseMember[]
  totals: EnterpriseTotals
}

export type EnterpriseCreateMemberPayload = {
  username: string
  password: string
  display_name?: string
  email?: string
  group?: string
}

export type EnterpriseDevSessionUser = {
  id: number
  username: string
  display_name: string
  role: number
  status: number
  group: string
}

export type ApiKeyMeta = {
  id: number
  user_id: number
  name: string
  key: string
  status: number
  remain_quota: number
  used_quota: number
  unlimited_quota: boolean
  created_time: number
  accessed_time: number
  expired_time: number
}

export type EnterpriseLog = {
  id: number
  user_id: number
  billing_user_id: number
  enterprise_id: number
  created_at: number
  type: number
  username: string
  token_name: string
  model_name: string
  quota: number
  prompt_tokens: number
  completion_tokens: number
  use_time: number
  is_stream: boolean
  request_id?: string
  upstream_request_id?: string
}
