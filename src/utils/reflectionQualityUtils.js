function normalizeText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getQuality(score, maxScore) {
  const ratio = maxScore ? score / maxScore : 0;
  if (ratio >= 0.85) return 'veryHigh';
  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.35) return 'medium';
  return 'low';
}

function hasAny(text, pattern) {
  return pattern.test(text);
}

const declarationSignals = [
  {
    key: 'standard',
    label: '지킬 기준',
    pattern: /(기준|원칙|우선|판단|근거|신뢰|공정|고객|팀원|협업|성과|학습)/,
    passedText: '우리 팀이 앞으로 지킬 판단 기준이 보입니다.',
    missingText: '우리 팀이 지킬 판단 기준을 한 문장으로 더 분명히 남겨 주세요.'
  },
  {
    key: 'stopHabit',
    label: '멈출 습관',
    pattern: /(멈추|줄이|하지 않|피하|조심|반복하지|미루지|숨기지|몰아주지|방치하지)/,
    passedText: '앞으로 줄이거나 멈출 판단 습관이 보입니다.',
    missingText: '앞으로 줄이거나 멈출 팀의 판단 습관을 함께 적어 주세요.'
  },
  {
    key: 'nextAction',
    label: '이어갈 행동',
    pattern: /(확인|점검|공유|질문|정리|기록|회의|보고|1on1|나누|정하|남기|묻|듣)/,
    passedText: '현업에서 이어갈 행동이 보입니다.',
    missingText: '다음 회의나 보고에서 바로 할 행동을 더 구체적으로 적어 주세요.'
  },
  {
    key: 'timing',
    label: '첫 확인 시점',
    pattern: /(다음|이번 주|다음 주|매주|월요일|화요일|수요일|목요일|금요일|회의 때|보고 전|시작 전|끝나기 전|까지|후에)/,
    passedText: '선언문을 다시 확인할 시점이 보입니다.',
    missingText: '이 선언을 언제 다시 확인할지 시점을 남겨 주세요.'
  },
  {
    key: 'burden',
    label: '남는 부담',
    pattern: /(부담|리스크|위험|대가|소진|지연|공백|혼선|불안|갈등|신뢰|협업 부채|압박)/,
    passedText: '선택의 대가와 남는 부담을 숨기지 않았습니다.',
    missingText: '우리 팀이 특히 조심해야 할 부담을 선언문에 연결해 주세요.'
  }
];

export function analyzeTeamDeclaration(text = '') {
  const normalized = normalizeText(text);
  if (!normalized) {
    return {
      score: 0,
      maxScore: 5,
      quality: 'low',
      label: '팀 선언문 없음',
      signals: declarationSignals.map(signal => ({ ...signal, passed: false, feedback: signal.missingText })),
      feedbackLines: ['선언문은 멋진 문구보다 다음 회의에서 지킬 행동 약속이어야 합니다.'],
      participantHint: '팀 선언문이 비어 있습니다. 지킬 기준, 멈출 습관, 다음 행동을 한 문장으로 남겨 주세요.'
    };
  }

  const signals = declarationSignals.map(signal => {
    const passed = hasAny(normalized, signal.pattern);
    return {
      key: signal.key,
      label: signal.label,
      passed,
      feedback: passed ? signal.passedText : signal.missingText
    };
  });
  const rawScore = signals.filter(signal => signal.passed).length;
  const hasSubstance = normalized.length >= 35;
  const score = hasSubstance ? rawScore : Math.min(rawScore, 2);
  const quality = getQuality(score, 5);
  return {
    score,
    rawScore,
    maxScore: 5,
    quality,
    label: quality === 'veryHigh' ? '현업 행동 약속이 매우 분명합니다.' : quality === 'high' ? '현업으로 가져갈 기준과 행동이 보입니다.' : quality === 'medium' ? '좋은 방향은 보이나 행동 조건이 더 필요합니다.' : '선언문이 구호에 가까워 실행 조건이 부족합니다.',
    signals,
    feedbackLines: signals.map(signal => `${signal.passed ? '충족' : '보완'} · ${signal.label}: ${signal.feedback}`),
    participantHint: quality === 'veryHigh'
      ? '지킬 기준, 멈출 습관, 다음 행동, 확인 시점이 균형 있게 남았습니다.'
      : quality === 'high'
        ? '선언문의 방향은 좋습니다. 첫 확인 시점이나 조심할 부담을 더 분명히 해 보세요.'
        : quality === 'medium'
          ? '선언문의 의도는 보입니다. 다음 회의에서 실제로 할 행동과 확인 시점을 더 적어 주세요.'
          : '좋은 말보다 행동 조건이 필요합니다. 무엇을 멈추고, 무엇을 언제 확인할지 적어 주세요.'
  };
}

export function analyzePersonalReflection({ habit = '', nextBehavior = '' } = {}) {
  const habitText = normalizeText(habit);
  const behaviorText = normalizeText(nextBehavior);
  const combined = `${habitText} ${behaviorText}`.trim();
  const signals = [
    {
      key: 'habit',
      label: '반복 습관 인식',
      passed: habitText.length >= 12,
      feedback: habitText.length >= 12 ? '반복한 판단 습관이 보입니다.' : '내가 반복한 판단 습관을 조금 더 구체적으로 적어 주세요.'
    },
    {
      key: 'selfAwareness',
      label: '자기 인식',
      passed: /(나는|내가|나의|스스로|자주|반복|습관|경향|불확실하면|먼저)/.test(combined),
      feedback: /(나는|내가|나의|스스로|자주|반복|습관|경향|불확실하면|먼저)/.test(combined) ? '자기 판단 습관을 성찰한 표현이 보입니다.' : '일반론보다 내가 반복한 방식으로 적어 주세요.'
    },
    {
      key: 'nextBehavior',
      label: '다음 행동',
      passed: behaviorText.length >= 12 && /(확인|질문|듣|묻|정리|기록|공유|회의|보고|1on1|먼저|다음)/.test(behaviorText),
      feedback: behaviorText.length >= 12 ? '다음 현업 행동이 보입니다.' : '다음 회의나 1on1에서 바로 할 행동을 적어 주세요.'
    },
    {
      key: 'burden',
      label: '부담 인식',
      passed: /(부담|리스크|대가|위험|소진|지연|공백|신뢰|협업|압박|불안)/.test(combined),
      feedback: /(부담|리스크|대가|위험|소진|지연|공백|신뢰|협업|압박|불안)/.test(combined) ? '판단의 대가나 부담을 함께 보았습니다.' : '이 행동이 어떤 부담을 줄이기 위한 것인지 연결해 보세요.'
    }
  ];
  const score = signals.filter(signal => signal.passed).length;
  const quality = getQuality(score, 4);
  return {
    score,
    maxScore: 4,
    quality,
    label: quality === 'veryHigh' ? '개인 성찰이 현업 행동으로 잘 연결되었습니다.' : quality === 'high' ? '반복 습관과 다음 행동이 보입니다.' : quality === 'medium' ? '성찰 방향은 있으나 행동이 더 구체적이면 좋습니다.' : '성찰이 짧거나 일반적입니다.',
    signals,
    feedbackLines: signals.map(signal => `${signal.passed ? '충족' : '보완'} · ${signal.label}: ${signal.feedback}`),
    participantHint: quality === 'veryHigh'
      ? '반복 습관과 다음 행동이 잘 연결되었습니다.'
      : quality === 'high'
        ? '좋은 성찰입니다. 행동을 언제 할지까지 적으면 더 좋습니다.'
        : quality === 'medium'
          ? '방향은 보입니다. 다음 회의에서 바로 할 행동을 더 구체화해 보세요.'
          : '나의 반복 습관과 다음 행동을 각각 한 문장 이상으로 남겨 주세요.'
  };
}

export function summarizeReflectionReviews(individualReflections = {}) {
  const reviews = Object.values(individualReflections || {}).map(item => item.reflectionQualityReview).filter(Boolean);
  if (!reviews.length) {
    return {
      count: 0,
      averageScore: 0,
      quality: 'low',
      summaryLine: '개인 성찰 기록이 아직 충분하지 않습니다.'
    };
  }
  const averageScore = Number((reviews.reduce((sum, item) => sum + Number(item.score || 0), 0) / reviews.length).toFixed(1));
  const quality = getQuality(averageScore, 4);
  return {
    count: reviews.length,
    averageScore,
    quality,
    summaryLine: `개인 성찰 ${reviews.length}건의 평균 품질은 ${averageScore}/4입니다.`
  };
}
