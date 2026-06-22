import { clamp } from './clamp';
import { getLevelLabel } from './competencyProfileUtils';
import { applyPersonaGrowthLens } from './playerPersonaUtils';

const choiceGrowthCategory = {
  SPEED: 'skill',
  STRUCTURE: 'knowledge',
  BALANCE: 'attitude',
  ALIGN: 'skill'
};

const riskShrinkCategory = {
  aceBurnoutRisk: 'attitude',
  growthShrinkRisk: 'skill',
  executionPressure: 'skill',
  executiveTrustRisk: 'knowledge',
  collaborationDebt: 'attitude'
};

const categoryLabels = {
  knowledge: '지식',
  skill: '기술',
  attitude: '태도'
};

function getAverageLevel(competencies = []) {
  if (!competencies.length) return 0;
  return Number((competencies.reduce((sum, item) => sum + Number(item.level || 0), 0) / competencies.length).toFixed(1));
}

function refreshProfileSummary(profile) {
  const competencies = profile.competencies || [];
  competencies.forEach(item => {
    item.initialLevel = item.initialLevel || item.level;
    item.levelLabel = getLevelLabel(item.level);
    item.note = item.level >= 4 ? '현재 강점' : item.level <= 2 ? '성장 관리 필요' : '실행 가능';
  });
  const sorted = [...competencies].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  profile.strengths = sorted.slice(0, 2).map(item => item.name);
  profile.growthFocus = [...competencies].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)).slice(0, 2).map(item => item.name);
  profile.averageLevel = getAverageLevel(competencies);
  profile.initialAverageLevel = profile.initialAverageLevel || profile.averageLevel;
  profile.updatedAt = Date.now();
}

function pickCompetency(profile, category, direction) {
  const candidates = (profile.competencies || []).filter(item => item.category === category);
  if (!candidates.length) return null;
  if (direction === 'up') return [...candidates].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))[0];
  return [...candidates].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))[0];
}

function getGrowthPlan({ choice, submission, risk }) {
  const quality = submission?.quality || 'low';
  const choiceType = choice?.internalType || 'BALANCE';
  if (['high', 'veryHigh'].includes(quality)) {
    return {
      direction: 'up',
      delta: 1,
      choiceType,
      category: choiceGrowthCategory[choiceType] || 'skill',
      reason: quality === 'veryHigh'
        ? '매우 높은 산출물 품질이 확인되어 실행 경험이 역량 성장으로 이어졌습니다.'
        : '높은 산출물 품질이 확인되어 선택한 방식과 연결된 역량이 성장했습니다.'
    };
  }
  if (quality === 'low' || Number(risk?.maxRiskValue || 0) >= 3) {
    const riskKey = risk?.maxRiskKey || 'executionPressure';
    return {
      direction: 'down',
      delta: -1,
      choiceType,
      category: riskShrinkCategory[riskKey] || 'skill',
      reason: quality === 'low'
        ? '산출물 품질이 낮아 해당 라운드의 학습 부담이 역량 위축 신호로 남았습니다.'
        : '라운드 후 남은 리스크가 위험 수준으로 올라 역량 위축 신호가 남았습니다.'
    };
  }
  return null;
}

export function applyRoundCompetencyGrowth({ room, teamId, roundId, choice, submission, risk }) {
  const profiles = room.competencyProfiles?.[teamId];
  if (!profiles) return { growthLines: [], growthEvents: [] };
  const basePlan = getGrowthPlan({ choice, submission, risk });
  if (!basePlan) return { growthLines: [], growthEvents: [] };

  const growthLines = [];
  const growthEvents = [];
  Object.values(profiles).forEach(profile => {
    if (!profile || !profile.competencies?.length) return;
    const eventId = `${roundId}_${profile.playerId}_competency_growth`;
    profile.growthEvents = profile.growthEvents || [];
    if (profile.growthEvents.some(event => event.eventId === eventId)) return;

    const plan = applyPersonaGrowthLens(profile, basePlan);
    const target = pickCompetency(profile, plan.category, plan.direction);
    if (!target) return;
    target.initialLevel = target.initialLevel || target.level;
    const before = Number(target.level || 1);
    const after = clamp(before + plan.delta, 1, 5);
    if (before === after) return;
    target.level = after;
    target.levelLabel = getLevelLabel(after);
    const event = {
      eventId,
      roundId,
      playerId: profile.playerId,
      displayName: profile.displayName,
      personaId: profile.personaId,
      personaLabel: profile.personaLabel,
      competencyId: target.competencyId,
      competencyName: target.name,
      category: target.category,
      categoryLabel: categoryLabels[target.category] || target.category,
      direction: plan.direction,
      delta: plan.delta,
      before,
      after,
      reason: plan.reason,
      personaApplied: Boolean(plan.personaApplied),
      createdAt: Date.now()
    };
    profile.growthEvents.push(event);
    refreshProfileSummary(profile);
    growthEvents.push(event);
    growthLines.push(`${profile.displayName}(${profile.personaLabel || '인물 카드'}) · ${target.name} ${before}→${after}: ${plan.reason}`);
  });

  return { growthLines, growthEvents };
}
