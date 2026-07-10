import './badge.css'

type BadgeVariant = 'available' | 'sold' | 'inquiry' | 'new'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>
}

export function priceToBadge(price?: string): BadgeVariant | null {
  if (!price) return null
  const lower = price.toLowerCase()
  if (lower === 'sold') return 'sold'
  if (lower.includes('available') || lower.includes('request')) return 'available'
  if (lower.includes('€') || lower.includes('$') || lower.includes('£')) return 'inquiry'
  return null
}
