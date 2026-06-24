import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { readDb } from '../services/storage';
import { canUseFirebaseHostStatus, subscribeFirebaseHostStatus } from '../services/firebaseHostStatusService';

function isKsaComplete(selectedKSA) {
  return selectedKSA?.knowledge?.length === 3 && selectedKSA?.skill?.length === 3 && selectedKSA?.attitude?.length === 3;
}

function statusText(done) {
  return done ? '완료' : '대기';
}

function docFor(map, roundId, teamId) {
  return map?.[`${roundId}_${teamId}`] || null;
}

export default function FirebaseHostStatusPage() {
  const { roomId } = useParams();
  const [status, setStatus] = useState({ room: null, teams: {}, teamDecisions: {}, submissions: {}, declarations: {}, finalResults: {}, roundCalculations: {} });
  const [msg, setMsg] = useState('');
  const db = readDb();
  const localRoom = db.rooms?.[roomId];
  const localTeams = useMemo(() => Object.values(localRoom?.teams || {}), [localRoom]);
  const teams = localTeams.length ? localTeams : Object.values(status.teams || {});
  const currentRoundId = status.room?.roomProgress?.currentRoundId || localRoom?.roomProgress?.currentRoundId || 'round0';
  const canUseFirebase = canUseFirebaseHostStatus();

  useEffect(() => {
    if (!canUseFirebase || !roomId) return undefined;
    setMsg('Firebase 운영 상태를 연결하고 있습니다.');
    return subscribeFirebaseHostStatus({
      roomId,
      onChange: data => {
        setStatus(data);
        setMsg('Firebase 운영 상태가 연결되었습니다.');
      },
      onError: error => setMsg(`Firebase 상태 확인 필요: ${error.message}`)
    });
  }, [canUseFirebase, roomId]);

  const rows = teams.map(team => {
    const firebaseTeam = status.teams?.[team.teamId] || status.teams?.[team.firebaseDocId] || {};
    const decision = docFor(status.teamDecisions, currentRoundId, team.teamId);
    const submission = docFor(status.submissions, currentRoundId, team.teamId);
    const calculation = docFor(status.roundCalculations, currentRoundId, team.teamId);
    const declaration = status.declarations?.[team.teamId];
    const finalResult = status.finalResults?.[team.teamId];
    return {
      teamId: team.teamId,
      teamName: team.teamName || firebaseTeam.teamName || team.teamId,
      pinIssued: Boolean(firebaseTeam.representativePin),
      representativeName: firebaseTeam.representativeName || '',
      ksaDone: isKsaComplete(firebaseTeam.selectedKSA || team.selectedKSA),
      decisionDone: Boolean(decision?.finalChoiceId),
      submissionDone: Boolean(submission?.answers),
      calculationDone: Boolean(calculation),
      declarationDone: Boolean(declaration?.teamDeclaration),
      finalDone: Boolean(finalResult)
    };
  });

  const counts = {
    pins: rows.filter(row => row.pinIssued).length,
    ksa: rows.filter(row => row.ksaDone).length,
    decisions: rows.filter(row => row.decisionDone).length,
    submissions: rows.filter(row => row.submissionDone).length,
    declarations: rows.filter(row => row.declarationDone).length,
    finals: rows.filter(row => row.finalDone).length
  };

  if (!canUseFirebase) {
    return (
      <Layout roomId={roomId}>
        <section className="card hero">
          <p className="eyebrow">FIREBASE STATUS</p>
          <h2>Firebase 설정 확인 필요</h2>
          <p>Vercel 환경변수 또는 Firebase 설정이 준비되지 않았습니다.</p>
          <Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">FIREBASE HOST STATUS</p>
        <h2>Firebase 실시간 운영 상태</h2>
        <p>Firebase 확장 운영 중 팀별 대표 PIN, KSA, 팀 결정, 산출물, 선언문 저장 상태를 확인합니다.</p>
        <div className="summaryCards">
          <div><b>{roomId}</b><span>방 ID</span></div>
          <div><b>{teams.length}</b><span>팀 수</span></div>
          <div><b>{currentRoundId}</b><span>현재 라운드</span></div>
          <div><b>{counts.pins}/{teams.length}</b><span>PIN 발급</span></div>
          <div><b>{counts.decisions}/{teams.length}</b><span>팀 결정</span></div>
          <div><b>{counts.submissions}/{teams.length}</b><span>산출물</span></div>
        </div>
        {msg && <div className="notice">{msg}</div>}
        {!status.room && <div className="notice">Firestore 방 문서를 아직 찾지 못했습니다. 먼저 Firebase 내보내기를 실행하세요.</div>}
        <div className="actions">
          <Link className="secondary" to={`/host/${roomId}`}>Host 화면</Link>
          <Link className="secondary" to={`/firebase-pins/${roomId}`}>팀대표 PIN 발급</Link>
          <Link className="secondary" to={`/firebase-export/${roomId}`}>Firebase 내보내기</Link>
          <Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link>
        </div>
      </section>

      <section className="card">
        <h3>팀별 Firebase 저장 상태</h3>
        <table>
          <thead>
            <tr><th>팀</th><th>대표 PIN</th><th>대표</th><th>KSA</th><th>팀 결정</th><th>산출물</th><th>결과</th><th>선언문</th><th>최종 판정</th><th>팀 화면</th></tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.teamId}>
                <td>{row.teamName}</td>
                <td>{statusText(row.pinIssued)}</td>
                <td>{row.representativeName || '미등록'}</td>
                <td>{statusText(row.ksaDone)}</td>
                <td>{statusText(row.decisionDone)}</td>
                <td>{statusText(row.submissionDone)}</td>
                <td>{statusText(row.calculationDone)}</td>
                <td>{statusText(row.declarationDone)}</td>
                <td>{statusText(row.finalDone)}</td>
                <td><Link to={`/firebase-team/${roomId}/${row.teamId}`}>열기</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>운영 해석</h3>
        <div className="reportInsight">
          <p>PIN 발급은 팀대표 입력 권한을 준비했다는 뜻입니다. KSA, 팀 결정, 산출물은 Firebase 팀 화면에서 대표가 저장해야 완료로 표시됩니다. 결과 계산과 최종 판정은 아직 기존 Host 계산 흐름과 병행 운영합니다.</p>
        </div>
      </section>
    </Layout>
  );
}
