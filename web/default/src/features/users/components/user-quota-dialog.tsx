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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { getCurrencyDisplay, getCurrencyLabel } from '@/lib/currency'
import { formatQuota, parseQuotaFromDollars } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog } from '@/components/dialog'
import { adjustUserQuota } from '../api'
import type { QuotaAdjustMode } from '../types'

interface UserQuotaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  currentQuota: number
  onSuccess: () => void
}

function formatSignedQuota(value: number) {
  return `${value >= 0 ? '+' : ''}${formatQuota(value)}`
}

export function UserQuotaDialog(props: UserQuotaDialogProps) {
  const { t } = useTranslation()
  const [mode, setMode] = useState<QuotaAdjustMode>('add')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { meta: currencyMeta } = getCurrencyDisplay()
  const currencyLabel = getCurrencyLabel()
  const tokensOnly = currencyMeta.kind === 'tokens'

  const amountValue = parseFloat(amount) || 0
  const quotaValue = parseQuotaFromDollars(Math.abs(amountValue))
  const targetQuota =
    mode === 'add'
      ? props.currentQuota + quotaValue
      : mode === 'subtract'
        ? props.currentQuota - quotaValue
        : parseQuotaFromDollars(amountValue)
  const quotaDelta = targetQuota - props.currentQuota
  const amountInvalid =
    amount.trim() === '' ||
    !Number.isFinite(amountValue) ||
    (mode !== 'override' && quotaValue <= 0) ||
    (mode === 'override' && amountValue < 0)

  const getPreviewText = () => {
    const current = props.currentQuota
    switch (mode) {
      case 'add':
        return `${t('Current quota')}: ${formatQuota(current)}  +${formatQuota(quotaValue)} = ${formatQuota(targetQuota)}`
      case 'subtract':
        return `${t('Current quota')}: ${formatQuota(current)}  -${formatQuota(quotaValue)} = ${formatQuota(targetQuota)}`
      case 'override':
        return `${t('Current quota')}: ${formatQuota(current)} -> ${formatQuota(targetQuota)}`
      default:
        return ''
    }
  }

  const handleRequestConfirm = () => {
    if (amountInvalid) return
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (amountInvalid) return

    setLoading(true)
    try {
      const value =
        mode === 'override' ? parseQuotaFromDollars(amountValue) : quotaValue
      const result = await adjustUserQuota({
        id: props.userId,
        action: 'add_quota',
        mode,
        value: mode === 'override' ? value : Math.abs(value),
      })
      if (result.success) {
        toast.success(t('Quota updated successfully'))
        setConfirmOpen(false)
        setAmount('')
        setMode('add')
        props.onOpenChange(false)
        props.onSuccess()
      } else {
        toast.error(result.message || t('Failed to update quota'))
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t('Failed to update quota'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setAmount('')
    setMode('add')
    setConfirmOpen(false)
    props.onOpenChange(false)
  }

  const placeholder = tokensOnly
    ? t('Enter amount in tokens')
    : t('Enter amount in {{currency}}', { currency: currencyLabel })

  return (
    <>
      <Dialog
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={t('Set quota')}
        description={t('Select a set mode and enter the amount')}
        contentHeight='auto'
        bodyClassName='space-y-4'
        footer={
          <>
            <Button variant='outline' onClick={handleCancel}>
              {t('Cancel')}
            </Button>
            <Button
              onClick={handleRequestConfirm}
              disabled={loading || amountInvalid}
            >
              {loading ? t('Processing...') : t('Save quota')}
            </Button>
          </>
        }
      >
        <div className='space-y-4'>
          <div className='text-muted-foreground text-sm'>
            {getPreviewText()}
          </div>

          <div className='space-y-2'>
            <Label>{t('Set mode')}</Label>
            <div className='flex gap-1'>
              {(['add', 'subtract', 'override'] as const).map((m) => (
                <Button
                  key={m}
                  type='button'
                  variant='outline'
                  size='sm'
                  className={cn(
                    mode === m &&
                      'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                  onClick={() => {
                    setMode(m)
                    setAmount('')
                  }}
                >
                  {m === 'add'
                    ? t('Add amount')
                    : m === 'subtract'
                      ? t('Subtract amount')
                      : t('Set balance')}
                </Button>
              ))}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>
              {t('Amount')} ({currencyLabel})
            </Label>
            <Input
              type='number'
              step={tokensOnly ? 1 : 0.000001}
              min={mode === 'override' ? 0 : 0}
              placeholder={placeholder}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRequestConfirm()
              }}
            />
          </div>
        </div>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Confirm quota update')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This update will change the following balances.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className='grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2'>
            <div>
              <div className='text-muted-foreground'>{t('Set mode')}</div>
              <div className='font-medium'>
                {mode === 'add'
                  ? t('Add amount')
                  : mode === 'subtract'
                    ? t('Subtract amount')
                    : t('Set balance')}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Input amount')} ({currencyLabel})
              </div>
              <div className='font-medium'>{amountValue}</div>
            </div>
            <div>
              <div className='text-muted-foreground'>
                {t('Current balance')}
              </div>
              <div className='font-medium'>
                {formatQuota(props.currentQuota)}
              </div>
            </div>
            <div>
              <div className='text-muted-foreground'>{t('New balance')}</div>
              <div className='font-medium'>{formatQuota(targetQuota)}</div>
            </div>
            <div className='sm:col-span-2'>
              <div className='text-muted-foreground'>{t('Change')}</div>
              <div className='font-medium'>{formatSignedQuota(quotaDelta)}</div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              disabled={loading}
              onClick={handleConfirm}
            >
              {loading ? t('Processing...') : t('Confirm update')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
