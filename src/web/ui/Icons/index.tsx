interface IconProps { size?: number; color?: string }

function Icon({ size = 20, color = 'currentColor', children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export function Close(p: IconProps) {
  return <Icon {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
}

export function Info(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Icon>
}

export function Map(p: IconProps) {
  return <Icon {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></Icon>
}

export function Play(p: IconProps) {
  return <Icon {...p}><polygon points="5 3 19 12 5 21 5 3" /></Icon>
}

export function Pause(p: IconProps) {
  return <Icon {...p}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></Icon>
}

export function ChevronLeft(p: IconProps) {
  return <Icon {...p}><polyline points="15 18 9 12 15 6" /></Icon>
}

export function ChevronRight(p: IconProps) {
  return <Icon {...p}><polyline points="9 18 15 12 9 6" /></Icon>
}

export function ExternalLink(p: IconProps) {
  return <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></Icon>
}

export function Mail(p: IconProps) {
  return <Icon {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>
}

export function Compass(p: IconProps) {
  return <Icon {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></Icon>
}
