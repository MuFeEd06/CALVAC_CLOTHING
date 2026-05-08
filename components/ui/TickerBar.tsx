interface TickerBarProps { reverse?: boolean }
const ITEMS = ['ART STYLING','CRAFTED STORIES','PREMIUM MATERIALS','PREMIUM FABRICS','TIMELESS CUTS','URBAN INFLUENCE','NEW COLLECTION 2026']
export default function TickerBar({ reverse = false }: TickerBarProps) {
  const doubled = [...ITEMS, ...ITEMS]
  return (
    <div className="bg-[var(--black)] text-white overflow-hidden py-3 select-none">
      <div className="flex whitespace-nowrap ticker-animate" style={{ animationDirection: reverse ? 'reverse' : 'normal', animationDuration: '28s' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="text-[11px] font-600 tracking-[3px] uppercase px-7">{item}</span>
            <span className="text-[var(--orange)] text-xs">+</span>
          </span>
        ))}
      </div>
    </div>
  )
}
