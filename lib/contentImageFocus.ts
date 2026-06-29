export const TOP_FOCUSED_OBJECT_POSITION = '50% 10%'
export const TOP_FOCUSED_IMAGE_CLASS_NAME = 'object-cover object-top'
export const HOMEPAGE_TOP_FOCUSED_OBJECT_POSITION = '50% 0%'

export function normalizeHomepageObjectPosition(value?: string | null) {
  const position = value?.trim()
  if (!position || position === 'top' || position === 'top center' || position === 'center top') {
    return HOMEPAGE_TOP_FOCUSED_OBJECT_POSITION
  }
  return position
}

export const topFocusedContentImageStyle = {
  objectFit: 'cover',
  objectPosition: TOP_FOCUSED_OBJECT_POSITION,
} as const
