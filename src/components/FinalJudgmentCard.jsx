import '../styles/finalJudgmentUx.css';

function resultLabel(value) {
  return value || '미생성';
}

function pickLines(lines = [], limit = 3) {
  return Array.isArray(lines) ? lines.filter(Boolean).slice(0, limit) : [];
}

function buildParticipantFeedback(finalResult) {
  if (!finalResult) return [];
  const riskTrend = finalResult.riskTrendSummary;
  return [
    `${finalResult.judgmentPattern || '우리 팀의 판단 패턴'}이 반복되었습니다. 12주 동안 어떤 기준을 자주 선택했는지 먼저 돌아보세요.`,
    riskTrend?.participantSummary || `가장 크게 남은 부담은 ${finalResult.remainingBurden || '아직 정리되지 않은 부담'}입니다. 다음 현업에서 이 부담을 낮출 행동을 정해야 합니다.`,
    finalResult.nextAction ? `현업 적용 행동: ${finalResult.nextAction}` : '팀 선언문과 개인 성찰을 연결해 다음 회의에서 바꿀 행동 하나를 정하세요.'
  ];
}

function buildFinalReflection(finalResult) {
  const survival = resultLabel(finalResult?.survivalLabel);
  const mission = resultLabel(finalResult?.missionLabel);
  if (/탈락|위험|실패|미달/.test(`${survival} ${mission}`)) {
    return '이번 결과는 실패 판정이라기보다, 조직개편 압박 속에서 우리 팀이 무엇을 늦게 봤는지 돌아보라는 신호입니다.';
  }
  if (/생존|달성|성공|우수/.test(`${survival} ${mission}`)) {
    return '이번 결과는 우리 팀의 판단 기준이 어느 정도 작동했다는 신호입니다. 다만 다음 현업에서도 같은 기준을 지키려면 반복할 행동을 분명히 남겨야 합니다.';
  }
  return '이번 결과는 우리 팀이 12주 동안 반복한 선택 기준을 돌아보는 마무리 피드백입니다.';
}

export default function FinalJudgmentCard({ finalResult, audience = 'participant' }) {
  if (!finalResult) return null;
  const isFacilitator = audience === 'facilitator';
  const feedbackLines = isFacilitator ? pickLines(finalResult.evidenceLines, 20) : buildParticipantFeedback(finalResult);
  const riskTrend = finalResult.riskTrendSummary;
  const gateChecks = finalResult.gateChecks || [];

  return (
    <section className="card result-card finalJudgmentCard">
      <div className="finalJudgmentHeader">
        <p className="finalJudgmentHeader__eyebrow">FINAL REVIEW</p>
        <h3>{resultLabel(finalResult.finalLevel)}</h3>
        <p>12주 동안의 선택, 산출물, 팀 선언문을 함께 놓고 우리 팀의 판단 흐름을 돌아봅니다.</p>
      </div>

      {!isFacilitator && (
        <>
          <div className="finalJudgmentReadingGuide">
            <b>최종 판정 읽는 법</b>
            <span>이 화면은 순위를 매기는 표가 아닙니다. 12주 동안 우리 팀이 어떤 기준을 반복했고, 조직개편 압박 속에서 무엇을 지켰는지 돌아보는 마무리 피드백입니다.</span>
          </div>
          <div className="finalJudgmentHero">
            <div>
              <small>조직개편 생존</small>
              <b>{resultLabel(finalResult.survivalLabel)}</b>
              <span>성과와 리스크를 함께 본 1차 판정입니다.</span>
            </div>
            <div>
              <small>팀 미션</small>
              <b>{resultLabel(finalResult.missionLabel)}</b>
              <span>우리 팀이 맡은 방향성을 얼마나 지켰는지 보는 2차 판정입니다.</span>
            </div>
            <div>
              <small>종합 마무리</small>
              <b>{resultLabel(finalResult.finalLevel)}</b>
              <span>생존, 미션, 선택의 대가를 함께 본 결과입니다.</span>
            </div>
          </div>
          <div className="finalReflectionBox">
            <h4>우리 팀이 마지막으로 확인할 것</h4>
            <p>{buildFinalReflection(finalResult)}</p>
          </div>
        </>
      )}

      {isFacilitator && (
        <div className="summaryCards">
          <div><b>{resultLabel(finalResult.survivalLabel)}</b><span>1차 조직개편 생존 판정</span></div>
          <div><b>{resultLabel(finalResult.missionLabel)}</b><span>2차 미션 달성 판정</span></div>
          <div><b>{resultLabel(finalResult.finalLevel)}</b><span>종합 판정</span></div>
          <div><b>{finalResult.secretMissionScore ?? '미생성'}/3</b><span>비밀 미션 점수</span></div>
          <div><b>{finalResult.weekLogImpactCount ?? 0}</b><span>중간 사건 반영</span></div>
          <div><b>{Number(finalResult.rawRiskLoad || 0).toFixed(1)}</b><span>누적 리스크 총량</span></div>
        </div>
      )}

      {isFacilitator && gateChecks.length > 0 && (
        <div className="finalFeedbackBox">
          <h4>최종 게이트 판정</h4>
          <p><b>{resultLabel(finalResult.gateLabel || finalResult.finalLevel)}</b> · {finalResult.gateReason}</p>
          <ul>
            {gateChecks.map(check => <li key={check.code}>{check.passed ? '통과' : '주의'} · {check.label}: {check.reason}</li>)}
          </ul>
        </div>
      )}

      {isFacilitator && riskTrend && (
        <div className="finalFeedbackBox">
          <h4>누적 리스크 흐름</h4>
          <ul>
            {(riskTrend.facilitatorLines || []).map(line => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}

      {feedbackLines.length > 0 && (
        <div className="finalFeedbackBox">
          <h4>{isFacilitator ? '판정 근거' : '주요 피드백'}</h4>
          <ul>
            {feedbackLines.map(line => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}

      {!isFacilitator && (
        <div className="debriefBox finalQuestionBox">
          <h4>마무리 성찰 질문</h4>
          <ol>
            <li>우리 팀이 12주 동안 가장 자주 반복한 판단 기준은 무엇입니까?</li>
            <li>조직개편 압박 속에서도 지켰던 기준은 무엇입니까?</li>
            <li>현업으로 돌아가면 가장 먼저 바꿀 회의·보고·의사결정 습관은 무엇입니까?</li>
          </ol>
        </div>
      )}
    </section>
  );
}
