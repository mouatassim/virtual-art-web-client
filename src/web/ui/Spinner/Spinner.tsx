import './spinner.css'

export function Spinner({ light }: { light?: boolean }) {
  return <span className={['spinner', light ? 'spinner--light' : ''].filter(Boolean).join(' ')} />
}
