import type { CartItem } from '@/types'

export function buildWhatsAppMessage(
  items: CartItem[],
  customerName: string,
  customerPhone: string,
  address: string
): string {
  const lines: string[] = []

  lines.push(`🛍️ *New Order — CALVAC*`)
  lines.push(``)
  lines.push(`*Customer:* ${customerName}`)
  lines.push(`*Phone:* ${customerPhone}`)
  if (address) lines.push(`*Address:* ${address}`)
  lines.push(``)
  lines.push(`*Order Items:*`)

  let subtotal = 0
  items.forEach((item, i) => {
    const itemPrice = item.color.price ?? item.product.price
    const total = itemPrice * item.quantity
    subtotal += total
    lines.push(
      `${i + 1}. ${item.product.name} — ${item.color.name}, Size ${item.size} × ${item.quantity} = ₹${total.toLocaleString('en-IN')}`
    )
  })

  lines.push(``)
  lines.push(`*Subtotal: ₹${subtotal.toLocaleString('en-IN')}*`)
  lines.push(``)
  lines.push(`_(Delivery charges will be confirmed separately)_`)

  return lines.join('\n')
}

export function openWhatsApp(whatsappNumber: string, message: string) {
  // Remove non-digits from number
  const number = whatsappNumber.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  const url = `https://wa.me/${number}?text=${encoded}`
  window.open(url, '_blank')
}

export function generateOrderNumber(): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `CAL-${yy}${mm}${dd}-${rand}`
}
