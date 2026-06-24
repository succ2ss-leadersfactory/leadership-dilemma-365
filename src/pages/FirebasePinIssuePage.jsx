import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { readDb } from '../services/storage';
import { issueRepresentativePins, subscribeRepresentativePins } from '../services/firebaseRepresentativePinService';

export default function FirebasePinIssuePage() {
  const { roomId } = useParams();
  const [pinDocs, setPinDocs] = useState({});
  const [msg, setMsg] = useState('');
  const [issuing, setIssuing] = useState(false);
  const db = readDb();
  const room = db.rooms?.[roomId];
  const teams = Object.values(room?.teams || {});

  useEffect(() => {
    if (!roomId || teams.length === 0) return undefined;
    return subscribeRepresentativePins({
      roomId,
      teamIds: teams.map(team => team.teamId),
      onChange: setPinDocs,
      onError: error => setMsg(`PIN 상태 확인 필요: ${error.message}`)
    });
  }, [roomId, teams.length]);

  async function handleIssuePins() {
    if (!room) {
      setMsg('현재 브라우저에 방 데이터가 없습니다. 먼저 Host 화면에서 방을 열어 주세요.');
      return;
    }
    if (!window.confirm('팀별 대표 PIN을 새로 생성합니다. 기존 PIN이 있다면 새 PIN으로 바뀝니다. 계속하시겠습니까?')) return;
    setIssuing(true);
    const result = await issueRepresentativePins({ roomId, teams, force: true });
    setMsg(result.message);
    setIssuing(false);
  }

  if (!room) {
    return (
      <Layout roomId={roomId}>
        <section className="card hero">
          <p className="eyebrow">FIREBASE REPRESENTATIVE PIN</p>
          <h2>방 데이터를 찾을 수 없습니다</h2>
          <p>이 PIN 발급 화면은 현재 브라우저에 저장된 방 정보를 기준으로 팀 목록을 가져옵니다. 먼저 같은 브라우저에서 Host 화면을 열어 주세요.</p>
          <div className="actions"><Link className="secondary" to="/">처음 화면</Link></div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">FIREBASE REPRESENTATIVE PIN</p>
        <h2>팀대표 PIN 발급</h2>
        <p>Firebase 팀 화면에서 팀대표만 입력할 수 있도록 팀별 4자리 PIN을 생성합니다. 생성된 PIN은 강사가 각 팀 대표에게만 안내합니다.</p>
        <div className="summaryCards">
          <div><b>{roomId}</b><span>방 ID</span></div>
          <div><b>{teams.length}</b><span>팀 수</span></div>
          <div><b>{Object.values(pinDocs).filter(doc => doc?.representativePin).length}</b><span>PIN 발급</span></div>
        </div>
        {msg && <div className="notice">{msg}</div>}
        <div className="actions">
          <button className="primary" onClick={handleIssuePins} disabled={issuing}>{issuing ? '발급 중...' : '팀별 대표 PIN 생성/재생성'}</button>
          <Link className="secondary" to={`/host/${roomId}`}>Host 화면</Link>
          <Link className="secondary" to={`/firebase-export/${roomId}`}>Firebase 내보내기</Link>
          <Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link>
        </div>
      </section>

      <section className="card">
        <h3>팀별 대표 PIN 목록</h3>
        <p className="muted">이 표는 강사용입니다. 각 팀 대표에게 자기 팀 PIN만 안내하세요.</p>
        <table>
          <thead><tr><th>팀</th><th>팀 ID</th><th>대표 PIN</th><th>대표 이름</th><th>Firebase 팀 화면</th></tr></thead>
          <tbody>
            {teams.map(team => {
              const pinDoc = pinDocs[team.teamId] || {};
              return (
                <tr key={team.teamId}>
                  <td>{team.teamName}</td>
                  <td>{team.teamId}</td>
                  <td><b className="code">{pinDoc.representativePin || '미발급'}</b></td>
                  <td>{pinDoc.representativeName || '미등록'}</td>
                  <td><Link to={`/firebase-team/${roomId}/${team.teamId}`}>열기</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>운영 안내 문구</h3>
        <div className="reportInsight">
          <p>각 팀은 같은 Firebase 팀 화면 링크로 접속합니다. 팀원은 보기 모드로 참여하고, 팀대표는 강사가 안내한 PIN을 입력해 대표 입력 모드로 전환합니다. 저장은 팀대표 1명만 진행합니다.</p>
        </div>
      </section>
    </Layout>
  );
}
