import { defineConfig } from 'vitepress'
import { generatedSidebar } from './sidebar.generated.mjs'

const brandName = process.env.DOCS_BRAND_NAME || 'ArmNet 字元服务'
const appUrl = process.env.DOCS_APP_URL || 'http://122.51.35.238:5170'

export default defineConfig({
  title: `${brandName} 文档中心`,
  description: `${brandName} 大模型 API 文档中心`,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['link', { rel: 'icon', href: '/armnet-shield.svg' }],
  ],
  themeConfig: {
    logo: '/armnet-shield.svg',
    siteTitle: `${brandName} 文档`,
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: 'API 参考', link: '/api-reference/chat-completions' },
      { text: 'FAQ', link: '/faq/model-selection-guide' },
      { text: '返回主站', link: appUrl },
    ],
    sidebar: generatedSidebar,
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '清除搜索',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关文档',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: {
      text: '最后更新',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '浅色模式',
    darkModeSwitchTitle: '深色模式',
  },
})

