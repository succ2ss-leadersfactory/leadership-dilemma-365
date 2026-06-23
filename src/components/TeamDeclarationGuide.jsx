import '../styles/teamDeclarationGuide.css';

const declarationItems = [
  {
    title: '지킬 기준',
    text: '12주 동안 반복해서 중요하다고 느낀 판단 기준을 적습니다.'
  },
  {
    title: '멈출 습관',
    text: '앞으로 줄이거나 조심해야 할 팀의 판단 습관을 한 가지 적습니다.'
  },
  {
    title: '이어갈 행동',
    text: '현업에서 바로 이어갈 작은 행동을 구체적으로 적습니다.'
  },
  {
    title: '첫 확인 시점',
    text: '이 선언을 언제 다시 확인할지 정합니다.'
  }
];

export default function TeamDeclarationGuide() {
  return (
    <div className="team-declaration-guide" aria-label="팀 선언문 작성 가이드">
      <div className="team-declaration-guide__header">
        <span className="team-declaration-guide__eyebrow">선언문 작성 기준</span>
        <p>선언문은 멋진 문구보다, 우리 팀이 다음 회의에서 실제로 지킬 약속에 가깝게 적어 주세요.</p>
      </div>
      <div className="team-declaration-guide__grid">
        {declarationItems.map(item => (
          <div className="team-declaration-guide__item" key={item.title}>
            <b>{item.title}</b>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <p className="team-declaration-guide__example">
        예: “우리는 빠른 결론보다 기준을 먼저 맞추고, 중요한 결정 뒤에는 남은 부담과 확인 시점을 함께 남긴다.”
      </p>
    </div>
  );
}
