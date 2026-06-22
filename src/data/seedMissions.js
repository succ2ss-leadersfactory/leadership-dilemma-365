export const seedMissions = {
  sales: {
    missionId: 'mission_sales_retention',
    teamId: 'sales',
    missionTitle: '핵심 고객 이탈 방지',
    missionBrief: '매출 회복을 서두르더라도 핵심 고객 신뢰와 핵심 담당자의 지속성을 함께 지켜야 한다.',
    successCondition: '고객 신뢰 리스크를 키우지 않고, 핵심 인재에게만 부담이 몰리는 구조를 줄인다.',
    criteria: ['핵심 고객 신뢰 유지', '핵심 담당자 소진 관리', '업무 재배분 또는 조건 조정'],
    scoreRules: [
      { ruleId: 'sales_trust', type: 'riskAtMost', riskKey: 'executiveTrustRisk', max: 1, label: '고객과 경영진에게 보여줄 신뢰 신호를 유지했다.' },
      { ruleId: 'sales_ace_load', type: 'riskAtMost', riskKey: 'aceBurnoutRisk', max: 1, label: '핵심 담당자에게 반복 부담이 몰리지 않게 관리했다.' },
      { ruleId: 'sales_week5_choice', type: 'roundChoiceTypeIn', roundId: 'week5', allowedTypes: ['STRUCTURE', 'BALANCE', 'ALIGN'], label: '핵심 인재 이탈 신호에서 일을 재배분하거나 조건을 조정했다.' }
    ]
  },
  marketing: {
    missionId: 'mission_marketing_message',
    teamId: 'marketing',
    missionTitle: '메시지 정렬과 신제품 포지셔닝',
    missionBrief: '빠른 캠페인 실행보다 시장에 전달될 메시지의 기준과 내부 정렬을 지켜야 한다.',
    successCondition: '메시지 기준을 세우고, 협업 부채를 키우지 않으며, 마지막 산출물 품질을 일정 수준 이상으로 남긴다.',
    criteria: ['메시지 기준 정렬', '협업 부채 관리', '마지막 산출물 품질 확보'],
    scoreRules: [
      { ruleId: 'marketing_week1_choice', type: 'roundChoiceTypeIn', roundId: 'week1', allowedTypes: ['STRUCTURE', 'BALANCE'], label: '위기 초기에 보여줄 결과와 지킬 기준을 함께 정리했다.' },
      { ruleId: 'marketing_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '부서 간 협업 부채를 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'marketing_week11_quality', type: 'outputQualityAtLeast', roundId: 'week11', minQuality: 'medium', label: '마지막 승부수에서 메시지와 실행 근거가 담긴 산출물을 남겼다.' }
    ]
  },
  rnd: {
    missionId: 'mission_rnd_delay',
    teamId: 'rnd',
    missionTitle: '핵심 과제 지연 방지',
    missionBrief: '기술 기준을 지키면서도 판단이 특정 전문가에게만 묶여 핵심 과제가 멈추지 않게 해야 한다.',
    successCondition: '핵심 과제의 실행 압박을 통제하고, 후배 판단 경험을 줄이지 않으며, 마지막 승부수의 기준을 분명히 한다.',
    criteria: ['핵심 과제 실행 압박 관리', '후배 판단 경험 유지', '마지막 기술 기준 정리'],
    scoreRules: [
      { ruleId: 'rnd_execution', type: 'riskAtMost', riskKey: 'executionPressure', max: 1, label: '핵심 과제가 지연되지 않도록 실행 압박을 관리했다.' },
      { ruleId: 'rnd_growth', type: 'riskAtMost', riskKey: 'growthShrinkRisk', max: 1, label: '후배의 판단 경험이 지나치게 줄어들지 않게 했다.' },
      { ruleId: 'rnd_week11_choice', type: 'roundChoiceTypeIn', roundId: 'week11', allowedTypes: ['STRUCTURE', 'ALIGN'], label: '마지막 승부수에서 기술 기준, 증거, 협업 조건을 먼저 정리했다.' }
    ]
  },
  operations: {
    missionId: 'mission_operations_delivery',
    teamId: 'operations',
    missionTitle: '납기 안정화',
    missionBrief: '납기를 지키더라도 현장 소진과 품질 경고를 방치하지 않는 운영 설계를 남겨야 한다.',
    successCondition: '실행 압박과 협업 부채를 통제하고, TF 파견으로 생기는 원팀 공백을 설계한다.',
    criteria: ['납기 실행 압박 관리', '원팀 공백 설계', '협업 부채 관리'],
    scoreRules: [
      { ruleId: 'operations_execution', type: 'riskAtMost', riskKey: 'executionPressure', max: 1, label: '납기 실행 압박을 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'operations_week8_choice', type: 'roundChoiceTypeIn', roundId: 'week8', allowedTypes: ['STRUCTURE', 'BALANCE', 'ALIGN'], label: 'AI 자동화 TF 파견 때 원팀 공백과 지원 구조를 함께 설계했다.' },
      { ruleId: 'operations_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '타부서와 현장 사이의 협업 부채를 키우지 않았다.' }
    ]
  },
  hr: {
    missionId: 'mission_hr_retention',
    teamId: 'hr',
    missionTitle: '핵심 인재 이탈 방지',
    missionBrief: '조직개편 불안 속에서도 공정성 기준과 사람의 불안을 함께 다뤄야 한다.',
    successCondition: '불안과 루머를 기준 있게 다루고, 핵심 인재와 성장 인재의 이탈 신호를 낮춘다.',
    criteria: ['조직개편 불안 대응', '핵심 인재 소진 관리', '성장 인재 위축 관리'],
    scoreRules: [
      { ruleId: 'hr_week10_choice', type: 'roundChoiceTypeIn', roundId: 'week10', allowedTypes: ['ALIGN', 'STRUCTURE', 'BALANCE'], label: '조직개편 루머 앞에서 확인된 사실과 말할 수 있는 범위를 구분했다.' },
      { ruleId: 'hr_ace_load', type: 'riskAtMost', riskKey: 'aceBurnoutRisk', max: 1, label: '핵심 인재의 소진 신호를 위험 수준으로 키우지 않았다.' },
      { ruleId: 'hr_growth', type: 'riskAtMost', riskKey: 'growthShrinkRisk', max: 1, label: '성장 인재가 위축되지 않도록 판단 참여 여지를 남겼다.' }
    ]
  },
  finance: {
    missionId: 'mission_finance_balance',
    teamId: 'finance',
    missionTitle: '비용 절감과 투자 균형',
    missionBrief: '비용 절감 압박 속에서도 미래 실행력을 끊지 않는 투자 최소선을 지켜야 한다.',
    successCondition: '경영진 신뢰와 협업 신뢰를 유지하고, 마지막 승부수에서 비용과 투자 기준을 분명히 한다.',
    criteria: ['비용 절감 기준화', '전략투자 최소선 유지', '협업 신뢰 유지'],
    scoreRules: [
      { ruleId: 'finance_week11_choice', type: 'roundChoiceTypeIn', roundId: 'week11', allowedTypes: ['STRUCTURE', 'ALIGN'], label: '마지막 승부수에서 비용, 증거, 협업 조건을 기준으로 정리했다.' },
      { ruleId: 'finance_trust', type: 'riskAtMost', riskKey: 'executiveTrustRisk', max: 1, label: '경영진 신뢰 리스크를 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'finance_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '비용 통제 과정에서 타부서 협업 신뢰를 무너뜨리지 않았다.' }
    ]
  }
};
