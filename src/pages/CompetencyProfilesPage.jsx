import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import CompetencyProfilePanel from '../components/CompetencyProfilePanel.jsx';
import { subscribe, readDb } from '../services/storage';

function getTeamProfileSummary(profiles = {}) {
  const list = Object.values(profiles || {}).filter(Boolean);
  if (!list.length) return { count: 0, average: '-', topStrengths: '-', personas: '-' };
  const average = (list.reduce((sum, profile) => sum + Number(profile.averageLevel || 0), 0) / list.length).toFixed(1);
  const strengthCounts = list.flatMap(profile => profile.strengths || []).reduce((acc, name) => {
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const personaCounts = list.reduce((acc, profile) => {
    const label = profile.personaLabel || '인물 카드 미지정';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const topStrengths = Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name).join(', ') || '-';
  const personas = Object.entries(personaCounts).sort((a, b) => b[1] - a[1]).map(([name, count]) => `${name} ${count}`).join(' / ') || '-';
  return { count: list.length, average, topStrengths, personas };
}

export default function CompetencyProfilesPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const teams = Object.values(room.teams || {});

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">KSA 자동 진단</p>
        <h2>팀원 초기 역량 프로필</h2>
        <p>Round 0에서 팀이 선택한 KSA 9개와 팀원 인물 카드를 기준으로 팀원별 초기 수준을 자동 등록한 화면입니다.</p>
        <p className="muted">이 값은 교육용 출발점입니다. 실제 인사평가가 아니라, 12주 게임에서 역할 분담과 성장 초점을 토의하기 위한 기준입니다.</p>
        <div className="facilitatorOnlyNotice"><b>강사용 역량 해석 화면</b><p>이 화면은 팀 운영과 디브리핑을 돕기 위한 참고 자료입니다. 참가자에게는 평가처럼 보이지 않도록 필요한 메시지만 선별해 공유해 주세요.</p></div>
        <div className="actions">
          <Link className="secondary" to={`/host/${roomId}`}>Host 화면</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트</Link>
        </div>
      </section>

      <section className="card">
        <h3>팀별 요약</h3>
        <table>
          <thead><tr><th>팀</th><th>프로필 수</th><th>평균 수준</th><th>인물 카드 구성</th><th>많이 나타난 강점</th><th>팀 화면</th></tr></thead>
          <tbody>
            {teams.map(team => {
              const profiles = room.competencyProfiles?.[team.teamId] || {};
              const summary = getTeamProfileSummary(profiles);
              return (
                <tr key={team.teamId}>
                  <td>{team.teamName}</td>
                  <td>{summary.count}</td>
                  <td>{summary.average}</td>
                  <td>{summary.personas}</td>
                  <td>{summary.topStrengths}</td>
                  <td><Link to={`/team/${roomId}/${team.teamId}`}>열기</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {teams.map(team => (
        <CompetencyProfilePanel
          key={team.teamId}
          profiles={room.competencyProfiles?.[team.teamId] || {}}
          title={`${team.teamName} · 팀원 초기 역량 프로필`}
        />
      ))}
    </Layout>
  );
}
