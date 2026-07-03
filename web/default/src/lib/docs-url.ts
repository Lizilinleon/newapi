export function getDocsServiceUrl() {
  if (typeof window === 'undefined') return 'http://127.0.0.1:5171/'
  return `${window.location.protocol}//${window.location.hostname}:5171/`
}

export function isDocsLink(title?: string, href?: string) {
  const normalizedHref = href?.replace(/\/+$/, '') || ''
  return title === 'Docs' || title === '文档' || normalizedHref === '/docs'
}
