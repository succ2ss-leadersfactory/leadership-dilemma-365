export const seedWeekLogImpacts = {
  log_week2_customer_split: {
    logId: 'log_week2_customer_split',
    rules: [
      {
        ruleId: 'week2_speed_trust_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week1', choiceTypes: ['SPEED'] },
        effect: { riskKey: 'executiveTrustRisk', amount: 1 },
        label: 'Week 2 고객 반응 분화 후폭풍',
        evidence: 'Week 1에서 속도 중심으로 출발해 빠른 반응은 얻었지만, 오래 쌓은 신뢰를 확인하는 부담이 남았습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 고객 신뢰 후폭풍', evidence: '영업팀은 빠른 대응이 고객별 온도 차이를 만들며 핵심 고객 신뢰 부담으로 남았습니다.' },
          marketing: { riskKey: 'collaborationDebt', amount: 1, label: '마케팅팀 메시지 정렬 후폭풍', evidence: '마케팅팀은 고객 반응이 갈라진 원인을 메시지 기준으로 정리하지 못해 협업 부채가 남았습니다.' },
          rnd: { riskKey: 'executiveTrustRisk', amount: 1, label: '연구개발팀 검증 신뢰 후폭풍', evidence: '연구개발팀은 빠른 실험 결과가 장기 품질 기준을 충분히 설명하지 못해 신뢰 부담이 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 납기 압박 후폭풍', evidence: '운영팀은 빠른 대응 이후 품질과 현장 부하를 확인해야 하는 실행 압박이 커졌습니다.' },
          hr: { riskKey: 'growthShrinkRisk', amount: 1, label: 'HR팀 구성원 불안 후폭풍', evidence: 'HR팀은 반응 차이를 구성원 불안의 원인별로 분리하지 못해 성장 위축 신호가 남았습니다.' },
          finance: { riskKey: 'executiveTrustRisk', amount: 1, label: '재무팀 장기 비용 신뢰 후폭풍', evidence: '재무팀은 초기 절감 신호 뒤에 장기 신뢰 비용을 함께 설명해야 하는 부담이 남았습니다.' }
        }
      },
      {
        ruleId: 'week2_align_pressure_aftershock',
        condition: { type: 'roundChoiceTypeIn', roundId: 'week1', choiceTypes: ['ALIGN'] },
        effect: { riskKey: 'executionPressure', amount: 1 },
        label: 'Week 2 실행 지연 압박',
        evidence: 'Week 1에서 상위 기준 확인을 우선해 방향은 맞췄지만, 팀이 체감하는 실행 압박이 뒤로 밀려 남았습니다.',
        teamEffects: {
          sales: { riskKey: 'executionPressure', amount: 1, label: '영업팀 현장 실행 지연', evidence: '영업팀은 상위 기준 확인을 기다리는 동안 현장 고객 대응 속도가 늦어지는 부담이 생겼습니다.' },
          marketing: { riskKey: 'collaborationDebt', amount: 1, label: '마케팅팀 승인 대기 부채', evidence: '마케팅팀은 상위 메시지 확인이 늦어지며 영업·운영과의 협업 부채가 남았습니다.' },
          rnd: { riskKey: 'executionPressure', amount: 1, label: '연구개발팀 실험 지연 압박', evidence: '연구개발팀은 방향 확인을 우선하며 핵심 실험 착수가 늦어지는 압박이 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 납기 지연 압박', evidence: '운영팀은 상위 조건 확인 사이에 납기 대응 여유가 줄어드는 부담이 커졌습니다.' },
          hr: { riskKey: 'executiveTrustRisk', amount: 1, label: 'HR팀 메시지 신뢰 부담', evidence: 'HR팀은 상위 확인을 기다리며 구성원에게 말할 수 있는 기준을 제때 주지 못해 신뢰 부담이 남았습니다.' },
          finance: { riskKey: 'collaborationDebt', amount: 1, label: '재무팀 예산 협의 지연', evidence: '재무팀은 상위 조건 확인을 기다리며 부서별 예산 협의가 늦어지는 협업 부채가 생겼습니다.' }
        }
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
        evidence: '초기 메시지에서 기준과 구성원 납득을 충분히 만들지 못해 비공식 불만이 협업 부채로 남았습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 현장 불만의 고객 전이', evidence: '영업팀은 내부 납득 부족이 고객 응대 톤으로 번지며 신뢰 부담을 키웠습니다.' },
          marketing: { riskKey: 'collaborationDebt', amount: 1, label: '마케팅팀 실행자 납득 부족', evidence: '마케팅팀은 메시지를 만드는 사람과 실행하는 사람 사이의 납득 차이가 협업 부채로 남았습니다.' },
          rnd: { riskKey: 'growthShrinkRisk', amount: 1, label: '연구개발팀 질문 위축', evidence: '연구개발팀은 기준 공유가 부족해 후배들이 질문보다 침묵을 택하는 성장 위축 신호가 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 현장 저항 압박', evidence: '운영팀은 현장 불만이 공정 지연과 품질 실수 가능성으로 이어져 실행 압박이 커졌습니다.' },
          hr: { riskKey: 'growthShrinkRisk', amount: 1, label: 'HR팀 조직 신뢰 위축', evidence: 'HR팀은 비공식 불만을 조직 신뢰 신호로 다루지 못해 성장과 발언 위축이 남았습니다.' },
          finance: { riskKey: 'collaborationDebt', amount: 1, label: '재무팀 비용 통제 납득 부채', evidence: '재무팀은 비용 통제 기준을 충분히 설명하지 못해 타부서 협업 부채가 남았습니다.' }
        }
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
        evidence: '중간 점검에서 활동은 있었지만 증거의 품질이 낮아 경영진 신뢰 리스크가 남았습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 고객 반응 증거 부족', evidence: '영업팀은 방문 횟수보다 고객 반응과 다음 행동 증거가 부족해 신뢰 부담이 남았습니다.' },
          marketing: { riskKey: 'executiveTrustRisk', amount: 1, label: '마케팅팀 메시지 검증 증거 부족', evidence: '마케팅팀은 캠페인 준비보다 메시지 검증 근거가 부족해 경영진 신뢰 부담이 남았습니다.' },
          rnd: { riskKey: 'executiveTrustRisk', amount: 1, label: '연구개발팀 리스크 감소 증거 부족', evidence: '연구개발팀은 기술 검토량보다 리스크가 줄었다는 증거가 약해 신뢰 부담이 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 품질·납기 증거 부족', evidence: '운영팀은 납기 대응의 증거가 약해 품질과 현장 부담을 다시 증명해야 하는 실행 압박이 커졌습니다.' },
          hr: { riskKey: 'executiveTrustRisk', amount: 1, label: 'HR팀 공정성 증거 부족', evidence: 'HR팀은 제도 안내보다 불안과 공정성 기준을 어떻게 다뤘는지 증거가 부족해 신뢰 부담이 남았습니다.' },
          finance: { riskKey: 'executiveTrustRisk', amount: 1, label: '재무팀 절감 기준 증거 부족', evidence: '재무팀은 삭감 규모보다 비용 결정 기준과 납득 구조의 증거가 부족해 신뢰 부담이 남았습니다.' }
        }
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
        evidence: '핵심 인재 부담을 구조적으로 재설계하지 못해, 타부서 협조 지연이 협업 부채로 누적되었습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 승인 지연의 고객 신뢰 부담', evidence: '영업팀은 내부 승인과 자료 지연이 고객 약속의 신뢰 부담으로 번졌습니다.' },
          marketing: { riskKey: 'collaborationDebt', amount: 1, label: '마케팅팀 캠페인 협업 병목', evidence: '마케팅팀은 영업·운영·검토 부서 조건을 맞추지 못해 캠페인 협업 부채가 커졌습니다.' },
          rnd: { riskKey: 'collaborationDebt', amount: 1, label: '연구개발팀 사업부 조건 병목', evidence: '연구개발팀은 품질·운영·사업부 조건과 맞물린 기술 검토 병목이 협업 부채로 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 납기 병목 후폭풍', evidence: '운영팀은 구매·영업·물류 조건이 맞지 않아 현장 실행 압박이 커졌습니다.' },
          hr: { riskKey: 'executiveTrustRisk', amount: 1, label: 'HR팀 경영진 메시지 연결 부담', evidence: 'HR팀은 인사팀 단독 커뮤니케이션으로는 불안을 낮추기 어려워 신뢰 부담이 남았습니다.' },
          finance: { riskKey: 'collaborationDebt', amount: 1, label: '재무팀 예산 조건 협업 부채', evidence: '재무팀은 숫자 통제와 각 부서 실행 조건을 맞추지 못해 협업 부채가 남았습니다.' }
        }
      },
      {
        ruleId: 'week6_unresolved_ace_aftershock',
        condition: { type: 'riskAtLeast', riskKey: 'aceBurnoutRisk', min: 2 },
        effect: { riskKey: 'executionPressure', amount: 1 },
        label: 'Week 6 핵심 인재 의존 후폭풍',
        evidence: '핵심 인재 소진 신호가 남은 상태에서 협업 지연이 겹쳐 실행 압박이 커졌습니다.',
        teamEffects: {
          sales: { riskKey: 'aceBurnoutRisk', amount: 1, label: '영업팀 핵심 담당자 과부하', evidence: '영업팀은 핵심 고객을 아는 담당자에게 승인·자료 대응이 다시 몰리며 소진 위험이 커졌습니다.' },
          marketing: { riskKey: 'aceBurnoutRisk', amount: 1, label: '마케팅팀 메시지 담당자 과부하', evidence: '마케팅팀은 메시지 기준을 아는 담당자에게 캠페인 조율이 다시 몰리며 소진 위험이 커졌습니다.' },
          rnd: { riskKey: 'aceBurnoutRisk', amount: 1, label: '연구개발팀 기술 전문가 과부하', evidence: '연구개발팀은 핵심 기술 판단이 특정 전문가에게 다시 몰리며 소진 위험이 커졌습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 숙련자 공백 압박', evidence: '운영팀은 숙련자 의존이 남은 상태에서 지연이 겹쳐 현장 실행 압박이 커졌습니다.' },
          hr: { riskKey: 'aceBurnoutRisk', amount: 1, label: 'HR팀 민감 이슈 담당자 과부하', evidence: 'HR팀은 민감한 사람 이슈가 특정 담당자에게 계속 몰리며 소진 위험이 커졌습니다.' },
          finance: { riskKey: 'aceBurnoutRisk', amount: 1, label: '재무팀 비용 통제 담당자 과부하', evidence: '재무팀은 비용 통제 경험자에게 협의와 설명이 몰리며 소진 위험이 커졌습니다.' }
        }
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
        evidence: 'TF 후보 논의가 있었지만 원팀 공백을 미리 설계하지 못해, Week 8의 에이스 차출 부담이 커졌습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 고객 담당 공백', evidence: '영업팀은 고객을 가장 잘 아는 사람을 보내며 핵심 고객 대응 신뢰 부담이 커졌습니다.' },
          marketing: { riskKey: 'executionPressure', amount: 1, label: '마케팅팀 캠페인 공백', evidence: '마케팅팀은 메시지 감각이 좋은 사람을 보내며 남은 캠페인 실행 압박이 커졌습니다.' },
          rnd: { riskKey: 'executionPressure', amount: 1, label: '연구개발팀 핵심 과제 공백', evidence: '연구개발팀은 기술 핵심 인력 차출로 핵심 과제 일정 압박이 커졌습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 현장 안정 공백', evidence: '운영팀은 현장 이해도가 높은 인력 차출로 납기와 품질 안정 압박이 커졌습니다.' },
          hr: { riskKey: 'growthShrinkRisk', amount: 1, label: 'HR팀 내부 불안 대응 공백', evidence: 'HR팀은 조직 변화 감각이 있는 인력 차출로 내부 불안 대응과 발언 위축 부담이 커졌습니다.' },
          finance: { riskKey: 'collaborationDebt', amount: 1, label: '재무팀 예산 통제 공백', evidence: '재무팀은 비용 구조를 아는 인력 차출로 예산 협의와 통제의 협업 부채가 커졌습니다.' }
        }
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
        evidence: '경쟁팀 성과 보고 이후 조급함이 커졌고, 루머 국면에서도 성과 속도를 우선하며 실행 압박이 남았습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 조급한 고객 대응', evidence: '영업팀은 경쟁팀 성과를 따라가려다 핵심 고객 신뢰를 놓칠 부담이 커졌습니다.' },
          marketing: { riskKey: 'executionPressure', amount: 1, label: '마케팅팀 캠페인 속도 압박', evidence: '마케팅팀은 경쟁팀 캠페인 속도에 반응하며 메시지 검증보다 실행 압박이 커졌습니다.' },
          rnd: { riskKey: 'executiveTrustRisk', amount: 1, label: '연구개발팀 기술 기준 흔들림', evidence: '연구개발팀은 비교 압박 속에 기술 기준을 낮출 유혹이 커지며 신뢰 부담이 남았습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 개선 속도 압박', evidence: '운영팀은 다른 팀 개선 속도를 따라가려다 현장 부담과 품질 경고를 키울 압박이 남았습니다.' },
          hr: { riskKey: 'growthShrinkRisk', amount: 1, label: 'HR팀 공정성 기준 흔들림', evidence: 'HR팀은 경쟁 압박 속에서도 공정성 기준을 지켜야 하는 부담이 성장 위축 신호로 남았습니다.' },
          finance: { riskKey: 'executiveTrustRisk', amount: 1, label: '재무팀 절감 성과 비교 부담', evidence: '재무팀은 절감액 비교에 반응하며 투자 최소선 기준을 설명해야 하는 신뢰 부담이 커졌습니다.' }
        }
      },
      {
        ruleId: 'week9_collaboration_debt_aftershock',
        condition: { type: 'riskAtLeast', riskKey: 'collaborationDebt', min: 2 },
        effect: { riskKey: 'executiveTrustRisk', amount: 1 },
        label: 'Week 9 비교 압박 속 협업 부채',
        evidence: '이미 협업 부채가 높은 상태에서 경쟁 압박이 더해져 경영진 신뢰 리스크로 번졌습니다.',
        teamEffects: {
          sales: { riskKey: 'executiveTrustRisk', amount: 1, label: '영업팀 협업 부채의 고객 신뢰 전이', evidence: '영업팀은 내부 협업 부채가 고객 약속의 신뢰 부담으로 번졌습니다.' },
          marketing: { riskKey: 'executiveTrustRisk', amount: 1, label: '마케팅팀 메시지 혼선 신뢰 부담', evidence: '마케팅팀은 협업 부채가 메시지 혼선으로 드러나 경영진 신뢰 부담이 커졌습니다.' },
          rnd: { riskKey: 'executionPressure', amount: 1, label: '연구개발팀 협업 부채의 일정 압박', evidence: '연구개발팀은 협업 부채가 핵심 과제 일정 압박으로 번졌습니다.' },
          operations: { riskKey: 'executionPressure', amount: 1, label: '운영팀 협업 부채의 납기 압박', evidence: '운영팀은 협업 부채가 납기와 품질 안정 압박으로 번졌습니다.' },
          hr: { riskKey: 'executiveTrustRisk', amount: 1, label: 'HR팀 협업 부채의 메시지 신뢰 부담', evidence: 'HR팀은 협업 부채가 경영진 메시지와 현장 납득 사이의 신뢰 부담으로 번졌습니다.' },
          finance: { riskKey: 'collaborationDebt', amount: 1, label: '재무팀 협업 부채의 누적', evidence: '재무팀은 예산 조건 협의가 풀리지 않아 협업 부채가 한 번 더 누적되었습니다.' }
        }
      }
    ]
  }
};
