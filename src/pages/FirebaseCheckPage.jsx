import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { getFirebaseEnvStatus } from '../services/firebaseClient';
import { runFirebaseConnectionCheck } from '../services/firebaseHealthService';

function statusLabel(result) {
  if (!result) return '대기';
  return result.ok ? '정상' : '확인 필요';
}

export default function FirebaseCheckPage() {
  const { roomId } = useParams();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const envStatus = getFirebaseEnvStatus();

  async function handleCheck() {
    setChecking(true);
    const nextResult = await runFirebaseConnectionCheck({ roomId });
    setResult(nextResult);
    setChecking(false);
  }

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">FIREBASE CONNECTION</p>
        <h2>Firebase 연결 확인</h2>
        <p>이 화면은 Vercel 환경변수가 정상 반영되었는지, Firestore에 테스트 문서를 쓰고 다시 읽을 수 있는지 확인합니다.</p>
        <div className="summaryCards">
          <div><b>{envStatus.ready ? '준비됨' : '누락'}</b><span>환경변수</span></div>
          <div><b>{envStatus.projectId || '-'}</b><span>Project ID</span></div>
          <div><b>{statusLabel(result)}</b><span>Firestore 테스트</span></div>
          <div><b>{roomId || '공통'}</b><span>방 ID</span></div>
        </div>
        <div className="actions">
          <button className="primary" onClick={handleCheck} disabled={checking}>{checking ? '확인 중...' : 'Firestore 연결 테스트'}</button>
          {roomId && <Link className="secondary" to={`/admin/${roomId}`}>관리자 운영 도구로 돌아가기</Link>}
          {roomId && <Link className="secondary" to={`/host/${roomId}`}>Host 화면으로 돌아가기</Link>}
          <Link className="secondary" to="/">처음 화면</Link>
        </div>
      </section>

      <section className="card">
        <h3>환경변수 인식 상태</h3>
        <table>
          <thead><tr><th>항목</th><th>상태</th><th>값</th></tr></thead>
          <tbody>
            <tr><td>apiKey</td><td>{envStatus.configuredKeys.includes('apiKey') ? '있음' : '누락'}</td><td>{envStatus.configuredKeys.includes('apiKey') ? '설정됨' : '-'}</td></tr>
            <tr><td>authDomain</td><td>{envStatus.authDomain ? '있음' : '누락'}</td><td>{envStatus.authDomain || '-'}</td></tr>
            <tr><td>projectId</td><td>{envStatus.projectId ? '있음' : '누락'}</td><td>{envStatus.projectId || '-'}</td></tr>
            <tr><td>storageBucket</td><td>{envStatus.configuredKeys.includes('storageBucket') ? '있음' : '누락'}</td><td>{envStatus.configuredKeys.includes('storageBucket') ? '설정됨' : '-'}</td></tr>
            <tr><td>messagingSenderId</td><td>{envStatus.configuredKeys.includes('messagingSenderId') ? '있음' : '누락'}</td><td>{envStatus.configuredKeys.includes('messagingSenderId') ? '설정됨' : '-'}</td></tr>
            <tr><td>appId</td><td>{envStatus.configuredKeys.includes('appId') ? '있음' : '누락'}</td><td>{envStatus.configuredKeys.includes('appId') ? '설정됨' : '-'}</td></tr>
            <tr><td>measurementId</td><td>{envStatus.hasMeasurementId ? '있음' : '선택 항목'}</td><td>{envStatus.hasMeasurementId ? '설정됨' : '-'}</td></tr>
          </tbody>
        </table>
        {envStatus.missingKeys.length > 0 && (
          <div className="facilitatorOnlyNotice">
            <b>환경변수 확인 필요</b>
            <p>Vercel Settings → Environment Variables에서 누락 항목을 추가한 뒤 Redeploy를 실행하세요: {envStatus.missingKeys.join(', ')}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Firestore 테스트 결과</h3>
        {!result && <p className="muted">아직 테스트를 실행하지 않았습니다. 위의 “Firestore 연결 테스트” 버튼을 누르세요.</p>}
        {result && (
          <div className={result.ok ? 'notice' : 'facilitatorOnlyNotice'}>
            <b>{result.ok ? '연결 성공' : '연결 확인 필요'}</b>
            <p>{result.message}</p>
            {result.checkId && <p><b>테스트 문서 ID:</b> {result.checkId}</p>}
            <p><b>확인 단계:</b> {result.step}</p>
          </div>
        )}
        <p className="muted">테스트가 성공하면 Firebase 콘솔의 Firestore 데이터 탭에 firebaseHealthChecks 컬렉션이 생깁니다.</p>
      </section>

      <section className="card">
        <h3>다음 개발 단계</h3>
        <ol>
          <li>Firebase 연결 성공 확인</li>
          <li>팀별 Team 화면의 대표 입력 데이터를 Firestore에 저장</li>
          <li>같은 팀 화면을 연 팀원들에게 대표 입력 내용을 실시간 반영</li>
          <li>Host 화면에 팀별 저장 상태를 실시간 반영</li>
        </ol>
      </section>
    </Layout>
  );
}
