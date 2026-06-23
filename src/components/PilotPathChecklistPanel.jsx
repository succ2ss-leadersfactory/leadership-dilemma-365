const pathChecks = [
  {
    code: 'P1',
    title: '방 생성과 Host 진입',
    route: '/host/create → /host/{roomId}',
    action: '방을 만들고 Host 화면으로 이동합니다.',
    expected: '입장 코드, 현재 라운드, 현재 단계, 팀 수, 운영 링크가 보입니다.',
    fix: '방 정보를 찾을 수 없으면 처음 화면에서 새 방을 다시 만들고 브라우저 저장 데이터를 확인합니다.'
  },
  {
    code: 'P2',
    title: '팀 화면과 KSA 저장',
    route: '/team/{roomId}/{teamId}',
    action: '팀 화면에서 Round 0 KSA 9개를 선택하고 저장합니다.',
    expected: 'KSA 저장 완료 메시지가 나오고 Host 화면의 KSA 완료 팀 수가 올라갑니다.',
    fix: 'KSA가 각 영역 3개씩 선택되었는지 확인합니다.'
  },
  {
    code: 'P3',
    title: 'Week 이동과 상황 표시',
    route: '/host/{roomId} → 다음 Week 열기',
    action: 'Host 화면에서 다음 Week를 열고 팀 화면을 확인합니다.',
    expected: 'Week 상황, 전사 공통 상황, 우리 팀에 들어온 신호가 보입니다.',
    fix: '현재 라운드가 round0에 머물러 있으면 Host에서 다음 Week 열기를 다시 누릅니다.'
  },
  {
    code: 'P4',
    title: '팀 최종 선택 저장',
    route: '/team/{roomId}/{teamId}',
    action: '선택지를 고르고 토의 요약을 입력한 뒤 팀 최종 선택을 저장합니다.',
    expected: '저장 메시지가 나오고 Host 팀별 진행 보드에서 팀 결정이 저장 완료로 보입니다.',
    fix: '토의 요약에 합의 기준과 남는 부담을 한 문장 이상 남깁니다.'
  },
  {
    code: 'P5',
    title: '산출물 저장',
    route: '/team/{roomId}/{teamId}',
    action: '산출물 입력 영역에 실행 조건과 확인 시점을 넣고 저장합니다.',
    expected: '산출물 저장 메시지가 나오고 산출물 품질 안내가 생성됩니다.',
    fix: '저장이 되지 않으면 필수 입력과 데이터 보정 상태를 확인합니다.'
  },
  {
    code: 'P6',
    title: '결과 계산 후 공개',
    route: '/host/{roomId}',
    action: 'Host 화면에서 결과 계산 후 공개를 누릅니다.',
    expected: '팀 화면에 결과 카드가 보이고 영향도 TOP 3와 반복 부담 안내가 표시됩니다.',
    fix: '팀 최종 선택과 산출물이 모두 저장되었는지 확인합니다.'
  },
  {
    code: 'P7',
    title: 'Week 12 선언문과 최종 판정',
    route: '/team/{roomId}/{teamId} → /host/{roomId}',
    action: 'Week 12에서 팀 선언문을 저장한 뒤 Host에서 최종 판정을 생성합니다.',
    expected: '최종 판정 카드에 조직개편 생존, 미션, 종합 판정, 선언문 피드백이 보입니다.',
    fix: '최종 게이트가 비어 있으면 Admin에서 전체 재계산과 최종 판정 재생성을 실행합니다.'
  },
  {
    code: 'P8',
    title: '교육 리포트 저장',
    route: '/report/{roomId}',
    action: '교육 리포트에서 인쇄/PDF 저장 또는 Markdown 다운로드를 실행합니다.',
    expected: '팀별 게이트, 누적 리스크, 영향도 TOP 3, 선언문·성찰 피드백이 리포트에 남습니다.',
    fix: '리포트가 비어 있으면 최종 판정 생성 여부와 계산 모델 v2 보정 여부를 확인합니다.'
  },
  {
    code: 'P9',
    title: 'Admin QA와 초기화',
    route: '/admin/{roomId}',
    action: '운영 QA 점검, QA 리포트 다운로드, JSON 백업, 현재 방 초기화를 확인합니다.',
    expected: '확인 필요 항목, 리허설 밸런스 검증, 팀별 운영 점검이 표시됩니다.',
    fix: '초기화 전 JSON 백업을 먼저 내려받습니다.'
  }
];

export default function PilotPathChecklistPanel({ roomId }) {
  const routeText = route => route.replaceAll('{roomId}', roomId || 'roomId').replaceAll('{teamId}', 'teamId');
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Pilot Path Checklist</p>
      <h3>파일럿 직전 기능 동선 점검표</h3>
      <p className="muted">한 팀만으로 먼저 끝까지 진행하면서 핵심 버튼과 화면 전환이 자연스럽게 이어지는지 확인합니다.</p>
      <table>
        <thead><tr><th>코드</th><th>동선</th><th>화면/경로</th><th>실행</th><th>기대 결과</th><th>문제 시 조치</th></tr></thead>
        <tbody>{pathChecks.map(step => <tr key={step.code}><td>{step.code}</td><td>{step.title}</td><td>{routeText(step.route)}</td><td>{step.action}</td><td>{step.expected}</td><td>{step.fix}</td></tr>)}</tbody>
      </table>
      <div className="notice"><b>통과 기준</b><p>P1~P9를 한 팀 기준으로 막힘 없이 통과하면 파일럿 운영을 시작할 수 있습니다.</p></div>
    </section>
  );
}
