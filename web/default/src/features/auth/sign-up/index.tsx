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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useStatus } from '@/hooks/use-status'
import { AuthLayout } from '../auth-layout'
import { TermsFooter } from '../components/terms-footer'
import { SignUpForm } from './components/sign-up-form'

export function SignUp() {
  const { t } = useTranslation()
  const { status } = useStatus()

  return (
    <AuthLayout>
      <div className='flex w-full flex-col gap-9'>
        <div className='flex flex-col gap-2'>
          <h2 className='bg-gradient-to-r from-slate-950 via-blue-700 to-cyan-600 bg-clip-text text-center text-4xl font-black tracking-tight text-transparent sm:text-left dark:from-white dark:via-cyan-200 dark:to-blue-200'>
            {t('Create an account')}
          </h2>
          <p className='text-muted-foreground text-left text-base sm:text-lg'>
            {t('Already have an account?')}{' '}
            <Link
              to='/sign-in'
              className='font-semibold text-blue-600 underline underline-offset-4 transition-colors hover:text-rose-600 dark:text-cyan-300 dark:hover:text-rose-200'
            >
              {t('Sign in')}
            </Link>
            .
          </p>
        </div>

        <SignUpForm />

        <TermsFooter
          variant='sign-up'
          status={status}
          className='text-center'
        />
      </div>
    </AuthLayout>
  )
}
