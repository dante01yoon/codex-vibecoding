import { Composition, Folder } from 'remotion'
import { RealtimeGuestbookPromo } from './RealtimeGuestbookPromo'

export function RemotionRoot() {
  return (
    <Folder name="RealtimeGuestbook">
      <Composition
        id="RealtimeGuestbookPromo"
        component={RealtimeGuestbookPromo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  )
}
