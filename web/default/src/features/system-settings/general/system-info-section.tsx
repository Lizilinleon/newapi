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
import { useRef } from 'react'
import * as z from 'zod'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImagePlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingsForm,
  SettingsFormGrid,
  SettingsFormGridItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const LOGO_UPLOAD_MAX_SIZE = 512 * 1024
const LOGO_UPLOAD_MAX_DIMENSION = 512
const LOGO_UPLOAD_ACCEPT =
  'image/png,image/jpeg,image/webp,image/svg+xml,image/gif'

function isValidLogoValue(value: string): boolean {
  if (!value) return true
  if (value.startsWith('data:image/')) return true
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const logoSchema = z.string().refine(isValidLogoValue, {
  message: 'Please upload an image or provide a valid logo URL',
})

const _systemInfoSchema = z.object({
  theme: z.object({
    frontend: z.enum(['default', 'classic']),
  }),
  SystemName: z.string().min(1),
  ServerAddress: z.string().optional(),
  Logo: logoSchema,
  Footer: z.string().optional(),
  About: z.string().optional(),
  HomePageContent: z.string().optional(),
  legal: z.object({
    user_agreement: z.string().optional(),
    privacy_policy: z.string().optional(),
  }),
})

type SystemInfoFormValues = z.infer<typeof _systemInfoSchema>

type SystemInfoSectionProps = {
  defaultValues: SystemInfoFormValues
}

function normalizeValue(value: unknown): string {
  if (value === undefined || value === null) return ''
  return typeof value === 'string' ? value : String(value)
}

function dataUrlByteSize(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  return Math.ceil((base64.length * 3) / 4)
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      result ? resolve(result) : reject(new Error('empty result'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('image load failed'))
    }
    image.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return readFileAsDataUrl(new File([blob], 'logo', { type: blob.type }))
}

async function compressLogoFile(file: File): Promise<string> {
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return readFileAsDataUrl(file)
  }

  const image = await loadImageFromFile(file)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  if (!sourceWidth || !sourceHeight) {
    return readFileAsDataUrl(file)
  }

  const scale = Math.min(
    1,
    LOGO_UPLOAD_MAX_DIMENSION / sourceWidth,
    LOGO_UPLOAD_MAX_DIMENSION / sourceHeight
  )
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale))
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const context = canvas.getContext('2d')
  if (!context) return readFileAsDataUrl(file)

  context.clearRect(0, 0, targetWidth, targetHeight)
  context.drawImage(image, 0, 0, targetWidth, targetHeight)

  const pngBlob = await canvasToBlob(canvas, 'image/png')
  if (pngBlob && pngBlob.size <= LOGO_UPLOAD_MAX_SIZE) {
    return blobToDataUrl(pngBlob)
  }

  for (const quality of [0.9, 0.8, 0.7, 0.6, 0.5]) {
    const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
    if (webpBlob && webpBlob.size <= LOGO_UPLOAD_MAX_SIZE) {
      return blobToDataUrl(webpBlob)
    }
  }

  return pngBlob ? blobToDataUrl(pngBlob) : readFileAsDataUrl(file)
}

export function SystemInfoSection({ defaultValues }: SystemInfoSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const normalizedDefaults: SystemInfoFormValues = {
    theme: {
      frontend:
        defaultValues.theme?.frontend === 'classic' ? 'classic' : 'default',
    },
    SystemName: normalizeValue(defaultValues.SystemName),
    ServerAddress: normalizeValue(defaultValues.ServerAddress),
    Logo: normalizeValue(defaultValues.Logo),
    Footer: normalizeValue(defaultValues.Footer),
    About: normalizeValue(defaultValues.About),
    HomePageContent: normalizeValue(defaultValues.HomePageContent),
    legal: {
      user_agreement: normalizeValue(defaultValues.legal?.user_agreement),
      privacy_policy: normalizeValue(defaultValues.legal?.privacy_policy),
    },
  }

  const systemInfoSchemaWithI18n = z.object({
    theme: z.object({
      frontend: z.enum(['default', 'classic']),
    }),
    SystemName: z.string().min(1, {
      error: () => t('System name is required'),
    }),
    ServerAddress: z.string().optional(),
    Logo: z.string().refine(isValidLogoValue, {
      message: t('Please upload an image or provide a valid logo URL'),
    }),
    Footer: z.string().optional(),
    About: z.string().optional(),
    HomePageContent: z.string().optional(),
    legal: z.object({
      user_agreement: z.string().optional(),
      privacy_policy: z.string().optional(),
    }),
  })

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<SystemInfoFormValues>({
      resolver: zodResolver(systemInfoSchemaWithI18n) as Resolver<
        SystemInfoFormValues,
        unknown,
        SystemInfoFormValues
      >,
      defaultValues: normalizedDefaults,
      onSubmit: async (_data, changedFields) => {
        // 主题切换会改变后端返回的前端产物，需放到最后处理：先更新其余设置项，
        // 仅当它们全部成功后才提交主题切换，避免其它设置失败时就切换了主题，
        // 导致用户停留或刷新到另一套前端不存在的路由而 404。
        const entries = Object.entries(changedFields)
        const themeEntry = entries.find(([key]) => key === 'theme.frontend')
        const otherEntries = entries.filter(([key]) => key !== 'theme.frontend')

        let allSucceeded = true
        for (const [key, value] of otherEntries) {
          let v = normalizeValue(value)
          if (key === 'ServerAddress') {
            v = v.replace(/\/+$/, '')
          }
          const res = await updateOption.mutateAsync({
            key,
            value: v,
          })
          if (!res.success) {
            allSucceeded = false
          }
        }
        if (themeEntry && !allSucceeded) {
          // Theme was not submitted; keep form state consistent with backend.
          _data.theme.frontend = normalizedDefaults.theme.frontend
          return
        }
        if (themeEntry && allSucceeded) {
          const res = await updateOption.mutateAsync({
            key: themeEntry[0],
            value: normalizeValue(themeEntry[1]),
          })
          if (res.success) {
            // 当前路由在另一套前端中并不存在，主题切换成功后重置到首页以避免 404。
            // 延时用于让表单脏状态先清除（移除 beforeunload 拦截）并展示成功提示后再刷新；
            // 使用 replace 让已失效的路由不进入历史，防止返回按钮再次触发 404。
            setTimeout(() => {
              window.location.replace('/')
            }, 600)
          } else {
            // Theme update failed; revert to the last saved value.
            _data.theme.frontend = normalizedDefaults.theme.frontend
          }
        }
      },
    })

  const handleLogoFile = async (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      form.setError('Logo', {
        type: 'manual',
        message: t('Please upload an image file'),
      })
      return
    }

    try {
      const result = await compressLogoFile(file)
      if (dataUrlByteSize(result) > LOGO_UPLOAD_MAX_SIZE) {
        form.setError('Logo', {
          type: 'manual',
          message: t('Logo image must be 512 KB or smaller'),
        })
        return
      }
      form.clearErrors('Logo')
      form.setValue('Logo', result, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    } catch {
      form.setError('Logo', {
        type: 'manual',
        message: t('Failed to read logo image'),
      })
    }
  }

  return (
    <>
      <FormNavigationGuard when={isDirty} />

      <SettingsSection title={t('System Information')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <SettingsFormGrid>
              <FormField
                control={form.control}
                name='theme.frontend'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Frontend Theme')}</FormLabel>
                    <Select
                      items={[
                        {
                          value: 'default',
                          label: t('Default (New Frontend)'),
                        },
                        {
                          value: 'classic',
                          label: t('Classic (Legacy Frontend)'),
                        },
                      ]}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          <SelectItem value='default'>
                            {t('Default (New Frontend)')}
                          </SelectItem>
                          <SelectItem value='classic'>
                            {t('Classic (Legacy Frontend)')}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t(
                        'Switch between the new frontend and the classic frontend. Changes take effect after page reload.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='SystemName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('System Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('Your system name')} {...field} />
                    </FormControl>
                    <FormDescription>
                      {t('The name displayed across the application')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='ServerAddress'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Server Address')}</FormLabel>
                    <FormControl>
                      <Input placeholder='https://yourdomain.com' {...field} />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'The public URL of your server, used for OAuth callbacks, webhooks, and other external integrations'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='Logo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Logo image')}</FormLabel>
                    <FormControl>
                      <div className='flex flex-col gap-3 rounded-lg border p-3'>
                        <div className='flex items-center gap-3'>
                          <div className='bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border'>
                            {field.value ? (
                              <img
                                src={field.value}
                                alt={t('Logo preview')}
                                className='size-full object-contain'
                              />
                            ) : (
                              <ImagePlus className='text-muted-foreground size-5' />
                            )}
                          </div>
                          <div className='flex min-w-0 flex-1 flex-col gap-1'>
                            <div className='font-medium'>
                              {field.value
                                ? t('Logo uploaded')
                                : t('No logo uploaded')}
                            </div>
                            <div className='text-muted-foreground truncate text-sm'>
                              {field.value ||
                                t('Upload PNG, JPG, WebP, SVG, or GIF')}
                            </div>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                          <Input
                            ref={logoInputRef}
                            type='file'
                            accept={LOGO_UPLOAD_ACCEPT}
                            className='hidden'
                            onChange={(event) => {
                              handleLogoFile(event.target.files?.[0])
                              event.target.value = ''
                            }}
                          />
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => logoInputRef.current?.click()}
                          >
                            <ImagePlus data-icon='inline-start' />
                            {t('Upload logo')}
                          </Button>
                          {field.value && (
                            <Button
                              type='button'
                              variant='ghost'
                              onClick={() => {
                                form.clearErrors('Logo')
                                field.onChange('')
                              }}
                            >
                              <X data-icon='inline-start' />
                              {t('Clear logo')}
                            </Button>
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Upload a logo image to display across the application. The image is saved with this setting after you click Save Changes.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='Footer'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Footer')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          '© 2025 Your Company. All rights reserved.'
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('Footer text displayed at the bottom of pages')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='About'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('About')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Enter HTML code (e.g., <p>About us...</p>) or a URL (e.g., https://example.com) to embed as iframe'
                        )}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Supports HTML markup or iframe embedding. Enter HTML code directly, or provide a complete URL to automatically embed it as an iframe.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SettingsFormGridItem span='full'>
                <FormField
                  control={form.control}
                  name='HomePageContent'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Home Page Content')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`{
  "titleTop": "统一的",
  "titleBottom": "大模型接口网关",
  "subtitle": "多模型统一接入，只需将基址替换为："
}`}
                          rows={8}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          'Use plain text lines to override the hero title/subtitle, or provide JSON fields such as titleTop, titleBottom, subtitle, serverAddress, endpoints, primaryButtonText, primaryButtonUrl, secondaryButtonText, secondaryButtonUrl, and providersTitle.'
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SettingsFormGridItem>

              <FormField
                control={form.control}
                name='legal.user_agreement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('User Agreement')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Provide Markdown, HTML, or an external URL for the user agreement'
                        )}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Leave empty to disable the agreement requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='legal.privacy_policy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Privacy Policy')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          'Provide Markdown, HTML, or an external URL for the privacy policy'
                        )}
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'Leave empty to disable the privacy policy requirement. Supports Markdown, HTML, or a full URL to redirect users.'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SettingsFormGrid>
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
