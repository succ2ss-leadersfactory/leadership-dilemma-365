export const seedMissions = {
  sales: {
    missionId: 'mission_sales_retention',
    teamId: 'sales',
    missionTitle: '핵심 고객 이탈 방지',
    missionBrief: '매출 회복을 서두르더라도 핵심 고객 신뢰와 핵심 담당자의 지속성을 함께 지켜야 한다.',
    successCondition: '고객 신뢰 리스크를 키우지 않고, 핵심 인재에게만 부담이 몰리는 구조를 줄인다.',
    criteria: ['핵심 고객 신뢰 유지', '핵심 담당자 소진 관리', '고객 반응과 다음 행동의 증거화'],
    scoreRules: [
      { ruleId: 'sales_trust', type: 'riskAtMost', riskKey: 'executiveTrustRisk', max: 1, label: '고객과 경영진에게 보여줄 신뢰 신호를 유지했다.' },
      { ruleId: 'sales_ace_load', type: 'riskAtMost', riskKey: 'aceBurnoutRisk', max: 1, label: '핵심 담당자에게 반복 부담이 몰리지 않게 관리했다.' },
      { ruleId: 'sales_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week2', 'week11'], minScore: 3, label: '고객 반응 구분과 다음 행동을 믿을 수 있는 증거로 남겼다.' }
    ]
  },
  marketing: {
    missionId: 'mission_marketing_message',
    teamId: 'marketing',
    missionTitle: '메시지 정렬과 신제품 포지셔닝',
    missionBrief: '빠른 캠페인 실행보다 시장에 전달될 메시지의 기준과 내부 정렬을 지켜야 한다.',
    successCondition: '메시지 기준을 세우고, 협업 부채를 키우지 않으며, 마지막 산출물에 검증 근거를 남긴다.',
    criteria: ['메시지 기준 정렬', '협업 부채 관리', '시장 반응과 메시지 검증의 증거화'],
    scoreRules: [
      { ruleId: 'marketing_week1_choice', type: 'roundChoiceTypeIn', roundId: 'week1', allowedTypes: ['STRUCTURE', 'BALANCE'], label: '위기 초기에 보여줄 결과와 지킬 기준을 함께 정리했다.' },
      { ruleId: 'marketing_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '부서 간 협업 부채를 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'marketing_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week2', 'week11'], minScore: 3, label: '시장 반응, 메시지 기준, 검증 지표를 산출물에 충실하게 남겼다.' }
    ]
  },
  rnd: {
    missionId: 'mission_rnd_delay',
    teamId: 'rnd',
    missionTitle: '핵심 과제 지연 방지',
    missionBrief: '기술 기준을 지키면서도 판단이 특정 전문가에게만 묶여 핵심 과제가 멈추지 않게 해야 한다.',
    successCondition: '핵심 과제의 실행 압박을 통제하고, 후배 판단 경험을 줄이지 않으며, 기술 리스크를 증거로 남긴다.',
    criteria: ['핵심 과제 실행 압박 관리', '후배 판단 경험 유지', '기술 기준과 리스크의 증거화'],
    scoreRules: [
      { ruleId: 'rnd_execution', type: 'riskAtMost', riskKey: 'executionPressure', max: 1, label: '핵심 과제가 지연되지 않도록 실행 압박을 관리했다.' },
      { ruleId: 'rnd_growth', type: 'riskAtMost', riskKey: 'growthShrinkRisk', max: 1, label: '후배의 판단 경험이 지나치게 줄어들지 않게 했다.' },
      { ruleId: 'rnd_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week4', 'week11'], minScore: 3, label: '기술 기준, 검증 리스크, 협업 조건을 산출물에 충실하게 남겼다.' }
    ]
  },
  operations: {
    missionId: 'mission_operations_delivery',
    teamId: 'operations',
    missionTitle: '납기 안정화',
    missionBrief: '납기를 지키더라도 현장 소진과 품질 경고를 방치하지 않는 운영 설계를 남겨야 한다.',
    successCondition: '실행 압박과 협업 부채를 통제하고, 병목과 현장 부담을 증거로 남긴다.',
    criteria: ['납기 실행 압박 관리', '협업 부채 관리', '병목과 현장 부담의 증거화'],
    scoreRules: [
      { ruleId: 'operations_execution', type: 'riskAtMost', riskKey: 'executionPressure', max: 1, label: '납기 실행 압박을 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'operations_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '타부서와 현장 사이의 협업 부채를 키우지 않았다.' },
      { ruleId: 'operations_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week6', 'week8', 'week11'], minScore: 3, label: '병목, 품질 부담, 원팀 공백 보완책을 산출물에 충실하게 남겼다.' }
    ]
  },
  hr: {
    missionId: 'mission_hr_retention',
    teamId: 'hr',
    missionTitle: '핵심 인재 이탈 방지',
    missionBrief: '조직개편 불안 속에서도 공정성 기준과 사람의 불안을 함께 다뤄야 한다.',
    successCondition: '불안과 루머를 기준 있게 다루고, 핵심 인재와 성장 인재의 이탈 신호를 낮춘다.',
    criteria: ['조직개편 불안 대응', '핵심 인재 소진 관리', '공정성과 변화 커뮤니케이션의 증거화'],
    scoreRules: [
      { ruleId: 'hr_week10_choice', type: 'roundChoiceTypeIn', roundId: 'week10', allowedTypes: ['ALIGN', 'STRUCTURE', 'BALANCE'], label: '조직개편 루머 앞에서 확인된 사실과 말할 수 있는 범위를 구분했다.' },
      { ruleId: 'hr_ace_load', type: 'riskAtMost', riskKey: 'aceBurnoutRisk', max: 1, label: '핵심 인재의 소진 신호를 위험 수준으로 키우지 않았다.' },
      { ruleId: 'hr_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week10', 'week11'], minScore: 3, label: '공정성 기준, 사실과 추측의 구분, 직원 불안 대응을 산출물에 충실하게 남겼다.' }
    ]
  },
  finance: {
    missionId: 'mission_finance_balance',
    teamId: 'finance',
    missionTitle: '비용 절감과 투자 균형',
    missionBrief: '비용 절감 압박 속에서도 미래 실행력을 끊지 않는 투자 최소선을 지켜야 한다.',
    successCondition: '경영진 신뢰와 협업 신뢰를 유지하고, 비용과 투자 기준을 증거로 남긴다.',
    criteria: ['비용 절감 기준화', '협업 신뢰 유지', '비용과 투자 효과의 증거화'],
    scoreRules: [
      { ruleId: 'finance_trust', type: 'riskAtMost', riskKey: 'executiveTrustRisk', max: 1, label: '경영진 신뢰 리스크를 감당 가능한 수준으로 관리했다.' },
      { ruleId: 'finance_collaboration', type: 'riskAtMost', riskKey: 'collaborationDebt', max: 1, label: '비용 통제 과정에서 타부서 협업 신뢰를 무너뜨리지 않았다.' },
      { ruleId: 'finance_evidence', type: 'outputEvidenceAtLeast', roundIds: ['week4', 'week11'], minScore: 3, label: '비용 구조, 투자 최소선, 실행 리스크를 산출물에 충실하게 남겼다.' }
    ]
  }
};
