import '../styles/teamDiscussionGuide.css';

const guideItems = [
  {
    title: '합의한 기준',
    text: '우리 팀이 이번 선택에서 가장 중요하게 본 기준을 한 문장으로 남깁니다.'
  },
  {
    title: '갈린 의견',
    text: '처음에 의견이 달랐던 지점과 그 이유를 짧게 남깁니다.'
  },
  {
    title: '감수할 부담',
    text: '이 선택으로 뒤로 미루는 일이나 나중에 확인해야 할 부담을 숨기지 않습니다.'
  },
  {
    title: '다음 확인',
    text: '결정 후 바로 확인할 신호, 사람, 일정 중 하나를 적습니다.'
  }
];

export default function TeamDiscussionGuide() {
  return (
    <div className="team-discussion-guide" aria-label="팀 토론 요약 작성 가이드">
      <div className="team-discussion-guide__header">
        <span className="team-discussion-guide__eyebrow">토론 요약 작성 기준</span>
        <p>결론만 쓰기보다, 팀이 어떤 기준으로 선택했고 무엇을 남겨 두었는지 보이게 적어 주세요.</p>
      </div>
      <div className="team-discussion-guide__grid">
        {guideItems.map(item => (
          <div className="team-discussion-guide__item" key={item.title}>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <p className="team-discussion-guide__example">
        예: “고객 신뢰 회복을 우선 기준으로 삼고 B안을 선택했다. 단, 내부 일정 지연 부담이 남아 다음 회의에서 담당자와 확인 시점을 정한다.”
      </p>
    </div>
  );
}
