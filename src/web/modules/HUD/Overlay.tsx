import { Hud, Hint } from './Hud'
import { IntroScreen } from './IntroScreen'
import { InfoPanel } from './InfoPanel'
import { Minimap } from './Minimap'
import { TourBar } from './TourBar'
import { Joystick } from './Joystick'
import { HoverLabel } from './HoverLabel'
import { useExpoStore } from '../Player/useExpoStore'

export function Overlay() {
  const entered = useExpoStore((s) => s.entered)
  const mode = useExpoStore((s) => s.mode)
  return (
    <div className={`overlay ${entered ? 'overlay--in' : ''} overlay--${mode}`}>
      <Hud />
      <Minimap />
      <InfoPanel />
      <TourBar />
      <Joystick />
      <Hint />
      <HoverLabel />
      <IntroScreen />
    </div>
  )
}
