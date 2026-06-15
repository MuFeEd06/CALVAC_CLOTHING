import type { PaymentMethodSettings, PolicyPageContent, PolicySettings, SiteSettings } from '@/types'

export const DEFAULT_PAYMENT_METHODS: PaymentMethodSettings = {
  whatsapp: true,
  cod: true,
  razorpay: true,
}

export type PolicyKey = keyof PolicySettings

type SettingsLike = Partial<Pick<SiteSettings, 'page_configs' | 'policies'>> | null | undefined

export const DEFAULT_POLICIES: Record<PolicyKey, PolicyPageContent> = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: June 2026',
    body: [
      'CALVAC respects your privacy. We collect the information needed to process orders, support customer accounts, respond to enquiries, and improve the store experience.',
      'Order, account, delivery, and contact details are used only for store operations, customer support, fulfilment, and required legal or tax records.',
      'Payments are processed through trusted payment partners. CALVAC does not store card numbers, UPI credentials, or banking passwords.',
      'You can contact CALVAC to ask about your personal information, order records, or account details.',
    ].join('\n\n'),
  },
  return: {
    title: 'Return Policy',
    lastUpdated: 'Last updated: June 2026',
    body: [
      'Returns and exchanges are reviewed item by item so CALVAC can keep every order handled carefully.',
      'Please contact us with your order number, product details, and reason for return. Items should be unused, unwashed, and in their original condition unless a product issue is reported.',
      'Final return or exchange approval depends on product condition, order status, and availability of replacement stock.',
      'Refund timelines may vary depending on the original payment method and payment provider processing time.',
    ].join('\n\n'),
  },
  shipping: {
    title: 'Shipping Policy',
    lastUpdated: 'Last updated: June 2026',
    body: [
      'CALVAC ships confirmed orders to the delivery address provided at checkout.',
      'Delivery charges, timelines, and courier availability may vary by location. We will contact you if an address needs clarification before dispatch.',
      'For WhatsApp and Cash on Delivery orders, dispatch happens after order confirmation. Online payment orders are processed after successful payment verification.',
      'Please ensure the phone number and address entered at checkout are correct so delivery updates can reach you.',
    ].join('\n\n'),
  },
}

export function parsePageConfigs(settings: SettingsLike): Record<string, any> {
  if (!settings?.page_configs) return {}

  try {
    const parsed = JSON.parse(settings.page_configs)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function parsePolicies(settings: SettingsLike): PolicySettings {
  const raw = settings?.policies
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      return {}
    }
  }
  return typeof raw === 'object' ? raw : {}
}

export function clampParallaxSpeed(value: unknown, fallback = 1) {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : Number.NaN

  if (!Number.isFinite(n)) return fallback
  return Math.min(2, Math.max(0, Number(n.toFixed(2))))
}

export function getParallaxSpeed(settings: SettingsLike) {
  const pageConfigs = parsePageConfigs(settings)
  return clampParallaxSpeed(
    pageConfigs?._visualSettings?.parallaxSpeed ??
      pageConfigs?.visualSettings?.parallaxSpeed ??
      pageConfigs?._parallaxSpeed ??
      pageConfigs?.parallaxSpeed,
  )
}

function booleanWithDefault(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

export function getPaymentMethodSettings(settings: SettingsLike): PaymentMethodSettings {
  const pageConfigs = parsePageConfigs(settings)
  const raw =
    pageConfigs?._checkoutSettings?.paymentMethods ??
    pageConfigs?.checkoutSettings?.paymentMethods ??
    pageConfigs?._paymentMethods ??
    pageConfigs?.paymentMethods ??
    {}

  return {
    whatsapp: booleanWithDefault(raw.whatsapp, DEFAULT_PAYMENT_METHODS.whatsapp),
    cod: booleanWithDefault(raw.cod, DEFAULT_PAYMENT_METHODS.cod),
    razorpay: booleanWithDefault(raw.razorpay, DEFAULT_PAYMENT_METHODS.razorpay),
  }
}

export function getPolicySettings(settings: SettingsLike): Record<PolicyKey, PolicyPageContent> {
  const policies = parsePolicies(settings)
  const pageConfigs = parsePageConfigs(settings)
  const legacy = pageConfigs?._policies ?? pageConfigs?.policies ?? {}

  return (Object.keys(DEFAULT_POLICIES) as PolicyKey[]).reduce((acc, key) => {
    const value = policies?.[key] ?? legacy?.[key] ?? {}
    acc[key] = {
      ...DEFAULT_POLICIES[key],
      ...(value && typeof value === 'object' ? value : {}),
    }
    return acc
  }, {} as Record<PolicyKey, PolicyPageContent>)
}

export function getPolicyContent(settings: SettingsLike, key: PolicyKey) {
  return getPolicySettings(settings)[key]
}
