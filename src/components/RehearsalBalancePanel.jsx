import { buildRehearsalBalanceCheck } from '../utils/rehearsalBalanceUtils';

export default function RehearsalBalancePanel({ room }) {
  const check = buildRehearsalBalanceCheck(room);
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Rehearsal Balance Check</p>
      <h3>리허설 샘플 밸런스 검증</h3>
      <p><b>{check.scenarioLabel}</b> · {check.summary}</p>
      <p className="muted">{check.scenarioIntent}</p>
      <div className="notice"><b>상태:</b> {check.status} · <b>기대 범위:</b> {check.expectedRange}</div>
      <div className="summaryCards">
        <div><b>{check.finalCount}/{check.teamCount}</b><span>최종 판정 생성</span></div>
        <div><b>{check.passedCount}/{check.totalChecks}</b><span>기준 충족</span></div>
        <div><b>{check.finalDistributionText}</b><span>최종 게이트 분포</span></div>
        <div><b>{check.survivalDistributionText}</b><span>생존 판정 분포</span></div>
        <div><b>{check.missionDistributionText}</b><span>미션 판정 분포</span></div>
        <div><b>{Number(check.minRawRiskLoad || 0).toFixed(1)}~{Number(check.maxRawRiskLoad || 0).toFixed(1)}</b><span>누적 리스크 총량 범위</span></div>
      </div>
      <table>
        <thead><tr><th>기준</th><th>상태</th><th>확인 내용</th><th>조정 제안</th></tr></thead>
        <tbody>
          {check.checks.map(item => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.status}</td>
              <td>{item.detail}</td>
              <td>{item.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {check.outcomeRows.length > 0 && (
        <>
          <h4>팀별 실제 결과</h4>
          <table>
            <thead><tr><th>팀</th><th>최종 게이트</th><th>생존</th><th>미션</th><th>미션 점수</th><th>남은 부담</th><th>누적 TOP 부담</th><th>누적 총량</th><th>주의 게이트</th></tr></thead>
            <tbody>
              {check.outcomeRows.map(row => (
                <tr key={row.teamId}>
                  <td>{row.teamName}</td>
                  <td>{row.finalLevel}</td>
                  <td>{row.survivalLabel}</td>
                  <td>{row.missionLabel}</td>
                  <td>{row.missionScore}/3</td>
                  <td>{row.remainingBurden}</td>
                  <td>{row.maxRawRiskLabel} {Number(row.maxRawRiskValue || 0).toFixed(1)}</td>
                  <td>{Number(row.rawRiskLoad || 0).toFixed(1)}</td>
                  <td>{row.gateIssueCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p className="muted">샘플 결과가 의도와 다르면 선택 패턴, 산출물 품질, 선택지 효과, 최종 판정 기준 순서로 조정합니다. 목표는 모든 팀을 같은 결과로 만드는 것이 아니라, 교육 디브리핑이 가능한 차이를 만드는 것입니다.</p>
    </section>
  );
}
