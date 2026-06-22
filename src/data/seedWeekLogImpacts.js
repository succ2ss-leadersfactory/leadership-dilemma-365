export const seedWeekLogImpacts = {
  log_week2_customer_split: {
    logId: 'log_week2_customer_split',
    rules: [
      {
        ruleId: 'week2_speed_trust_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week1', choiceTypes: ['SPEED'] },
        effect: { riskKey: 'executiveTrustRisk', amount: 1 },
        label: 'Week 2 고객 반응 분화 후폭풍',
        evidence: 'Week 1에서 속도 중심으로 출발해 빠른 반응은 얻었지만, 오래 쌓은 신뢰를 확인하는 부담이 남았습니다.'
      },
      {
        ruleId: 'week2_align_pressure_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week1', choiceTypes: ['ALIGN'] },
        effect: { riskKey: 'executionPressure', amount: 1 },
        label: 'Week 2 실행 지연 압박',
        evidence: 'Week 1에서 상위 기준 확인을 우선해 방향은 맞췄지만, 팀이 체감하는 실행 압박이 뒤로 밀려 남았습니다.'
      }
    ]
  },
  log_week3_chat_spread: {
    logId: 'log_week3_chat_spread',
    rules: [
      {
        ruleId: 'week3_low_buyin_aftershock',
        condition: { type: 'roundChoiceTypeNotIn', roundId: 'week1', choiceTypes: ['STRUCTURE', 'BALANCE'] },
        effect: { riskKey: 'collaborationDebt', amount: 1 },
        label: 'Week 3 납득 부족 후폭풍',
        evidence: '초기 메시지에서 기준과 구성원 납득을 충분히 만들지 못해 비공식 불만이 협업 부채로 남았습니다.'
      }
    ]
  },
  log_week4_mid_check: {
    logId: 'log_week4_mid_check',
    rules: [
      {
        ruleId: 'week4_low_output_aftershock',
        condition: { type: 'outputQualityAtMost', roundId: 'week1', maxQuality: 'low' },
        effect: { riskKey: 'executiveTrustRisk', amount: 1 },
        label: 'Week 4 증거 부족 후폭풍',
        evidence: '중간 점검에서 활동은 있었지만 증거의 품질이 낮아 경영진 신뢰 리스크가 남았습니다.'
      }
    ]
  },
  log_week6_cross_delay: {
    logId: 'log_week6_cross_delay',
    rules: [
      {
        ruleId: 'week6_speed_reallocation_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week5', choiceTypes: ['SPEED'] },
        effect: { riskKey: 'collaborationDebt', amount: 1 },
        label: 'Week 6 협업 조건 미정리 후폭풍',
        evidence: '핵심 인재 부담을 구조적으로 재설계하지 못해, 타부서 협조 지연이 협업 부채로 누적되었습니다.'
      },
      {
        ruleId: 'week6_unresolved_ace_aftershock',
        condition: { type: 'riskAtLeast', riskKey: 'aceBurnoutRisk', min: 2 },
        effect: { riskKey: 'executionPressure', amount: 1 },
        label: 'Week 6 핵심 인재 의존 후폭풍',
        evidence: '핵심 인재 소진 신호가 남은 상태에서 협업 지연이 겹쳐 실행 압박이 커졌습니다.'
      }
    ]
  },
  log_week7_tf_name: {
    logId: 'log_week7_tf_name',
    rules: [
      {
        ruleId: 'week7_tf_ace_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week8', choiceTypes: ['SPEED'] },
        effect: { riskKey: 'aceBurnoutRisk', amount: 1 },
        label: 'Week 7 TF 예고 후속 공백',
        evidence: 'TF 후보 논의가 있었지만 원팀 공백을 미리 설계하지 못해, Week 8의 에이스 차출 부담이 커졌습니다.'
      }
    ]
  },
  log_week9_competitor_report: {
    logId: 'log_week9_competitor_report',
    rules: [
      {
        ruleId: 'week9_competition_speed_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week10', choiceTypes: ['SPEED'] },
        effect: { riskKey: 'executionPressure', amount: 1 },
        label: 'Week 9 경쟁 압박 후폭풍',
        evidence: '경쟁팀 성과 보고 이후 조급함이 커졌고, 루머 국면에서도 성과 속도를 우선하며 실행 압박이 남았습니다.'
      },
      {
        ruleId: 'week9_collaboration_debt_aftershock',
        condition: { type: 'riskAtLeast', riskKey: 'collaborationDebt', min: 2 },
        effect: { riskKey: 'executiveTrustRisk', amount: 1 },
        label: 'Week 9 비교 압박 속 협업 부채',
        evidence: '이미 협업 부채가 높은 상태에서 경쟁 압박이 더해져 경영진 신뢰 리스크로 번졌습니다.'
      }
    ]
  }
};
