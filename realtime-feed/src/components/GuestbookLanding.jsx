import {
  ArrowDown,
  MessageSquareText,
  PenLine,
  RadioTower,
  Rows3,
} from 'lucide-react'

const featureCards = [
  {
    title: '로그인 없이 바로 남기기',
    description:
      '이름, 무드, 아바타 색상, 짧은 메시지만 채우면 한 장의 메모가 완성돼요.',
    Icon: PenLine,
  },
  {
    title: '새 글은 실시간으로 위에 붙기',
    description:
      '다른 브라우저에서 남긴 인사도 새로고침 없이 피드 상단에 자연스럽게 올라와요.',
    Icon: RadioTower,
  },
  {
    title: '작은 대화까지 이어가기',
    description:
      '궁금한 메모를 펼치면 댓글을 남기고, 열린 글에서만 가볍게 대화를 이어가요.',
    Icon: MessageSquareText,
  },
]

const flowSteps = [
  '짧은 이름과 오늘의 무드를 고른다',
  '응원, 후기, 한 줄 인사를 적는다',
  '필요하면 사진이나 간단한 그림을 더한다',
  '실시간 피드에서 함께 붙은 메모를 읽는다',
]

function GuestbookLanding({ onWriteClick, onFeedClick }) {
  return (
    <section className="landing" aria-labelledby="landing-title">
      <div className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">따뜻한 실시간 포스트잇 방명록</p>
          <h1 id="landing-title">
            행사장 벽처럼, 오늘의 인사를 바로 붙여 보세요
          </h1>
          <p className="landing-lede">
            Realtime Guestbook은 로그인 장벽 없이 짧은 메시지와 선택 첨부를
            남기고, 새 메모를 실시간으로 함께 확인하는 작은 커뮤니티 공간이에요.
          </p>
          <div className="landing-actions" aria-label="방명록 바로가기">
            <button className="landing-primary" type="button" onClick={onWriteClick}>
              방명록 남기기
              <ArrowDown size={18} aria-hidden="true" />
            </button>
            <button className="landing-secondary" type="button" onClick={onFeedClick}>
              실시간 피드 보기
              <Rows3 size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="landing-preview" aria-label="방명록 미리보기">
          <article className="landing-note landing-note-yellow">
            <span className="landing-pin" aria-hidden="true" />
            <strong>민지</strong>
            <p>오늘 수업 너무 좋았어요. 다음 시간도 기대할게요!</p>
          </article>
          <article className="landing-note landing-note-mint">
            <span className="landing-pin" aria-hidden="true" />
            <strong>준호</strong>
            <p>사진 한 장과 함께 남기는 짧은 응원도 바로 피드에 붙어요.</p>
          </article>
        </div>
      </div>

      <div className="landing-grid" aria-label="기능 소개">
        {featureCards.map(({ title, description, Icon }) => (
          <article className="landing-feature" key={title}>
            <span className="landing-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>

      <div className="landing-flow" aria-labelledby="landing-flow-title">
        <div>
          <p className="section-kicker">사용 흐름</p>
          <h2 id="landing-flow-title">네 단계면 충분해요</h2>
        </div>
        <ol>
          {flowSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="landing-cta" aria-label="방명록 시작하기">
        <p>첫 화면 아래에서 실제 작성기와 실시간 피드가 바로 이어져요.</p>
        <button className="landing-primary" type="button" onClick={onWriteClick}>
          지금 메모 붙이기
          <ArrowDown size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default GuestbookLanding
