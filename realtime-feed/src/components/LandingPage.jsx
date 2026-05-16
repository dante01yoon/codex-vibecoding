import {
  Image as ImageIcon,
  MessageCircle,
  Palette,
  Paperclip,
  Radio,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'

const featureItems = [
  {
    icon: Users,
    title: '익명 작성',
    description: '로그인 화면 없이 이름과 짧은 메시지만으로 바로 참여해요.',
  },
  {
    icon: Palette,
    title: '무드와 아바타 색상',
    description: '오늘의 기분과 작은 색상 스와치로 작성자를 부드럽게 구분해요.',
  },
  {
    icon: Paperclip,
    title: '선택 첨부',
    description: '이미지 한 장이나 간단한 그림을 더해 포스트잇을 풍성하게 만들어요.',
  },
  {
    icon: Radio,
    title: '실시간 피드',
    description: '새 메모가 피드 위에 자연스럽게 붙어 살아 있는 게시판처럼 보여요.',
  },
  {
    icon: MessageCircle,
    title: '댓글',
    description: '펼친 메모에서 짧은 답글을 남기고 대화를 이어갈 수 있어요.',
  },
]

const sceneItems = [
  {
    title: '행사',
    description: '부스 방문 후기, 응원 문구, 현장 사진을 한곳에 모아요.',
  },
  {
    title: '수업',
    description: '강의 후 느낀 점과 질문을 부담 없이 남기는 작은 게시판이 돼요.',
  },
  {
    title: '소규모 커뮤니티',
    description: '멤버들의 안부와 짧은 소식을 따뜻한 메모처럼 이어 붙여요.',
  },
]

function LandingPage({ onStart }) {
  return (
    <section className="landing-page" aria-labelledby="landing-title">
      <div className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">따뜻한 실시간 방명록</p>
          <h1 id="landing-title">실시간으로 남기는 따뜻한 방명록</h1>
          <p className="landing-lead">
            행사장 벽에 붙은 포스트잇처럼, 누구나 로그인 없이 오늘의 인사와
            응원을 남기고 바로 서로의 반응을 확인할 수 있어요.
          </p>
          <div className="landing-actions">
            <button className="landing-cta" type="button" onClick={onStart}>
              <Send size={18} aria-hidden="true" />
              방명록 시작하기
            </button>
            <p className="landing-note">이름, 무드, 메시지만 있으면 충분해요.</p>
          </div>
        </div>

        <div className="landing-preview" aria-label="방명록 미리보기">
          <div className="preview-note preview-note-yellow">
            <span className="preview-pin" />
            <strong>민지</strong>
            <p>오늘 행사 분위기가 정말 따뜻했어요. 또 만나요!</p>
          </div>
          <div className="preview-note preview-note-mint">
            <span className="preview-pin preview-pin-teal" />
            <strong>준호</strong>
            <p>사진 한 장과 함께 남기는 작은 후기</p>
            <ImageIcon size={18} aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="landing-section">
        <div className="landing-section-heading">
          <p className="section-kicker">기능 소개</p>
          <h2>짧게 남기고, 바로 이어지는 경험</h2>
        </div>
        <div className="feature-grid">
          {featureItems.map((item) => {
            const Icon = item.icon

            return (
              <article className="feature-card" key={item.title}>
                <span className="feature-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>

      <div className="landing-section landing-scenes">
        <div className="landing-section-heading">
          <p className="section-kicker">사용 장면</p>
          <h2>작은 모임에 어울리는 방명록</h2>
        </div>
        <div className="scene-list">
          {sceneItems.map((item) => (
            <article className="scene-card" key={item.title}>
              <Sparkles size={18} aria-hidden="true" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingPage
