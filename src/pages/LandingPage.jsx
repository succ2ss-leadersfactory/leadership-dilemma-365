import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';

export default function LandingPage() {
  return (
    <Layout>
      <section className="card hero">
        <p className="eyebrow">Leadership Decision Journey</p>
        <h1>리더십 딜레마 365: 위기의 12주</h1>
        <p>조직개편 심사까지 12주, 팀의 판단이 생존을 결정합니다. 이 앱은 정답 맞히기 게임이 아니라, 팀의 선택 기준과 남은 부담을 드러내는 교육용 시뮬레이션입니다.</p>
        <div className="actions">
          <Link className="primary" to="/host/create">Host로 시작</Link>
          <Link className="secondary" to="/join/DEMO">입장 코드로 참가</Link>
        </div>
      </section>

      <section className="grid2">
        <div className="card">
          <h3>교육 운영 흐름</h3>
          <ol>
            <li>Host가 방을 만들고 입장 코드를 공유합니다.</li>
            <li>팀별 KSA를 선택하고 Week 1로 이동합니다.</li>
            <li>개인 선택과 팀 최종 결정을 진행합니다.</li>
            <li>결과 카드를 보며 판단의 대가를 토론합니다.</li>
            <li>Week 12에서 개인 성찰과 팀 선언문을 작성합니다.</li>
            <li>최종 판정과 교육 리포트로 마무리합니다.</li>
          </ol>
        </div>
        <div className="card">
          <h3>핵심 기능</h3>
          <ul>
            <li>팀별 12주 판단 여정</li>
            <li>결과 카드와 상태 리스크 표시</li>
            <li>강사용 진행 가이드</li>
            <li>다팀 비교와 교육 리포트</li>
            <li>Markdown 다운로드와 PDF 저장</li>
            <li>운영 화면의 샘플 생성, 백업, 가져오기</li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h3>권장 테스트 순서</h3>
        <p className="muted">처음 확인할 때는 Host로 방을 만든 뒤, 운영 화면에서 6팀 샘플 데이터를 생성하고 리포트와 다팀 비교 화면을 먼저 확인하세요.</p>
        <div className="actions"><Link className="secondary" to="/host/create">새 방 만들기</Link></div>
      </section>
    </Layout>
  );
}
