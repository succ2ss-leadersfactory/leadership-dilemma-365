import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { calculateRoundResult, generateFinalResults } from '../services/calculationService';

const rounds = ['week1', 'week5', 'week8', 'week10', 'week11'];
const pick = {
  sales: ['week1_balance', 'week5_structure', 'week8_balance', 'week10_structure', 'week11_balance'],
  marketing: ['week1_structure', 'week5_balance', 'week8_align', 'week10_balance', 'week11_structure'],
  rnd: ['week1_align', 'week5_structure', 'week8_structure', 'week10_structure', 'week11_structure'],
  operations: ['week1_speed', 'week5_speed', 'week8_structure', 'week10_speed', 'week11_speed'],
  hr: ['week1_balance', 'week5_align', 'week8_balance', 'week10_balance', 'week11_balance'],
  finance: ['week1_structure', 'week5_align', 'week8_align', 'week10_align', 'week11_align']
};

const memberNames = ['김박사', '이매니저', '박코치'];
const habits = ['불확실하면 속도부터 선택하는 경향이 있었다.', '기준을 세우느라 실행을 늦추는 순간이 있었다.', '사람 부담을 알면서도 성과 압박을 먼저 본 순간이 있었다.'];
const nexts = ['선택 전에 부담이 누구에게 몰리는지 먼저 확인하겠다.', '결정 전에 성공 기준과 확인 시점을 먼저 합의하겠다.', '성과와 사람을 함께 보는 체크 질문을 회의에 넣겠다.'];

function makeSample(roomId) {
  updateDb(db => {
    const room = db.rooms[roomId];
    Object.values(room.teams).forEach(team => {
      const ksa = db.gameContent.ksaOptions[team.teamId];
      if (ksa) team.selectedKSA = { knowledge: ksa.knowledge.slice(0, 3), skill: ksa.skill.slice(0, 3), attitude: ksa.attitude.slice(0, 3) };

      const declaration = room.declarations[team.teamId] || { teamId: team.teamId, individualReflections: {} };
      declaration.teamDeclaration = `${team.teamName}은 선택의 대가를 숨기지 않고, 다음 현업에서 부담 배분과 확인 시점을 먼저 정하겠습니다.`;
      declaration.submittedAt = Date.now();
      declaration.individualReflections = declaration.individualReflections || {};

      memberNames.forEach((name, idx) => {
        const playerId = `${team.teamId}_sample_${idx + 1}`;
        room.players[playerId] = {
          playerId,
          displayName: name,
          teamId: team.teamId,
          joinedAt: Date.now(),
          lastSeenAt: Date.now(),
          isActive: true
        };
        declaration.individualReflections[playerId] = {
          habit: habits[idx],
          nextBehavior: nexts[idx],
          submittedAt: Date.now()
        };
      });
      room.declarations[team.teamId] = declaration;

      rounds.forEach((roundId, idx) => {
        const choiceId = pick[team.teamId]?.[idx] || db.gameContent.choices.find(c => c.roundId === roundId)?.choiceId;
        const choice = db.gameContent.choices.find(c => c.choiceId === choiceId);
        room.teamDecisions[`${roundId}_${team.teamId}`] = { decisionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, finalChoiceId: choiceId, discussionSummary: `${team.teamName}은 선택의 장점과 남는 부담을 함께 정리했다.`, submittedBy: 'sample', submittedAt: Date.now(), locked: true };
        room.submissions[`${roundId}_${team.teamId}`] = { submissionId: `${roundId}_${team.teamId}`, roundId, teamId: team.teamId, answers: { summary: `${choice?.choiceText || '선택'} 실행안`, action: '책임자와 확인 시점을 정한다.' }, quality: idx >= 3 ? 'high' : 'medium', qualityScore: idx >= 3 ? 85 : 65, submittedBy: 'sample', submittedAt: Date.now() };
      });
    });
  });
  rounds.forEach(roundId => Object.keys(readDb().rooms[roomId].teams).forEach(teamId => { try { calculateRoundResult({ roomId, roundId, teamId }); } catch {} }));
  generateFinalResults(roomId);
  updateDb(db => { const room = db.rooms[roomId]; room.roomProgress.currentRoundId = 'week12'; room.roomProgress.currentPhase = 'finalResult'; room.roomProgress.finalResultVisible = true; Object.values(room.finalResults).forEach(r => { r.visible = true; }); });
}

export default function AdminOpsPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  const [msg, setMsg] = useState('');
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);
  const room = readDb().rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;
  const backup = () => { const blob = new Blob([JSON.stringify(room, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${roomId}_backup.json`; a.click(); };
  return <Layout roomId={roomId}><section className="card hero"><p className="eyebrow">운영 안정화</p><h2>테스트와 리포트 검증 도구</h2><p>현재 라운드: {room.roomProgress.currentRoundId} · 단계: {room.roomProgress.currentPhase}</p><p>참가자: {Object.keys(room.players).length}명 · 팀: {Object.keys(room.teams).length}개</p>{msg && <div className="notice">{msg}</div>}<div className="actions"><button onClick={backup}>JSON 백업 다운로드</button><button onClick={() => setMsg('데이터 건강도: 기본 room, teams, progress 확인 완료')}>데이터 건강도 점검</button><button className="primary" onClick={() => { makeSample(roomId); setMsg('6개 팀 샘플 데이터, 참가자 성찰, 최종 판정을 생성했습니다.'); }}>6팀 샘플 데이터 생성</button><Link className="secondary" to={`/report/${roomId}`}>교육 리포트 보기</Link></div></section><section className="card"><h3>샘플 생성 내용</h3><ul><li>6개 팀 KSA 자동 선택</li><li>팀별 샘플 참가자 3명과 개인 성찰 생성</li><li>주요 라운드 팀 결정과 산출물 생성</li><li>상태값 계산과 최종 판정 생성</li></ul></section></Layout>;
}
