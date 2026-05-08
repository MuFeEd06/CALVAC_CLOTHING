'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/useCart'

interface Props { open: boolean; onClose: () => void }

export default function CartDrawer({ open, onClose }: Props) {
  const router  = useRouter()
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart()

  const goCheckout = () => { onClose(); router.push('/checkout') }

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          backdropFilter: open ? 'blur(2px)' : 'none',
        }}
      />

      {/* ── Drawer ──
          Mobile  : slides up from bottom (translateY), full-width, max-height 92vh
          Desktop : slides in from right (translateX), 420px wide, full height
      ── */}
      <div
        className="cart-drawer"
        style={{
          position: 'fixed', zIndex: 71,
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'Barlow, sans-serif',
        }}
      >
        {/* Drag handle (mobile only) */}
        <div className="cart-handle" />

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e8e8e5',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={17} />
            <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Cart
            </span>
            {totalItems > 0 && (
              <span style={{ background: '#f04e0f', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #e8e8e5', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close cart"
          >
            <X size={15} />
          </button>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 64, color: '#aaa' }}>
              <ShoppingBag size={36} style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontSize: 14, marginBottom: 18 }}>Your cart is empty</p>
              <Link
                href="/shop"
                onClick={onClose}
                style={{ padding: '10px 22px', border: '1.5px solid #0d0d0d', borderRadius: 40, fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none', color: '#0d0d0d' }}
              >Shop Now</Link>
            </div>
          ) : (
            items.map((item, i) => {
              const price = item.color.price ?? item.product.price
              return (
                <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid #f0f0ee' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 68, height: 80, borderRadius: 10, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={68} height={80}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#888', margin: '0 0 10px' }}>
                      <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: item.color.hex, border: '1px solid #e8e8e5', marginRight: 4, verticalAlign: 'middle' }} />
                      {item.color.name} · Size {item.size}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Qty stepper */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e8e8e5', borderRadius: 20, overflow: 'hidden' }}>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity - 1)}
                          style={{ width: 30, height: 28, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Minus size={10} /></button>
                        <span style={{ minWidth: 22, textAlign: 'center', fontSize: 12, fontWeight: 600 }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity + 1)}
                          style={{ width: 30, height: 28, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        ><Plus size={10} /></button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: '"Barlow Condensed",sans-serif', fontWeight: 700, fontSize: 15 }}>
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}
                        ><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e8e8e5', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 14, textAlign: 'center' }}>
              Delivery charges calculated at checkout
            </p>
            <button
              onClick={goCheckout}
              style={{ width: '100%', padding: '14px', borderRadius: 40, border: 'none', background: '#0d0d0d', color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Barlow,sans-serif', transition: 'background 0.2s' }}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Mobile: bottom sheet */
        .cart-drawer {
          left: 0; right: 0; bottom: 0;
          top: auto;
          border-radius: 20px 20px 0 0;
          max-height: 92dvh;
          transform: ${open ? 'translateY(0)' : 'translateY(100%)'};
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          box-shadow: 0 -8px 40px rgba(0,0,0,0.14);
        }
        .cart-handle {
          width: 40px; height: 4px; border-radius: 2px;
          background: #d5d5d2; margin: 10px auto 2px;
          flex-shrink: 0;
        }
        /* Desktop: right side panel */
        @media (min-width: 640px) {
          .cart-drawer {
            left: auto; bottom: 0; top: 0;
            width: 400px;
            border-radius: 0;
            max-height: 100dvh;
            transform: ${open ? 'translateX(0)' : 'translateX(100%)'};
            box-shadow: -8px 0 40px rgba(0,0,0,0.12);
          }
          .cart-handle { display: none; }
        }
      `}</style>
    </>
  )
}
