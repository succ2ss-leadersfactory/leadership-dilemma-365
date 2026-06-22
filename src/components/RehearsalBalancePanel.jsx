import { buildRehearsalBalanceCheck } from '../utils/rehearsalBalanceUtils';

export default function RehearsalBalancePanel({ room }) {
  const check = buildRehearsalBalanceCheck(room);
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Rehearsal Balance Check</p>
      <h3>리허설 샘플 밸런스 검증</h3>
      <p><b>{check.scenarioLabel}</b> · {check.summary}</p>
      <div className="notice"><b>상태:</b> {check.status}</div>
      <div className="summaryCards">
        <div><b>{check.finalCount}/{check.teamCount}</b><span>최종 판정 생성</span></div>
        <div><b>{check.passedCount}/{check.totalChecks}</b><span>기준 충족</span></div>
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
      <p className="muted">샘플 결과가 의도와 다르면 선택 패턴, 산출물 품질, 선택지 효과, 최종 판정 기준 순서로 조정합니다.</p>
    </section>
  );
}
