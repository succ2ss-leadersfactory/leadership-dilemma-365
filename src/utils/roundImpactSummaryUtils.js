import { stateLabels } from './statusLabels';

function riskLabel(key) {
  return stateLabels[key] || key;
}

function changeText(amount) {
  const value = Number(amount || 0);
  if (value > 0) return `+${value}`;
  return `${value}`;
}

function buildRiskChangeLines(before = {}, after = {}) {
  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
  return keys
    .map(key => {
      const from = Number(before?.[key] || 0);
      const to = Number(after?.[key] || 0);
      const delta = to - from;
      if (!delta) return null;
      return {
        riskKey: key,
        riskLabel: riskLabel(key),
        before: from,
        after: to,
        delta,
        absDelta: Math.abs(delta),
        text: `${riskLabel(key)} ${from}→${to}(${changeText(delta)})`
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.absDelta - a.absDelta || a.riskLabel.localeCompare(b.riskLabel));
}

function scoreRank(item) {
  const base = Number(item.weight || 0);
  const directionBoost = item.direction === 'riskUp' ? 0.25 : item.direction === 'riskDown' ? 0.15 : 0;
  return base + directionBoost;
}

function buildChoiceImpact({ choice, previousState, afterChoice }) {
  const changes = buildRiskChangeLines(previousState, afterChoice);
  if (!changes.length) {
    return {
      type: 'choiceImpact',
      title: '팀 선택',
      direction: 'neutral',
      weight: 0.8,
      summary: '이번 선택은 상태값을 크게 흔들지는 않았지만, 팀의 판단 방향을 결정했습니다.',
      detailLines: []
    };
  }

  const riskUp = changes.filter(item => item.delta > 0);
  const riskDown = changes.filter(item => item.delta < 0);
  const direction = riskUp.length >= riskDown.length ? 'riskUp' : 'riskDown';
  const summary = riskUp.length && riskDown.length
    ? `이번 선택은 ${riskDown.map(item => item.riskLabel).join('·')}을 낮추는 대신 ${riskUp.map(item => item.riskLabel).join('·')}을 남겼습니다.`
    : riskUp.length
      ? `이번 선택은 ${riskUp.map(item => item.riskLabel).join('·')}을 높이는 부담을 남겼습니다.`
      : `이번 선택은 ${riskDown.map(item => item.riskLabel).join('·')}을 낮추는 효과가 있었습니다.`;

  return {
    type: 'choiceImpact',
    title: `팀 선택 · ${choice?.internalType || 'UNKNOWN'}`,
    direction,
    weight: Math.min(3, changes.reduce((sum, item) => sum + item.absDelta, 0)),
    summary,
    detailLines: changes.map(item => item.text)
  };
}

function buildOutputImpact({ submission, afterChoice, afterQuality }) {
  const changes = buildRiskChangeLines(afterChoice, afterQuality);
  const quality = submission?.quality || 'low';
  const score = submission?.qualityScore;
  const breakdown = submission?.qualityBreakdown;
  const qualityText = score != null ? `${quality} · ${score}/100` : quality;

  if (changes.length) {
    const direction = changes.some(item => item.delta < 0) ? 'riskDown' : 'riskUp';
    return {
      type: 'outputImpact',
      title: '산출물 품질',
      direction,
      weight: Math.max(1, changes.reduce((sum, item) => sum + item.absDelta, 0)),
      summary: direction === 'riskDown'
        ? `산출물 품질이 ${qualityText}로 확인되어 실행 부담을 일부 완화했습니다.`
        : `산출물 품질이 ${qualityText}에 머물러 신뢰 부담이 커졌습니다.`,
      detailLines: [
        ...(breakdown?.feedback || []),
        ...changes.map(item => item.text)
      ]
    };
  }

  return {
    type: 'outputImpact',
    title: '산출물 품질',
    direction: ['high', 'veryHigh'].includes(quality) ? 'support' : 'neutral',
    weight: ['high', 'veryHigh'].includes(quality) ? 1 : 0.5,
    summary: `산출물 품질은 ${qualityText}로 기록되었습니다. 이번 라운드의 상태값을 직접 바꾸지는 않았지만, 판단 근거로 남았습니다.`,
    detailLines: breakdown?.feedback || []
  };
}

function buildDiscussionImpact(discussionReview) {
  if (!discussionReview) return null;
  const score = Number(discussionReview.score || 0);
  const quality = discussionReview.quality || 'low';
  const direction = score >= 3 ? 'support' : score <= 1 ? 'riskUp' : 'neutral';
  return {
    type: 'discussionImpact',
    title: '토의 요약 품질',
    direction,
    weight: score >= 3 ? 1.2 : score <= 1 ? 1 : 0.7,
    summary: score >= 3
      ? '토의 요약에 선택 기준과 남는 부담이 보여 산출물의 신뢰도를 뒷받침했습니다.'
      : score >= 2
        ? '토의 요약에 일부 판단 근거는 있으나, 갈린 의견이나 후속 행동 보완이 필요합니다.'
        : '토의 요약이 결론 중심에 머물러 선택의 대가를 설명하는 근거가 약했습니다.',
    detailLines: [`품질 ${quality} · ${score}/${discussionReview.maxScore || 5}`, ...(discussionReview.feedbackLines || [])]
  };
}

function buildPersonaImpact(personaInfluence) {
  const items = personaInfluence?.personaInfluences || [];
  if (!items.length) return null;
  const detailLines = items.map(item => `${item.label}(${item.personaCount}명): ${item.effectText}`);
  const risky = items.some(item => Object.values(item.effects || {}).some(amount => Number(amount) > 0));
  return {
    type: 'personaImpact',
    title: '인물 카드 영향',
    direction: risky ? 'riskUp' : 'riskDown',
    weight: Math.min(2.5, items.length),
    summary: risky
      ? '팀 구성의 특성이 이번 선택의 후폭풍을 일부 키웠습니다.'
      : '팀 구성의 특성이 이번 선택의 부담을 일부 완충했습니다.',
    detailLines
  };
}

function buildFinalStateImpact({ previousState, finalState }) {
  const changes = buildRiskChangeLines(previousState, finalState);
  if (!changes.length) return null;
  const highest = changes[0];
  return {
    type: 'netStateImpact',
    title: '최종 상태 변화',
    direction: highest.delta > 0 ? 'riskUp' : 'riskDown',
    weight: Math.min(3, changes.reduce((sum, item) => sum + item.absDelta, 0)),
    summary: `이번 라운드가 끝난 뒤 가장 크게 움직인 부담은 ${highest.riskLabel}입니다.`,
    detailLines: changes.map(item => item.text)
  };
}

export function buildRoundImpactSummary({ choice, previousState, afterChoice, afterQuality, finalState, submission, discussionReview, personaInfluence }) {
  const factors = [
    buildChoiceImpact({ choice, previousState, afterChoice }),
    buildOutputImpact({ submission, afterChoice, afterQuality }),
    buildDiscussionImpact(discussionReview),
    buildPersonaImpact(personaInfluence),
    buildFinalStateImpact({ previousState, finalState })
  ].filter(Boolean);

  const topFactors = [...factors]
    .sort((a, b) => scoreRank(b) - scoreRank(a))
    .slice(0, 3)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return {
    modelVersion: 'impact-v1.0',
    topFactors,
    factors,
    facilitatorSummaryLines: topFactors.map(item => `${item.rank}. ${item.title}: ${item.summary}`),
    participantSummary: topFactors[0]?.summary || '이번 라운드의 주요 영향은 크지 않았습니다. 다음 선택에서 기준과 실행 조건을 더 분명히 남겨 보세요.'
  };
}
