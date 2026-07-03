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
import {
  GlobeIcon,
  KeyRoundIcon,
  PaperclipIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  PromptInputButton,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSystemConfig } from '@/hooks/use-system-config'

import {
  ATTACHMENT_ACTIONS,
  getAttachmentActionNotice,
  getSearchActionNotice,
} from '../../lib'

type PlaygroundInputToolsProps = {
  disabled?: boolean
  hasMessages?: boolean
  onClearMessages?: () => void
  apiKey: string
  apiBaseUrl: string
  onApiConnectionChange: (apiKey: string, apiBaseUrl: string) => void
}

export function PlaygroundInputTools({
  disabled,
  hasMessages = false,
  onClearMessages,
  apiKey,
  apiBaseUrl,
  onApiConnectionChange,
}: PlaygroundInputToolsProps) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [draftApiKey, setDraftApiKey] = useState(apiKey)
  const [draftApiBaseUrl, setDraftApiBaseUrl] = useState(apiBaseUrl || '/v1')
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const handleFileAction = (action: string) => {
    const notice = getAttachmentActionNotice(action)
    toast.info(t(notice.title), {
      description: notice.description,
    })
  }

  const handleSearchAction = () => {
    const notice = getSearchActionNotice()
    toast.info(t(notice.title))
  }

  const handleClearMessages = () => {
    onClearMessages?.()
    setClearConfirmOpen(false)
    toast.success(t('Conversation cleared'))
  }

  const officialBaseUrlExamples = [
    { name: systemName, url: '/v1' },
    { name: 'DeepSeek', url: 'https://api.deepseek.com' },
    { name: 'OpenAI', url: 'https://api.openai.com/v1' },
    {
      name: 'Gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    },
    { name: 'OpenRouter', url: 'https://openrouter.ai/api/v1' },
    { name: 'SiliconFlow', url: 'https://api.siliconflow.cn/v1' },
    { name: 'xAI', url: 'https://api.x.ai/v1' },
    { name: 'Mistral', url: 'https://api.mistral.ai/v1' },
  ]

  const handleApiKeyDialogOpenChange = (open: boolean) => {
    setApiKeyDialogOpen(open)
    if (open) {
      setDraftApiKey(apiKey)
      setDraftApiBaseUrl(apiBaseUrl || '/v1')
    }
  }

  const handleSaveApiKey = () => {
    onApiConnectionChange(draftApiKey, draftApiBaseUrl)
    setApiKeyDialogOpen(false)
    toast.success(
      draftApiKey.trim()
        ? t('Playground API key saved')
        : t('Playground API key cleared')
    )
  }

  const handleClearApiKey = () => {
    setDraftApiKey('')
    setDraftApiBaseUrl('/v1')
    onApiConnectionChange('', '')
    setApiKeyDialogOpen(false)
    toast.success(t('Playground API key cleared'))
  }

  return (
    <>
      <PromptInputTools className='bg-background/70 border-border/60 rounded-lg border p-1 shadow-xs'>
        <Tooltip>
          <DropdownMenu>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <PromptInputButton
                      aria-label={t('Attach')}
                      className='text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
                      disabled={disabled}
                      variant='ghost'
                    />
                  }
                >
                  <PaperclipIcon size={16} />
                </DropdownMenuTrigger>
              }
            />
            <TooltipContent>
              <p>{t('Attach')}</p>
            </TooltipContent>
            <DropdownMenuContent align='start'>
              {ATTACHMENT_ACTIONS.map(({ action, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleFileAction(action)}
                >
                  <Icon className='mr-2' size={16} />
                  {t(label)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Tooltip>

        <Dialog
          open={apiKeyDialogOpen}
          onOpenChange={handleApiKeyDialogOpenChange}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogTrigger
                  render={
                    <PromptInputButton
                      aria-label={apiKey ? t('API Key set') : t('API Key')}
                      className='text-muted-foreground hover:text-foreground hover:bg-muted/70 data-[state=open]:bg-muted/70 font-medium'
                      disabled={disabled}
                      variant='ghost'
                    />
                  }
                >
                  <KeyRoundIcon size={16} />
                </DialogTrigger>
              }
            />
            <TooltipContent>
              <p>{apiKey ? t('API Key set') : t('API Key')}</p>
            </TooltipContent>
          </Tooltip>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>{t('Playground API connection')}</DialogTitle>
              <DialogDescription>
                {t(
                  'Use a key generated by {{systemName}} or an official OpenAI-compatible provider key. Settings are stored locally in this browser.',
                  { systemName }
                )}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor='playground-api-base-url'>
                  {t('Base URL')}
                </FieldLabel>
                <Input
                  id='playground-api-base-url'
                  autoComplete='off'
                  placeholder='/v1'
                  value={draftApiBaseUrl}
                  onChange={(event) => setDraftApiBaseUrl(event.target.value)}
                />
                <FieldDescription>
                  {t(
                    'Use /v1 for keys generated by {{systemName}}. For official provider keys, use that provider official OpenAI-compatible Base URL.',
                    { systemName }
                  )}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor='playground-api-key'>
                  {t('API Key')}
                </FieldLabel>
                <Input
                  id='playground-api-key'
                  autoComplete='off'
                  placeholder='sk-...'
                  type='password'
                  value={draftApiKey}
                  onChange={(event) => setDraftApiKey(event.target.value)}
                />
                <FieldDescription>
                  {t(
                    'When set, requests use the configured Base URL with Bearer authentication instead of the current dashboard session.'
                  )}
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>{t('Official Base URL examples')}</FieldLabel>
                <div className='flex flex-wrap gap-2'>
                  {officialBaseUrlExamples.map((example) => (
                    <Button
                      key={example.name}
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setDraftApiBaseUrl(example.url)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
                <FieldDescription>
                  {t(
                    'Some official provider APIs may block browser requests because of CORS. If that happens, add the provider as a Channel and use /v1 with a key generated by {{systemName}}.',
                    { systemName }
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClearApiKey}
              >
                {t('Clear')}
              </Button>
              <Button type='button' onClick={handleSaveApiKey}>
                {t('Save API Key')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Tooltip>
          <TooltipTrigger
            render={
              <PromptInputButton
                aria-label={t('Search')}
                className='text-muted-foreground hover:text-foreground hover:bg-muted/70 font-medium'
                disabled={disabled}
                onClick={handleSearchAction}
                variant='ghost'
              >
                <GlobeIcon size={16} />
              </PromptInputButton>
            }
          />
          <TooltipContent>
            <p>{t('Search')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <PromptInputButton
                aria-label={t('Clear chat history')}
                className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-medium'
                disabled={disabled || !hasMessages || !onClearMessages}
                onClick={() => setClearConfirmOpen(true)}
                variant='ghost'
              >
                <Trash2Icon size={16} />
              </PromptInputButton>
            }
          />
          <TooltipContent>
            <p>{t('Clear chat history')}</p>
          </TooltipContent>
        </Tooltip>
      </PromptInputTools>

      <ConfirmDialog
        destructive
        desc={t(
          'All playground messages saved in this browser will be removed. This cannot be undone.'
        )}
        confirmText={t('Clear')}
        handleConfirm={handleClearMessages}
        open={clearConfirmOpen}
        onOpenChange={setClearConfirmOpen}
        title={t('Clear chat history?')}
      />
    </>
  )
}
