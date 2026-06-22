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

export default function TwelveWeekTimeline({ rounds = [], weekLogs = [], currentWeek = 0, teamId, compact = false }) {
  const items = buildTimelineItems(rounds, weekLogs);
  const visibleItems = compact ? items.filter(item => item.itemType !== 'empty') : items;
  return (
    <section className="card twelve-week-timeline">
      <p className="eyebrow">12주 흐름</p>
      <h3>위기의 12주 타임라인</h3>
      <p className="muted">PLAY는 직접 선택하는 라운드이고, LOG는 선택 사이에 누적되는 중간 사건입니다.</p>
      <div className="timelineList">
        {visibleItems.map(item => {
          const lens = item.log?.teamLens?.[teamId];
          const isActive = item.week === currentWeek;
          return (
            <div className={`timelineItem ${item.itemType} ${isActive ? 'active' : ''}`} key={item.week}>
              <div className="timelineMeta"><b>Week {item.week}</b><span>{item.badge}</span></div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
                {!compact && item.storyText && <p className="muted">{item.storyText}</p>}
                {lens && <p className="eventLens"><b>우리 팀 관점</b><br />{lens}</p>}
                {item.prompt && <small>{item.prompt}</small>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
