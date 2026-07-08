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
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  Languages,
  Link2,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Main } from '@/components/layout'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { LanguagePreferencesCard } from '@/features/profile/components/language-preferences-card'
import { AccountBindingsTab } from '@/features/profile/components/tabs/account-bindings-tab'
import { NotificationTab } from '@/features/profile/components/tabs/notification-tab'
import { useProfile } from '@/features/profile/hooks'

type SettingsSection =
  | 'account-bindings'
  | 'preferences'
  | 'language'

type SettingsSectionItem = {
  value: SettingsSection
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

function SettingsSectionNav(props: {
  items: SettingsSectionItem[]
  section: SettingsSection
  onSectionChange: (section: SettingsSection) => void
}) {
  const { t } = useTranslation()
  const current = props.items.find((item) => item.value === props.section)

  return (
    <Card className='h-fit'>
      <CardHeader>
        <CardTitle>{t('Settings sections')}</CardTitle>
        <CardDescription>
          {current?.description || t('Choose a settings section to manage.')}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Field>
          <FieldLabel htmlFor='settings-section-select'>
            {t('Choose section')}
          </FieldLabel>
          <NativeSelect
            id='settings-section-select'
            value={props.section}
            onChange={(event) =>
              props.onSectionChange(event.target.value as SettingsSection)
            }
          >
            {props.items.map((item) => (
              <NativeSelectOption key={item.value} value={item.value}>
                {item.title}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <div className='flex flex-col gap-2'>
          {props.items.map((item) => {
            const Icon = item.icon
            const active = item.value === props.section
            return (
              <Button
                key={item.value}
                type='button'
                variant={active ? 'secondary' : 'ghost'}
                className='h-auto justify-start px-3 py-2'
                onClick={() => props.onSectionChange(item.value)}
              >
                <Icon data-icon='inline-start' />
                <span className='flex min-w-0 flex-col items-start gap-0.5 text-left'>
                  <span className='font-medium'>{item.title}</span>
                  <span className='text-muted-foreground text-xs leading-snug'>
                    {item.description}
                  </span>
                </span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsShellCard(props: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  const Icon = props.icon

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg'>
            <Icon className='size-4' />
          </div>
          <div className='min-w-0'>
            <CardTitle>{props.title}</CardTitle>
            <CardDescription>{props.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  )
}

export function Settings(props: { section?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile, loading, refreshProfile } = useProfile()

  const sectionItems: SettingsSectionItem[] = [
    {
      value: 'account-bindings',
      title: t('Account bindings'),
      description: t('Connections and external login methods.'),
      icon: Link2,
    },
    {
      value: 'preferences',
      title: t('Settings & Preferences'),
      description: t('Notifications and account behavior.'),
      icon: Bell,
    },
    {
      value: 'language',
      title: t('Language Preferences'),
      description: t('Interface language preference.'),
      icon: Languages,
    },
  ]

  const sectionValues = sectionItems.map((item) => item.value)
  const currentSection = sectionValues.includes(
    props.section as SettingsSection
  )
    ? (props.section as SettingsSection)
    : sectionItems[0].value

  const goToSection = (section: SettingsSection) => {
    void navigate({
      to: '/settings/$section',
      params: { section },
    })
  }

  const currentItem = sectionItems.find((item) => item.value === currentSection)

  const renderSection = () => {
    if (currentSection === 'preferences') {
      return (
        <SettingsShellCard
          title={t('Settings & Preferences')}
          description={t('Notifications and account behavior.')}
          icon={Bell}
        >
          <NotificationTab profile={profile} onUpdate={refreshProfile} />
        </SettingsShellCard>
      )
    }

    if (currentSection === 'language') {
      return (
        <LanguagePreferencesCard
          profile={profile}
          onProfileUpdate={refreshProfile}
        />
      )
    }

    return (
      <SettingsShellCard
        title={t('Account bindings')}
        description={t('Connections and external login methods.')}
        icon={Link2}
      >
        {loading ? null : (
          <AccountBindingsTab profile={profile} onUpdate={refreshProfile} />
        )}
      </SettingsShellCard>
    )
  }

  return (
    <Main>
      <div className='min-h-0 flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-6'>
        <CardStaggerContainer className='mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6'>
          <CardStaggerItem>
            <div className='flex items-center gap-3 px-1'>
              <div className='bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg'>
                <SettingsIcon className='size-4' />
              </div>
              <div className='min-w-0'>
                <h1 className='text-xl font-semibold tracking-tight'>
                  {t('Settings')}
                </h1>
                <p className='text-muted-foreground text-sm'>
                  {currentItem?.description ||
                    t('Manage account preferences and integrations.')}
                </p>
              </div>
            </div>
          </CardStaggerItem>

          <CardStaggerItem>
            <div className='grid gap-4 xl:grid-cols-[280px_1fr] xl:items-start'>
              <SettingsSectionNav
                items={sectionItems}
                section={currentSection}
                onSectionChange={goToSection}
              />
              {renderSection()}
            </div>
          </CardStaggerItem>
        </CardStaggerContainer>
      </div>
    </Main>
  )
}
