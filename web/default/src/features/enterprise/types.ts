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
  created_by_user_id: number
  name: string
  quota: number
  status: number
  created_at: number
  updated_at: number
}

export type AdminEnterpriseAccount = {
  id: number
  name: string
  quota: number
  status: number
  created_at: number
  updated_at: number
  created_by_user_id: number
  created_by_username: string
  created_by_email: string
  active_owner_user_id: number
  active_owner_username: string
  active_owner_email: string
  member_count: number
  active_member_count: number
  token_count: number
  used_quota: number
  request_count: number
  detached: boolean
  legacy_owner_user_id: number
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
  allocated_quota: number
  quota_warning_threshold: number
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

export type EnterpriseBalanceWarning = {
  enabled: boolean
  email_enabled: boolean
  threshold_percent: number
  remaining_percent: number
  owner_quota: number
  total_quota: number
  is_low: boolean
}

export type EnterpriseSummary = {
  mode: 'none' | 'owner' | 'member'
  enterprise?: EnterpriseAccount
  owner?: EnterpriseOwner
  member?: EnterpriseMember
  members: EnterpriseMember[]
  totals: EnterpriseTotals
  balance_warning?: EnterpriseBalanceWarning
}

export type AdminEnterpriseMembersData = {
  items: EnterpriseMember[]
  totals: EnterpriseTotals
}

export type EnterpriseCreateMemberPayload = {
  email: string
  display_name?: string
}

export type EnterpriseCreateAccountPayload = {
  name: string
}

export type EnterpriseAllocateQuotaPayload = {
  allocated_quota: number
  warning_threshold?: number
}

export type EnterpriseTransferQuotaPayload = {
  quota: number
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
  model_limits_enabled: boolean
  model_limits: string
  allow_ips: string
  group: string
  cross_group_retry: boolean
  created_time: number
  accessed_time: number
  expired_time: number
  enterprise_id: number
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
