export default function ReportExpertiseSummaryPanel({ summaries = [] }) {
  if (!summaries.length) return null;

  return (
    <section className="card debriefBox">
      <p className="eyebrow">전문성 리포트</p>
      <h3>팀별 산출물 증거 수준과 전문성 관찰</h3>
      <p className="muted">각 팀이 자기 기능 전문성에 맞는 증거를 얼마나 남겼고, 어떤 진전과 대가를 반복했는지 보는 강사용 요약입니다.</p>
      <div className="grid2">
        {summaries.map(summary => (
          <div className="card" key={summary.teamId}>
            <h4>{summary.teamName} · {summary.evidenceLevel}</h4>
            <div className="summaryCards">
              <div><b>{summary.averageScore || '-'}/4</b><span>평균 증거 수준</span></div>
              <div><b>{summary.evidenceCount}</b><span>계산된 산출물</span></div>
              <div><b>{summary.narrativeCount || 0}</b><span>결과 해석 기록</span></div>
            </div>
            <p><b>전문성 렌즈:</b> {summary.lensTitle}</p>
            <p>{summary.summaryLine}</p>
            {summary.narrativeSummary && <p><b>누적 결과 해석:</b> {summary.narrativeSummary}</p>}
            {summary.warningSignals?.length > 0 && (
              <div className="notice">
                <b>강사용 경고 신호</b>
                <ul>{summary.warningSignals.map(line => <li key={line}>{line}</li>)}</ul>
              </div>
            )}
            <p><b>관련 역량:</b> {summary.expertiseKeywords.join(' / ') || '-'}</p>
            <p><b>강한 주차:</b> {summary.strongestWeeks}</p>
            <p><b>취약 주차:</b> {summary.weakestWeeks}</p>
            {summary.repeatedGains?.length > 0 && (
              <>
                <h4>반복된 진전</h4>
                <ul>{summary.repeatedGains.map(line => <li key={line}>{line}</li>)}</ul>
              </>
            )}
            {summary.repeatedRisks?.length > 0 && (
              <>
                <h4>반복된 대가</h4>
                <ul>{summary.repeatedRisks.map(line => <li key={line}>{line}</li>)}</ul>
              </>
            )}
            {summary.needsMoreEvidence.length > 0 && (
              <>
                <h4>보완 신호</h4>
                <ul>{summary.needsMoreEvidence.map(line => <li key={line}>{line}</li>)}</ul>
              </>
            )}
            <div className="notice"><b>강사용 질문:</b> {summary.narrativeQuestions?.[0] || summary.facilitatorQuestion}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
