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

export default function TwelveWeekTimeline({ rounds = [], weekLogs = [], currentWeek = 0, teamId, compact = false, audience }) {
  const items = buildTimelineItems(rounds, weekLogs);
  const visibleItems = compact ? getCompactItems(items, currentWeek) : items;
  const resolvedAudience = audience || (compact ? 'participant' : 'facilitator');
  const isFacilitator = resolvedAudience === 'facilitator';
  const meaningfulCount = items.filter(item => item.itemType !== 'empty').length;
  const playCount = items.filter(item => item.itemType === 'play').length;
  const logCount = items.filter(item => item.itemType === 'log').length;

  return (
    <section className={`card twelve-week-timeline ${compact ? 'twelve-week-timeline--compact' : 'twelve-week-timeline--full'}`}>
      <div className="timelineHeader">
        <div>
          <p className="timelineHeader__eyebrow">{compact ? 'CURRENT WINDOW' : '12 WEEK JOURNEY'}</p>
          <h3>{compact ? '이번 판단 구간' : '위기의 12주 타임라인'}</h3>
          <p>{compact ? '현재 위치와 바로 앞뒤 흐름을 중심으로 봅니다.' : '직접 선택하는 라운드와 중간 사건이 어떻게 누적되는지 봅니다.'}</p>
        </div>
        <div className="timelineStats">
          <span className="timelineModeBadge">{compact ? '현재 중심' : '전체 흐름'}</span>
          <small>Week {currentWeek}</small>
        </div>
      </div>
      <div className="timelineGuide">
        <b>흐름 읽는 법</b>
        <span>{compact ? '지금 선택이 앞선 사건과 다음 흐름에 어떻게 이어지는지 확인하세요.' : `PLAY ${playCount}개와 LOG ${logCount}개가 12주 동안 누적됩니다. 각 사건은 선택의 배경과 대가를 보여줍니다.`}</span>
        <em>{meaningfulCount}개 흐름 표시</em>
      </div>
      <div className="timelineList">
        {visibleItems.map(item => {
          const lens = item.log?.teamLens?.[teamId];
          const isActive = item.week === currentWeek;
          return (
            <div className={`timelineItem ${item.itemType} ${isActive ? 'active' : ''}`} aria-current={isActive ? 'step' : undefined} key={item.week}>
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
