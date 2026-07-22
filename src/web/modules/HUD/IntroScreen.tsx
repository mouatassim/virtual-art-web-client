import { isTouchDevice, useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'

export function IntroScreen() {
  const entered = useExpoStore((s) => s.entered)
  const { config, layout } = useExpoContext()

  const start = (tour: boolean) => {
    const s = useExpoStore.getState()
    s.enter()
    if (tour) s.setMode('tour')
  }

  return (
    <div className={`intro ${entered ? 'intro--gone' : ''}`} aria-hidden={entered}>
      <div className="intro__card">
        <p className="eyebrow">{config.subtitle}</p>
        <h1 className="intro__title">{config.title}</h1>
        <p className="intro__artist">{config.artist.name}</p>
        <p className="intro__meta">{layout.stops.length} works · one room · open now</p>
        <div className="intro__actions">
          <button className="btn btn--primary" onClick={() => start(false)} autoFocus>Enter the expo</button>
          <button className="btn btn--ghost" onClick={() => start(true)}>Take the guided tour</button>
        </div>
        <ul className="intro__keys">
          {isTouchDevice ? (
            <><li><span className="kbd">Drag</span> look around</li><li><span className="kbd">Tap floor</span> walk there</li><li><span className="kbd">Joystick</span> walk freely</li><li><span className="kbd">Tap a work</span> step up close</li></>
          ) : (
            <><li><span className="kbd">Drag</span> look around</li><li><span className="kbd">W A S D</span> walk · <span className="kbd">Shift</span> faster</li><li><span className="kbd">Click floor</span> walk there</li><li><span className="kbd">Click a work</span> step up close</li><li><span className="kbd">Scroll</span> zoom in on detail</li></>
          )}
        </ul>
      </div>
    </div>
  )
}
