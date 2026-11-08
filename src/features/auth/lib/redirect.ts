export function getSafeReturnPath(value: string | null): string | null {
  if (!value?.startsWith('/') || value.startsWith('//')) return null

  try {
    const url = new URL(value, window.location.origin)
    if (url.origin !== window.location.origin) return null
    if (url.pathname === '/login' || url.pathname === '/register') return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
