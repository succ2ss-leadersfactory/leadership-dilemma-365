const checklistItems = [
  {
    step: '1. 방 만들기',
    route: '/host/create',
    doneText: 'Host 화면에서 입장 코드가 보입니다.',
    check: '입장 코드와 참가 링크를 강사용 메신저 또는 화면에 공유합니다.'
  },
  {
    step: '2. 참가자 입장',
    route: '/join/{joinCode}',
    doneText: '참가자 이름과 팀이 Host 화면에 표시됩니다.',
    check: '팀 선택이 잘못된 참가자가 없는지 먼저 확인합니다.'
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
    doneText: '개인 선택, 팀 결정, 산출물 저장이 순서대로 남습니다.',
    check: '파일럿 진행 체크리스트의 버튼 순서와 강사 멘트를 따라갑니다.'
  },
  {
    step: '5. 결과 공개',
    route: '/team/{roomId}/{teamId}',
    doneText: '결과 카드에 작은 진전, 남은 부담, 인물 카드 영향이 표시됩니다.',
    check: '결과가 낮은 팀을 실패로 부르지 말고 남은 부담으로 디브리핑합니다.'
  },
  {
    step: '6. Week 12 마무리',
    route: '/player/{roomId}/{playerId}',
    doneText: '개인 성찰과 팀 선언문이 저장됩니다.',
    check: '성찰은 평가가 아니라 다음 현업 행동을 찾는 기록이라고 안내합니다.'
  },
  {
    step: '7. 리포트 다운로드',
    route: '/report/{roomId}',
    doneText: '팀별 결과, 강사용 관찰 요약, 공통 질문이 리포트에 남습니다.',
    check: 'Markdown 다운로드 또는 인쇄/PDF 저장으로 파일럿 기록을 남깁니다.'
  }
];

export default function FinalPilotChecklistPanel({ roomId = '', joinCode = '' }) {
  const fillRoute = route => route.replace('{roomId}', roomId || 'roomId').replace('{joinCode}', joinCode || 'joinCode').replace('{teamId}', 'teamId').replace('{playerId}', 'playerId');
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Final Pilot Checklist</p>
      <h3>파일럿 운영 전 최종 동선 점검표</h3>
      <p className="muted">실제 운영 전에 아래 순서대로 한 번만 따라가면, 참가자 입장부터 리포트 저장까지 핵심 기능을 확인할 수 있습니다.</p>
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
