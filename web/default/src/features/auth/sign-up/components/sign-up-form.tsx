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
import { useEffect, useState } from 'react'
import type { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { useStatus } from '@/hooks/use-status'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { register } from '@/features/auth/api'
import { registerFormSchema } from '@/features/auth/constants'
import { useAuthRedirect } from '@/features/auth/hooks/use-auth-redirect'
import { useEmailVerification } from '@/features/auth/hooks/use-email-verification'

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [codeSentFor, setCodeSentFor] = useState('')
  const { redirectToLogin } = useAuthRedirect()
  const { status } = useStatus()
  const emailVerificationEnabled = Boolean(
    status?.email_verification ?? status?.data?.email_verification
  )
  const { isSending, secondsLeft, isActive, sendCode } = useEmailVerification()
  const resetAuth = useAuthStore((state) => state.auth.reset)

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      verificationCode: '',
    },
  })
  const email = form.watch('email')
  const username = form.watch('username')
  const normalizedWatchedEmail = email.trim().toLowerCase()

  useEffect(() => {
    if (normalizedWatchedEmail !== codeSentFor) {
      form.setValue('verificationCode', '')
    }
  }, [codeSentFor, form, normalizedWatchedEmail])

  async function handleSendCode() {
    const valid = await form.trigger(['username', 'email'])
    if (!valid) return
    const normalizedEmail = normalizedWatchedEmail
    const sent = await sendCode(normalizedEmail, username.trim())
    if (sent) setCodeSentFor(normalizedEmail)
  }

  async function onSubmit(data: z.infer<typeof registerFormSchema>) {
    const normalizedEmail = data.email.trim().toLowerCase()
    const verificationCode = data.verificationCode?.trim() ?? ''
    if (emailVerificationEnabled) {
      if (!verificationCode) {
        toast.error(t('Please enter the email verification code'))
        return
      }
      if (normalizedEmail !== codeSentFor) {
        toast.error(t('Please send a new verification code for this email'))
        return
      }
    }
    setIsLoading(true)
    try {
      const res = await register({
        username: data.username.trim(),
        email: normalizedEmail,
        password: data.password,
        verification_code: emailVerificationEnabled
          ? verificationCode
          : undefined,
      })

      if (res?.success) {
        resetAuth()
        toast.success(t('Account created! Please sign in'))
        redirectToLogin()
      } else {
        toast.error(res?.message || t('Failed to create account'))
      }
    } catch (_error) {
      toast.error(t('Failed to create account'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('Enter your username')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Email')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('name@example.com')}
                  type='email'
                  autoComplete='email'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {emailVerificationEnabled && (
          <FormField
            control={form.control}
            name='verificationCode'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Email verification code')}</FormLabel>
                <div className='flex gap-2'>
                  <FormControl>
                    <Input
                      placeholder={t('Enter the 6-digit code')}
                      inputMode='numeric'
                      autoComplete='one-time-code'
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type='button'
                    variant='outline'
                    className='shrink-0'
                    disabled={isSending || isActive || isLoading}
                    onClick={handleSendCode}
                  >
                    {isSending ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : null}
                    {isActive
                      ? t('Resend in {{seconds}}s', { seconds: secondsLeft })
                      : t('Send code')}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('Enter password (8-20 characters)')}
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('Confirm password')}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('Confirm password')}
                  autoComplete='new-password'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='mt-2 w-full justify-center gap-2'
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
          {t('Create account')}
        </Button>
      </form>
    </Form>
  )
}
