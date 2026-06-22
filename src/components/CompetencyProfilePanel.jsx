function levelClass(level) {
  if (level >= 4) return 'success';
  if (level <= 2) return 'warning';
  return 'info';
}

export default function CompetencyProfilePanel({ profiles = {}, title = '팀원 역량 프로필', compact = false }) {
  const profileList = Object.values(profiles || {}).filter(Boolean);
  if (!profileList.length) {
    return (
      <section className="card">
        <h3>{title}</h3>
        <p className="muted">아직 자동 등록된 팀원 역량 프로필이 없습니다. 참가자가 입장한 뒤 Round 0 KSA를 저장하면 자동 생성됩니다.</p>
      </section>
    );
  }

  return (
    <section className="card competency-profile-panel">
      <p className="eyebrow">Auto KSA Profile</p>
      <h3>{title}</h3>
      <p className="muted">Round 0에서 선택한 9개 KSA를 기준으로 팀원별 초기 수준을 자동 배정한 값입니다. 교육용 초기 진단이며, 실제 평가 점수는 아닙니다.</p>
      <div className="grid2">
        {profileList.map(profile => (
          <div className="competencyCard" key={profile.playerId}>
            <h4>{profile.displayName}</h4>
            <p><b>{profile.archetypeLabel}</b> · 평균 {profile.averageLevel}</p>
            <p className="muted">{profile.archetypeDescription}</p>
            <p><b>초기 강점:</b> {profile.strengths?.join(', ') || '-'}</p>
            <p><b>성장 초점:</b> {profile.growthFocus?.join(', ') || '-'}</p>
            {!compact && (
              <table>
                <thead><tr><th>구분</th><th>역량</th><th>수준</th></tr></thead>
                <tbody>
                  {profile.competencies?.map(item => (
                    <tr key={item.competencyId}>
                      <td>{item.categoryLabel}</td>
                      <td>{item.name}</td>
                      <td><span className={`riskBadge ${levelClass(item.level)}`}>{item.level} · {item.levelLabel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
