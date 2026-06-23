const operationSteps = [
  {
    title: '1. 운영 전 준비',
    screen: 'Host 화면 · Admin 운영 도구',
    action: '새 방을 만들고 팀 화면 링크를 미리 열어 둡니다. 리허설 데이터가 남아 있으면 JSON 백업 후 현재 방 진행 데이터를 초기화합니다.',
    buttons: ['JSON 백업 다운로드', '현재 방 진행 데이터 초기화', '팀 화면 열기'],
    check: '팀당 1개 화면이 열려 있고, 강사용 Host 화면과 Admin 운영 도구를 별도 탭에 준비합니다.'
  },
  {
    title: '2. Round 0 시작',
    screen: '팀 화면',
    action: '각 팀이 KSA 9개를 고릅니다. KSA가 저장되면 팀원 초기 역량 프로필과 인물 카드가 생성됩니다.',
    buttons: ['KSA 저장', 'Week 1 시작하기'],
    check: 'Host 화면에서 KSA 완료 팀 수를 확인하고, 모두 준비된 뒤 Week 1을 엽니다.'
  },
  {
    title: '3. Week 1~11 반복 운영',
    screen: '팀 화면 · Host 화면',
    action: '상황 읽기 → 1분 개인 생각 → 팀 토의 → 팀 최종 선택 저장 → 산출물 저장 → 결과 계산 후 공개 순서로 진행합니다.',
    buttons: ['현재 라운드 다음 단계', '팀 최종 선택 저장', '산출물 저장', '결과 계산 후 공개', '다음 Week 열기'],
    check: '결과 공개 전에는 팀 최종 선택과 산출물이 모두 저장되었는지 확인합니다.'
  },
  {
    title: '4. Week 12 마무리',
    screen: '팀 화면 · 선택 시 개인 화면',
    action: '개인 성찰은 선택 운영으로 진행하고, 팀 선언문은 반드시 저장합니다. 선언문에는 지킬 기준, 멈출 습관, 다음 행동, 첫 확인 시점, 남는 부담이 보여야 합니다.',
    buttons: ['개인 성찰 저장하기', '팀 선언문 저장', '최종 판정 생성'],
    check: '최종 판정은 팀 선언문 저장 뒤 생성하는 흐름을 권장합니다.'
  },
  {
    title: '5. 리포트 저장',
    screen: '교육 리포트',
    action: '팀별 게이트 판정, 누적 리스크, 영향도 TOP 3, 선언문·성찰 피드백을 확인하고 파일로 남깁니다.',
    buttons: ['인쇄 / PDF 저장', 'Markdown 다운로드'],
    check: '교육 종료 후 강사용 디브리핑 기록과 사후 개선 메모로 활용합니다.'
  },
  {
    title: '6. 리허설·QA·초기화',
    screen: 'Admin 운영 도구',
    action: '리허설 샘플 4종을 생성해 판정 분포를 확인합니다. 오래된 데이터는 v2 보정 후 전체 재계산합니다.',
    buttons: ['리허설 샘플 생성', '계산 모델 v2 데이터 보정', '전체 재계산 + 최종 판정 재생성', 'QA 리포트 다운로드'],
    check: '초기화 전에는 반드시 JSON 백업을 먼저 다운로드합니다.'
  }
];

const troubleItems = [
  {
    symptom: '팀 화면에 결과가 보이지 않음',
    cause: '팀 최종 선택 또는 산출물이 저장되지 않았거나 결과 공개 전입니다.',
    action: 'Host 화면의 팀별 진행 보드에서 팀 결정·산출물·결과 상태를 확인한 뒤 “결과 계산 후 공개”를 누릅니다.'
  },
  {
    symptom: '리포트에 최종 게이트가 비어 있음',
    cause: 'Week 12 최종 판정이 아직 생성되지 않았거나 이전 데이터입니다.',
    action: '팀 선언문 저장 상태를 확인한 뒤 Host 또는 Admin에서 최종 판정을 다시 생성합니다.'
  },
  {
    symptom: '누적 리스크·영향도 TOP 3가 없음',
    cause: '이전 계산 모델로 만들어진 방 데이터일 수 있습니다.',
    action: 'Admin 운영 도구에서 “계산 모델 v2 데이터 보정” 후 “전체 재계산 + 최종 판정 재생성”을 실행합니다.'
  },
  {
    symptom: '모바일에서 표가 길게 보임',
    cause: '리포트와 QA 표는 정보량이 많아 가로 스크롤이 필요합니다.',
    action: '진행 중에는 팀 화면 중심으로 운영하고, 리포트·QA는 노트북 또는 태블릿 가로 모드에서 확인합니다.'
  },
  {
    symptom: '리허설 샘플 결과가 모두 비슷함',
    cause: '선택 패턴이나 품질 설정이 한쪽으로 치우쳤을 수 있습니다.',
    action: 'Admin의 리허설 밸런스 검증에서 기대 범위와 팀별 실제 결과를 확인합니다.'
  }
];

export default function FinalOperationGuidePanel({ roomId }) {
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Final Operation Guide</p>
      <h3>파일럿 운영용 최종 사용 가이드</h3>
      <p className="muted">이 가이드는 실제 강사가 운영 중 바로 따라갈 수 있도록 버튼 순서와 확인 기준을 정리한 요약본입니다. 참가자에게는 산식이나 내부 판정 기준을 설명하지 말고, 선택 기준·남은 부담·다음 행동으로 바꿔 안내합니다.</p>
      <div className="grid2">
        {operationSteps.map(step => (
          <div className="reportInsight" key={step.title}>
            <h4>{step.title}</h4>
            <p><b>화면:</b> {step.screen}</p>
            <p><b>운영 행동:</b> {step.action}</p>
            <p><b>버튼 순서:</b> {step.buttons.join(' → ')}</p>
            <p><b>완료 확인:</b> {step.check}</p>
          </div>
        ))}
      </div>
      <div className="notice">
        <b>운영 원칙</b>
        <p>기본 운영은 팀당 1개 화면입니다. 개인 화면은 온라인·확장 운영에서만 사용하고, 대면 파일럿에서는 팀 대표가 최종 선택·토의 요약·산출물을 입력합니다.</p>
      </div>
      <h4>문제 발생 시 조치</h4>
      <table>
        <thead><tr><th>상황</th><th>가능한 원인</th><th>조치</th></tr></thead>
        <tbody>
          {troubleItems.map(item => <tr key={item.symptom}><td>{item.symptom}</td><td>{item.cause}</td><td>{item.action}</td></tr>)}
        </tbody>
      </table>
      {roomId && <p className="muted">빠른 이동: /host/{roomId} · /admin/{roomId} · /report/{roomId}</p>}
    </section>
  );
}
