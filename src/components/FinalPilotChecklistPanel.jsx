const checklistItems = [
  {
    step: '1. 방 만들기',
    route: '/host/create',
    doneText: 'Host 화면에서 입장 코드와 운영 링크가 보입니다.',
    check: '입장 코드는 필요할 때만 공유합니다. 기본 대면 운영에서는 팀별 진행 화면을 먼저 열어 두세요.'
  },
  {
    step: '2. 팀 화면 준비',
    route: '/team/{roomId}/{teamId}',
    doneText: '각 팀이 하나의 화면에서 상황, 선택지, 산출물 입력을 볼 수 있습니다.',
    check: '기본 운영은 팀당 1개 화면입니다. 개인별 링크는 온라인/확장 운영에서만 사용합니다.'
  },
  {
    step: '3. Round 0 KSA 저장',
    route: '/team/{roomId}/{teamId}',
    doneText: '팀별 KSA 9개와 팀원 역량 프로필이 생성됩니다.',
    check: '운영 QA 점검판에서 KSA 완료 팀과 프로필 정상 팀 수를 확인합니다.'
  },
  {
    step: '4. Week 라운드 진행',
    route: '/host/{roomId}',
    doneText: '상황 읽기, 1분 개인 생각, 팀 최종 선택, 산출물 저장이 순서대로 남습니다.',
    check: '강사용 Host 화면의 파일럿 진행 체크리스트를 보며 현재 단계와 버튼 순서를 맞춥니다.'
  },
  {
    step: '5. 결과 계산과 공개',
    route: '/host/{roomId}',
    doneText: '결과 카드에 작은 진전, 남은 부담, 영향도 TOP 3, 누적 부담 흐름이 표시됩니다.',
    check: '결과 공개 전 팀 최종 선택과 산출물이 모두 저장되었는지 확인합니다.'
  },
  {
    step: '6. Week 12 마무리',
    route: '/team/{roomId}/{teamId}',
    doneText: '팀 선언문과 최종 판정이 연결됩니다. 개인 성찰은 필요 시 확장 운영으로 수집합니다.',
    check: '성찰과 선언문은 평가가 아니라 다음 현업 행동을 찾는 기록이라고 안내합니다.'
  },
  {
    step: '7. 리포트 저장',
    route: '/report/{roomId}',
    doneText: '팀별 게이트 판정, 누적 리스크, 영향도, 성찰·선언 피드백이 리포트에 남습니다.',
    check: 'Markdown 다운로드 또는 인쇄/PDF 저장으로 파일럿 기록을 남깁니다.'
  },
  {
    step: '8. 리허설 데이터 정리',
    route: '/admin/{roomId}',
    doneText: '운영 QA 점검판에서 백업, 재계산, 초기화 상태를 확인합니다.',
    check: '초기화 전 JSON 백업을 먼저 다운로드했는지 반드시 확인합니다.'
  }
];

export default function FinalPilotChecklistPanel({ roomId = '', joinCode = '' }) {
  const fillRoute = route => route.replace('{roomId}', roomId || 'roomId').replace('{joinCode}', joinCode || 'joinCode').replace('{teamId}', 'teamId').replace('{playerId}', 'playerId');
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Final Pilot Checklist</p>
      <h3>파일럿 운영 전 최종 동선 점검표</h3>
      <p className="muted">실제 운영 전에 아래 순서대로 한 번만 따라가면, 팀 화면 준비부터 결과 리포트 저장과 데이터 정리까지 핵심 동선을 확인할 수 있습니다.</p>
      <ol>
        {checklistItems.map(item => (
          <li key={item.step}>
            <b>{item.step}</b>
            <p><b>화면:</b> {fillRoute(item.route)}</p>
            <p><b>완료 기준:</b> {item.doneText}</p>
            <p><b>확인 질문:</b> {item.check}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
