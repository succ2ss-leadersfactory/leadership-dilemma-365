import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { subscribe, readDb } from '../services/storage';
import { getJudgmentPattern } from '../utils/judgmentUtils';
import { stateLabels } from '../utils/statusLabels';

const riskValue = { 안정: 0, 신호: 1, 주의: 2, 위험: 3 };

function resultLabel(value) {
  return value || '미생성';
}

function riskText(summary) {
  const riskKey = summary.final?.reviewMaxRiskKey || summary.state.maxRiskKey;
  const riskLabel = summary.final?.reviewMaxRiskLabel || summary.state.maxRiskLabel;
  return `${stateLabels[riskKey] || riskKey || '-'} · ${riskLabel || '-'}`;
}

function riskScore(summary) {
  return summary.final?.reviewMaxRiskValue ?? riskValue[summary.state.maxRiskLabel] ?? summary.state.maxRiskValue ?? 0;
}

function getTeamSummary(room, team, choices) {
  const state = room.stateValues[team.teamId] || { values: {}, maxRiskLabel: '안정' };
  const decisions = Object.values(room.teamDecisions || {}).filter(d => d.teamId === team.teamId);
  const pattern = getJudgmentPattern(decisions, choices);
  const final = room.finalResults?.[team.teamId];
  const declaration = room.declarations?.[team.teamId];
  const reflectionCount = Object.keys(declaration?.individualReflections || {}).length;
  return { team, state, decisions, pattern, final, declaration, reflectionCount };
}

export default function MultiTeamComparePage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const choices = db.gameContent.choices;
  const summaries = Object.values(room.teams).map(t => getTeamSummary(room, t, choices));
  const highestRisk = [...summaries].sort((a, b) => riskScore(b) - riskScore(a))[0];
  const patternMap = summaries.reduce((acc, s) => {
    acc[s.pattern.label] = (acc[s.pattern.label] || 0) + 1;
    return acc;
  }, {});
  const finalResults = Object.values(room.finalResults || {});
  const survivalTeams = finalResults.filter(r => ['조직개편 생존', '조건부 생존'].includes(r.survivalLabel)).length;
  const missionPositiveTeams = finalResults.filter(r => ['미션 달성', '미션 부분 달성'].includes(r.missionLabel)).length;
  const aftershockCount = finalResults.reduce((sum, result) => sum + (result.weekLogImpactCount || 0), 0);

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">다팀 비교</p>
        <h2>팀별 판단 패턴과 남은 부담 비교</h2>
        <p>같은 위기 상황에서도 팀마다 반복한 판단 기준과 남은 부담이 다르게 나타납니다.</p>
        <div className="summaryCards">
          <div><b>{summaries.length}</b><span>전체 팀</span></div>
          <div><b>{highestRisk?.team.teamName || '-'}</b><span>리스크 우선 점검 팀</span></div>
          <div><b>{Object.keys(room.finalResults || {}).length}</b><span>최종 판정 생성</span></div>
          <div><b>{survivalTeams}</b><span>생존/조건부 생존 팀</span></div>
          <div><b>{missionPositiveTeams}</b><span>미션 달성/부분 달성 팀</span></div>
          <div><b>{aftershockCount}</b><span>중간 사건 후폭풍</span></div>
          <div><b>{Object.values(patternMap).reduce((a, b) => Math.max(a, b), 0)}</b><span>최다 반복 패턴 수</span></div>
        </div>
      </section>

      <section className="card">
        <h3>팀별 비교표</h3>
        <table>
          <thead>
            <tr><th>팀</th><th>비밀 미션</th><th>미션 점수</th><th>후폭풍</th><th>조직개편 생존 판정</th><th>미션 달성 판정</th><th>종합 판정</th><th>판단 패턴</th><th>최대 리스크</th><th>결정 수</th><th>성찰 수</th><th>진행</th></tr>
          </thead>
          <tbody>
            {summaries.map(s => (
              <tr key={s.team.teamId}>
                <td>{s.team.teamName}</td>
                <td>{s.final?.secretMissionTitle || '미생성'}</td>
                <td>{s.final?.secretMissionScore ?? '미생성'}/3</td>
                <td>{s.final?.weekLogImpactCount ?? 0}건</td>
                <td>{resultLabel(s.final?.survivalLabel)}</td>
                <td>{resultLabel(s.final?.missionLabel)}</td>
                <td>{resultLabel(s.final?.finalLevel)}</td>
                <td>{s.pattern.label}</td>
                <td>{riskText(s)}</td>
                <td>{s.decisions.length}</td>
                <td>{s.reflectionCount}</td>
                <td><Link to={`/team/${roomId}/${s.team.teamId}`}>열기</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid2">
        {summaries.map(s => (
          <section className="card" key={s.team.teamId}>
            <p className="eyebrow">{s.team.teamId}</p>
            <h3>{s.team.teamName}</h3>
            <div className="summaryCards">
              <div><b>{resultLabel(s.final?.survivalLabel)}</b><span>조직개편 생존 판정</span></div>
              <div><b>{resultLabel(s.final?.missionLabel)}</b><span>미션 달성 판정</span></div>
              <div><b>{resultLabel(s.final?.finalLevel)}</b><span>종합 판정</span></div>
              <div><b>{s.final?.secretMissionScore ?? '미생성'}/3</b><span>비밀 미션 점수</span></div>
              <div><b>{s.final?.weekLogImpactCount ?? 0}</b><span>중간 사건 후폭풍</span></div>
            </div>
            <p><b>비밀 미션:</b> {s.final?.secretMissionTitle || '미생성'}</p>
            <p><b>남은 부담:</b> {riskText(s)}</p>
            <p><b>종합 점수:</b> {s.final?.baseScore ?? '미생성'}</p>
            {s.final?.weekLogImpactLines?.length > 0 && (
              <>
                <h4>후폭풍 근거</h4>
                <ol>{s.final.weekLogImpactLines.map((line, i) => <li key={i}>{line}</li>)}</ol>
              </>
            )}
            <p><b>팀 선언문:</b> {s.declaration?.teamDeclaration || '미작성'}</p>
            <div className="actions"><Link className="secondary" to={`/team/${roomId}/${s.team.teamId}`}>팀 화면</Link></div>
          </section>
        ))}
      </section>

      <section className="card debriefBox">
        <h3>비교 디브리핑 질문</h3>
        <ol>
          <li>같은 상황에서 팀별 판단 패턴이 왜 달라졌습니까?</li>
          <li>조직개편 생존 판정과 미션 달성 판정이 엇갈린 팀은 어디입니까?</li>
          <li>중간 사건 후폭풍이 가장 크게 남은 팀은 어디이며, 어떤 판단에서 비롯되었습니까?</li>
          <li>각 팀의 비밀 미션 기준 중 충족하지 못한 항목은 무엇입니까?</li>
          <li>성과를 높인 선택과 부담을 키운 선택은 각각 무엇입니까?</li>
          <li>다른 팀의 선택 중 우리 팀이 현업에 가져갈 만한 기준은 무엇입니까?</li>
        </ol>
      </section>
    </Layout>
  );
}
