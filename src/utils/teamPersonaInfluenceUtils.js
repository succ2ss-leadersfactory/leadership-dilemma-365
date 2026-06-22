import { clamp } from './clamp';
import { stateLabels } from './statusLabels';

const personaChoiceRules = {
  SPEED: [
    {
      personaId: 'ace_practitioner',
      effects: { executionPressure: -1, aceBurnoutRisk: 1 },
      label: '에이스 실무자의 빠른 처리',
      evidence: '에이스 실무자가 빠른 실행을 밀어주며 실행 압박은 줄었지만, 중요한 일이 다시 특정 사람에게 몰리는 부담이 남았습니다.'
    },
    {
      personaId: 'challenge_driver',
      effects: { executionPressure: -1, collaborationDebt: 1 },
      label: '도전 추진자의 선행 실행',
      evidence: '도전 추진자가 먼저 움직이며 속도는 냈지만, 주변 정렬보다 실행이 앞서 협업 부채가 남았습니다.'
    },
    {
      personaId: 'careful_newcomer',
      effects: { growthShrinkRisk: 1 },
      label: '꼼꼼한 신입의 기준 미확인 부담',
      evidence: '꼼꼼한 신입에게는 빠른 실행이 기준을 확인할 시간을 줄여 성장 위축 신호로 남았습니다.'
    }
  ],
  STRUCTURE: [
    {
      personaId: 'standard_keeper',
      effects: { executiveTrustRisk: -1 },
      label: '기준 수호자의 신뢰 보정',
      evidence: '기준 수호자가 판단 기준과 품질선을 붙잡아 경영진 신뢰 리스크를 낮췄습니다.'
    },
    {
      personaId: 'silent_expert',
      effects: { executiveTrustRisk: -1, collaborationDebt: 1 },
      label: '침묵형 전문가의 품질 보정',
      evidence: '침묵형 전문가가 중요한 허점을 줄여 신뢰 리스크는 낮췄지만, 충분히 공유되지 않은 기준은 협업 부채로 남았습니다.'
    },
    {
      personaId: 'careful_newcomer',
      effects: { growthShrinkRisk: -1 },
      label: '꼼꼼한 신입의 기준 학습',
      evidence: '꼼꼼한 신입은 구조화된 기준을 통해 판단 부담을 줄이고 성장 위축 신호를 낮췄습니다.'
    }
  ],
  BALANCE: [
    {
      personaId: 'relationship_connector',
      effects: { collaborationDebt: -1 },
      label: '관계형 조율자의 협업 완충',
      evidence: '관계형 조율자가 사람들의 수용성과 감정선을 살펴 협업 부채를 낮췄습니다.'
    },
    {
      personaId: 'ace_practitioner',
      effects: { aceBurnoutRisk: -1 },
      label: '에이스 실무자의 부담 분산',
      evidence: '균형 조정 선택이 에이스 실무자에게 몰리던 부담을 나누며 소진 위험을 낮췄습니다.'
    },
    {
      personaId: 'challenge_driver',
      effects: { executionPressure: 1 },
      label: '도전 추진자의 속도 저하 체감',
      evidence: '도전 추진자에게 균형 조정은 필요한 과정이지만, 실행 속도가 늦어진다는 압박으로 체감되었습니다.'
    }
  ],
  ALIGN: [
    {
      personaId: 'standard_keeper',
      effects: { executiveTrustRisk: -1 },
      label: '기준 수호자의 상위 정렬',
      evidence: '기준 수호자가 상위 기대와 책임선을 확인해 경영진 신뢰 리스크를 낮췄습니다.'
    },
    {
      personaId: 'relationship_connector',
      effects: { collaborationDebt: -1 },
      label: '관계형 조율자의 이해관계자 연결',
      evidence: '관계형 조율자가 이해관계자 사이의 온도 차이를 줄이며 협업 부채를 낮췄습니다.'
    },
    {
      personaId: 'silent_expert',
      effects: { executiveTrustRisk: -1 },
      label: '침묵형 전문가의 검증 기준',
      evidence: '침묵형 전문가가 조용히 검증 기준을 보완해 경영진 신뢰 리스크를 낮췄습니다.'
    },
    {
      personaId: 'challenge_driver',
      effects: { executionPressure: 1 },
      label: '도전 추진자의 대기 압박',
      evidence: '도전 추진자에게 상위 정렬은 필요한 과정이지만, 기다리는 시간이 실행 압박으로 남았습니다.'
    }
  ]
};

function countPersonas(profiles = {}) {
  return Object.values(profiles || {}).filter(Boolean).reduce((acc, profile) => {
    const personaId = profile.personaId;
    if (!personaId) return acc;
    acc[personaId] = (acc[personaId] || 0) + 1;
    return acc;
  }, {});
}

function applyBalancedAmount(current, amount) {
  const before = Number(current || 0);
  const change = Number(amount || 0);
  if (change > 0 && before >= 2) return before;
  return clamp(before + change, 0, 3);
}

function applyEffects(values, effects = {}) {
  const next = { ...values };
  Object.entries(effects).forEach(([riskKey, amount]) => {
    next[riskKey] = applyBalancedAmount(next[riskKey], amount);
  });
  return next;
}

function buildEffectText(effects = {}) {
  return Object.entries(effects).map(([riskKey, amount]) => `${stateLabels[riskKey] || riskKey} ${amount > 0 ? '+' : ''}${amount}`).join(', ');
}

export function applyTeamPersonaInfluence({ values = {}, profiles = {}, choice }) {
  const choiceType = choice?.internalType;
  const rules = personaChoiceRules[choiceType] || [];
  const personaCounts = countPersonas(profiles);
  let nextValues = { ...values };
  const personaInfluences = [];

  rules.forEach(rule => {
    const count = personaCounts[rule.personaId] || 0;
    if (!count) return;
    const before = { ...nextValues };
    nextValues = applyEffects(nextValues, rule.effects);
    personaInfluences.push({
      personaId: rule.personaId,
      personaCount: count,
      choiceType,
      label: rule.label,
      evidence: rule.evidence,
      effects: rule.effects,
      effectText: buildEffectText(rule.effects),
      before,
      after: { ...nextValues },
      balanced: Object.entries(rule.effects).some(([riskKey, amount]) => Number(amount) > 0 && Number(before[riskKey] || 0) >= 2)
    });
  });

  return {
    values: nextValues,
    personaInfluences,
    personaInfluenceLines: personaInfluences.map(item => `${item.label}(${item.personaCount}명): ${item.effectText}${item.balanced ? ' · 이미 주의 수준인 리스크는 추가 상승 없이 부담 신호로만 기록' : ''}. ${item.evidence}`)
  };
}
