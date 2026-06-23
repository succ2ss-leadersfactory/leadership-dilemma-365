import '../styles/participantStepGuide.css';

const baseSteps = [
  { id: 'situation', label: '상황 읽기' },
  { id: 'personal', label: '개인 판단' },
  { id: 'discussion', label: '팀 토의' },
  { id: 'teamDecision', label: '팀 결정' },
  { id: 'output', label: '산출물' },
  { id: 'result', label: '결과 확인' },
  { id: 'next', label: '다음 라운드' }
];

const modeCopy = {
  player: {
    eyebrow: '참여자 진행 흐름',
    title: '먼저 혼자 판단을 남깁니다',
    description: '팀 토의 전에 내가 본 문제와 선택 이유를 짧게 남기는 단계입니다. 이후 팀 화면에서 선택 차이를 보고 함께 결정합니다.',
    currentLabel: '현재 할 일',
    currentText: '개인 선택과 선택 이유 저장',
    nextLabel: '다음 단계',
    nextText: '팀 화면에서 선택 분포 확인 후 토의'
  },
  team: {
    eyebrow: '팀 진행 흐름',
    title: '개인 판단을 모아 팀 결정을 정합니다',
    description: '개인 선택 분포를 확인한 뒤, 우리 팀이 함께 감수할 선택을 정하고 산출물에 다음 행동과 리스크를 남깁니다.',
    currentLabel: '현재 할 일',
    currentText: '팀 최종 선택과 산출물 저장',
    nextLabel: '다음 단계',
    nextText: '결과 카드를 피드백으로 확인'
  },
  ksa: {
    eyebrow: 'Round 0 진행 흐름',
    title: '팀의 초기 KSA를 먼저 정합니다',
    description: '12주 시뮬레이션에 들어가기 전, 우리 팀이 중요하게 볼 지식·기술·태도 기준을 선택합니다.',
    currentLabel: '현재 할 일',
    currentText: 'KSA 각 3개 선택 후 저장',
    nextLabel: '다음 단계',
    nextText: 'Week 1 개인 선택으로 이동'
  },
  reflection: {
    eyebrow: 'Week 12 마무리',
    title: '반복한 판단 습관을 정리합니다',
    description: '최종 판정 전에 내가 반복한 판단 방식과 현업에서 바꿀 행동을 먼저 남깁니다.',
    currentLabel: '현재 할 일',
    currentText: '개인 성찰 저장',
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
  if (guideMode === 'team') return 'teamDecision';
  if (guideMode === 'result') return 'result';
  return 'situation';
}

export default function ParticipantStepGuide({ mode = 'player', roundId, resultVisible = false }) {
  const guideMode = resolveGuideMode({ mode, roundId, resultVisible });
  const copy = modeCopy[guideMode] || modeCopy.player;
  const active = activeStepId(guideMode);

  return (
    <section className="card stepGuide">
      <div className="stepGuideHeader">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
        <div className="stepGuideNow">
          <small>{copy.currentLabel}</small>
          <b>{copy.currentText}</b>
          <span>{copy.nextLabel}: {copy.nextText}</span>
        </div>
      </div>
      <ol className="stepGuideList" aria-label="참여자 진행 단계">
        {baseSteps.map((step, index) => (
          <li className={step.id === active ? 'active' : ''} key={step.id}>
            <span>{index + 1}</span>
            <b>{step.label}</b>
          </li>
        ))}
      </ol>
    </section>
  );
}
