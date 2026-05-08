import { getSiteSettings } from '@/lib/db'

export default async function DebugPage() {
  const settings = await getSiteSettings().catch(() => null)
  const pageConfigs = settings?.page_configs ? JSON.parse(settings.page_configs) : null

  return (
    <div style={{ fontFamily: 'monospace', padding: 32, background: '#111', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#fff', marginBottom: 16 }}>Settings Debug</h1>
      <h2 style={{ color: '#ff0' }}>page_configs in DB: {settings?.page_configs ? '✅ YES' : '❌ NO'}</h2>
      <h2 style={{ color: '#ff0' }}>hero_config in DB: {settings?.hero_config ? '✅ YES' : '❌ NO'}</h2>

      <h3 style={{ color: '#0ff', marginTop: 24 }}>featured_moments image elements:</h3>
      <pre style={{ fontSize: 12, background: '#222', padding: 16, borderRadius: 8, overflow: 'auto' }}>
        {JSON.stringify(
          pageConfigs?.featured_moments?.elements
            ?.filter((e: any) => e.isImage)
            ?.map((e: any) => ({ id: e.id, label: e.label, imageUrl: e.imageUrl || '(empty — no upload yet)' })),
          null, 2
        ) ?? 'No featured_moments config found'}
      </pre>

      <h3 style={{ color: '#0ff', marginTop: 24 }}>All pages saved:</h3>
      <pre style={{ fontSize: 12, background: '#222', padding: 16, borderRadius: 8 }}>
        {JSON.stringify(Object.keys(pageConfigs ?? {}), null, 2)}
      </pre>

      <h3 style={{ color: '#f90', marginTop: 24 }}>Raw DB columns:</h3>
      <pre style={{ fontSize: 11, background: '#222', padding: 16, borderRadius: 8 }}>
        {`page_configs length: ${settings?.page_configs?.length ?? 0} chars\nhero_config length: ${(settings as any)?.hero_config?.length ?? 0} chars`}
      </pre>
    </div>
  )
}
