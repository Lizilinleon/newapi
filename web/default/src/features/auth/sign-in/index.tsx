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
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { t } = useTranslation()
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })
  const { status } = useStatus()

  return (
    <AuthLayout>
      <div className='flex w-full flex-col gap-10'>
        <div className='flex flex-col gap-3'>
          <h2 className='bg-gradient-to-r from-slate-950 via-blue-700 to-rose-600 bg-clip-text text-center text-5xl font-black tracking-tight text-transparent sm:text-left dark:from-white dark:via-cyan-200 dark:to-rose-200'>
            {t('Sign in')}
          </h2>
          <p className='text-muted-foreground text-left text-lg'>
            {t("Don't have an account?")}{' '}
            <Link
              to='/sign-up'
              className='font-bold text-blue-600 underline underline-offset-4 transition-colors hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-blue-200'
            >
              {t('Create account')}
            </Link>
            .
          </p>
        </div>

        <UserAuthForm redirectTo={redirect} />

        <TermsFooter
          variant='sign-in'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
