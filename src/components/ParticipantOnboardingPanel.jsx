import '../styles/onboardingUx.css';

export default function ParticipantOnboardingPanel({ mode = 'join', playerName = '', teamName = '' }) {
  const isPlayer = mode === 'player';
  return (
    <section className="card onboardingPanel">
      <div className="onboardingHero">
        <p className="eyebrow">참가 안내</p>
        <h3>{isPlayer ? `${playerName}님, 이렇게 참여하시면 됩니다` : '처음 입장하는 분께'}</h3>
        <p>이 게임은 점수 경쟁이 아니라, 위기 상황에서 내가 어떤 기준으로 판단하고 팀이 어떤 대가를 감수하는지 확인하는 과정입니다.</p>
        <div className="onboardingFlow">
          <div><b>1. 혼자 판단</b><span>상황을 읽고 먼저 내 선택을 남깁니다.</span></div>
          <div><b>2. 이유 기록</b><span>왜 그렇게 보았는지 짧게 적습니다.</span></div>
          <div><b>3. 팀 토의</b><span>다른 판단과 선택의 대가를 비교합니다.</span></div>
          <div><b>4. 피드백 확인</b><span>결과 카드에서 남은 부담을 봅니다.</span></div>
        </div>
      </div>

      <div className="onboardingRuleGrid">
        <div className="onboardingRuleBox">
          <h4>참여할 때 기억할 것</h4>
          <ul>
            <li>빠른 선택도, 신중한 선택도 모두 학습 자료입니다.</li>
            <li>좋은 팀은 늘 맞히는 팀이 아니라, 선택의 대가를 숨기지 않는 팀입니다.</li>
            <li>개인 성찰은 평가가 아니라 현업에서 바꿀 행동을 찾기 위한 기록입니다.</li>
          </ul>
        </div>
        <div className="onboardingRuleBox">
          <h4>팀 토의에서 할 말</h4>
          <ul>
            <li>내가 본 핵심 문제가 무엇인지 말합니다.</li>
            <li>이 선택으로 얻는 것과 미루는 부담을 함께 말합니다.</li>
            <li>정답을 맞히기보다 우리 팀이 감수할 기준을 정합니다.</li>
          </ul>
        </div>
      </div>

      <div className="onboardingFooter">
        {isPlayer && teamName ? `${teamName}의 판단 흐름은 팀 화면에 함께 모입니다. ` : ''}진행 중 막히면 현재 화면의 안내 문구를 먼저 확인하고, 필요한 경우 강사의 안내에 따라 이동하시면 됩니다.
      </div>
    </section>
  );
}
