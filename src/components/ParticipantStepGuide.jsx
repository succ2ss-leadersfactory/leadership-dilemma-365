import '../styles/participantStepGuide.css';

const baseSteps = [
  { id: 'situation', label: '상황 읽기' },
  { id: 'personal', label: '개인 생각' },
  { id: 'discussion', label: '팀 토의' },
  { id: 'teamDecision', label: '팀 결정' },
  { id: 'output', label: '산출물' },
  { id: 'result', label: '결과 확인' },
  { id: 'next', label: '다음 라운드' }
];

const modeCopy = {
  player: {
    eyebrow: '확장 운영용 개인 화면',
    title: '개인별 입력을 사용할 때만 판단을 남깁니다',
    description: '기본 대면 운영은 팀 화면 하나로 진행합니다. 온라인 과정이나 개인 성찰 수집이 필요할 때만 이 화면에서 선택과 이유를 저장합니다.',
    currentLabel: '현재 할 일',
    currentText: '확장 운영용 개인 선택 저장',
    nextLabel: '다음 단계',
    nextText: '팀 화면에서 토의와 최종 결정 진행'
  },
  team: {
    eyebrow: '팀 단일 화면 진행 흐름',
    title: '팀 화면 하나로 토의하고 결정합니다',
    description: '상황을 읽고 각자 1분 동안 선택 방향을 생각합니다. 그다음 팀 안에서 의견을 나누고, 팀 대표가 최종 선택과 산출물을 입력합니다.',
    currentLabel: '현재 할 일',
    currentText: '개인 생각 후 팀 토의',
    nextLabel: '다음 단계',
    nextText: '팀 대표가 최종 선택과 산출물 저장'
  },
  ksa: {
    eyebrow: 'Round 0 진행 흐름',
    title: '팀의 초기 KSA를 먼저 정합니다',
    description: '12주 여정에 들어가기 전, 우리 팀이 중요하게 볼 지식·기술·태도 기준을 팀 토의로 선택합니다.',
    currentLabel: '현재 할 일',
    currentText: 'KSA 각 3개 선택 후 저장',
    nextLabel: '다음 단계',
    nextText: 'Week 1 상황 읽기와 팀 토의'
  },
  reflection: {
    eyebrow: 'Week 12 마무리',
    title: '반복한 판단 습관을 정리합니다',
    description: '최종 판정 전에 내가 반복한 판단 방식과 현업에서 바꿀 행동을 먼저 남깁니다. 기본 운영에서는 강사의 안내에 따라 별도 활동지나 팀 토의로 진행할 수 있습니다.',
    currentLabel: '현재 할 일',
    currentText: '개인 성찰 정리',
    nextLabel: '다음 단계',
    nextText: '팀 선언문 작성과 최종 판정 확인'
  },
  result: {
    eyebrow: '결과 확인 흐름',
    title: '결과를 평가가 아니라 피드백으로 읽습니다',
    description: '이번 선택이 만든 작은 진전과 남은 부담을 확인하고, 다음 라운드에서 관리할 행동을 정합니다.',
    currentLabel: '현재 할 일',
    currentText: '결과 카드 확인',
    nextLabel: '다음 단계',
    nextText: '다음 라운드로 이동'
  }
};

function resolveGuideMode({ mode, roundId, resultVisible }) {
  if (resultVisible) return 'result';
  if (roundId === 'round0') return 'ksa';
  if (roundId === 'week12' && mode === 'player') return 'reflection';
  return mode === 'team' ? 'team' : 'player';
}

function activeStepId(guideMode) {
  if (guideMode === 'ksa') return 'situation';
  if (guideMode === 'player' || guideMode === 'reflection') return 'personal';
  if (guideMode === 'team') return 'discussion';
  if (guideMode === 'result') return 'result';
  return 'situation';
}

export default function ParticipantStepGuide({ mode = 'player', roundId, resultVisible = false }) {
  const guideMode = resolveGuideMode({ mode, roundId, resultVisible });
  const copy = modeCopy[guideMode] || modeCopy.player;
  const active = activeStepId(guideMode);

  return (
    <section className={`card stepGuide stepGuide--${guideMode}`}>
      <div className="stepGuideHeader">
        <div>
          <p className="stepGuideHeader__eyebrow">{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
          <p className="stepGuideHeader__description">{copy.description}</p>
        </div>
        <div className="stepGuideNow">
          <small>{copy.currentLabel}</small>
          <b>{copy.currentText}</b>
          <span><strong>{copy.nextLabel}</strong>{copy.nextText}</span>
        </div>
      </div>
      <ol className="stepGuideList" aria-label="진행 단계">
        {baseSteps.map((step, index) => (
          <li className={step.id === active ? 'active' : ''} aria-current={step.id === active ? 'step' : undefined} key={step.id}>
            <span>{index + 1}</span>
            <b>{step.label}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}
