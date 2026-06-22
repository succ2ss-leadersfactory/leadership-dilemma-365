export const defaultResultCard = {
  resultTitle: '이번 선택이 남긴 결과',
  oneLineResult: '선택의 방향은 정해졌지만, 그에 따른 부담도 함께 남았습니다.',
  smallProgress: '팀은 하나의 방향으로 움직이기 시작했습니다.',
  smallFriction: '다만 일부 팀원은 이 선택의 대가를 걱정했습니다.',
  reorgReviewView: '심사 관점에서는 결과와 함께 선택의 대가를 어떻게 관리했는지가 함께 보입니다.',
  stateSceneText: {},
  falloutCandidates: []
};

const cards = {
  week1_speed: { resultTitle: '빠른 실행을 선택한 팀', oneLineResult: '팀은 위기 앞에서 빠르게 움직였고, 단기 성과의 신호를 만들기 시작했습니다.', smallProgress: '무엇부터 할지 명확해지면서 실행 속도는 올라갔습니다.', smallFriction: '충분히 납득하지 못한 팀원에게 압박감이 남았습니다.', reorgReviewView: '속도는 긍정적으로 보이지만, 지속 가능한 실행 구조가 함께 확인됩니다.', stateSceneText: { executionPressure: '팀의 에너지가 실행으로 모였습니다.' } },
  week1_structure: { resultTitle: '기준 정렬을 선택한 팀', oneLineResult: '팀은 위기를 막연한 불안이 아니라 기준과 산출물의 문제로 바꾸었습니다.', smallProgress: '무엇을 보여줘야 하는지 기준이 잡히면서 혼란이 줄었습니다.', smallFriction: '기준을 세우는 동안 즉각적인 실행 속도는 다소 느려졌습니다.', reorgReviewView: '기준이 실행으로 이어지는지가 관찰됩니다.', stateSceneText: { executiveTrustRisk: '설명 가능한 기준이 생겼습니다.' } },
  week1_balance: { resultTitle: '균형 조정을 선택한 팀', oneLineResult: '팀은 위기의 무게를 숨기지 않으면서도, 이번 주에 지킬 기준과 보여줄 결과를 함께 정했습니다.', smallProgress: '팀원들은 불안을 말해도 된다는 신호를 받았고, 감당 가능한 첫 행동을 정했습니다.', smallFriction: '빠른 성과를 기대한 사람에게는 속도가 부족해 보일 수 있습니다.', reorgReviewView: '단기 성과뿐 아니라 팀의 회복력과 판단 기준이 함께 보입니다.', stateSceneText: { growthShrinkRisk: '질문과 의견이 조금 더 자연스럽게 나왔습니다.' } },
  week1_align: { resultTitle: '조건 조율을 선택한 팀', oneLineResult: '팀은 바로 움직이기보다 상위 기대와 보고 기준을 먼저 맞추었습니다.', smallProgress: '무엇을 중요하게 보는지 확인하면서 불필요한 재작업 가능성을 줄였습니다.', smallFriction: '기다리는 시간이 길어지며 실행 동력이 약해질 수 있습니다.', reorgReviewView: '상위 정렬 능력과 독자적 실행력이 함께 평가됩니다.', stateSceneText: { executiveTrustRisk: '기대와 어긋날 위험이 낮아졌습니다.' } },
  week5_speed: { resultTitle: '핵심 인재 의존을 선택한 팀', oneLineResult: '이번 주 결과는 지킬 수 있었지만, 핵심 인재에게 부담이 다시 집중되었습니다.', smallProgress: '급한 과제는 빠르게 정리되었습니다.', smallFriction: '핵심 인재는 인정받았지만 이 방식이 반복될까 걱정하기 시작했습니다.', reorgReviewView: '성과는 보이지만 특정 인재 의존 구조가 리스크로 보입니다.', stateSceneText: { aceBurnoutRisk: '잘하는 사람에게 일이 다시 몰렸습니다.' } },
  week5_structure: { resultTitle: '부담 구조 재설계를 선택한 팀', oneLineResult: '팀은 사람의 의지만이 아니라 일의 구조를 다시 나누기 시작했습니다.', smallProgress: '업무 난이도와 확인 시점이 나뉘면서 부담의 위치가 보였습니다.', smallFriction: '재설계 과정에서 당장의 속도는 조금 늦어졌습니다.', reorgReviewView: '특정 인재 의존을 줄이는 관리 역량으로 보입니다.', stateSceneText: { aceBurnoutRisk: '부담이 일부 분산되었습니다.' } },
  week5_balance: { resultTitle: '성과와 지속성을 함께 본 팀', oneLineResult: '팀은 핵심 인재의 부담을 인정하고, 맡길 일과 내려놓을 일을 함께 정했습니다.', smallProgress: '성과만이 아니라 지속 가능성도 판단 기준이 된다는 신호를 받았습니다.', smallFriction: '일부 과제는 속도를 늦추거나 범위를 줄여야 했습니다.', reorgReviewView: '사람을 태워 성과를 만드는 팀인지, 지속 가능한 팀인지가 보입니다.', stateSceneText: { aceBurnoutRisk: '부담 신호가 공식적으로 다뤄졌습니다.' } },
  week5_align: { resultTitle: '상위 조건 조율을 선택한 팀', oneLineResult: '팀은 핵심 인재 의존 위험을 드러내고 감당 조건을 조율했습니다.', smallProgress: '위험을 숨기지 않으면서 지원 조건을 논의할 수 있게 되었습니다.', smallFriction: '상위 조직에는 변명처럼 들릴 위험도 남았습니다.', reorgReviewView: '리스크를 조기 보고하는 팀으로 보이지만, 자체 해결력도 함께 평가됩니다.', stateSceneText: { executiveTrustRisk: '리스크를 숨기지 않는 신뢰 신호가 생겼습니다.' } },
  week8_speed: { resultTitle: '전문가 파견을 선택한 팀', oneLineResult: '팀은 가장 확실한 사람을 TF에 보냈고, 전사 기여의 속도를 높였습니다.', smallProgress: 'TF는 빠르게 힘을 받았고 협조적 신호가 전달되었습니다.', smallFriction: '원팀에는 핵심 공백이 생겼고 남은 팀원의 부담이 커졌습니다.', reorgReviewView: '전사 기여와 원팀 공백 관리가 함께 평가됩니다.', stateSceneText: { aceBurnoutRisk: '핵심 인재가 팀 밖 과제까지 감당하게 되었습니다.' } },
  week8_structure: { resultTitle: 'TF 기준 설계를 선택한 팀', oneLineResult: '팀은 사람을 보내기 전에 역할, 공백, 산출물 기준을 먼저 정했습니다.', smallProgress: 'TF 참여가 단순 차출이 아니라 관리 가능한 프로젝트로 바뀌었습니다.', smallFriction: '기준을 맞추는 동안 출발은 조금 늦어졌습니다.', reorgReviewView: '전사 협업을 구조화하는 팀으로 보입니다.', stateSceneText: { collaborationDebt: '협업의 기대와 책임이 더 분명해졌습니다.' } },
  week8_balance: { resultTitle: '성장 후보 파견을 선택한 팀', oneLineResult: '팀은 TF를 인재 성장 기회로 바꾸고, 지원 구조를 붙였습니다.', smallProgress: '후배에게 전사 과제를 경험할 기회가 생겼습니다.', smallFriction: '경험 부족으로 초기 품질과 속도에 대한 우려가 남았습니다.', reorgReviewView: '인재 파이프라인을 키우는 팀으로 보입니다.', stateSceneText: { growthShrinkRisk: '성장 기회가 생기며 위축 신호가 줄었습니다.' } },
  week8_align: { resultTitle: '협업 조건 조율을 선택한 팀', oneLineResult: '팀은 타부서와 역할 구성을 맞춘 뒤 TF 참여 조건을 조율했습니다.', smallProgress: 'TF의 책임 경계가 선명해져 중복과 충돌 가능성이 줄었습니다.', smallFriction: '조율 과정이 길어져 즉각적인 기여 신호는 약해질 수 있습니다.', reorgReviewView: '협업 성숙도와 실행 속도가 함께 점검됩니다.', stateSceneText: { collaborationDebt: '부서 간 기대를 드러내 조정하기 시작했습니다.' } },
  week10_align: { resultTitle: '확인 범위 조율을 선택한 팀', oneLineResult: '팀은 소문에 바로 반응하지 않고, 말할 수 있는 범위를 먼저 확인했습니다.', smallProgress: '불확실한 말이 확산되는 것을 줄였습니다.', smallFriction: '기다리는 동안 팀 내부의 불안은 완전히 사라지지 않았습니다.', reorgReviewView: '신중한 커뮤니케이션과 내부 불안 관리가 함께 평가됩니다.', stateSceneText: { executiveTrustRisk: '메시지와 어긋날 위험이 줄었습니다.' } },
  week10_structure: { resultTitle: '사실과 추측을 구분한 팀', oneLineResult: '팀은 확인된 사실, 확인 중인 내용, 말하지 않을 추측을 구분해 공유했습니다.', smallProgress: '루머가 판단 기준을 흔드는 정도가 줄었습니다.', smallFriction: '모든 불안을 해소하지는 못했지만 말의 기준은 생겼습니다.', reorgReviewView: '불확실성 속에서도 질서를 만드는 팀으로 보입니다.', stateSceneText: { collaborationDebt: '불필요한 오해와 해석 차이가 줄었습니다.' } },
  week10_speed: { resultTitle: '성과 집중을 선택한 팀', oneLineResult: '팀은 루머 대응보다 이번 주 마지막 성과를 만드는 데 집중했습니다.', smallProgress: '흔들리는 분위기 속에서도 산출물은 앞으로 나아갔습니다.', smallFriction: '불안을 다루지 않은 팀원은 혼자 추측을 키울 수 있습니다.', reorgReviewView: '성과 집중과 조직 불안 관리가 함께 보입니다.', stateSceneText: { executionPressure: '성과 압박이 다시 앞에 섰습니다.' } },
  week10_balance: { resultTitle: '불안과 행동 기준을 함께 다룬 팀', oneLineResult: '팀은 불안을 인정하되, 성과 시간을 지키기 위한 행동 기준도 함께 정했습니다.', smallProgress: '팀원들은 소문보다 우리가 통제할 행동에 다시 집중했습니다.', smallFriction: '불안을 다루는 데 시간이 들면서 실행 시간은 일부 줄었습니다.', reorgReviewView: '사람의 불안과 성과 관리를 함께 보는 팀으로 보입니다.', stateSceneText: { growthShrinkRisk: '불안을 말할 수 있는 여지가 생겼습니다.' } },
  week11_speed: { resultTitle: '마지막 성과 집중을 선택한 팀', oneLineResult: '팀은 마지막에 가장 눈에 보이는 성과를 만들기 위해 자원을 집중했습니다.', smallProgress: '짧은 시간 안에 보여줄 결과가 선명해졌습니다.', smallFriction: '무리한 집중은 사람과 협업에 남은 부담을 키울 수 있습니다.', reorgReviewView: '성과 의지와 지속 가능성 질문이 함께 따라옵니다.', stateSceneText: { executionPressure: '마지막 압박이 크게 올라갔습니다.' } },
  week11_balance: { resultTitle: '지속 가능한 승부수를 선택한 팀', oneLineResult: '팀은 마지막 기회 앞에서도 팀 지속성을 무너뜨리지 않는 승부수를 선택했습니다.', smallProgress: '성과와 사람을 함께 지키려는 기준이 마지막까지 유지되었습니다.', smallFriction: '더 큰 임팩트를 기대한 사람에게는 과감성이 부족해 보일 수 있습니다.', reorgReviewView: '무리한 성과보다 지속 가능한 실행력을 가진 팀으로 보입니다.', stateSceneText: { aceBurnoutRisk: '마지막 부담의 쏠림을 일부 막았습니다.' } },
  week11_structure: { resultTitle: '증거 기반 승부수를 선택한 팀', oneLineResult: '팀은 마지막 승부수를 감정이 아니라 기준, 증거, 산출물로 정리했습니다.', smallProgress: '심사장에서 설명 가능한 결과와 근거가 생겼습니다.', smallFriction: '기준을 맞추는 동안 새로운 시도는 제한될 수 있습니다.', reorgReviewView: '신뢰 가능한 실행과 보고 역량이 강점으로 보입니다.', stateSceneText: { executiveTrustRisk: '설명 가능한 근거가 생겼습니다.' } },
  week11_align: { resultTitle: '협업 조건부터 맞춘 팀', oneLineResult: '팀은 마지막 승부수를 혼자 밀어붙이지 않고, 필요한 협업 조건부터 맞추었습니다.', smallProgress: '타부서 지원과 책임 경계가 명확해졌습니다.', smallFriction: '조율 시간이 길어지며 마지막 성과의 속도는 다소 낮아질 수 있습니다.', reorgReviewView: '혼자 잘하는 팀보다 함께 성과를 만드는 팀으로 보입니다.', stateSceneText: { collaborationDebt: '부서 간 협업 부담을 드러내고 조정했습니다.' } }
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
  { resultCardId: id, roundId: id.split('_')[0], choiceId: id, ...defaultResultCard, ...(cards[id] || {}) }
]));
