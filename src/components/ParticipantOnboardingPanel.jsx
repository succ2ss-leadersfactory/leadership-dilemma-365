import '../styles/onboardingUx.css';

export default function ParticipantOnboardingPanel({ mode = 'join', playerName = '', teamName = '' }) {
  const isPlayer = mode === 'player';
  return (
    <section className="card onboardingPanel">
      <div className="onboardingHero">
        <p className="eyebrow">참가 안내</p>
        <h3>{isPlayer ? `${playerName}님, 이 화면은 확장 운영용입니다` : '개인별 입력을 사용하는 경우'}</h3>
        <p>기본 대면 운영은 팀 화면 하나로 진행합니다. 개인별 입력은 온라인 과정이나 개인 성찰을 따로 수집할 때 선택적으로 사용합니다.</p>
        <div className="onboardingFlow">
          <div><b>1. 개인 생각</b><span>상황을 읽고 먼저 내 선택 방향을 생각합니다.</span></div>
          <div><b>2. 필요 시 입력</b><span>확장 운영에서는 선택과 이유를 앱에 남깁니다.</span></div>
          <div><b>3. 팀 토의</b><span>서로 다른 판단과 선택의 대가를 비교합니다.</span></div>
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
        {isPlayer && teamName ? `${teamName}의 기본 진행은 팀 화면에서 이어집니다. ` : ''}진행 중 막히면 현재 화면의 안내 문구를 먼저 확인하고, 필요한 경우 강사의 안내에 따라 이동하시면 됩니다.
      </div>
    </section>
  );
}
