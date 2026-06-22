function levelClass(level) {
  if (level >= 4) return 'success';
  if (level <= 2) return 'warning';
  return 'info';
}

function levelDelta(item) {
  const initial = Number(item.initialLevel || item.level || 0);
  const current = Number(item.level || 0);
  const delta = current - initial;
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function eventDirectionText(direction) {
  if (direction === 'up') return '성장';
  if (direction === 'down') return '위축 신호';
  return '변화';
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
        {profileList.map(profile => {
          const recentEvents = [...(profile.growthEvents || [])].slice(-3).reverse();
          const avgDelta = Number(profile.averageLevel || 0) - Number(profile.initialAverageLevel || profile.averageLevel || 0);
          return (
            <div className="competencyCard" key={profile.playerId}>
              <p className="eyebrow">{profile.personaLabel || '인물 카드'}</p>
              <h4>{profile.displayName}</h4>
              {profile.personaCardTitle && <p><b>{profile.personaCardTitle}</b></p>}
              {profile.personaSceneText && <p className="muted">{profile.personaSceneText}</p>}
              <p><b>{profile.archetypeLabel}</b> · 평균 {profile.averageLevel} <span className="muted">초기 대비 {avgDelta >= 0 ? `+${avgDelta.toFixed(1)}` : avgDelta.toFixed(1)}</span></p>
              <p className="muted">{profile.archetypeDescription}</p>
              <p><b>인물 강점:</b> {profile.personaStrengthText || '-'}</p>
              <p><b>주의 신호:</b> {profile.personaRiskText || '-'}</p>
              <p><b>판단 습관:</b> {profile.personaDecisionHabit || '-'}</p>
              <p><b>현재 강점:</b> {profile.strengths?.join(', ') || '-'}</p>
              <p><b>성장 초점:</b> {profile.growthFocus?.join(', ') || '-'}</p>
              {recentEvents.length > 0 && (
                <div className="notice">
                  <b>최근 성장 기록</b>
                  <ul>
                    {recentEvents.map(event => <li key={event.eventId}>{event.roundId} · {eventDirectionText(event.direction)} · {event.competencyName} {event.before}→{event.after}</li>)}
                  </ul>
                </div>
              )}
              {!compact && (
                <table>
                  <thead><tr><th>구분</th><th>역량</th><th>초기</th><th>현재</th><th>변화</th></tr></thead>
                  <tbody>
                    {profile.competencies?.map(item => (
                      <tr key={item.competencyId}>
                        <td>{item.categoryLabel}</td>
                        <td>{item.name}</td>
                        <td>{item.initialLevel || item.level}</td>
                        <td><span className={`riskBadge ${levelClass(item.level)}`}>{item.level} · {item.levelLabel}</span></td>
                        <td>{levelDelta(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
