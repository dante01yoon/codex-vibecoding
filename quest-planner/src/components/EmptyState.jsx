export default function EmptyState() {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="section-kicker">추천 결과</div>
      <h2>정확히 맞는 코스 없음</h2>
      <p>
        현재 조건을 모두 만족하는 코스가 없어요. 사용 가능 시간을 한 단계 늘리거나 예산을
        넓히면 더 많은 코스를 볼 수 있습니다.
      </p>
    </section>
  );
}
