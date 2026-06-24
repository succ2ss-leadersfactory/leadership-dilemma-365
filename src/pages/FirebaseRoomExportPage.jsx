import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { readDb } from '../services/storage';
import { buildFirestoreExportPlan, exportRoomToFirestore } from '../services/firebaseRoomExportService';

export default function FirebaseRoomExportPage() {
  const { roomId } = useParams();
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState(null);
  const db = readDb();
  const room = db.rooms?.[roomId];
  const plan = buildFirestoreExportPlan(room);

  async function handleExport() {
    if (!room) return;
    if (!window.confirm('현재 브라우저에 저장된 이 방 데이터를 Firestore로 내보냅니다. 기존 Firestore 문서는 같은 ID 기준으로 병합됩니다. 계속하시겠습니까?')) return;
    setExporting(true);
    const nextResult = await exportRoomToFirestore(room);
    setResult(nextResult);
    setExporting(false);
  }

  if (!room) {
    return (
      <Layout roomId={roomId}>
        <section className="card hero">
          <p className="eyebrow">FIREBASE EXPORT</p>
          <h2>방 데이터를 찾을 수 없습니다</h2>
          <p>현재 브라우저 localStorage에 이 방 데이터가 없습니다. Host 화면에서 방을 먼저 열어 주세요.</p>
          <div className="actions">
            <Link className="secondary" to="/">처음 화면</Link>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">FIREBASE EXPORT</p>
        <h2>현재 방 Firebase 내보내기</h2>
        <p>현재 브라우저에 저장된 방 데이터를 Firestore의 rooms/{roomId} 구조로 내보냅니다. 기존 localStorage 운영 데이터는 그대로 유지됩니다.</p>
        <div className="summaryCards">
          <div><b>{roomId}</b><span>방 ID</span></div>
          <div><b>{room.joinCode || '-'}</b><span>입장 코드</span></div>
          <div><b>{Object.keys(room.teams || {}).length}</b><span>팀</span></div>
          <div><b>{Object.keys(room.teamDecisions || {}).length}</b><span>팀 결정</span></div>
          <div><b>{Object.keys(room.submissions || {}).length}</b><span>산출물</span></div>
          <div><b>{Object.keys(room.finalResults || {}).length}</b><span>최종 판정</span></div>
        </div>
        <div className="actions">
          <button className="primary" onClick={handleExport} disabled={exporting}>{exporting ? '내보내는 중...' : '현재 방 Firebase로 내보내기'}</button>
          <Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link>
          <Link className="secondary" to={`/admin/${roomId}`}>관리자 운영 도구</Link>
          <Link className="secondary" to={`/host/${roomId}`}>Host 화면</Link>
        </div>
      </section>

      <section className="card">
        <h3>생성될 Firestore 구조</h3>
        <p className="muted">내보내기를 실행하면 아래 문서와 하위 컬렉션이 생성됩니다.</p>
        <table>
          <thead><tr><th>경로</th><th>문서 수</th><th>역할</th></tr></thead>
          <tbody>
            <tr><td>{plan.rootDocument}</td><td>1</td><td>방 메타, 진행 상태, 데이터 수량</td></tr>
            {plan.collections.map(item => (
              <tr key={item.name}>
                <td>{plan.rootDocument}/{item.name}</td>
                <td>{item.count}</td>
                <td>{item.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>내보내기 결과</h3>
        {!result && <p className="muted">아직 내보내기를 실행하지 않았습니다.</p>}
        {result && (
          <div className={result.ok ? 'notice' : 'facilitatorOnlyNotice'}>
            <b>{result.ok ? '내보내기 성공' : '내보내기 확인 필요'}</b>
            <p>{result.message}</p>
            {result.rootDocument && <p><b>루트 문서:</b> {result.rootDocument}</p>}
            {result.writtenCollections && (
              <ul>
                {Object.entries(result.writtenCollections).map(([name, count]) => <li key={name}>{name}: {count}건</li>)}
              </ul>
            )}
          </div>
        )}
        <p className="muted">성공 후 Firebase 콘솔 Firestore 데이터 탭에서 rooms 컬렉션과 현재 방 문서를 확인하세요.</p>
      </section>

      <section className="card">
        <h3>주의 사항</h3>
        <ul>
          <li>이번 기능은 현재 방 데이터를 Firestore에 복사하는 1차 내보내기입니다.</li>
          <li>아직 팀 화면과 Host 화면이 Firestore를 실시간 구독하는 단계는 아닙니다.</li>
          <li>다음 개발 단계에서 팀 대표 입력을 Firestore에 저장하고, 같은 팀원 화면에 실시간 반영합니다.</li>
        </ul>
      </section>
    </Layout>
  );
}
