export default function TeamExpertiseLensPanel({ teams = {}, lenses = {} }) {
  const teamItems = Object.values(teams || {});

  if (!teamItems.length) {
    return null;
  }

  return (
    <section className="card debriefBox">
      <p className="eyebrow">전문지식 렌즈</p>
      <h3>팀별 전문성 관찰 포인트</h3>
      <p className="muted">참가자에게 이론 용어를 직접 설명하기보다, 팀의 선택과 산출물을 해석할 때 강사가 참고하는 렌즈입니다.</p>
      <div className="grid2">
        {teamItems.map(team => {
          const lens = lenses?.[team.teamId];
          if (!lens) return null;
          return (
            <div className="card" key={team.teamId}>
              <h4>{team.teamName} · {lens.title}</h4>
              <p><b>기능 전문성:</b> {lens.businessLens}</p>
              <p><b>리더십 관찰:</b> {lens.leadershipLens}</p>
              <p><b>관련 역량:</b> {lens.theoryKeywords.join(' / ')}</p>
              <div className="notice"><b>좋은 산출물 기준:</b> {lens.evidenceStandards.join(' · ')}</div>
              <p><b>흔한 오판:</b> {lens.commonBlindSpots.join(' · ')}</p>
              <ol>
                {lens.facilitatorQuestions.map(question => <li key={question}>{question}</li>)}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
