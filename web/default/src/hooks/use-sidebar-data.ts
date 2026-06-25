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
import {
  Box,
  Building2,
  CreditCard,
  FileText,
  FlaskConical,
  Key,
  ListTodo,
  MessageSquare,
  Radio,
  Settings,
  Ticket,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import { type SidebarData } from '@/components/layout/types'
import { getEnterpriseSummary } from '@/features/enterprise/api'
import { ROLE } from '@/lib/roles'

/**
 * Root navigation groups for the application sidebar.
 *
 * These are shown when the URL does not match any nested sidebar view
 * registered in `layout/lib/sidebar-view-registry.ts`.
 */
export function useSidebarData(): SidebarData {
  const { t } = useTranslation()
  const userRole = useAuthStore((state) => state.auth.user?.role ?? 0)
  const enterpriseSummaryQuery = useQuery({
    queryKey: ['enterprise', 'summary'],
    queryFn: getEnterpriseSummary,
    staleTime: 30_000,
  })
  const isSuperAdmin = userRole === ROLE.SUPER_ADMIN
  const isEnterpriseMember =
    enterpriseSummaryQuery.data?.success &&
    enterpriseSummaryQuery.data.data?.mode === 'member'
  const enterpriseItems = [
    {
      title: t('Overview'),
      url: '/enterprise/overview',
      activeUrls: ['/enterprise', '/enterprise/'],
      icon: Building2,
    },
    ...(!isEnterpriseMember
      ? [
          {
            title: t('Member management'),
            url: '/enterprise/members',
            icon: Users,
          },
        ]
      : []),
    {
      title: t('API Keys'),
      url: '/enterprise/member-api',
      icon: Key,
    },
    {
      title: t('Usage logs'),
      url: '/enterprise/usage-logs',
      icon: FileText,
    },
  ]
  const personalServiceItems = [
    {
      title: t('API Keys'),
      url: '/keys',
      icon: Key,
    },
    {
      title: t('Usage Logs'),
      url: '/usage-logs/common',
      icon: FileText,
    },
    {
      title: t('Task Logs'),
      url: '/usage-logs/task',
      activeUrls: ['/usage-logs/drawing'],
      configUrls: ['/usage-logs/drawing', '/usage-logs/task'],
      icon: ListTodo,
    },
  ]

  return {
    navGroups: [
      {
        id: 'chat',
        title: t('Chat'),
        items: [
          {
            title: t('Playground'),
            url: '/playground',
            icon: FlaskConical,
          },
          {
            title: t('Chat'),
            icon: MessageSquare,
            type: 'chat-presets',
          },
        ],
      },
      ...(!isSuperAdmin
        ? [
            {
              id: 'service',
              title: t('Service'),
              items: [
                {
                  title: t('Enterprise'),
                  icon: Building2,
                  defaultOpen: true,
                  items: enterpriseItems,
                },
                {
                  title: t('Personal'),
                  icon: User,
                  defaultOpen: true,
                  items: personalServiceItems,
                },
              ],
            },
          ]
        : []),
      {
        id: 'settings',
        title: t('Settings'),
        items: [
          {
            title: t('Wallet'),
            url: '/wallet',
            icon: Wallet,
          },
          {
            title: t('Profile'),
            url: '/profile',
            icon: User,
          },
          {
            title: t('More Settings'),
            url: '/settings/account-bindings',
            activeUrls: ['/settings'],
            configUrls: ['/settings'],
            icon: Settings,
          },
        ],
      },
      {
        id: 'admin',
        title: t('Admin'),
        items: [
          {
            title: t('Channels'),
            url: '/channels',
            icon: Radio,
          },
          {
            title: t('Models'),
            url: '/models/metadata',
            icon: Box,
          },
          {
            title: t('Users'),
            url: '/users',
            icon: Users,
          },
          {
            title: t('Enterprise List'),
            url: '/enterprises',
            icon: Building2,
          },
          {
            title: t('Redemption Codes'),
            url: '/redemption-codes',
            icon: Ticket,
          },
          {
            title: t('Subscriptions'),
            url: '/subscriptions',
            icon: CreditCard,
          },
          {
            title: t('Admin Logs'),
            url: '/admin-logs/common',
            activeUrls: ['/admin-logs'],
            configUrls: [
              '/admin-logs/common',
              '/admin-logs/drawing',
              '/admin-logs/task',
            ],
            icon: FileText,
          },
          {
            title: t('System Settings'),
            url: '/system-settings/site',
            activeUrls: ['/system-settings'],
            icon: Settings,
          },
        ],
      },
    ],
  }
}
