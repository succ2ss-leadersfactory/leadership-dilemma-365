import { clamp } from './clamp';

const levelLabels = {
  1: '입문',
  2: '기초',
  3: '실행',
  4: '강점',
  5: '전문'
};

const categoryLabels = {
  knowledge: '지식',
  skill: '기술',
  attitude: '태도'
};

const archetypes = [
  {
    code: 'execution_driver',
    label: '실행 추진형',
    description: '일단 움직이며 결과를 만들어 보려는 힘이 있습니다. 다만 기준 정리와 부담 배분을 의식해야 합니다.',
    offsets: { knowledge: 0, skill: 1, attitude: 0 }
  },
  {
    code: 'standard_builder',
    label: '기준 정리형',
    description: '상황을 구조화하고 판단 기준을 세우는 데 강점이 있습니다. 실행 전환 속도를 함께 관리해야 합니다.',
    offsets: { knowledge: 1, skill: 0, attitude: 0 }
  },
  {
    code: 'relationship_connector',
    label: '관계 조율형',
    description: '사람의 반응과 협업 분위기를 읽는 데 강점이 있습니다. 어려운 결정을 미루지 않는 연습이 필요합니다.',
    offsets: { knowledge: 0, skill: 0, attitude: 1 }
  },
  {
    code: 'growth_candidate',
    label: '성장 후보형',
    description: '아직 숙련도는 고르게 쌓는 중이지만, 작은 성공 경험을 통해 빠르게 성장할 수 있습니다.',
    offsets: { knowledge: 0, skill: 0, attitude: 0 },
    growthMode: true
  }
];

function hashText(text = '') {
  return String(text).split('').reduce((sum, ch) => ((sum * 31) + ch.charCodeAt(0)) % 100000, 7);
}

export function isKsaComplete(selectedKSA = {}) {
  return ['knowledge', 'skill', 'attitude'].every(key => (selectedKSA[key] || []).length === 3);
}

export function flattenKsa(selectedKSA = {}) {
  return ['knowledge', 'skill', 'attitude'].flatMap(category =>
    (selectedKSA[category] || []).map(name => ({ category, categoryLabel: categoryLabels[category], name }))
  );
}

function getBaseLevel(category, archetype) {
  const base = category === 'skill' ? 2 : 3;
  const archetypeOffset = archetype.offsets?.[category] || 0;
  const growthPenalty = archetype.growthMode && category !== 'attitude' ? -1 : 0;
  return base + archetypeOffset + growthPenalty;
}

export function generatePlayerCompetencyProfile({ player, team, selectedKSA }) {
  if (!player || !team || !isKsaComplete(selectedKSA)) return null;
  const seed = hashText(`${player.playerId}-${player.displayName}-${team.teamId}`);
  const archetype = archetypes[seed % archetypes.length];
  const competencies = flattenKsa(selectedKSA).map((item, index) => {
    const itemNoise = (hashText(`${player.displayName}-${item.name}-${index}`) % 3) - 1;
    const level = clamp(getBaseLevel(item.category, archetype) + itemNoise, 1, 5);
    return {
      competencyId: `${item.category}_${item.name}`,
      category: item.category,
      categoryLabel: item.categoryLabel,
      name: item.name,
      level,
      levelLabel: levelLabels[level],
      note: level >= 4 ? '초기 강점' : level <= 2 ? '우선 성장 필요' : '실행 가능'
    };
  });

  const sorted = [...competencies].sort((a, b) => b.level - a.level || a.name.localeCompare(b.name));
  const strengths = sorted.slice(0, 2).map(item => item.name);
  const growthFocus = [...competencies].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)).slice(0, 2).map(item => item.name);
  const averageLevel = Number((competencies.reduce((sum, item) => sum + item.level, 0) / competencies.length).toFixed(1));

  return {
    playerId: player.playerId,
    teamId: team.teamId,
    displayName: player.displayName,
    archetypeCode: archetype.code,
    archetypeLabel: archetype.label,
    archetypeDescription: archetype.description,
    averageLevel,
    strengths,
    growthFocus,
    competencies,
    generatedAt: Date.now(),
    source: 'round0_ksa_auto'
  };
}

export function generateTeamCompetencyProfiles({ players = [], team, selectedKSA }) {
  if (!team || !isKsaComplete(selectedKSA)) return {};
  return Object.fromEntries(
    players
      .filter(player => player.teamId === team.teamId)
      .map(player => [player.playerId, generatePlayerCompetencyProfile({ player, team, selectedKSA })])
      .filter(([, profile]) => Boolean(profile))
  );
}

export function getLevelLabel(level) {
  return levelLabels[level] || '미진단';
}
