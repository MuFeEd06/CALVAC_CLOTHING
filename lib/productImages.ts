export const MAX_PRODUCT_IMAGE_BYTES = 250 * 1024

export interface ProductImageTransformOptions {
  width?: number
  quality?: number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
}

function normalizeEndpoint(value?: string) {
  return (value ?? '').replace(/\/+$/, '')
}

export function isImageKitUrl(url: string) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    const endpoint = normalizeEndpoint(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT)
    return parsed.hostname.endsWith('imagekit.io') || (!!endpoint && url.startsWith(endpoint))
  } catch {
    return false
  }
}

export function getOptimizedProductImageUrl(
  url: string | null | undefined,
  options: ProductImageTransformOptions = {},
) {
  if (!url) return ''
  if (!isImageKitUrl(url)) return url

  try {
    const parsed = new URL(url)
    if (parsed.searchParams.has('tr')) return parsed.toString()

    const quality = Math.min(100, Math.max(1, options.quality ?? 80))
    const transforms = [`q-${quality}`]
    if (options.format !== undefined) transforms.push(`f-${options.format}`)
    else transforms.push('f-auto')
    if (options.width) transforms.push(`w-${Math.max(1, Math.round(options.width))}`)

    parsed.searchParams.set('tr', transforms.join(','))
    return parsed.toString()
  } catch {
    return url
  }
}

export function formatProductImageLimit() {
  return '250 KB'
}
