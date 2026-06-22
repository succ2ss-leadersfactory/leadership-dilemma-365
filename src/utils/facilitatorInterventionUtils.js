const personaLabels = {
  ace_practitioner: '에이스 실무자',
  careful_newcomer: '꼼꼼한 신입',
  relationship_connector: '관계형 조율자',
  silent_expert: '침묵형 전문가',
  challenge_driver: '도전 추진자',
  standard_keeper: '기준 수호자'
};

function countPersonas(profiles = {}) {
  return Object.values(profiles || {}).filter(Boolean).reduce((acc, profile) => {
    const personaId = profile.personaId || 'unknown';
    acc[personaId] = (acc[personaId] || 0) + 1;
    return acc;
  }, {});
}

function formatPersonaMix(counts = {}) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  if (!entries.length) return '인물 카드 미등록';
  return entries.map(([personaId, count]) => `${personaLabels[personaId] || personaId} ${count}명`).join(' / ');
}

function getDecision(room, roundId, teamId) {
  return room.teamDecisions?.[`${roundId}_${teamId}`];
}

function getChoice(gameContent, choiceId) {
  return gameContent.choices?.find(choice => choice.choiceId === choiceId);
}

function add(interventions, item) {
  interventions.push({
    priority: item.priority || '관찰',
    title: item.title,
    signal: item.signal,
    intervention: item.intervention,
    question: item.question
  });
}

function buildPersonaInterventions({ counts, choice, currentRoundId }) {
  const interventions = [];
  const choiceType = choice?.internalType;

  if ((counts.ace_practitioner || 0) >= 1 && ['week5', 'week8'].includes(currentRoundId)) {
    add(interventions, {
      priority: '주의',
      title: '에이스 의존 점검',
      signal: '중요한 일이 다시 특정 사람에게 몰릴 가능성이 큽니다.',
      intervention: '성과를 낸 사람을 칭찬하기 전에, 그 사람이 빠져도 굴러가는 구조가 있는지 묻게 합니다.',
      question: '이번 선택에서 “역시 그 사람이 해야 하는 일”로 남은 것은 무엇입니까?'
    });
  }

  if ((counts.ace_practitioner || 0) >= 2 && choiceType === 'SPEED') {
    add(interventions, {
      priority: '개입',
      title: '빠른 실행의 소진 대가',
      signal: '성과 속도는 빨라질 수 있지만, 에이스 소진 위험이 커질 수 있습니다.',
      intervention: '팀장에게 속도를 만든 사람과 부담을 흡수한 사람을 분리해서 말하게 합니다.',
      question: '성과를 빨리 만든 사람은 누구이고, 그 사람이 이번 주 줄여야 할 일은 무엇입니까?'
    });
  }

  if ((counts.careful_newcomer || 0) >= 1 && choiceType === 'SPEED') {
    add(interventions, {
      priority: '관찰',
      title: '기준 확인 없는 속도',
      signal: '꼼꼼한 신입은 기준이 불분명하면 실행 속도보다 불안이 먼저 커질 수 있습니다.',
      intervention: '선택 이유를 묻기 전에 완료 기준과 보고 시점을 한 문장으로 정리하게 합니다.',
      question: '이 선택이 성공했다는 것을 신입도 알 수 있는 기준은 무엇입니까?'
    });
  }

  if ((counts.relationship_connector || 0) >= 1 && ['BALANCE', 'ALIGN'].includes(choiceType)) {
    add(interventions, {
      priority: '강점 활용',
      title: '관계 조율자의 완충 효과',
      signal: '팀이 사람들의 수용성과 협업 온도 차이를 읽을 가능성이 있습니다.',
      intervention: '관계형 조율자가 감지한 불편한 반응을 공식 대화로 꺼내게 합니다.',
      question: '지금 회의에서 말은 안 했지만 표정으로 드러난 불편은 무엇입니까?'
    });
  }

  if ((counts.relationship_connector || 0) >= 1 && currentRoundId === 'week10') {
    add(interventions, {
      priority: '개입',
      title: '루머 불안 완충',
      signal: '관계형 조율자가 있으면 불안을 덮기보다 말할 수 있는 분위기를 만들 수 있습니다.',
      intervention: '사실, 추측, 감정을 따로 적게 한 뒤 감정만 먼저 다루게 합니다.',
      question: '지금 확인된 사실이 아니라 감정으로 먼저 번지는 말은 무엇입니까?'
    });
  }

  if ((counts.silent_expert || 0) >= 1 && ['STRUCTURE', 'ALIGN'].includes(choiceType)) {
    add(interventions, {
      priority: '강점 활용',
      title: '침묵형 전문가의 기준 꺼내기',
      signal: '중요한 품질 기준을 알고 있지만 먼저 말하지 않을 수 있습니다.',
      intervention: '침묵형 전문가에게 “말하지 않은 리스크 1개”를 먼저 쓰게 하고 팀에 공유하게 합니다.',
      question: '아직 말하지 않았지만, 나중에 문제가 될 수 있는 기준은 무엇입니까?'
    });
  }

  if ((counts.challenge_driver || 0) >= 1 && ['SPEED', 'ALIGN'].includes(choiceType)) {
    add(interventions, {
      priority: '관찰',
      title: '도전 추진자의 실행 압박',
      signal: '먼저 움직이는 힘은 크지만, 주변 정렬보다 속도가 앞설 수 있습니다.',
      intervention: '추진 아이디어를 막지 말고, 실행 전 합의해야 할 사람과 조건을 함께 적게 합니다.',
      question: '바로 시작하기 전에 반드시 맞춰야 할 사람, 기준, 일정은 무엇입니까?'
    });
  }

  if ((counts.standard_keeper || 0) >= 1 && ['STRUCTURE', 'ALIGN'].includes(choiceType)) {
    add(interventions, {
      priority: '강점 활용',
      title: '기준 수호자의 신뢰 보정',
      signal: '상위 기대, 책임선, 품질선을 정리해 신뢰 리스크를 낮출 수 있습니다.',
      intervention: '기준을 늘리는 토의가 되지 않도록 “이번 라운드에 지킬 기준 1개”만 정하게 합니다.',
      question: '이번 선택에서 반드시 지킬 기준 하나와 잠시 내려놓을 기준 하나는 무엇입니까?'
    });
  }

  return interventions;
}

export function getFacilitatorInterventions({ room, gameContent, currentRoundId }) {
  const teams = Object.values(room.teams || {});
  return teams.map(team => {
    const profiles = room.competencyProfiles?.[team.teamId] || {};
    const counts = countPersonas(profiles);
    const decision = getDecision(room, currentRoundId, team.teamId);
    const choice = getChoice(gameContent, decision?.finalChoiceId);
    const calculation = room.roundCalculations?.[`${currentRoundId}_${team.teamId}`];
    const interventions = buildPersonaInterventions({ counts, choice, currentRoundId });

    if (calculation?.personaInfluenceLines?.length) {
      calculation.personaInfluenceLines.forEach(line => add(interventions, {
        priority: '결과 확인',
        title: '계산된 인물 카드 영향',
        signal: line,
        intervention: '결과 카드의 인물 영향 문장을 읽고, 이것이 실제 팀 토의에서 보였는지 확인합니다.',
        question: '이 영향은 실제 토의 장면에서 누구의 말이나 침묵으로 드러났습니까?'
      }));
    }

    return {
      teamId: team.teamId,
      teamName: team.teamName,
      personaMix: formatPersonaMix(counts),
      choiceText: choice?.choiceText || '팀 결정 전',
      choiceType: choice?.internalType || '미정',
      interventions
    };
  });
}
