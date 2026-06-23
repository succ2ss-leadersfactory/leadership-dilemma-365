import '../styles/finalJudgmentCard.css';

function resultLabel(value) {
  return value || '미생성';
}

function pickLines(lines = [], limit = 3) {
  return Array.isArray(lines) ? lines.filter(Boolean).slice(0, limit) : [];
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
  const feedbackLines = pickLines(finalResult.evidenceLines, isFacilitator ? 20 : 3);

  return (
    <section className="card result-card finalJudgmentCard">
      <p className="eyebrow">최종 판정</p>
      <h3>{resultLabel(finalResult.finalLevel)}</h3>

      {!isFacilitator && (
        <>
          <div className="notice">
            <b>최종 판정 읽는 법:</b> 이 화면은 순위를 매기는 표가 아닙니다. 12주 동안 우리 팀이 어떤 기준을 반복했고, 조직개편 압박 속에서 무엇을 지켰는지 돌아보는 마무리 피드백입니다.
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
          <div><b>{finalResult.skippedPlayableLogCount ?? 0}</b><span>플레이로 처리된 사건</span></div>
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
