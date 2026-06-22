const commonLens = {
  sales: '고객 신뢰와 실행 속도를 함께 봐야 한다.',
  marketing: '메시지의 속도와 시장 수용성을 함께 봐야 한다.',
  rnd: '기술 기준과 일정 압박 사이의 균형을 봐야 한다.',
  operations: '납기, 품질, 현장 부담을 함께 봐야 한다.',
  hr: '공정성, 불안, 실행 기준을 함께 봐야 한다.',
  finance: '비용 통제와 실행 지속성을 함께 봐야 한다.'
};

export const seedStrategicEvents = {
  event_week1_burning_platform: {
    eventId: 'event_week1_burning_platform', roundId: 'week1', eventType: 'crisis', eventLabel: '위기 신호', title: '경영회의에서 나온 한 문장',
    triggerText: '상무가 말했다. “이번 조직개편은 숫자만 보는 자리가 아닙니다. 12주 동안 팀장이 무엇을 붙잡는지 보겠습니다.”',
    pressureText: '팀원들은 결과를 빨리 보여줘야 한다고 느끼지만, 심사 기준은 아직 분명하지 않다.',
    hiddenTradeoff: '속도를 앞세우면 첫 성과는 만들 수 있지만, 팀이 지킬 기준은 흐려질 수 있다.',
    opportunityText: '처음부터 기준과 결과를 함께 말하면 위기는 실행 기준이 될 수 있다.',
    facilitatorPrompt: '팀장이 처음 던진 말은 팀원에게 압박으로 들렸습니까, 기준으로 들렸습니까?', teamLens: commonLens
  },
  event_week2_customer_split: {
    eventId: 'event_week2_customer_split', roundId: 'week2', eventType: 'mixed', eventLabel: '반응 분기', title: '고객 반응이 둘로 갈라지다',
    triggerText: '오래 거래한 고객은 속도를 부담스러워했고, 신규 고객은 빠른 결정을 긍정적으로 봤다.',
    pressureText: '빠른 반응이 있는 쪽에 힘을 싣고 싶지만 오래 쌓은 신뢰가 흔들릴 수 있다.',
    hiddenTradeoff: '좋은 반응만 보면 단기 성과는 보이지만 불편 신호는 지하로 들어간다.',
    opportunityText: '반응을 나누어 보면 고객군별 전략과 신뢰 보완 행동을 함께 설계할 수 있다.',
    facilitatorPrompt: '우리 팀은 빠른 반응과 깊은 신뢰 중 무엇을 먼저 확인하려 했습니까?', teamLens: commonLens
  },
  event_week3_chat_spread: {
    eventId: 'event_week3_chat_spread', roundId: 'week3', eventType: 'crisis', eventLabel: '불만 확산', title: '실무자 불만이 메신저에 번지다',
    triggerText: '공식 회의는 조용했지만 메신저에는 “이거 누가 정한 거죠?”라는 말이 늘었다.',
    pressureText: '조용히 넘어가면 실행 속도는 유지될 수 있지만, 납득 부족은 다음 저항으로 남는다.',
    hiddenTradeoff: '불만을 태도 문제로만 보면 기준 설명 부족과 역할 부담을 놓칠 수 있다.',
    opportunityText: '불편을 원인별로 나누면 팀의 실행 기준을 다시 세울 수 있다.',
    facilitatorPrompt: '우리 팀은 불만을 태도 문제로 보았습니까, 기준 설명 부족으로 보았습니까?', teamLens: commonLens
  },
  event_week4_mid_check: {
    eventId: 'event_week4_mid_check', roundId: 'week4', eventType: 'check', eventLabel: '중간 점검', title: '상무가 한 장짜리 자료를 요구하다',
    triggerText: '상무가 말했다. “멋진 계획 말고, 지금까지 무엇을 바꿨는지 한 장으로 보여주십시오.”',
    pressureText: '보여줄 내용을 만들기 위해 성과를 포장하고 싶어진다.',
    hiddenTradeoff: '증거 없는 보고는 잠깐 시간을 벌 수 있지만 신뢰 리스크를 키운다.',
    opportunityText: '활동이 아니라 변화의 증거를 압축하면 팀의 존재 이유가 더 선명해진다.',
    facilitatorPrompt: '우리 팀은 한 장 보고서에 활동을 담았습니까, 변화의 증거를 담았습니까?', teamLens: commonLens
  },
  event_week5_key_person: {
    eventId: 'event_week5_key_person', roundId: 'week5', eventType: 'crisis', eventLabel: '이탈 신호', title: '핵심 인재의 짧은 한숨',
    triggerText: '핵심 인재가 말했다. “중요한 일은 계속 제 쪽으로 오네요. 이번에도 제가 맡으면 되겠죠.”',
    pressureText: '성과를 내려면 익숙한 사람에게 맡기는 것이 빠르지만 같은 방식은 소진을 만든다.',
    hiddenTradeoff: '핵심 인재에게 계속 맡기면 단기 완성도는 높아지지만 팀 전체의 실행 근육은 약해진다.',
    opportunityText: '일을 기준, 난이도, 확인 시점으로 나누면 핵심 인재를 지키면서 후배에게 경험을 줄 수 있다.',
    facilitatorPrompt: '이 선택은 핵심 인재를 보호한 선택입니까, 의존을 미룬 선택입니까?', teamLens: commonLens
  },
  event_week6_cross_delay: {
    eventId: 'event_week6_cross_delay', roundId: 'week6', eventType: 'friction', eventLabel: '협업 지연', title: '타부서 협조가 늦어진다',
    triggerText: '필요한 자료는 다른 부서에서 오지 않았고, 담당자는 “우리도 지금 정신이 없습니다”라고 답했다.',
    pressureText: '팀 안에서 더 세게 몰아붙이면 움직이는 것처럼 보이지만 병목은 반복된다.',
    hiddenTradeoff: '내부 실행만 강조하면 협업 조건을 맞추지 못해 같은 문제가 다시 생긴다.',
    opportunityText: '일정, 책임, 기준을 다시 합의하면 타부서 병목을 공식 과제로 바꿀 수 있다.',
    facilitatorPrompt: '우리 팀은 지연을 내부 속도 문제로 보았습니까, 협업 조건 문제로 보았습니까?', teamLens: commonLens
  },
  event_week7_tf_name: {
    eventId: 'event_week7_tf_name', roundId: 'week7', eventType: 'opportunity', eventLabel: '기회 예고', title: '팀원 한 명이 TF 후보로 거론된다',
    triggerText: '공식 발표 전부터 “우리 팀에서는 누가 TF에 갈까요?”라는 말이 돌았다.',
    pressureText: '준비 없이 지시를 받으면 사람을 뽑는 순간 원팀 공백이 생긴다.',
    hiddenTradeoff: '기회를 사람 선발로만 보면 남는 팀의 공백 설계가 늦어진다.',
    opportunityText: '후보 기준과 대체 역할을 미리 세우면 TF는 성장 기회가 될 수 있다.',
    facilitatorPrompt: '우리 팀은 TF를 성장 기회로 준비했습니까, 갑작스러운 차출로만 받아들였습니까?', teamLens: commonLens
  },
  event_week8_ai_tf: {
    eventId: 'event_week8_ai_tf', roundId: 'week8', eventType: 'opportunity', eventLabel: '전략적 기회', title: 'AI 자동화 TF 긴급 차출',
    triggerText: '상무가 전 팀장에게 메시지를 보냈다. “각 팀에서 1명씩 AI 자동화 TF에 보내십시오.”',
    pressureText: '가장 잘하는 사람을 보내면 TF 성공 가능성은 높지만, 그 사람이 빠진 자리는 바로 드러난다.',
    hiddenTradeoff: '에이스를 보내면 전사 프로젝트에는 기여하지만 원팀의 실행 공백이 생길 수 있다.',
    opportunityText: '성장 후보에게 기회를 주고 원팀 공백을 설계하면 팀 역량 확장의 계기가 된다.',
    facilitatorPrompt: '우리 팀은 TF 파견을 사람 선발 문제로 보았습니까, 원팀 공백 설계 문제로 보았습니까?', teamLens: commonLens
  },
  event_week9_competitor_report: {
    eventId: 'event_week9_competitor_report', roundId: 'week9', eventType: 'competition', eventLabel: '비교 압박', title: '경쟁팀 성과가 먼저 보고된다',
    triggerText: '임원회의에서 다른 팀의 성과가 먼저 언급됐다. “A팀은 이미 자동화 후보 업무를 세 개 줄였습니다.”',
    pressureText: '비교 압박이 커지면 우리 팀도 눈에 보이는 성과를 급히 만들고 싶어진다.',
    hiddenTradeoff: '남의 성과를 따라가다 보면 우리 팀의 미션과 기준이 흐려질 수 있다.',
    opportunityText: '비교를 자극으로 쓰되, 따라갈 것과 따라가지 않을 것을 나누면 집중력이 생긴다.',
    facilitatorPrompt: '우리 팀은 경쟁팀 성과를 자극으로 썼습니까, 조급함으로 받아들였습니까?', teamLens: commonLens
  },
  event_week10_reorg_rumor: {
    eventId: 'event_week10_reorg_rumor', roundId: 'week10', eventType: 'crisis', eventLabel: '불확실성', title: '공유 폴더에 남은 파일명',
    triggerText: '잠깐 올라왔다 내려간 파일명 하나가 팀 메신저를 흔들었다. “조직개편_초안_팀통합검토”라는 이름만 남았다.',
    pressureText: '팀원들은 일을 멈춘 것은 아니지만 눈에 띄게 느려졌다.',
    hiddenTradeoff: '루머를 무시하면 실행은 이어갈 수 있지만 불안은 지하로 들어간다.',
    opportunityText: '확인된 사실, 확인 중인 것, 말하지 않을 추측을 나누면 불안을 다루면서 실행 기준을 지킬 수 있다.',
    facilitatorPrompt: '팀장은 불안을 없애려 했습니까, 불안을 다룰 기준을 만들었습니까?', teamLens: commonLens
  },
  event_week11_final_bet: {
    eventId: 'event_week11_final_bet', roundId: 'week11', eventType: 'mixed', eventLabel: '마지막 승부수', title: '하나만 증명하라는 지시',
    triggerText: '상무가 마지막으로 말했다. “이번 주 안에 각 팀은 하나만 증명하십시오. 모든 것을 다 하겠다는 말은 믿지 않겠습니다.”',
    pressureText: '모든 것을 조금씩 보여주고 싶지만 심사 테이블에는 분명한 하나의 증거가 더 강하게 남는다.',
    hiddenTradeoff: '하나를 고르면 나머지는 내려놓아야 한다.',
    opportunityText: '마지막 승부수를 기준과 증거로 좁히면 팀의 존재 이유를 짧고 선명하게 보여줄 수 있다.',
    facilitatorPrompt: '우리 팀은 마지막에 무엇을 걸었고, 무엇을 포기한다고 명시했습니까?', teamLens: commonLens
  }
};
