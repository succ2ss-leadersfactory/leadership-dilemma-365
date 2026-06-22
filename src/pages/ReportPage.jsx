import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { subscribe, readDb } from '../services/storage';
import { stateLabels } from '../utils/statusLabels';

const riskOrder = { 안정: 0, 신호: 1, 주의: 2, 위험: 3 };

function getKsaText(team) {
  const selected = team.selectedKSA || { knowledge: [], skill: [], attitude: [] };
  const items = [...selected.knowledge, ...selected.skill, ...selected.attitude];
  return items.length ? items.join(', ') : '미선택';
}

function getReportSummary(teams, room) {
  const finalResults = Object.values(room.finalResults || {});
  const stateValues = Object.values(room.stateValues || {});
  const declarations = Object.values(room.declarations || {});
  const reflectionCount = declarations.reduce((sum, d) => sum + Object.keys(d.individualReflections || {}).length, 0);
  const warningTeams = stateValues.filter(s => (s.maxRiskValue ?? riskOrder[s.maxRiskLabel] ?? 0) >= 2).length;
  const maintainTeams = finalResults.filter(r => ['전략 유지·확대팀', '유지팀'].includes(r.finalLevel)).length;
  const patterns = finalResults.reduce((acc, r) => {
    if (!r.judgmentPattern) return acc;
    acc[r.judgmentPattern] = (acc[r.judgmentPattern] || 0) + 1;
    return acc;
  }, {});
  const topPattern = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0]?.[0] || '아직 없음';
  return { totalTeams: teams.length, warningTeams, maintainTeams, topPattern, reflectionCount };
}

function getTeamPlayers(room, teamId) {
  return Object.values(room.players || {}).filter(p => p.teamId === teamId);
}

export default function ReportPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const room = readDb().rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const teams = Object.values(room.teams);
  const summary = getReportSummary(teams, room);

  return (
    <Layout roomId={roomId}>
      <section className="card hero reportHero">
        <p className="eyebrow">교육 리포트</p>
        <h2>12주 판단 여정 요약</h2>
        <p>이 리포트는 위기 상황에서 반복된 판단 습관과 남은 부담을 돌아보기 위한 디브리핑 자료입니다.</p>
        <div className="summaryCards">
          <div><b>{summary.totalTeams}</b><span>전체 팀</span></div>
          <div><b>{summary.warningTeams}</b><span>주의 이상 리스크 팀</span></div>
          <div><b>{summary.maintainTeams}</b><span>유지 이상 판정 팀</span></div>
          <div><b>{summary.topPattern}</b><span>대표 판단 패턴</span></div>
          <div><b>{summary.reflectionCount}</b><span>개인 성찰 제출</span></div>
        </div>
        <div className="actions"><button onClick={() => window.print()}>인쇄 / PDF 저장</button></div>
      </section>

      <section className="card">
        <h3>팀별 요약표</h3>
        <table>
          <thead><tr><th>팀</th><th>최종 판정</th><th>판단 패턴</th><th>핵심 리스크</th><th>다음 행동</th></tr></thead>
          <tbody>
            {teams.map(t => {
              const st = room.stateValues[t.teamId];
              const final = room.finalResults[t.teamId];
              return (
                <tr key={t.teamId}>
                  <td>{t.teamName}</td>
                  <td>{final?.finalLevel || '미생성'}</td>
                  <td>{final?.judgmentPattern || '-'}</td>
                  <td>{stateLabels[st?.maxRiskKey] || '-'} · {st?.maxRiskLabel || '-'}</td>
                  <td>{final?.nextAction || '최종 판정 생성 후 표시됩니다.'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid2">
        {teams.map(t => {
          const st = room.stateValues[t.teamId];
          const final = room.finalResults[t.teamId];
          const dec = room.declarations[t.teamId];
          const reflections = dec?.individualReflections || {};
          const teamPlayers = getTeamPlayers(room, t.teamId);
          return (
            <section className="card teamReportCard" key={t.teamId}>
              <p className="eyebrow">{t.teamName}</p>
              <h3>{final?.finalLevel || '최종 판정 미생성'}</h3>
              <p><b>판단 패턴:</b> {final?.judgmentPattern || '아직 계산되지 않았습니다.'}</p>
              <p><b>핵심 리스크:</b> {stateLabels[st?.maxRiskKey] || '-'} · {st?.maxRiskLabel || '-'}</p>
              <p><b>선택한 KSA:</b> {getKsaText(t)}</p>
              {final ? (
                <>
                  <h4>판정 근거</h4>
                  <ol>{final.evidenceLines?.map((line, i) => <li key={i}>{line}</li>)}</ol>
                  <div className="reportInsight">
                    <p><b>가장 큰 자산:</b> {final.strongestAsset}</p>
                    <p><b>남은 부담:</b> {final.remainingBurden}</p>
                    <p><b>현업 적용 행동:</b> {final.nextAction}</p>
                  </div>
                </>
              ) : <p className="muted">Week 12에서 최종 판정을 생성하면 근거와 다음 행동이 표시됩니다.</p>}
              <p><b>팀 선언문:</b> {dec?.teamDeclaration || '미작성'}</p>

              <h4>개인 성찰</h4>
              {teamPlayers.length ? teamPlayers.map(p => {
                const r = reflections[p.playerId];
                return (
                  <div className="reflectionItem" key={p.playerId}>
                    <b>{p.displayName}</b>
                    {r ? (
                      <>
                        <p><span>반복한 판단 습관:</span> {r.habit || '-'}</p>
                        <p><span>다음 현업 행동:</span> {r.nextBehavior || '-'}</p>
                      </>
                    ) : <p className="muted">성찰 미작성</p>}
                  </div>
                );
              }) : <p className="muted">이 팀에 입장한 참가자가 없습니다.</p>}
            </section>
          );
        })}
      </div>

      <section className="card debriefBox">
        <h3>공통 디브리핑 질문</h3>
        <ol>
          <li>우리 팀은 위기 앞에서 속도, 기준, 균형, 조건 중 무엇을 반복했습니까?</li>
          <li>그 판단은 어떤 성과를 만들었고, 어떤 부담을 남겼습니까?</li>
          <li>가장 크게 남은 리스크는 개인의 문제입니까, 구조의 문제입니까?</li>
          <li>개인 성찰에 반복적으로 나타난 행동 변화 키워드는 무엇입니까?</li>
          <li>다음 주 현업에서 바로 바꿀 행동 하나는 무엇입니까?</li>
        </ol>
      </section>
    </Layout>
  );
}
