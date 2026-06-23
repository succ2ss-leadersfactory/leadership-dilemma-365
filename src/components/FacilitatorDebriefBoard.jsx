import '../styles/facilitatorDebriefBoard.css';

function riskLevel(final) {
  const value = final?.reviewMaxRiskValue ?? 0;
  if (value >= 3) return 'warning';
  if (value <= 1 && final?.finalLevel) return 'success';
  return '';
}

function badgeText(final) {
  if (!final) return '판정 대기';
  if ((final.reviewMaxRiskValue ?? 0) >= 3) return '리스크 우선';
  if (final.survivalLabel?.includes('생존')) return '사례 공유';
  return '토의 필요';
}

export default function FacilitatorDebriefBoard({ summary, teams = [], room, observations = [], expertiseSummaries = [] }) {
  const finalResults = room?.finalResults || {};
  const focusTeams = teams
    .map(team => {
      const final = finalResults[team.teamId];
      const obs = observations.find(item => item.teamId === team.teamId);
      const expertise = expertiseSummaries.find(item => item.teamId === team.teamId);
      return { team, final, obs, expertise, level: riskLevel(final) };
    })
    .sort((a, b) => (b.final?.reviewMaxRiskValue ?? -1) - (a.final?.reviewMaxRiskValue ?? -1));

  return (
    <section className="card facilitatorDebriefBoard">
      <div className="facilitatorDebriefBoard__header">
        <p className="facilitatorDebriefBoard__eyebrow">FACILITATOR DEBRIEF BOARD</p>
        <h3>마무리 디브리핑 운영 보드</h3>
        <p>최종 판정을 설명하기보다, 팀이 반복한 판단 기준과 남은 부담을 스스로 말하게 하는 순서로 진행하세요.</p>
      </div>

      <div className="debriefCommandGrid">
        <div className="debriefCommandCard">
          <small>1단계</small>
          <h4>전체 흐름부터 열기</h4>
          <p>총 {summary.totalTeams}개 팀 중 주의 이상 리스크 팀은 {summary.warningTeams}개입니다. 먼저 공통 패턴인 “{summary.topPattern}”을 묻고 시작하세요.</p>
        </div>
        <div className="debriefCommandCard">
          <small>2단계</small>
          <h4>팀별 차이 비교하기</h4>
          <p>생존/조건부 생존은 {summary.survivalTeams}개 팀, 미션 달성/부분 달성은 {summary.missionPositiveTeams}개 팀입니다. 두 판정이 갈린 팀부터 질문하세요.</p>
        </div>
        <div className="debriefCommandCard">
          <small>3단계</small>
          <h4>현업 행동으로 닫기</h4>
          <p>개인 성찰 {summary.reflectionCount}건과 팀 선언문을 연결해, 다음 주 회의에서 바꿀 행동 하나를 정하게 하세요.</p>
        </div>
      </div>

      <div className="debriefTeamFocusGrid">
        {focusTeams.map(({ team, final, obs, expertise, level }) => (
          <div className={`debriefTeamFocusCard ${level}`} key={team.teamId}>
            <div className="debriefTeamFocusCard__top">
              <div>
                <h4>{team.teamName}</h4>
                <p>{final?.finalLevel || '최종 판정 미생성'} · {final?.judgmentPattern || '판단 패턴 미생성'}</p>
              </div>
              <span className={`debriefFocusBadge ${level}`}>{badgeText(final)}</span>
            </div>
            <p><b>먼저 볼 지점:</b> {obs?.observation || expertise?.summaryLine || '팀별 결과 생성 후 관찰 지점이 표시됩니다.'}</p>
            <p><b>강사 개입:</b> {obs?.intervention || '팀 선언문과 남은 부담을 연결해 질문하세요.'}</p>
            <div className="debriefQuestionLine"><b>핵심 질문</b><br />{obs?.question || expertise?.facilitatorQuestion || '이 팀이 반복한 판단 기준은 무엇이었습니까?'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
