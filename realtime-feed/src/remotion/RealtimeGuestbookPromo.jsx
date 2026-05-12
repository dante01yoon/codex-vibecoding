import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

const IMAGES = {
  hero: 'img/realtime-guestbook-hero-background.png',
  notes: 'img/realtime-guestbook-digital-notes-scene.png',
  showcase: 'img/realtime-guestbook-portfolio-showcase.png',
}

const colors = {
  background: '#fff8ed',
  surface: '#ffffff',
  primary: '#f9735b',
  primaryDark: '#de553f',
  realtime: '#0f9f8f',
  accent: '#7c3aed',
  text: '#1f2933',
  muted: '#5f6b7a',
  border: '#e8dccb',
  paperYellow: '#ffe8a3',
  paperMint: '#cff7e8',
  paperPeach: '#ffd6c2',
  paperBlue: '#d7ecff',
}

const ease = Easing.bezier(0.16, 1, 0.3, 1)

function clampProgress(frame, start, end) {
  return interpolate(frame, [start, end], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

function sceneOpacity(frame, duration, fade = 30, first = false, last = false) {
  const enter = first ? 1 : clampProgress(frame, 0, fade)
  const exit = last ? 1 : interpolate(frame, [duration - fade, duration], [1, 0], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return enter * exit
}

function reveal(frame, delay, duration = 26) {
  return clampProgress(frame, delay, delay + duration)
}

function BackgroundImage({ src, frame, duration, x = 0, y = 0 }) {
  const drift = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const scale = interpolate(drift, [0, 1], [1.02, 1.08])
  const moveX = interpolate(drift, [0, 1], [0, x])
  const moveY = interpolate(drift, [0, 1], [0, y])

  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale})`,
      }}
    />
  )
}

function TextureLayer() {
  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(90deg, rgba(255, 248, 237, 0.9) 0%, rgba(255, 248, 237, 0.52) 40%, rgba(255, 248, 237, 0.08) 100%)',
        boxShadow: 'inset 0 0 140px rgba(73, 51, 28, 0.13)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.32,
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.32) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
    </AbsoluteFill>
  )
}

function TitleBlock({
  frame,
  kicker,
  title,
  body,
  align = 'left',
  top = 190,
  width = 780,
}) {
  const titleIn = reveal(frame, 10)
  const bodyIn = reveal(frame, 28)
  const kickerIn = reveal(frame, 0)
  const isRight = align === 'right'

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: isRight ? 'auto' : 112,
        right: isRight ? 112 : 'auto',
        width,
        textAlign: align,
        color: colors.text,
      }}
    >
      <div
        style={{
          opacity: kickerIn,
          transform: `translateY(${interpolate(kickerIn, [0, 1], [24, 0])}px)`,
          color: colors.realtime,
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 0,
          marginBottom: 22,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          opacity: titleIn,
          transform: `translateY(${interpolate(titleIn, [0, 1], [36, 0])}px)`,
          fontSize: 78,
          lineHeight: 1.06,
          fontWeight: 900,
          letterSpacing: 0,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </div>
      <div
        style={{
          opacity: bodyIn,
          transform: `translateY(${interpolate(bodyIn, [0, 1], [28, 0])}px)`,
          marginTop: 30,
          color: colors.muted,
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.45,
          whiteSpace: 'pre-line',
        }}
      >
        {body}
      </div>
    </div>
  )
}

function PillRow({ frame, items, top, left, right, align = 'left' }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        display: 'flex',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 14,
        flexWrap: 'wrap',
        maxWidth: 760,
      }}
    >
      {items.map((item, index) => {
        const progress = reveal(frame, 52 + index * 8)
        return (
          <div
            key={item}
            style={{
              opacity: progress,
              transform: `translateY(${interpolate(progress, [0, 1], [22, 0])}px)`,
              minHeight: 54,
              padding: '14px 20px',
              borderRadius: 999,
              border: `2px solid ${colors.border}`,
              background: 'rgba(255, 253, 247, 0.92)',
              color: colors.text,
              boxShadow: '0 18px 36px rgba(73, 51, 28, 0.12)',
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {item}
          </div>
        )
      })}
    </div>
  )
}

function FloatingNote({ frame, delay, color, top, left, width, rotate, children }) {
  const progress = reveal(frame, delay, 30)
  const float = Math.sin((frame + delay) / 34) * 5

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        minHeight: 150,
        padding: 22,
        borderRadius: 8,
        background: color,
        boxShadow: '0 26px 52px rgba(73, 51, 28, 0.16)',
        opacity: progress,
        transform: `translateY(${interpolate(progress, [0, 1], [42, float])}px) rotate(${rotate}deg)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: colors.realtime,
          }}
        />
        <div
          style={{
            width: 128,
            height: 16,
            borderRadius: 999,
            background: 'rgba(31, 41, 51, 0.2)',
          }}
        />
      </div>
      <div
        style={{
          color: colors.text,
          fontSize: 24,
          fontWeight: 900,
          lineHeight: 1.35,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function FeaturePanel({ frame }) {
  const panel = reveal(frame, 48, 32)
  const pulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.2, 1])

  return (
    <div
      style={{
        position: 'absolute',
        left: 116,
        bottom: 92,
        width: 640,
        padding: 28,
        borderRadius: 18,
        border: `2px solid ${colors.border}`,
        background: 'rgba(255, 255, 255, 0.88)',
        boxShadow: '0 26px 60px rgba(73, 51, 28, 0.16)',
        opacity: panel,
        transform: `translateY(${interpolate(panel, [0, 1], [34, 0])}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900, color: colors.text }}>
          실시간 피드 상태
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minHeight: 40,
            padding: '8px 14px',
            borderRadius: 999,
            background: '#e9fbf6',
            color: '#0f766e',
            fontSize: 18,
            fontWeight: 900,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: colors.realtime,
              opacity: pulse,
            }}
          />
          연결됨
        </div>
      </div>
      {['새 메모가 상단에 조용히 반영됩니다', '펼친 댓글만 실시간으로 구독합니다'].map(
        (text, index) => {
          const progress = reveal(frame, 68 + index * 10, 24)
          return (
            <div
              key={text}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: progress,
                transform: `translateX(${interpolate(progress, [0, 1], [-24, 0])}px)`,
                marginTop: index ? 14 : 0,
                color: colors.muted,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: index ? colors.paperMint : colors.paperPeach,
                  border: `2px solid ${colors.border}`,
                }}
              />
              {text}
            </div>
          )
        },
      )}
    </div>
  )
}

function SecurityStack({ frame }) {
  const items = [
    ['익명 세션', '로그인 화면 없이 바로 참여'],
    ['RLS 정책', '본인이 쓴 항목만 삭제'],
    ['Vercel 배포', '작은 제품처럼 바로 공개'],
  ]

  return (
    <div
      style={{
        position: 'absolute',
        right: 110,
        bottom: 110,
        width: 650,
        display: 'grid',
        gap: 18,
      }}
    >
      {items.map(([title, body], index) => {
        const progress = reveal(frame, 54 + index * 12, 30)
        return (
          <div
            key={title}
            style={{
              display: 'grid',
              gridTemplateColumns: '22px 1fr',
              gap: 18,
              alignItems: 'center',
              padding: '22px 24px',
              borderRadius: 16,
              border: `2px solid ${colors.border}`,
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 18px 42px rgba(73, 51, 28, 0.14)',
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [46, 0])}px)`,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background:
                  index === 0
                    ? colors.primary
                    : index === 1
                      ? colors.realtime
                      : colors.accent,
              }}
            />
            <div>
              <div
                style={{
                  color: colors.text,
                  fontSize: 25,
                  fontWeight: 900,
                  marginBottom: 5,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  color: colors.muted,
                  fontSize: 21,
                  fontWeight: 800,
                }}
              >
                {body}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProgressRail({ frame }) {
  const { durationInFrames } = useVideoConfig()
  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: 112,
        right: 112,
        bottom: 46,
        height: 6,
        borderRadius: 999,
        background: 'rgba(232, 220, 203, 0.8)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          borderRadius: 999,
          background: colors.primary,
        }}
      />
    </div>
  )
}

function SceneShell({
  image,
  children,
  duration,
  first = false,
  last = false,
  x,
  y,
  overlay = true,
}) {
  const frame = useCurrentFrame()
  const opacity = sceneOpacity(frame, duration, 30, first, last)

  return (
    <AbsoluteFill style={{ opacity, background: colors.background }}>
      <BackgroundImage src={image} frame={frame} duration={duration} x={x} y={y} />
      {overlay ? <TextureLayer /> : null}
      {children(frame)}
    </AbsoluteFill>
  )
}

function HeroScene({ duration }) {
  return (
    <SceneShell image={IMAGES.hero} duration={duration} first x={-26} y={8}>
      {(frame) => (
        <>
          <TitleBlock
            frame={frame}
            kicker="Agent Skills Finale"
            title={'Realtime\nGuestbook'}
            body={'행사와 수업을 위한\n따뜻한 실시간 방명록'}
            top={176}
            width={720}
          />
          <PillRow
            frame={frame}
            top={646}
            left={112}
            items={['로그인 화면 없음', '포스트잇 피드', '모바일 우선']}
          />
          <FloatingNote
            frame={frame}
            delay={76}
            color={colors.paperYellow}
            top={178}
            left={1240}
            width={360}
            rotate={-1}
          >
            새 인사가 올라왔어요
          </FloatingNote>
          <FloatingNote
            frame={frame}
            delay={92}
            color={colors.paperMint}
            top={390}
            left={1378}
            width={330}
            rotate={1}
          >
            댓글도 실시간으로
          </FloatingNote>
        </>
      )}
    </SceneShell>
  )
}

function ParticipationScene({ duration }) {
  return (
    <SceneShell image={IMAGES.notes} duration={duration} x={24} y={-8}>
      {(frame) => (
        <>
          <TitleBlock
            frame={frame}
            align="right"
            kicker="참여는 가볍게"
            title={'남기는 순간,\n모두에게 바로 보여요'}
            body={'이름, 메시지, 무드, 색상,\n선택 첨부까지 한 번에'}
            top={150}
            width={760}
          />
          <PillRow
            frame={frame}
            top={676}
            right={112}
            align="right"
            items={['익명 세션', '이미지/그림 첨부', '3초 안에 반영']}
          />
        </>
      )}
    </SceneShell>
  )
}

function TrustScene({ duration }) {
  return (
    <SceneShell image={IMAGES.showcase} duration={duration} x={-18} y={0}>
      {(frame) => (
        <>
          <TitleBlock
            frame={frame}
            kicker="제품처럼 안전하게"
            title={'작은 앱이어도\n권한 흐름은 정확하게'}
            body={'Supabase 익명 인증과 RLS로\n본인이 쓴 글만 정리할 수 있게'}
            top={146}
            width={790}
          />
          <SecurityStack frame={frame} />
        </>
      )}
    </SceneShell>
  )
}

function PortfolioScene({ duration }) {
  return (
    <SceneShell image={IMAGES.showcase} duration={duration} last x={18} y={-6}>
      {(frame) => (
        <>
          <TitleBlock
            frame={frame}
            kicker="Portfolio-ready Demo"
            title={'설계부터 배포까지,\n하나의 완성된 흐름'}
            body={'Codex Agent Skills로 만든\n한국어 실시간 방명록'}
            top={158}
            width={820}
          />
          <FeaturePanel frame={frame} />
          <div
            style={{
              position: 'absolute',
              right: 112,
              top: 118,
              width: 360,
              height: 92,
              borderRadius: 999,
              background: colors.text,
              color: colors.background,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 900,
              opacity: reveal(frame, 84, 28),
            }}
          >
            Realtime Guestbook
          </div>
        </>
      )}
    </SceneShell>
  )
}

export function RealtimeGuestbookPromo() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const heroDuration = 8 * fps
  const participationDuration = 9 * fps
  const trustDuration = 9 * fps
  const portfolioDuration = 7 * fps

  return (
    <AbsoluteFill
      style={{
        background: colors.background,
        fontFamily:
          "'Noto Sans KR', 'Apple SD Gothic Neo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <Sequence from={0} durationInFrames={heroDuration} premountFor={fps}>
        <HeroScene duration={heroDuration} />
      </Sequence>
      <Sequence from={7 * fps} durationInFrames={participationDuration} premountFor={fps}>
        <ParticipationScene duration={participationDuration} />
      </Sequence>
      <Sequence from={15 * fps} durationInFrames={trustDuration} premountFor={fps}>
        <TrustScene duration={trustDuration} />
      </Sequence>
      <Sequence from={23 * fps} durationInFrames={portfolioDuration} premountFor={fps}>
        <PortfolioScene duration={portfolioDuration} />
      </Sequence>
      <ProgressRail frame={frame} />
    </AbsoluteFill>
  )
}
