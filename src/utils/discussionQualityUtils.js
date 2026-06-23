const signalPatterns = [
  {
    key: 'criteria',
    label: '합의 기준',
    participantLabel: '선택 기준',
    passedText: '선택의 기준이나 이유가 보입니다.',
    missingText: '무엇을 기준으로 선택했는지 더 분명히 남기면 좋습니다.',
    pattern: /(기준|우선|판단|근거|이유|중심|중요|목표|원칙|고려)/
  },
  {
    key: 'divergence',
    label: '갈린 의견',
    participantLabel: '다른 관점',
    passedText: '팀 안에서 갈렸던 의견이나 우려가 일부 보입니다.',
    missingText: '다른 의견이나 우려가 있었다면 짧게 남겨 주세요.',
    pattern: /(A안|B안|C안|D안|의견|갈렸|갈림|우려|반대|일부|반면|다른 의견|논의|토의|비교|대안)/
  },
  {
    key: 'tradeoff',
    label: '감수할 부담',
    participantLabel: '남는 부담',
    passedText: '선택 이후 남는 부담이나 리스크를 숨기지 않았습니다.',
    missingText: '이번 선택으로 남는 부담이나 리스크를 함께 적어 주세요.',
    pattern: /(부담|리스크|위험|대가|지연|공백|소진|신뢰|혼선|반발|누락|불안|품질|비용|협업)/
  },
  {
    key: 'followUp',
    label: '후속 행동',
    participantLabel: '다음 행동',
    passedText: '다음 확인 행동이나 점검 방식이 보입니다.',
    missingText: '누가 무엇을 확인할지 다음 행동을 더 남기면 좋습니다.',
    pattern: /(다음|확인|점검|담당|책임|회의|보고|까지|언제|일정|공유|요청|정리|후속|팔로우업|Follow-up)/
  },
  {
    key: 'specificity',
    label: '구체성',
    participantLabel: '대상·시점',
    passedText: '대상, 숫자, 시점, 담당 같은 구체 정보가 보입니다.',
    missingText: '대상, 시점, 담당자, 숫자 중 하나를 더 구체적으로 적어 주세요.',
    pattern: /(\d|명|곳|개|건|회|일|주|월|분기|금요일|월요일|화요일|수요일|목요일|담당자|팀장|고객|부서|상무|이번 주|다음 주)/
  }
];

function normalizeText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function countSentences(text = '') {
  const chunks = text
    .split(/[.!?。]|다\.|요\.|임\.|함\.|함\s|다\s/)
    .map(item => item.trim())
    .filter(Boolean);
  return chunks.length;
}

function getQuality(score) {
  if (score >= 5) return 'veryHigh';
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function getQualityLabel(quality) {
  if (quality === 'veryHigh') return '토의 구조가 매우 잘 남았습니다.';
  if (quality === 'high') return '토의의 핵심 흔적이 남아 있습니다.';
  if (quality === 'medium') return '일부 판단 근거는 있으나 보완이 필요합니다.';
  return '선택 결과만 있고 토의의 흔적이 부족합니다.';
}

export function analyzeDiscussionSummary(summary = '') {
  const text = normalizeText(summary);
  if (!text) {
    return {
      score: 0,
      maxScore: 5,
      quality: 'low',
      label: '토의 요약 없음',
      textLength: 0,
      sentenceCount: 0,
      signals: signalPatterns.map(item => ({
        key: item.key,
        label: item.label,
        participantLabel: item.participantLabel,
        passed: false,
        feedback: item.missingText
      })),
      feedbackLines: ['토의 결과만이 아니라 선택 기준, 남는 부담, 다음 확인 행동을 함께 남겨 주세요.'],
      participantHint: '토의 요약이 비어 있습니다. 결론보다 선택 기준과 남는 부담을 짧게 남겨 주세요.'
    };
  }

  const sentenceCount = countSentences(text);
  const hasSubstance = text.length >= 35 || sentenceCount >= 2;
  const signals = signalPatterns.map(item => {
    const passed = item.pattern.test(text);
    return {
      key: item.key,
      label: item.label,
      participantLabel: item.participantLabel,
      passed,
      feedback: passed ? item.passedText : item.missingText
    };
  });

  const rawScore = signals.filter(signal => signal.passed).length;
  const score = hasSubstance ? rawScore : Math.min(rawScore, 1);
  const quality = getQuality(score);
  const feedbackLines = signals.map(signal => `${signal.passed ? '충족' : '보완'} · ${signal.label}: ${signal.feedback}`);
  const participantHint = quality === 'veryHigh'
    ? '선택 기준, 갈린 의견, 남는 부담, 다음 행동이 균형 있게 남았습니다.'
    : quality === 'high'
      ? '토의의 핵심 흔적은 보입니다. 남는 부담이나 확인 시점을 더 분명히 하면 좋습니다.'
      : quality === 'medium'
        ? '선택 이유는 보이지만, 갈린 의견·남는 부담·다음 행동 중 일부가 더 필요합니다.'
        : '선택 결과만 남아 보입니다. 왜 선택했는지, 무엇을 감수할지, 다음에 무엇을 확인할지 더 적어 주세요.';

  return {
    score,
    rawScore,
    maxScore: 5,
    quality,
    label: getQualityLabel(quality),
    textLength: text.length,
    sentenceCount,
    hasSubstance,
    signals,
    feedbackLines,
    participantHint
  };
}
