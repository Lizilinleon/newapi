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
import {
  PaperclipIcon,
  FileIcon,
  ImageIcon,
  ScreenShareIcon,
  CameraIcon,
  GlobeIcon,
  KeyRoundIcon,
  SendIcon,
  SquareIcon,
  BarChartIcon,
  BoxIcon,
  NotepadTextIcon,
  CodeSquareIcon,
  GraduationCapIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PromptInput,
  PromptInputButton,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import { ModelGroupSelector } from '@/components/model-group-selector'
import { useSystemConfig } from '@/hooks/use-system-config'
import type { ModelOption, GroupOption } from '../types'

interface PlaygroundInputProps {
  onSubmit: (text: string) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  models: ModelOption[]
  modelValue: string
  onModelChange: (value: string) => void
  isModelLoading?: boolean
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  apiKey: string
  apiBaseUrl: string
  onApiConnectionChange: (apiKey: string, apiBaseUrl: string) => void
}

const suggestions = [
  { icon: BarChartIcon, text: 'Analyze data', color: '#76d0eb' },
  { icon: BoxIcon, text: 'Surprise me', color: '#76d0eb' },
  { icon: NotepadTextIcon, text: 'Summarize text', color: '#ea8444' },
  { icon: CodeSquareIcon, text: 'Code', color: '#6c71ff' },
  { icon: GraduationCapIcon, text: 'Get advice', color: '#76d0eb' },
  { icon: null, text: 'More' },
]

export function PlaygroundInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
  models,
  modelValue,
  onModelChange,
  isModelLoading = false,
  groups,
  groupValue,
  onGroupChange,
  apiKey,
  apiBaseUrl,
  onApiConnectionChange,
}: PlaygroundInputProps) {
  const { t } = useTranslation()
  const { systemName } = useSystemConfig()
  const [text, setText] = useState('')
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  const [draftApiKey, setDraftApiKey] = useState(apiKey)
  const [draftApiBaseUrl, setDraftApiBaseUrl] = useState(apiBaseUrl || '/v1')

  const isModelSelectDisabled =
    disabled || isModelLoading || models.length === 0
  const isGroupSelectDisabled = disabled || groups.length === 0
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

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim() || disabled) return
    onSubmit(message.text)
    setText('')
  }

  const handleFileAction = (action: string) => {
    toast.info(t('Feature in development'), {
      description: action,
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSubmit(suggestion)
  }

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
    <div className='grid shrink-0 gap-4 px-1 md:pb-4'>
      <PromptInput groupClassName='rounded-xl' onSubmit={handleSubmit}>
        <PromptInputTextarea
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck={false}
          className='px-5 md:text-base'
          disabled={disabled}
          onChange={(event) => setText(event.target.value)}
          placeholder={t('Ask anything')}
          value={text}
        />

        <PromptInputFooter className='p-2.5'>
          <PromptInputTools>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <PromptInputButton
                    className='border font-medium'
                    disabled={disabled}
                    variant='outline'
                  />
                }
              >
                <PaperclipIcon size={16} />
                <span className='hidden sm:inline'>{t('Attach')}</span>
                <span className='sr-only sm:hidden'>{t('Attach')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem
                  onClick={() => handleFileAction('upload-file')}
                >
                  <FileIcon className='mr-2' size={16} />
                  {t('Upload file')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFileAction('upload-photo')}
                >
                  <ImageIcon className='mr-2' size={16} />
                  {t('Upload photo')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFileAction('take-screenshot')}
                >
                  <ScreenShareIcon className='mr-2' size={16} />
                  {t('Take screenshot')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFileAction('take-photo')}
                >
                  <CameraIcon className='mr-2' size={16} />
                  {t('Take photo')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <PromptInputButton
              className='border font-medium'
              disabled={disabled}
              onClick={() => toast.info(t('Search feature in development'))}
              variant='outline'
            >
              <GlobeIcon size={16} />
              <span className='hidden sm:inline'>{t('Search')}</span>
              <span className='sr-only sm:hidden'>{t('Search')}</span>
            </PromptInputButton>
          </PromptInputTools>

          <div className='flex items-center gap-1.5 md:gap-2'>
            <Dialog
              open={apiKeyDialogOpen}
              onOpenChange={handleApiKeyDialogOpenChange}
            >
              <DialogTrigger
                render={
                  <PromptInputButton
                    className='border font-medium'
                    disabled={disabled}
                    variant={apiKey ? 'secondary' : 'outline'}
                  />
                }
              >
                <KeyRoundIcon size={16} />
                <span className='hidden sm:inline'>
                  {apiKey ? t('API Key set') : t('API Key')}
                </span>
                <span className='sr-only sm:hidden'>
                  {apiKey ? t('API Key set') : t('API Key')}
                </span>
              </DialogTrigger>
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
                      onChange={(event) =>
                        setDraftApiBaseUrl(event.target.value)
                      }
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

            <ModelGroupSelector
              selectedModel={modelValue}
              models={models}
              onModelChange={onModelChange}
              selectedGroup={groupValue}
              groups={groups}
              onGroupChange={onGroupChange}
              disabled={isModelSelectDisabled || isGroupSelectDisabled}
            />

            {isGenerating && onStop ? (
              <PromptInputButton
                className='text-foreground font-medium'
                onClick={onStop}
                variant='secondary'
              >
                <SquareIcon className='fill-current' size={16} />
                <span className='hidden sm:inline'>{t('Stop')}</span>
                <span className='sr-only sm:hidden'>{t('Stop')}</span>
              </PromptInputButton>
            ) : (
              <PromptInputButton
                className='text-foreground font-medium'
                disabled={disabled || !text.trim()}
                type='submit'
                variant='secondary'
              >
                <SendIcon size={16} />
                <span className='hidden sm:inline'>{t('Send')}</span>
                <span className='sr-only sm:hidden'>{t('Send')}</span>
              </PromptInputButton>
            )}
          </div>
        </PromptInputFooter>
      </PromptInput>

      <Suggestions>
        {suggestions.map(({ icon: Icon, text, color }) => (
          <Suggestion
            className={`text-xs font-normal sm:text-sm ${
              text === 'More' ? 'hidden sm:flex' : ''
            }`}
            key={text}
            onClick={() => handleSuggestionClick(text)}
            suggestion={text}
          >
            {Icon && <Icon size={16} style={{ color }} />}
            {text}
          </Suggestion>
        ))}
      </Suggestions>
    </div>
  )
}
