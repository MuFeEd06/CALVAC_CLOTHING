import { NextResponse } from 'next/server'

const DEFAULT_JSON_LIMIT_BYTES = 64 * 1024

function safeOrigin(value: string | null) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function allowedOrigins(req: Request) {
  const requestOrigin = safeOrigin(req.url)
  const publicOrigin = safeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? null)
  return new Set([requestOrigin, publicOrigin].filter(Boolean) as string[])
}

export function isSameOriginRequest(req: Request) {
  const allowed = allowedOrigins(req)
  const origin = safeOrigin(req.headers.get('origin'))
  if (origin) return allowed.has(origin)

  const referer = safeOrigin(req.headers.get('referer'))
  if (referer) return allowed.has(referer)

  return false
}

export function sameOriginGuard(req: Request) {
  if (isSameOriginRequest(req)) return null
  return NextResponse.json({ error: 'Request origin not allowed' }, { status: 403 })
}

export async function readJsonBody<T = unknown>(
  req: Request,
  maxBytes = DEFAULT_JSON_LIMIT_BYTES,
): Promise<T> {
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error('Expected JSON request body')
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error('Request body is too large')
  }

  return req.json() as Promise<T>
}

export async function readTextBody(req: Request, maxBytes: number) {
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error('Request body is too large')
  }

  const body = await req.text()
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new Error('Request body is too large')
  }
  return body
}

export function getStringField(
  source: Record<string, unknown>,
  key: string,
  maxLength = 128,
) {
  const value = source[key]
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  return trimmed.length <= maxLength ? trimmed : ''
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

