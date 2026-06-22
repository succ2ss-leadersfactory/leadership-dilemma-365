const effects = {
  speed: { aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:0, collaborationDebt:1 },
  structure: { aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:-1 },
  balance: { aceBurnoutRisk:-1, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 },
  align: { aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:-1 }
};

export const seedChoices = [
  { choiceId:'week1_speed', roundId:'week1', displayOrder:1, choiceText:'팀원들에게 지금은 결과를 보여줘야 할 때라고 말하고, 이번 주 안에 바로 보일 수 있는 과제 하나를 정한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week1_structure', roundId:'week1', displayOrder:2, choiceText:'조직개편 심사에서 확인될 기준을 먼저 정리하고, 팀이 이번 주에 남길 최소 산출물을 정한다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:0, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week1_balance', roundId:'week1', displayOrder:3, choiceText:'상황의 무게를 인정하되, 이번 주에 지킬 것 하나와 보여줄 결과 하나를 팀과 함께 정한다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:-1, executionPressure:0, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week1_align', roundId:'week1', displayOrder:4, choiceText:'팀에 바로 확답하지 않고, 상무에게 이번 심사에서 확인될 기준과 보고 시점을 먼저 맞춘다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:0 } },

  { choiceId:'week2_speed', roundId:'week2', displayOrder:1, choiceText:'반응이 빠른 고객군에 먼저 집중해 이번 주 안에 눈에 보이는 반응 지표를 만든다.', internalType:'SPEED', baseEffects:{ ...effects.speed, executiveTrustRisk:-1 } },
  { choiceId:'week2_structure', roundId:'week2', displayOrder:2, choiceText:'고객 반응을 기존 고객, 신규 고객, 불편 신호로 나누고 각기 다른 확인 기준을 정한다.', internalType:'STRUCTURE', baseEffects:effects.structure },
  { choiceId:'week2_balance', roundId:'week2', displayOrder:3, choiceText:'빠른 반응은 살리되, 불편을 보인 고객에게는 별도 설명과 확인 일정을 잡는다.', internalType:'BALANCE', baseEffects:effects.balance },
  { choiceId:'week2_align', roundId:'week2', displayOrder:4, choiceText:'고객 메시지를 바로 밀어붙이지 않고, 상무와 고객 대응 기준을 먼저 맞춘다.', internalType:'ALIGN', baseEffects:effects.align },

  { choiceId:'week3_speed', roundId:'week3', displayOrder:1, choiceText:'불만 대화에 오래 머물지 않고, 지금 정한 과제를 그대로 밀고 가자고 말한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:1, executionPressure:-1, executiveTrustRisk:0, collaborationDebt:1 } },
  { choiceId:'week3_structure', roundId:'week3', displayOrder:2, choiceText:'불만을 태도 문제가 아니라 기준 설명 부족, 역할 부담, 일정 압박으로 나누어 정리한다.', internalType:'STRUCTURE', baseEffects:effects.structure },
  { choiceId:'week3_balance', roundId:'week3', displayOrder:3, choiceText:'짧은 팀 대화를 열어 불편을 인정하고, 바꿀 수 있는 것과 유지할 것을 함께 정한다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:0, collaborationDebt:-1 } },
  { choiceId:'week3_align', roundId:'week3', displayOrder:4, choiceText:'불만이 커지는 원인을 상무에게 설명하고, 현장에 다시 말할 기준과 범위를 확인한다.', internalType:'ALIGN', baseEffects:effects.align },

  { choiceId:'week4_speed', roundId:'week4', displayOrder:1, choiceText:'상무가 볼 만한 성과 문장을 먼저 만들고, 세부 근거는 나중에 보완한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:1, collaborationDebt:0 } },
  { choiceId:'week4_structure', roundId:'week4', displayOrder:2, choiceText:'활동 목록을 줄이고, 실제로 바뀐 증거와 확인 가능한 숫자만 한 장에 담는다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week4_balance', roundId:'week4', displayOrder:3, choiceText:'성과로 보일 것과 아직 부족한 것을 함께 적어 과장하지 않는 보고를 만든다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week4_align', roundId:'week4', displayOrder:4, choiceText:'상무가 기대하는 증거 수준을 먼저 확인하고, 보고 범위와 후속 일정을 맞춘다.', internalType:'ALIGN', baseEffects:effects.align },

  { choiceId:'week5_speed', roundId:'week5', displayOrder:1, choiceText:'이번 주 중요한 과제는 그대로 핵심 인재가 맡게 하고, 대신 끝난 뒤 보상과 인정을 분명히 하겠다고 말한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week5_structure', roundId:'week5', displayOrder:2, choiceText:'핵심 인재가 맡던 일을 기준, 난이도, 확인 시점으로 나누고 일부를 다른 팀원이 맡도록 재설계한다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week5_balance', roundId:'week5', displayOrder:3, choiceText:'핵심 인재의 부담을 인정하고, 이번 과제에서 맡길 일과 내려놓을 일을 함께 정한다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week5_align', roundId:'week5', displayOrder:4, choiceText:'상무에게 핵심 인재 의존 구조의 위험을 설명하고, 이번 주 결과 범위와 인력 배분 조건을 다시 맞춘다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 } },

  { choiceId:'week6_speed', roundId:'week6', displayOrder:1, choiceText:'타부서 회신을 기다리지 않고 우리 팀이 할 수 있는 일부터 먼저 진행한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:0, collaborationDebt:1 } },
  { choiceId:'week6_structure', roundId:'week6', displayOrder:2, choiceText:'지연된 자료, 의사결정자, 마감 시점을 표로 정리해 협업 병목을 공식화한다.', internalType:'STRUCTURE', baseEffects:effects.structure },
  { choiceId:'week6_balance', roundId:'week6', displayOrder:3, choiceText:'우리 팀이 먼저 줄일 부담과 타부서에 요청할 조건을 나누어 정리한다.', internalType:'BALANCE', baseEffects:effects.balance },
  { choiceId:'week6_align', roundId:'week6', displayOrder:4, choiceText:'타부서 팀장과 직접 맞춰 일정, 책임, 우선순위를 다시 합의한다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:-1 } },

  { choiceId:'week7_speed', roundId:'week7', displayOrder:1, choiceText:'TF 후보를 빠르게 정해 두고 공식 지시가 오면 바로 보낼 준비를 한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:1 } },
  { choiceId:'week7_structure', roundId:'week7', displayOrder:2, choiceText:'TF 후보 기준, 원팀 공백, 대체 역할을 미리 표로 정리한다.', internalType:'STRUCTURE', baseEffects:effects.structure },
  { choiceId:'week7_balance', roundId:'week7', displayOrder:3, choiceText:'성장 기회가 필요한 사람과 지금 빠지면 안 되는 사람을 구분해 후보군을 만든다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week7_align', roundId:'week7', displayOrder:4, choiceText:'공식 지시 전이라도 상무와 TF 역할 기대, 파견 기준, 원팀 보완 조건을 확인한다.', internalType:'ALIGN', baseEffects:effects.align },

  { choiceId:'week8_speed', roundId:'week8', displayOrder:1, choiceText:'TF 성공 가능성을 높이기 위해 가장 경험 많고 영향력 있는 사람을 보낸다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:1 } },
  { choiceId:'week8_structure', roundId:'week8', displayOrder:2, choiceText:'TF 파견자보다 먼저 TF 역할, 원팀 공백, 성공 산출물을 기준으로 정한 뒤 사람을 고른다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:0, collaborationDebt:-1 } },
  { choiceId:'week8_balance', roundId:'week8', displayOrder:3, choiceText:'성장 후보에게 TF 기회를 주되, 원팀 공백과 실패 가능성을 보완할 지원자를 함께 정한다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:1, collaborationDebt:0 } },
  { choiceId:'week8_align', roundId:'week8', displayOrder:4, choiceText:'우리 팀 파견자만 정하지 않고, 타부서와 TF 역할 구성을 맞춘 뒤 최종 파견자를 정한다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:0, collaborationDebt:-1 } },

  { choiceId:'week9_speed', roundId:'week9', displayOrder:1, choiceText:'경쟁팀보다 늦어 보이지 않도록 이번 주에 바로 보이는 성과 하나를 추가로 만든다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:1 } },
  { choiceId:'week9_structure', roundId:'week9', displayOrder:2, choiceText:'경쟁팀 성과와 우리 팀 미션을 비교해 따라갈 것과 따라가지 않을 것을 구분한다.', internalType:'STRUCTURE', baseEffects:effects.structure },
  { choiceId:'week9_balance', roundId:'week9', displayOrder:3, choiceText:'비교 압박을 인정하되, 우리 팀이 지킬 기준과 이번 주 증거를 함께 정한다.', internalType:'BALANCE', baseEffects:effects.balance },
  { choiceId:'week9_align', roundId:'week9', displayOrder:4, choiceText:'상무에게 우리 팀의 비밀 미션과 평가 기준을 다시 맞추고 무리한 추격을 피한다.', internalType:'ALIGN', baseEffects:effects.align },

  { choiceId:'week10_align', roundId:'week10', displayOrder:1, choiceText:'팀원에게 바로 답하지 못하는 것을 감수하고, 상무에게 확인 가능한 범위와 아직 말할 수 없는 범위를 먼저 확인한다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:0, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week10_structure', roundId:'week10', displayOrder:2, choiceText:'확인된 사실, 확인 중인 내용, 말하지 않을 추측을 구분해 공유한다. 다만 개인별 불안은 그 자리에서 다루지 못한다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:1, executionPressure:0, executiveTrustRisk:-1, collaborationDebt:-1 } },
  { choiceId:'week10_speed', roundId:'week10', displayOrder:3, choiceText:'루머 대응보다 이번 주 마지막 성과를 먼저 만들게 한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:1, executionPressure:-1, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week10_balance', roundId:'week10', displayOrder:4, choiceText:'불안을 인정하되, 이번 주 성과 시간이 줄어드는 것을 감수하고 팀이 지킬 기준과 행동을 함께 정한다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:-1, executionPressure:1, executiveTrustRisk:0, collaborationDebt:0 } },
  { choiceId:'week11_speed', roundId:'week11', displayOrder:1, choiceText:'가장 눈에 보이는 성과를 빠르게 만들기 위해 팀의 자원을 집중한다.', internalType:'SPEED', baseEffects:{ aceBurnoutRisk:1, growthShrinkRisk:0, executionPressure:-1, executiveTrustRisk:-1, collaborationDebt:1 } },
  { choiceId:'week11_balance', roundId:'week11', displayOrder:2, choiceText:'조직개편 심사에서 약해 보일 수 있더라도, 팀 지속성과 사람 부담을 무너뜨리지 않는 승부수로 낮춘다.', internalType:'BALANCE', baseEffects:{ aceBurnoutRisk:-1, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:1, collaborationDebt:0 } },
  { choiceId:'week11_structure', roundId:'week11', displayOrder:3, choiceText:'실행 시간이 줄어드는 것을 감수하고, 조직개편 심사에서 보여줄 기준, 증거, 산출물을 먼저 정한 뒤 움직인다.', internalType:'STRUCTURE', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:-1, collaborationDebt:0 } },
  { choiceId:'week11_align', roundId:'week11', displayOrder:4, choiceText:'승부수 실행 속도가 늦어지는 것을 감수하고, 타부서와 충돌하지 않도록 필요한 협업 조건부터 맞춘다.', internalType:'ALIGN', baseEffects:{ aceBurnoutRisk:0, growthShrinkRisk:0, executionPressure:1, executiveTrustRisk:0, collaborationDebt:-1 } }
];
