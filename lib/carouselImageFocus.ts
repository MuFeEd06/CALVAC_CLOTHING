export const CAROUSEL_DEFAULT_IMAGE_FOCUS = 'top'
export const CAROUSEL_DEFAULT_IMAGE_OBJECT_POSITION = '50% 0%'

export const CAROUSEL_IMAGE_FOCUS_POSITIONS = {
  top: '50% 0%',
  center: '50% 50%',
  bottom: '50% 100%',
  left: '0% 50%',
  right: '100% 50%',
  'top-left': '0% 0%',
  'top-right': '100% 0%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%',
} as const

export type CarouselImageFocusPreset = keyof typeof CAROUSEL_IMAGE_FOCUS_POSITIONS
export type CarouselImageFocusValue = CarouselImageFocusPreset | 'custom'

export const CAROUSEL_IMAGE_FOCUS_OPTIONS: Array<{
  label: string
  value: CarouselImageFocusPreset
  objectPosition: string
}> = [
  { label: 'Top', value: 'top', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS.top },
  { label: 'Center', value: 'center', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS.center },
  { label: 'Bottom', value: 'bottom', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS.bottom },
  { label: 'Left', value: 'left', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS.left },
  { label: 'Right', value: 'right', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS.right },
  { label: 'Top Left', value: 'top-left', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS['top-left'] },
  { label: 'Top Right', value: 'top-right', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS['top-right'] },
  { label: 'Bottom Left', value: 'bottom-left', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-left'] },
  { label: 'Bottom Right', value: 'bottom-right', objectPosition: CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-right'] },
]

export interface CarouselImageFocusSource {
  imageFocus?: string | null
  imageObjectPosition?: string | null
  objectPosition?: string | null
}

export interface CarouselImageFocusPatch {
  imageFocus: CarouselImageFocusValue
  imageObjectPosition: string
  objectPosition: string
}

const LEGACY_POSITION_ALIASES: Record<string, string> = {
  top: CAROUSEL_IMAGE_FOCUS_POSITIONS.top,
  'top center': CAROUSEL_IMAGE_FOCUS_POSITIONS.top,
  'center top': CAROUSEL_IMAGE_FOCUS_POSITIONS.top,
  center: CAROUSEL_IMAGE_FOCUS_POSITIONS.center,
  'center center': CAROUSEL_IMAGE_FOCUS_POSITIONS.center,
  bottom: CAROUSEL_IMAGE_FOCUS_POSITIONS.bottom,
  'bottom center': CAROUSEL_IMAGE_FOCUS_POSITIONS.bottom,
  'center bottom': CAROUSEL_IMAGE_FOCUS_POSITIONS.bottom,
  left: CAROUSEL_IMAGE_FOCUS_POSITIONS.left,
  'left center': CAROUSEL_IMAGE_FOCUS_POSITIONS.left,
  'center left': CAROUSEL_IMAGE_FOCUS_POSITIONS.left,
  right: CAROUSEL_IMAGE_FOCUS_POSITIONS.right,
  'right center': CAROUSEL_IMAGE_FOCUS_POSITIONS.right,
  'center right': CAROUSEL_IMAGE_FOCUS_POSITIONS.right,
  'top left': CAROUSEL_IMAGE_FOCUS_POSITIONS['top-left'],
  'left top': CAROUSEL_IMAGE_FOCUS_POSITIONS['top-left'],
  'top right': CAROUSEL_IMAGE_FOCUS_POSITIONS['top-right'],
  'right top': CAROUSEL_IMAGE_FOCUS_POSITIONS['top-right'],
  'bottom left': CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-left'],
  'left bottom': CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-left'],
  'bottom right': CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-right'],
  'right bottom': CAROUSEL_IMAGE_FOCUS_POSITIONS['bottom-right'],
}

const POSITION_TOKEN = /^(?:-?\d+(?:\.\d+)?(?:%|px)|left|center|right|top|bottom)$/

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function normalizeCarouselImageObjectPosition(value?: string | null): string | null {
  if (!value) return null

  const normalized = normalizeWhitespace(value)
  const lower = normalized.toLowerCase()
  const aliased = LEGACY_POSITION_ALIASES[lower]
  if (aliased) return aliased

  const tokens = lower.split(' ')
  if (tokens.length < 1 || tokens.length > 2) return null
  if (!tokens.every(token => POSITION_TOKEN.test(token))) return null

  return normalized
}

export function resolveCarouselImageObjectPosition(source?: CarouselImageFocusSource | null): string {
  const focus = normalizeWhitespace(source?.imageFocus ?? '').toLowerCase()
  if (focus && focus !== 'custom' && focus in CAROUSEL_IMAGE_FOCUS_POSITIONS) {
    return CAROUSEL_IMAGE_FOCUS_POSITIONS[focus as CarouselImageFocusPreset]
  }

  const custom = normalizeCarouselImageObjectPosition(source?.imageObjectPosition ?? source?.objectPosition)
  return custom ?? CAROUSEL_DEFAULT_IMAGE_OBJECT_POSITION
}

export function getCarouselImageTransformOrigin(source?: CarouselImageFocusSource | null): string {
  return resolveCarouselImageObjectPosition(source)
}

export function getCarouselImageFocusValue(source?: CarouselImageFocusSource | null): CarouselImageFocusValue {
  const focus = normalizeWhitespace(source?.imageFocus ?? '').toLowerCase()
  if (focus === 'custom') return 'custom'
  if (focus in CAROUSEL_IMAGE_FOCUS_POSITIONS) return focus as CarouselImageFocusPreset

  const resolved = resolveCarouselImageObjectPosition(source)
  const matched = CAROUSEL_IMAGE_FOCUS_OPTIONS.find(option => option.objectPosition === resolved)
  return matched?.value ?? 'custom'
}

export function getCarouselImageFocusWarning(source?: CarouselImageFocusSource | null): string | null {
  const focus = normalizeWhitespace(source?.imageFocus ?? '').toLowerCase()
  const raw = source?.imageObjectPosition ?? source?.objectPosition
  if (focus !== 'custom' || !raw) return null
  return normalizeCarouselImageObjectPosition(raw) ? null : `Invalid custom focus. Falling back to ${CAROUSEL_DEFAULT_IMAGE_OBJECT_POSITION}.`
}

export function buildCarouselImageFocusPatch(
  focus: CarouselImageFocusValue,
  customObjectPosition = '',
): CarouselImageFocusPatch {
  const objectPosition = focus === 'custom'
    ? customObjectPosition
    : CAROUSEL_IMAGE_FOCUS_POSITIONS[focus]

  return {
    imageFocus: focus,
    imageObjectPosition: objectPosition,
    objectPosition,
  }
}
