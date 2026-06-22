export default function ParticipantOnboardingPanel({ mode = 'join', playerName = '', teamName = '' }) {
  const isPlayer = mode === 'player';
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Participant Guide</p>
      <h3>{isPlayer ? `${playerName}님, 이렇게 참여하시면 됩니다` : '처음 입장하는 분께'}</h3>
      <div className="notice">
        이 게임은 점수 경쟁이 아니라, 위기 상황에서 내가 어떤 기준으로 판단하는지 확인하는 과정입니다.
      </div>
      <div className="grid2">
        <div>
          <h4>3분 사용법</h4>
          <ol>
            <li>상황을 읽고, 먼저 혼자 선택합니다.</li>
            <li>왜 그렇게 선택했는지 짧게 남깁니다.</li>
            <li>팀 토의에서는 정답보다 선택의 대가를 말합니다.</li>
            <li>결과 카드에서 남은 부담과 다음 행동을 확인합니다.</li>
          </ol>
        </div>
        <div>
          <h4>참여할 때 기억할 것</h4>
          <ul>
            <li>빠른 선택도, 신중한 선택도 모두 학습 자료입니다.</li>
            <li>좋은 팀은 늘 맞히는 팀이 아니라, 선택의 대가를 숨기지 않는 팀입니다.</li>
            <li>개인 성찰은 평가가 아니라 현업에서 바꿀 행동을 찾기 위한 기록입니다.</li>
            {isPlayer && <li>{teamName}의 판단 흐름은 팀 화면과 리포트에 함께 남습니다.</li>}
          </ul>
        </div>
      </div>
      <p className="muted">진행 중 막히면 팀 화면으로 이동하거나, 강사의 안내에 따라 현재 단계만 따라오시면 됩니다.</p>
    </section>
  );
}
