import '../styles/timelineUx.css';

function buildTimelineItems(rounds = [], weekLogs = []) {
  const playableByWeek = Object.fromEntries(rounds.map(round => [round.week, round]));
  const logByWeek = Object.fromEntries(weekLogs.map(log => [log.week, log]));
  return Array.from({ length: 13 }, (_, week) => {
    const round = playableByWeek[week];
    const log = logByWeek[week];
    if (round) {
      return {
        week,
        itemType: 'play',
        title: round.title,
        badge: week === 0 ? 'SETUP' : round.isFinal ? 'FINAL' : 'PLAY',
        text: round.teamSignalText || round.coreQuestion,
        prompt: round.coreQuestion,
        roundId: round.roundId
      };
    }
    if (log) {
      return {
        week,
        itemType: 'log',
        title: log.title,
        badge: 'LOG',
        text: log.signalText || log.storyText,
        storyText: log.storyText,
        prompt: log.facilitatorPrompt,
        log
      };
    }
    return { week, itemType: 'empty', title: '미등록', badge: 'EMPTY', text: '아직 등록된 사건이 없습니다.' };
  });
}

function getCompactItems(items, currentWeek) {
  const meaningful = items.filter(item => item.itemType !== 'empty');
  const activeIndex = meaningful.findIndex(item => item.week === currentWeek);
  if (activeIndex < 0) return meaningful.slice(0, 3);
  const start = Math.max(0, activeIndex - 1);
  const end = Math.min(meaningful.length, activeIndex + 2);
  const slice = meaningful.slice(start, end);
  if (slice.length < 3 && start > 0) return meaningful.slice(Math.max(0, end - 3), end);
  if (slice.length < 3) return meaningful.slice(start, Math.min(meaningful.length, start + 3));
  return slice;
}

export default function TwelveWeekTimeline({ rounds = [], weekLogs = [], currentWeek = 0, teamId, compact = false, audience = 'participant' }) {
  const items = buildTimelineItems(rounds, weekLogs);
  const visibleItems = compact ? getCompactItems(items, currentWeek) : items;
  const isFacilitator = audience === 'facilitator';
  return (
    <section className="card twelve-week-timeline">
      <div className="timelineHeader">
        <div>
          <p className="eyebrow">{compact ? '현재 구간' : '12주 흐름'}</p>
          <h3>{compact ? '이번 판단 구간' : '위기의 12주 타임라인'}</h3>
        </div>
        <span className="timelineModeBadge">{compact ? '현재 중심' : '전체 흐름'}</span>
      </div>
      <div className="timelineGuide">{compact ? '현재 라운드와 바로 앞뒤의 흐름만 보여줍니다. 지금 선택이 앞선 사건과 다음 흐름에 어떻게 이어지는지 확인하세요.' : 'PLAY는 직접 선택하는 라운드이고, LOG는 선택 사이에 누적되는 중간 사건입니다.'}</div>
      <div className="timelineList">
        {visibleItems.map(item => {
          const lens = item.log?.teamLens?.[teamId];
          const isActive = item.week === currentWeek;
          return (
            <div className={`timelineItem ${item.itemType} ${isActive ? 'active' : ''}`} key={item.week}>
              <div className="timelineMeta"><b>Week {item.week}</b><span>{item.badge}</span></div>
              <div>
                {isActive && <span className="timelineCurrentNote">현재 위치</span>}
                <h4>{item.title}</h4>
                <p>{item.text}</p>
                {!compact && item.storyText && <p className="muted">{item.storyText}</p>}
                {lens && <p className="eventLens"><b>우리 팀 관점</b><br />{lens}</p>}
                {isFacilitator && item.prompt && <small className="timelineSmallPrompt">{item.prompt}</small>}
              </div>
            </div>
          );
        })}
      </div>
      {!isFacilitator && <p className="timelineParticipantHint">타임라인은 정답을 알려주는 표가 아니라, 선택이 누적되는 흐름을 보는 장치입니다.</p>}
    </section>
  );
}
