import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.resolve(root, '..', 'weelinking-docs', 'markdown')
const brandName = process.env.DOCS_BRAND_NAME || 'ArmNet 字元服务'
const apiBase = process.env.DOCS_API_BASE || 'http://122.51.35.238:5170'
const apiHost = apiBase.replace(/^https?:\/\//i, '').replace(/\/$/, '')

const generatedRoots = [
  'api-capabilities',
  'api-reference',
  'faq',
  'scenarios',
  'wiki',
]
const rootDocs = [
  'index.md',
  'getting-started.md',
  'api-manual.md',
  'pricing.md',
  'resources.md',
  'scenarios.md',
]

const sectionTitles = new Map([
  ['', '快速开始'],
  ['api-capabilities', 'API 能力'],
  ['api-reference', 'API 参考'],
  ['faq', '常见问题'],
  ['scenarios', '使用场景'],
  ['scenarios/engineering', '工程集成'],
  ['scenarios/programming', '编程工具'],
  ['wiki', '大模型百科'],
  ['wiki/applications', '应用场景'],
  ['wiki/architectures', '模型架构'],
  ['wiki/basics', '基础概念'],
  ['wiki/encyclopedia', '百科条目'],
  ['wiki/models', '模型介绍'],
  ['wiki/practices', '最佳实践'],
  ['wiki/tools', '工具生态'],
])

async function exists(file) {
  try {
    await fs.access(file)
    return true
  } catch {
    return false
  }
}

async function listMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listMarkdown(full)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(full)
    }
  }
  return files.sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/)
  if (!match) return { meta: {}, body: raw }

  let meta = {}
  const block = match[1].trim()
  try {
    meta = JSON.parse(block)
  } catch {
    for (const line of block.split(/\r?\n/)) {
      const pair = line.match(/^([\w-]+):\s*(.*)$/)
      if (pair) meta[pair[1]] = pair[2].replace(/^['"]|['"]$/g, '')
    }
  }

  return { meta, body: raw.slice(match[0].length) }
}

function escapeYaml(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')
}

function replaceBrand(content) {
  return String(content)
    .replace(/https:\/\/docs\.weelinking\.com\/docs\/?/gi, '/')
    .replace(/https:\/\/api\.weelinking\.com/gi, apiBase)
    .replace(/api\.weelinking\.com/gi, apiHost)
    .replace(/weelinking/gi, brandName)
    .replace(/\[\s*\]\([^)]*#([^)]*)\)/g, '')
}

function alignWithCurrentApi(content) {
  return String(content)
    .replace(/\/v1\/videos\/generations\/\{task_id\}/g, '/v1/video/generations/{task_id}')
    .replace(/\/videos\/generations\/\{task_id\}/g, '/video/generations/{task_id}')
    .replace(/\/v1\/videos\/generations/g, '/v1/video/generations')
    .replace(/\/videos\/generations/g, '/video/generations')
    .replace(/sora_video2-landscape/g, 'sora-2-pro')
    .replace(/sora_video2/g, 'sora-2')
    .replace(/704 × 1280/g, '720 × 1280')
    .replace(/1280 × 704/g, '1280 × 720')
    .replace(/\/google/g, '')
    .replace(/\/prices/g, '/pricing')
    .replace(/\/account\/profile/g, '/profile')
}

function applyDocSpecificFixes(content, relative) {
  if (relative === 'faq/token-management.md') {
    return String(content).replaceAll(`${apiBase}/profile`, `${apiBase}/keys`)
  }
  if (relative === 'faq/call-logs.md') {
    return String(content).replaceAll(`${apiBase}/profile`, `${apiBase}/usage-logs`)
  }
  return content
}

function normalizeLinks(content) {
  return content.replace(/\]\(\/([^)#]+?)(?:\.html)?\)/g, (_, target) => {
    const clean = target.replace(/^docs\//, '').replace(/\/$/, '')
    return `](/${clean})`
  })
}

function titleFromPath(relative) {
  const base = path.basename(relative, '.md')
  return base
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function transformMarkdown(raw, relative) {
  const { meta, body } = parseFrontmatter(raw)
  const title = replaceBrand(meta.title || titleFromPath(relative)).trim()
  const description = replaceBrand(meta.description || '').trim()
  const sourceUrl = replaceBrand(meta.source_url || '').trim()
  const normalized = normalizeLinks(
    applyDocSpecificFixes(alignWithCurrentApi(replaceBrand(body)), relative)
  ).trimStart()
  const sourceNote = sourceUrl
    ? `---\n\n> 本页内容来自文档知识库整理，已按 ${brandName} 服务命名统一更新。\n`
    : ''

  return `---\ntitle: "${escapeYaml(title)}"\ndescription: "${escapeYaml(description)}"\nlastUpdated: true\n---\n\n${normalized}\n\n${sourceNote}`
}

function linkFor(relative) {
  const noExt = relative.replace(/\\/g, '/').replace(/\.md$/, '')
  return noExt === 'index' ? '/' : `/${noExt}`
}

function groupBySection(files) {
  const groups = new Map()
  for (const file of files) {
    const relative = path.relative(sourceRoot, file).replace(/\\/g, '/')
    if (relative === 'index.md') continue
    const parts = relative.split('/')
    const key = parts.length === 1 ? '' : parts.slice(0, -1).join('/')
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(relative)
  }
  return groups
}

function makeSidebar(files, titleByRelative) {
  const groups = groupBySection(files)
  const order = [
    '',
    'api-capabilities',
    'api-reference',
    'faq',
    'scenarios',
    'scenarios/engineering',
    'scenarios/programming',
    'wiki/basics',
    'wiki/models',
    'wiki/applications',
    'wiki/architectures',
    'wiki/practices',
    'wiki/encyclopedia',
    'wiki/tools',
  ]

  const sidebar = []
  for (const key of order) {
    const items = groups.get(key)
    if (!items?.length) continue
    sidebar.push({
      text: sectionTitles.get(key) || key,
      collapsed: key !== '',
      items: items.map((relative) => ({
        text: titleByRelative.get(relative) || titleFromPath(relative),
        link: linkFor(relative),
      })),
    })
  }

  return sidebar
}

function makeHome() {
  return `---
layout: home
title: "${escapeYaml(brandName)} 文档中心"
titleTemplate: false
hero:
  name: "${escapeYaml(brandName)}"
  text: "大模型 API 文档中心"
  tagline: "把接入指南、API 能力、常见问题与工程实践整理成一个独立、可搜索的文档站。"
  image:
    src: /armnet-shield.svg
    alt: ${escapeYaml(brandName)}
  actions:
    - theme: brand
      text: 快速开始
      link: /getting-started
    - theme: alt
      text: API 参考
      link: /api-reference/chat-completions
features:
  - icon: 🚀
    title: 快速接入
    details: 从服务地址、密钥、SDK 到调用示例，帮助开发者更快完成首个请求。
  - icon: 🧩
    title: 能力分类
    details: 按文本、图像、视频、多模态与工具链拆分，查找路径更清晰。
  - icon: 🛡️
    title: 实践与 FAQ
    details: 覆盖计费、并发、网络、日志、安全等线上使用问题。
---

## 文档分类

<div class="doc-grid">
  <a class="doc-card" href="/getting-started"><span>01</span><strong>入门指南</strong><em>服务地址、密钥、价格与资源入口</em></a>
  <a class="doc-card" href="/api-capabilities/text-generation"><span>02</span><strong>API 能力</strong><em>文本、图像、视频、多模态能力说明</em></a>
  <a class="doc-card" href="/api-reference/chat-completions"><span>03</span><strong>API 参考</strong><em>接口参数、请求与响应格式</em></a>
  <a class="doc-card" href="/faq/model-selection-guide"><span>04</span><strong>常见问题</strong><em>模型选择、账单、并发与网络排查</em></a>
  <a class="doc-card" href="/scenarios/programming/codex-cli"><span>05</span><strong>使用场景</strong><em>编程工具与工程应用接入示例</em></a>
  <a class="doc-card" href="/wiki/basics/llm"><span>06</span><strong>大模型百科</strong><em>基础概念、模型介绍与最佳实践</em></a>
</div>
`
}

async function main() {
  if (!(await exists(sourceRoot))) {
    throw new Error(`Source docs not found: ${sourceRoot}`)
  }

  for (const dir of generatedRoots) {
    await fs.rm(path.join(root, dir), { recursive: true, force: true })
  }
  for (const doc of rootDocs) {
    await fs.rm(path.join(root, doc), { force: true })
  }

  const files = await listMarkdown(sourceRoot)
  const titleByRelative = new Map()

  for (const file of files) {
    const relative = path.relative(sourceRoot, file).replace(/\\/g, '/')
    const raw = await fs.readFile(file, 'utf8')
    const { meta } = parseFrontmatter(raw)
    titleByRelative.set(relative, replaceBrand(meta.title || titleFromPath(relative)).trim())

    if (relative === 'index.md') continue
    const output = path.join(root, relative)
    await fs.mkdir(path.dirname(output), { recursive: true })
    await fs.writeFile(output, transformMarkdown(raw, relative), 'utf8')
  }

  await fs.writeFile(path.join(root, 'index.md'), makeHome(), 'utf8')

  const sidebar = makeSidebar(files, titleByRelative)
  const generated = `export const generatedSidebar = ${JSON.stringify(sidebar, null, 2)}\n`
  await fs.writeFile(path.join(root, '.vitepress', 'sidebar.generated.mjs'), generated, 'utf8')

  console.log(`Generated ${files.length} docs for ${brandName}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
