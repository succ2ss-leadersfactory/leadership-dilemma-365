export const defaultResultCard = {
  oneLineResult: '선택의 방향은 정해졌지만, 그에 따른 부담도 함께 남았습니다.',
  smallProgress: '팀은 하나의 방향으로 움직이기 시작했습니다.',
  smallFriction: '다만 일부 팀원은 이 선택의 대가를 걱정했습니다.',
  reorgReviewView: '조직개편 심사에서는 결과와 함께 선택의 대가를 어떻게 관리했는지가 함께 보입니다.',
  stateSceneText: {},
  falloutCandidates: []
};

export const seedResultCards = Object.fromEntries([
  'week1_speed','week1_structure','week1_balance','week1_align','week5_speed','week5_structure','week5_balance','week5_align','week8_speed','week8_structure','week8_balance','week8_align','week10_align','week10_structure','week10_speed','week10_balance','week11_speed','week11_balance','week11_structure','week11_align'
].map(id => [id, { resultCardId:id, roundId:id.split('_')[0], choiceId:id, ...defaultResultCard, oneLineResult:`${id} 선택 결과: 팀은 한 가지 판단을 실행했고, 그 대가도 함께 남겼습니다.` }]));
