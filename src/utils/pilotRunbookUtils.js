const phaseLabels = {
  intro: '상황 안내',
  ksaSelection: 'KSA 선택',
  playerVote: '개인 선택',
  teamDiscussion: '팀 토의',
  teamDecision: '팀 결정',
  submission: '산출물 입력',
  calculationReview: '계산 확인',
  resultReveal: '결과 공개',
  finalCalculation: '최종 계산',
  finalReview: '최종 검토',
  finalResult: '최종 판정',
  reflection: '개인 성찰',
  declaration: '팀 선언문'
};

const roundLabels = {
  round0: 'Round 0 · 우리 팀 전력맵',
  week1: 'Week 1 · 위기 선언',
  week5: 'Week 5 · 핵심 인재 부담',
  week8: 'Week 8 · AI 자동화 TF',
  week10: 'Week 10 · 루머 확산',
  week11: 'Week 11 · 마지막 승부수',
  week12: 'Week 12 · 최종 판정'
};

function getBaseScript(roundId) {
  if (roundId === 'round0') return '지금은 정답을 고르는 시간이 아니라, 우리 팀이 12주 위기를 버틸 때 무엇을 강점으로 삼을지 정하는 시간입니다.';
  if (roundId === 'week12') return '최종 판정은 승패가 아니라, 12주 동안 반복한 판단 습관과 남은 부담을 확인하는 거울입니다.';
  if (roundId === 'week8') return '이번 라운드는 사람을 누구로 보낼지보다, 그 사람이 빠진 뒤 팀이 어떻게 버틸지를 함께 보는 시간입니다.';
  if (roundId === 'week10') return '루머 상황에서는 많이 말하는 것보다, 사실·추측·감정을 구분해 말하는 것이 더 중요합니다.';
  if (roundId === 'week5') return '핵심 인재를 보호하는 일은 배려가 아니라 성과를 지속시키는 운영 판단입니다.';
  return '이번 라운드에서는 선택의 장점만 보지 말고, 그 선택이 남기는 작은 대가까지 함께 보겠습니다.';
}

function getPhaseGuide(roundId, phase, resultVisible) {
  if (roundId === 'round0') {
    return {
      operatorAction: '팀 화면에서 KSA 9개를 저장하게 한 뒤, Week 1 개인 선택 단계로 이동합니다.',
      buttonOrder: ['팀 화면 열기', 'KSA 저장 확인', '다음 라운드'],
      screenToShow: '팀 화면 또는 역량 프로필 화면',
      caution: 'KSA 저장 전에는 팀원 역량 프로필과 인물 카드가 생성되지 않습니다.',
      timeBox: '5~8분'
    };
  }

  if (roundId === 'week12') {
    if (phase === 'reflection') {
      return { operatorAction: '참가자가 개인 성찰을 먼저 저장하게 합니다.', buttonOrder: ['개인 화면 안내', '개인 성찰 저장', '팀 선언문 단계 이동'], screenToShow: '개인 화면', caution: '성찰을 평가처럼 말하지 말고 다음 현업 행동을 찾는 기록으로 안내합니다.', timeBox: '5~7분' };
    }
    if (phase === 'declaration') {
      return { operatorAction: '팀 선언문을 저장하고 교육 리포트로 이동합니다.', buttonOrder: ['팀 선언문 저장', '교육 리포트 보기'], screenToShow: '팀 화면 → 교육 리포트', caution: '선언문은 멋진 문장보다 다음 주 행동이 보여야 합니다.', timeBox: '5~7분' };
    }
    return { operatorAction: '개인 성찰과 팀 선언문을 저장한 뒤 최종 판정을 생성하고 리포트로 이동합니다.', buttonOrder: ['최종 판정 생성', '개인 성찰 안내', '팀 선언문 저장', '교육 리포트 보기'], screenToShow: 'Host 화면 → 개인 화면 → 팀 화면 → 리포트', caution: '최종 판정만 보여주고 끝내면 점수 게임처럼 보일 수 있습니다. 반드시 판단 습관과 다음 행동을 묻습니다.', timeBox: '12~18분' };
  }

  if (resultVisible || phase === 'resultReveal') {
    return {
      operatorAction: '결과 카드에서 작은 진전, 남은 부담, 인물 카드 영향을 읽고 다음 라운드로 이동합니다.',
      buttonOrder: ['결과 카드 확인', '강사 질문 1개 선택', '다음 라운드'],
      screenToShow: '팀 화면 결과 카드 또는 강사 가이드',
      caution: '결과가 낮은 팀을 실패팀으로 부르지 않습니다. “현업에서 먼저 고쳐야 할 부담이 드러났다”고 말합니다.',
      timeBox: '5~7분'
    };
  }

  if (phase === 'playerVote') {
    return {
      operatorAction: '참가자가 개인 선택과 선택 이유를 먼저 저장하게 합니다.',
      buttonOrder: ['화면 잠금 해제', '참가자 개인 선택 저장 안내', '팀 토의 단계 이동'],
      screenToShow: '개인 화면',
      caution: '처음부터 팀 합의를 시키면 개인 판단 흔적이 사라집니다. 먼저 혼자 고르게 하십시오.',
      timeBox: '3~5분'
    };
  }

  if (phase === 'teamDiscussion') {
    return {
      operatorAction: '개인 선택 분포를 보고 팀 토의를 진행하게 합니다.',
      buttonOrder: ['팀 화면 열기', '개인 선택 분포 확인', '팀 결정 단계 이동'],
      screenToShow: '팀 화면',
      caution: '토의가 다수결로 끝나지 않도록 선택하지 않은 대가를 반드시 말하게 하십시오.',
      timeBox: '5~8분'
    };
  }

  if (phase === 'teamDecision') {
    return {
      operatorAction: '팀 최종 선택과 토론 요약을 저장하게 합니다.',
      buttonOrder: ['팀 최종 선택 저장', '토론 요약 확인', '산출물 입력 단계 이동'],
      screenToShow: '팀 화면',
      caution: '최종 선택만 저장하지 말고, 선택 이유와 남는 부담을 한 문장으로 남기게 하십시오.',
      timeBox: '4~6분'
    };
  }

  if (phase === 'submission') {
    return {
      operatorAction: '산출물 입력을 마치게 합니다.',
      buttonOrder: ['산출물 작성', '산출물 저장', '계산 확인 단계 이동'],
      screenToShow: '팀 화면 산출물 입력 영역',
      caution: '산출물은 길게 쓰는 것보다 책임자, 기준, 확인 시점이 보여야 합니다.',
      timeBox: '5~8분'
    };
  }

  if (phase === 'calculationReview') {
    return {
      operatorAction: '계산 후 결과 공개를 실행합니다.',
      buttonOrder: ['계산 후 결과 공개', '결과 카드 확인'],
      screenToShow: 'Host 화면 → 팀 화면 결과 카드',
      caution: '결과 공개 전 팀 결정과 산출물이 저장되었는지 한 번 더 확인합니다.',
      timeBox: '2~3분'
    };
  }

  return {
    operatorAction: '라운드 상황과 전략 이벤트를 읽고 개인 선택 단계로 이동합니다.',
    buttonOrder: ['전략 이벤트 확인', '다음 단계', '개인 선택 안내'],
    screenToShow: 'Host 화면 또는 강사 가이드',
    caution: '상황 설명을 길게 하지 말고, 팀이 느낄 압박과 숨은 대가만 짚어줍니다.',
    timeBox: '3~5분'
  };
}

function getDebriefQuestions(roundId) {
  if (roundId === 'week5') return ['누구의 부담을 당연하게 여겼습니까?', '그 사람이 빠져도 굴러가는 구조는 무엇입니까?'];
  if (roundId === 'week8') return ['TF 파견은 성장 기회입니까, 원팀 공백입니까?', '보낸 사람보다 남은 팀의 운영 조건은 무엇입니까?'];
  if (roundId === 'week10') return ['확인된 사실, 추측, 감정은 각각 무엇입니까?', '말하지 않아야 할 것과 반드시 말해야 할 것은 무엇입니까?'];
  if (roundId === 'week11') return ['이번 주 안에 하나만 증명한다면 무엇입니까?', '선택하지 않은 일의 대가는 무엇입니까?'];
  if (roundId === 'week12') return ['우리 팀의 판정은 어떤 반복 판단의 결과입니까?', '다음 현업에서 바로 바꿀 행동 하나는 무엇입니까?'];
  return ['이번 선택은 어떤 진전을 만들고 어떤 부담을 남겼습니까?', '다음 라운드에서 먼저 관리할 리스크는 무엇입니까?'];
}

export function buildPilotRunbook({ round, progress }) {
  const roundId = round?.roundId || 'round0';
  const phase = progress?.currentPhase || 'intro';
  const guide = getPhaseGuide(roundId, phase, progress?.resultVisible);
  return {
    roundTitle: roundLabels[roundId] || round?.title || roundId,
    phaseLabel: phaseLabels[phase] || phase,
    facilitatorScript: getBaseScript(roundId),
    debriefQuestions: getDebriefQuestions(roundId),
    ...guide
  };
}
