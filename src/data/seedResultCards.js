export const defaultResultCard = {
  resultTitle: '이번 선택이 남긴 결과',
  oneLineResult: '선택의 방향은 정해졌지만, 그에 따른 부담도 함께 남았습니다.',
  smallProgress: '팀은 하나의 방향으로 움직이기 시작했습니다.',
  smallFriction: '다만 일부 팀원은 이 선택의 대가를 걱정했습니다.',
  reorgReviewView: '조직개편 심사에서는 결과와 함께 선택의 대가를 어떻게 관리했는지가 함께 보입니다.',
  stateSceneText: {},
  falloutCandidates: []
};

const cards = {
  week1_speed: {
    resultTitle: '빠른 실행을 선택한 팀',
    oneLineResult: '팀은 위기 앞에서 빠르게 움직였고, 단기 성과의 신호를 만들기 시작했습니다.',
    smallProgress: '무엇부터 할지 명확해지면서 실행 속도는 올라갔습니다.',
    smallFriction: '다만 왜 이 일을 해야 하는지 충분히 납득하지 못한 팀원에게 압박감이 남았습니다.',
    reorgReviewView: '조직개편 심사에서는 속도는 긍정적으로 보이지만, 지속 가능한 실행 구조가 함께 확인됩니다.',
    stateSceneText: {
      executionPressure: '팀의 에너지가 실행으로 모였지만, 일부 팀원은 숨 쉴 틈이 줄었다고 느꼈습니다.'
    }
  },
  week1_structure: {
    resultTitle: '기준 정렬을 선택한 팀',
    oneLineResult: '팀은 위기를 막연한 불안이 아니라 기준과 산출물의 문제로 바꾸었습니다.',
    smallProgress: '무엇을 보여줘야 하는지 기준이 잡히면서 혼란이 줄었습니다.',
    smallFriction: '다만 기준을 세우는 동안 즉각적인 실행 속도는 다소 느려졌습니다.',
    reorgReviewView: '조직개편 심사에서는 기준을 세우는 팀으로 보이지만, 기준이 실행으로 이어지는지가 관찰됩니다.',
    stateSceneText: {
      executiveTrustRisk: '상무에게 설명 가능한 기준이 생겼습니다.',
      executionPressure: '실행 압박은 남아 있지만 무질서한 압박은 줄었습니다.'
    }
  },
  week1_balance: {
    resultTitle: '균형 조정을 선택한 팀',
    oneLineResult: '팀은 위기의 무게를 숨기지 않으면서도, 이번 주에 지킬 기준과 보여줄 결과를 함께 정했습니다.',
    smallProgress: '팀원들은 불안을 말해도 된다는 신호를 받았고, 감당 가능한 첫 행동을 정했습니다.',
    smallFriction: '다만 빠른 성과를 기대한 사람에게는 속도가 부족해 보일 수 있습니다.',
    reorgReviewView: '조직개편 심사에서는 단기 성과뿐 아니라 팀의 회복력과 판단 기준이 함께 보입니다.',
    stateSceneText: {
      growthShrinkRisk: '질문과 의견이 조금 더 자연스럽게 나왔습니다.',
      executionPressure: '결과를 향한 긴장은 남아 있지만 관리 가능한 수준입니다.'
    }
  },
  week1_align: {
    resultTitle: '조건 조율을 선택한 팀',
    oneLineResult: '팀은 바로 움직이기보다 상위 기대와 보고 기준을 먼저 맞추었습니다.',
    smallProgress: '상무가 무엇을 중요하게 보는지 확인하면서 불필요한 재작업 가능성을 줄였습니다.',
    smallFriction: '다만 팀 내부에서는 기다리는 시간이 길어지며 실행 동력이 약해질 수 있습니다.',
    reorgReviewView: '조직개편 심사에서는 상위 정렬 능력이 보이지만, 독자적 실행력도 함께 평가됩니다.',
    stateSceneText: {
      executiveTrustRisk: '상위 기대와 어긋날 위험이 낮아졌습니다.',
      executionPressure: '확인하는 동안 실행 시간은 줄어들었습니다.'
    }
  },
  week5_speed: {
    resultTitle: '핵심 인재 의존을 선택한 팀',
    oneLineResult: '이번 주 결과는 지킬 수 있었지만, 핵심 인재에게 부담이 다시 집중되었습니다.',
    smallProgress: '급한 과제는 빠르게 정리되었습니다.',
    smallFriction: '핵심 인재는 인정받았지만 이 방식이 반복될까 걱정하기 시작했습니다.',
    reorgReviewView: '조직개편 심사에서는 성과는 보이지만 특정 인재 의존 구조가 리스크로 보입니다.',
    stateSceneText: {
      aceBurnoutRisk: '잘하는 사람에게 일이 다시 몰렸습니다.'
    }
  },
  week5_structure: {
    resultTitle: '부담 구조 재설계를 선택한 팀',
    oneLineResult: '팀은 사람의 의지만이 아니라 일의 구조를 다시 나누기 시작했습니다.',
    smallProgress: '업무 난이도와 확인 시점이 나뉘면서 부담의 위치가 보였습니다.',
    smallFriction: '재설계 과정에서 당장의 속도는 조금 늦어졌습니다.',
    reorgReviewView: '조직개편 심사에서는 특정 인재 의존을 줄이는 관리 역량으로 보입니다.',
    stateSceneText: {
      aceBurnoutRisk: '핵심 인재에게 몰리던 부담이 일부 분산되었습니다.',
      growthShrinkRisk: '후배가 맡을 수 있는 작은 단위가 생겼습니다.'
    }
  },
  week5_balance: {
    resultTitle: '성과와 지속성을 함께 본 팀',
    oneLineResult: '팀은 핵심 인재의 부담을 인정하고, 맡길 일과 내려놓을 일을 함께 정했습니다.',
    smallProgress: '팀원들은 성과만이 아니라 지속 가능성도 판단 기준이 된다는 신호를 받았습니다.',
    smallFriction: '일부 과제는 속도를 늦추거나 범위를 줄여야 했습니다.',
    reorgReviewView: '조직개편 심사에서는 사람을 태워 성과를 만드는 팀이 아니라 지속 가능한 팀인지가 보입니다.',
    stateSceneText: {
      aceBurnoutRisk: '핵심 인재의 부담 신호가 공식적으로 다뤄졌습니다.'
    }
  },
  week5_align: {
    resultTitle: '상위 조건 조율을 선택한 팀',
    oneLineResult: '팀은 핵심 인재 의존 위험을 상무에게 드러내고 감당 조건을 조율했습니다.',
    smallProgress: '위험을 숨기지 않으면서 지원 조건을 논의할 수 있게 되었습니다.',
    smallFriction: '상위 조직에는 변명처럼 들릴 위험도 남았습니다.',
    reorgReviewView: '조직개편 심사에서는 리스크를 조기 보고하는 팀으로 보이지만, 자체 해결력도 함께 평가됩니다.',
    stateSceneText: {
      executiveTrustRisk: '리스크를 숨기지 않는 신뢰 신호가 생겼습니다.'
    }
  }
};

const ids = [
  'week1_speed','week1_structure','week1_balance','week1_align',
  'week5_speed','week5_structure','week5_balance','week5_align',
  'week8_speed','week8_structure','week8_balance','week8_align',
  'week10_align','week10_structure','week10_speed','week10_balance',
  'week11_speed','week11_balance','week11_structure','week11_align'
];

export const seedResultCards = Object.fromEntries(ids.map(id => [
  id,
  {
    resultCardId: id,
    roundId: id.split('_')[0],
    choiceId: id,
    ...defaultResultCard,
    ...(cards[id] || {})
  }
]));
