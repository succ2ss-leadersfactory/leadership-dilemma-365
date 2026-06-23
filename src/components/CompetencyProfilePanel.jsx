import '../styles/competencyProfileUx.css';

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

function listText(items) {
  return items?.length ? items.join(', ') : '-';
}

export default function CompetencyProfilePanel({ profiles = {}, title = '팀원 역량 프로필', compact = false, audience = 'participant' }) {
  const profileList = Object.values(profiles || {}).filter(Boolean);
  const isFacilitator = audience === 'facilitator';
  if (!profileList.length) {
    return (
      <section className="card competency-profile-panel">
        <h3>{title}</h3>
        <p className="muted">아직 자동 등록된 팀원 역량 프로필이 없습니다. 참가자가 입장한 뒤 Round 0 KSA를 저장하면 자동 생성됩니다.</p>
      </section>
    );
  }

  return (
    <section className="card competency-profile-panel">
      <div className="competencyProfileIntro">
        <p className="eyebrow">KSA Profile</p>
        <h3>{title}</h3>
        <p>{isFacilitator ? 'Round 0에서 선택한 9개 KSA를 기준으로 팀원별 초기 수준을 자동 배정한 교육용 진단 정보입니다.' : '이 프로필은 실제 평가가 아니라, 이번 12주 동안 내가 관찰할 강점과 주의 신호를 보여주는 학습용 자료입니다.'}</p>
      </div>
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
              <div className="competencyTagLine">
                <span>{profile.archetypeLabel || '관찰 유형'}</span>
                {isFacilitator && <span>평균 {profile.averageLevel} · 초기 대비 {avgDelta >= 0 ? `+${avgDelta.toFixed(1)}` : avgDelta.toFixed(1)}</span>}
              </div>
              <p className="muted">{profile.archetypeDescription}</p>
              <div className="competencyFocusGrid">
                <div><b>강점 신호</b><p>{profile.personaStrengthText || listText(profile.strengths)}</p></div>
                <div><b>주의 신호</b><p>{profile.personaRiskText || '-'}</p></div>
                <div><b>성장 초점</b><p>{listText(profile.growthFocus)}</p></div>
              </div>
              <p><b>판단 습관:</b> {profile.personaDecisionHabit || '-'}</p>
              {!isFacilitator && <div className="competencyParticipantNote">이 프로필은 나를 평가하기 위한 점수가 아니라, 라운드마다 어떤 강점이 드러나고 어떤 부담이 반복되는지 보는 기준입니다.</div>}
              {recentEvents.length > 0 && isFacilitator && (
                <div className="notice">
                  <b>최근 성장 기록</b>
                  <ul>
                    {recentEvents.map(event => <li key={event.eventId}>{event.roundId} · {eventDirectionText(event.direction)} · {event.competencyName} {event.before}→{event.after}</li>)}
                  </ul>
                </div>
              )}
              {isFacilitator && !compact && (
                <table className="competencyFacilitatorTable">
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
