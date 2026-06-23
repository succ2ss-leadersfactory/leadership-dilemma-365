import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import TwelveWeekTimeline from '../components/TwelveWeekTimeline.jsx';
import ReportExpertiseSummaryPanel from '../components/ReportExpertiseSummaryPanel.jsx';
import FacilitatorDebriefBoard from '../components/FacilitatorDebriefBoard.jsx';
import { subscribe, readDb } from '../services/storage';
import { stateLabels } from '../utils/statusLabels';
import { buildAllTeamExpertiseReportSummaries } from '../utils/reportExpertiseUtils';

const riskOrder = { 안정: 0, 신호: 1, 주의: 2, 위험: 3 };
const personaLabels = {
  ace_practitioner: '에이스 실무자',
  careful_newcomer: '꼼꼼한 신입',
  relationship_connector: '관계형 조율자',
  silent_expert: '침묵형 전문가',
  challenge_driver: '도전 추진자',
  standard_keeper: '기준 수호자'
};
const choiceTypeLabels = { SPEED: '빠른 실행형', STRUCTURE: '기준 정리형', BALANCE: '균형 조정형', ALIGN: '조건 조율형' };

function getKsaText(team) {
  const selected = team.selectedKSA || { knowledge: [], skill: [], attitude: [] };
  const items = [...selected.knowledge, ...selected.skill, ...selected.attitude];
  return items.length ? items.join(', ') : '미선택';
}

function getRiskText(final, state) {
  const riskKey = final?.reviewMaxRiskKey || state?.maxRiskKey;
  const riskLabel = final?.reviewMaxRiskLabel || state?.maxRiskLabel;
  return `${stateLabels[riskKey] || riskKey || '-'} · ${riskLabel || '-'}`;
}

function countBy(items = [], getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function formatCounts(counts = {}, labels = {}) {
  const entries = Object.entries(counts).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  return entries.length ? entries.map(([key, count]) => `${labels[key] || key} ${count}`).join(' / ') : '기록 없음';
}

function getChoice(gameContent, choiceId) {
  return gameContent.choices?.find(choice => choice.choiceId === choiceId);
}

function getTeamObservation(room, gameContent, team) {
  const profiles = Object.values(room.competencyProfiles?.[team.teamId] || {}).filter(Boolean);
  const decisions = Object.values(room.teamDecisions || {}).filter(decision => decision.teamId === team.teamId);
  const final = room.finalResults?.[team.teamId];
  const personaCounts = countBy(profiles, profile => profile.personaId);
  const choiceCounts = countBy(decisions, decision => getChoice(gameContent, decision.finalChoiceId)?.internalType);
  const topChoice = Object.entries(choiceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '미정';
  const influenceLines = Object.values(room.roundCalculations || {})
    .filter(calc => calc.teamId === team.teamId)
    .flatMap(calc => (calc.personaInfluenceLines || []).map(line => `${calc.roundId}: ${line}`));

  let observation = '큰 개입 신호는 적지만, 팀이 반복한 선택 기준과 실제 남은 부담을 연결해 정리하는 것이 좋습니다.';
  if ((personaCounts.ace_practitioner || 0) >= 1 && topChoice === 'SPEED') observation = '빠른 실행으로 성과를 만들 가능성이 높지만, 중요한 일이 특정 사람에게 몰리는 패턴을 점검해야 합니다.';
  else if ((personaCounts.relationship_connector || 0) >= 1 && ['BALANCE', 'ALIGN'].includes(topChoice)) observation = '협업 온도와 수용성을 읽는 힘이 강점으로 작동했습니다. 다만 어려운 결정을 미루지 않았는지 함께 확인해야 합니다.';
  else if ((personaCounts.standard_keeper || 0) >= 1 && ['STRUCTURE', 'ALIGN'].includes(topChoice)) observation = '기준과 책임선을 붙잡아 신뢰 리스크를 낮추는 장면이 있었을 가능성이 큽니다. 기준이 실행 속도를 늦추지는 않았는지 확인해야 합니다.';
  else if ((personaCounts.challenge_driver || 0) >= 1 && topChoice === 'SPEED') observation = '새로운 시도와 선행 실행의 힘이 보였습니다. 주변 정렬과 마무리 조건이 뒤따랐는지 점검해야 합니다.';
  else if (final?.weekLogImpactCount > 0) observation = '중간 사건 후폭풍이 남았습니다. 사건 자체보다 그때 반복한 판단 습관을 중심으로 디브리핑해야 합니다.';

  let intervention = '팀이 반복한 판단 기준을 하나의 문장으로 정리하게 하십시오.';
  if (final?.reviewMaxRiskValue >= 3) intervention = '최종 리스크가 위험 수준입니다. 성과 논의보다 먼저 어떤 부담을 누구에게서 덜어낼 것인지 묻게 하십시오.';
  else if ((personaCounts.ace_practitioner || 0) >= 1) intervention = '성과를 낸 사람을 칭찬한 뒤 곧바로 그 일이 다시 한 사람에게 몰리지 않게 할 방법을 묻게 하십시오.';
  else if ((personaCounts.relationship_connector || 0) >= 1) intervention = '말하지 않은 불편과 감정 신호를 공식 대화로 꺼내게 하십시오.';
  else if ((personaCounts.standard_keeper || 0) >= 1) intervention = '기준을 더 늘리기보다 이번 현업에 남길 기준 하나와 내려놓을 기준 하나를 정하게 하십시오.';
  else if (topChoice === 'SPEED') intervention = '빠른 실행의 성과와 부작용을 분리해서 말하게 하십시오.';

  let question = `반복된 ${choiceTypeLabels[topChoice] || '선택'} 판단은 어떤 성과와 부담을 동시에 만들었습니까?`;
  if ((personaCounts.ace_practitioner || 0) >= 1) question = '이번 12주 동안 “그 사람이 해야 한다”고 여긴 일은 무엇이었습니까?';
  else if ((personaCounts.careful_newcomer || 0) >= 1) question = '신입도 스스로 판단할 수 있도록 남긴 기준은 무엇이었습니까?';
  else if ((personaCounts.relationship_connector || 0) >= 1) question = '팀원들이 말하지 않았지만 표정으로 드러낸 불편은 무엇이었습니까?';
  else if ((personaCounts.silent_expert || 0) >= 1) question = '전문가가 알고 있었지만 팀 기준으로 공유되지 않은 것은 무엇이었습니까?';

  return {
    teamId: team.teamId,
    teamName: team.teamName,
    personaMix: formatCounts(personaCounts, personaLabels),
    choiceMix: formatCounts(choiceCounts, choiceTypeLabels),
    topChoiceLabel: choiceTypeLabels[topChoice] || '미정',
    influenceLines,
    observation,
    intervention,
    question
  };
}

function getReportSummary(teams, room) {
  const finalResults = Object.values(room.finalResults || {});
  const stateValues = Object.values(room.stateValues || {});
  const declarations = Object.values(room.declarations || {});
  const reflectionCount = declarations.reduce((sum, d) => sum + Object.keys(d.individualReflections || {}).length, 0);
  const warningTeams = finalResults.length
    ? finalResults.filter(r => (r.reviewMaxRiskValue ?? 0) >= 2).length
    : stateValues.filter(s => (s.maxRiskValue ?? riskOrder[s.maxRiskLabel] ?? 0) >= 2).length;
  const maintainTeams = finalResults.filter(r => ['전략 유지·확대팀', '유지팀'].includes(r.finalLevel)).length;
  const survivalTeams = finalResults.filter(r => ['조직개편 생존', '조건부 생존'].includes(r.survivalLabel)).length;
  const missionPositiveTeams = finalResults.filter(r => ['미션 달성', '미션 부분 달성'].includes(r.missionLabel)).length;
  const weekLogImpactCount = finalResults.reduce((sum, result) => sum + (result.weekLogImpactCount || 0), 0);
  const patterns = finalResults.reduce((acc, r) => {
    if (!r.judgmentPattern) return acc;
    acc[r.judgmentPattern] = (acc[r.judgmentPattern] || 0) + 1;
    return acc;
  }, {});
  const topPattern = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0]?.[0] || '아직 없음';
  return {
    totalTeams: teams.length,
    warningTeams,
    maintainTeams,
    survivalTeams,
    missionPositiveTeams,
    weekLogImpactCount,
    topPattern,
    reflectionCount
  };
}

function getTeamPlayers(room, teamId) {
  return Object.values(room.players || {}).filter(p => p.teamId === teamId);
}

function resultLabel(value) {
  return value || '미생성';
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function buildTimelineMarkdown(gameContent) {
  const roundsByWeek = Object.fromEntries((gameContent.rounds || []).map(round => [round.week, round]));
  const logsByWeek = Object.fromEntries((gameContent.weekLogs || []).map(log => [log.week, log]));
  const lines = ['## 12주 타임라인'];
  Array.from({ length: 13 }, (_, week) => week).forEach(week => {
    const round = roundsByWeek[week];
    const log = logsByWeek[week];
    if (round) {
      lines.push(`- Week ${week} · PLAY · ${round.title}: ${round.teamSignalText || round.coreQuestion}`);
    } else if (log) {
      lines.push(`- Week ${week} · LOG · ${log.title}: ${log.signalText || log.storyText}`);
    } else {
      lines.push(`- Week ${week} · 미등록`);
    }
  });
  lines.push('');
  return lines;
}

function pushMarkdownList(lines, title, items = []) {
  if (!items.length) return;
  lines.push(`- ${title}:`);
  items.forEach(line => lines.push(`  - ${line}`));
}

function buildMarkdownReport(room, teams, summary, gameContent, observations, expertiseSummaries) {
  const lines = [];
  lines.push('# 리더십 딜레마 365 교육 리포트');
  lines.push('');
  lines.push('## 전체 요약');
  lines.push(`- 전체 팀: ${summary.totalTeams}`);
  lines.push(`- 주의 이상 리스크 팀: ${summary.warningTeams}`);
  lines.push(`- 조직개편 생존/조건부 생존 팀: ${summary.survivalTeams}`);
  lines.push(`- 미션 달성/부분 달성 팀: ${summary.missionPositiveTeams}`);
  lines.push(`- 중간 사건 후폭풍: ${summary.weekLogImpactCount}건`);
  lines.push(`- 유지 이상 종합 판정 팀: ${summary.maintainTeams}`);
  lines.push(`- 대표 판단 패턴: ${summary.topPattern}`);
  lines.push(`- 개인 성찰 제출: ${summary.reflectionCount}`);
  lines.push('');
  lines.push(...buildTimelineMarkdown(gameContent));

  lines.push('## 강사용 관찰 요약');
  observations.forEach(obs => {
    lines.push(`### ${obs.teamName}`);
    lines.push(`- 인물 카드 구성: ${obs.personaMix}`);
    lines.push(`- 선택 유형 분포: ${obs.choiceMix}`);
    lines.push(`- 관찰 요약: ${obs.observation}`);
    lines.push(`- 개입 제안: ${obs.intervention}`);
    lines.push(`- 핵심 질문: ${obs.question}`);
    if (obs.influenceLines.length) {
      lines.push('- 인물 카드 영향 기록:');
      obs.influenceLines.forEach(line => lines.push(`  - ${line}`));
    }
    lines.push('');
  });

  lines.push('## 팀별 전문성 요약');
  expertiseSummaries.forEach(item => {
    lines.push(`### ${item.teamName}`);
    lines.push(`- 전문성 렌즈: ${item.lensTitle}`);
    lines.push(`- 평균 증거 수준: ${item.evidenceLevel} (${item.averageScore || '-'}/4, ${item.evidenceCount}건)`);
    lines.push(`- 결과 해석 기록: ${item.resultEvidenceCount}건`);
    lines.push(`- 관련 역량: ${item.expertiseKeywords.join(', ') || '-'}`);
    lines.push(`- 강한 주차: ${item.strongestWeeks}`);
    lines.push(`- 취약 주차: ${item.weakestWeeks}`);
    lines.push(`- 요약: ${item.summaryLine}`);
    pushMarkdownList(lines, '반복된 진전', item.repeatedGains || []);
    pushMarkdownList(lines, '반복된 대가', item.repeatedRisks || []);
    pushMarkdownList(lines, '강사용 경고 신호', item.warningSignals || []);
    if (item.needsMoreEvidence.length) {
      lines.push('- 보완 신호:');
      item.needsMoreEvidence.forEach(line => lines.push(`  - ${line}`));
    }
    lines.push(`- 강사용 질문: ${item.narrativeQuestions?.[0] || item.facilitatorQuestion}`);
    lines.push('');
  });

  lines.push('## 팀별 결과');
  teams.forEach(t => {
    const st = room.stateValues?.[t.teamId] || {};
    const final = room.finalResults?.[t.teamId];
    const dec = room.declarations?.[t.teamId];
    const reflections = dec?.individualReflections || {};
    const teamPlayers = getTeamPlayers(room, t.teamId);
    const obs = observations.find(item => item.teamId === t.teamId);
    const expertise = expertiseSummaries.find(item => item.teamId === t.teamId);
    lines.push(`### ${t.teamName}`);
    lines.push(`- 비밀 미션: ${final?.secretMissionTitle || '미생성'}`);
    lines.push(`- 비밀 미션 점수: ${final?.secretMissionScore ?? '미생성'}/3`);
    lines.push(`- 중간 사건 후폭풍: ${final?.weekLogImpactCount ?? 0}건`);
    lines.push(`- 조직개편 생존 판정: ${resultLabel(final?.survivalLabel)}`);
    lines.push(`- 미션 달성 판정: ${resultLabel(final?.missionLabel)}`);
    lines.push(`- 종합 판정: ${resultLabel(final?.finalLevel)}`);
    lines.push(`- 판단 패턴: ${final?.judgmentPattern || '-'}`);
    lines.push(`- 핵심 리스크: ${getRiskText(final, st)}`);
    lines.push(`- 선택한 KSA: ${getKsaText(t)}`);
    lines.push(`- 강사용 관찰: ${obs?.observation || '-'}`);
    lines.push(`- 전문성 요약: ${expertise?.summaryLine || '-'}`);
    lines.push(`- 누적 결과 해석: ${expertise?.narrativeSummary || '-'}`);
    pushMarkdownList(lines, '반복된 진전', expertise?.repeatedGains || []);
    pushMarkdownList(lines, '반복된 대가', expertise?.repeatedRisks || []);
    pushMarkdownList(lines, '강사용 경고 신호', expertise?.warningSignals || []);
    lines.push(`- 팀 선언문: ${dec?.teamDeclaration || '미작성'}`);
    if (final) {
      lines.push('- 중간 사건 후폭풍 근거:');
      (final.weekLogImpactLines || []).forEach(line => lines.push(`  - ${line}`));
      lines.push('- 비밀 미션 근거:');
      (final.missionEvidenceLines || []).forEach(line => lines.push(`  - ${line}`));
      lines.push('- 종합 판정 근거:');
      (final.evidenceLines || []).forEach(line => lines.push(`  - ${line}`));
      lines.push(`- 가장 큰 자산: ${final.strongestAsset}`);
      lines.push(`- 남은 부담: ${final.remainingBurden}`);
      lines.push(`- 현업 적용 행동: ${final.nextAction}`);
    }
    lines.push('- 개인 성찰:');
    if (teamPlayers.length) {
      teamPlayers.forEach(p => {
        const r = reflections[p.playerId];
        lines.push(`  - ${p.displayName}`);
        lines.push(`    - 반복한 판단 습관: ${r?.habit || '성찰 미작성'}`);
        lines.push(`    - 다음 현업 행동: ${r?.nextBehavior || '-'}`);
      });
    } else {
      lines.push('  - 참가자 없음');
    }
    lines.push('');
  });

  lines.push('## 공통 디브리핑 질문');
  lines.push('1. 우리 팀은 위기 앞에서 속도, 기준, 균형, 조건 중 무엇을 반복했습니까?');
  lines.push('2. 그 판단은 어떤 성과를 만들었고, 어떤 부담을 남겼습니까?');
  lines.push('3. 조직개편 생존 판정과 미션 달성 판정이 서로 다르게 나온 이유는 무엇입니까?');
  lines.push('4. 비밀 미션 기준 중 충족하지 못한 항목은 어떤 판단 습관에서 비롯되었습니까?');
  lines.push('5. 중간 사건 로그 중 우리 팀의 선택을 가장 크게 흔든 주차는 언제였습니까?');
  lines.push('6. 후폭풍으로 남은 리스크는 다음 현업에서 어떻게 먼저 낮출 수 있습니까?');
  lines.push('7. 팀 안의 인물 카드 구성은 선택의 장점과 부작용에 어떤 영향을 주었습니까?');
  lines.push('8. 이 팀은 자기 기능 전문성에 맞는 증거를 충분히 남겼습니까?');
  lines.push('9. 팀별 결과 해석에서 반복된 대가는 무엇이며, 왜 뒤로 미뤄졌습니까?');
  lines.push('10. 다음 주 현업에서 바로 바꿀 행동 하나는 무엇입니까?');
  return lines.join('\n');
}

export default function ReportPage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const teams = Object.values(room.teams);
  const summary = getReportSummary(teams, room);
  const observations = teams.map(team => getTeamObservation(room, db.gameContent, team));
  const expertiseSummaries = buildAllTeamExpertiseReportSummaries({ room, gameContent: db.gameContent, teams });
  const saveMarkdown = () => downloadText(`${roomId}_leadership_report.md`, buildMarkdownReport(room, teams, summary, db.gameContent, observations, expertiseSummaries));

  return (
    <Layout roomId={roomId}>
      <section className="card hero reportHero">
        <p className="eyebrow">교육 리포트</p>
        <h2>12주 판단 여정 요약</h2>
        <p>이 리포트는 위기 상황에서 반복된 판단 습관과 남은 부담을 돌아보기 위한 디브리핑 자료입니다.</p>
        <div className="summaryCards">
          <div><b>{summary.totalTeams}</b><span>전체 팀</span></div>
          <div><b>{summary.warningTeams}</b><span>주의 이상 리스크 팀</span></div>
          <div><b>{summary.survivalTeams}</b><span>생존/조건부 생존 팀</span></div>
          <div><b>{summary.missionPositiveTeams}</b><span>미션 달성/부분 달성 팀</span></div>
          <div><b>{summary.weekLogImpactCount}</b><span>중간 사건 후폭풍</span></div>
          <div><b>{summary.maintainTeams}</b><span>유지 이상 종합 판정 팀</span></div>
          <div><b>{summary.topPattern}</b><span>대표 판단 패턴</span></div>
          <div><b>{summary.reflectionCount}</b><span>개인 성찰 제출</span></div>
        </div>
        <div className="actions"><button onClick={() => window.print()}>인쇄 / PDF 저장</button><button className="secondary" onClick={saveMarkdown}>Markdown 다운로드</button></div>
      </section>

      <FacilitatorDebriefBoard summary={summary} teams={teams} room={room} observations={observations} expertiseSummaries={expertiseSummaries} />

      <TwelveWeekTimeline rounds={db.gameContent.rounds} weekLogs={db.gameContent.weekLogs} currentWeek={12} />

      <section className="card debriefBox">
        <h3>강사용 관찰 요약</h3>
        {observations.map(obs => (
          <div className="reflectionItem" key={obs.teamId}>
            <h4>{obs.teamName}</h4>
            <p><b>인물 카드 구성:</b> {obs.personaMix}</p>
            <p><b>선택 유형 분포:</b> {obs.choiceMix}</p>
            <p><b>관찰 요약:</b> {obs.observation}</p>
            <p><b>개입 제안:</b> {obs.intervention}</p>
            <p><b>핵심 질문:</b> {obs.question}</p>
            {obs.influenceLines.length > 0 && (
              <>
                <h4>인물 카드 영향 기록</h4>
                <ol>{obs.influenceLines.map((line, i) => <li key={i}>{line}</li>)}</ol>
              </>
            )}
          </div>
        ))}
      </section>

      <ReportExpertiseSummaryPanel summaries={expertiseSummaries} />

      <section className="card">
        <h3>팀별 요약표</h3>
        <table>
          <thead><tr><th>팀</th><th>비밀 미션</th><th>미션 점수</th><th>후폭풍</th><th>조직개편 생존 판정</th><th>미션 달성 판정</th><th>종합 판정</th><th>판단 패턴</th><th>핵심 리스크</th><th>다음 행동</th></tr></thead>
          <tbody>
            {teams.map(t => {
              const st = room.stateValues?.[t.teamId];
              const final = room.finalResults?.[t.teamId];
              return (
                <tr key={t.teamId}>
                  <td>{t.teamName}</td>
                  <td>{final?.secretMissionTitle || '미생성'}</td>
                  <td>{final?.secretMissionScore ?? '미생성'}/3</td>
                  <td>{final?.weekLogImpactCount ?? 0}건</td>
                  <td>{resultLabel(final?.survivalLabel)}</td>
                  <td>{resultLabel(final?.missionLabel)}</td>
                  <td>{resultLabel(final?.finalLevel)}</td>
                  <td>{final?.judgmentPattern || '-'}</td>
                  <td>{getRiskText(final, st)}</td>
                  <td>{final?.nextAction || '최종 판정 생성 후 표시됩니다.'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <div className="grid2">
        {teams.map(t => {
          const st = room.stateValues?.[t.teamId];
          const final = room.finalResults?.[t.teamId];
          const dec = room.declarations?.[t.teamId];
          const reflections = dec?.individualReflections || {};
          const teamPlayers = getTeamPlayers(room, t.teamId);
          const obs = observations.find(item => item.teamId === t.teamId);
          const expertise = expertiseSummaries.find(item => item.teamId === t.teamId);
          return (
            <section className="card teamReportCard" key={t.teamId}>
              <p className="eyebrow">{t.teamName}</p>
              <h3>{resultLabel(final?.finalLevel)}</h3>
              <div className="summaryCards">
                <div><b>{resultLabel(final?.survivalLabel)}</b><span>조직개편 생존 판정</span></div>
                <div><b>{resultLabel(final?.missionLabel)}</b><span>미션 달성 판정</span></div>
                <div><b>{resultLabel(final?.finalLevel)}</b><span>종합 판정</span></div>
                <div><b>{final?.secretMissionScore ?? '미생성'}/3</b><span>비밀 미션 점수</span></div>
                <div><b>{final?.weekLogImpactCount ?? 0}</b><span>중간 사건 후폭풍</span></div>
              </div>
              <p><b>비밀 미션:</b> {final?.secretMissionTitle || '미생성'}</p>
              {final?.secretMissionBrief && <p className="muted">{final.secretMissionBrief}</p>}
              <p><b>판단 패턴:</b> {final?.judgmentPattern || '아직 계산되지 않았습니다.'}</p>
              <p><b>핵심 리스크:</b> {getRiskText(final, st)}</p>
              <p><b>선택한 KSA:</b> {getKsaText(t)}</p>
              {expertise && (
                <div className="reportInsight">
                  <p><b>전문성 요약:</b> {expertise.summaryLine}</p>
                  <p><b>평균 증거 수준:</b> {expertise.evidenceLevel} · {expertise.averageScore || '-'}/4</p>
                  <p><b>강사용 질문:</b> {expertise.facilitatorQuestion}</p>
                </div>
              )}
              {obs && (
                <div className="reportInsight">
                  <p><b>강사용 관찰:</b> {obs.observation}</p>
                  <p><b>개입 제안:</b> {obs.intervention}</p>
                  <p><b>핵심 질문:</b> {obs.question}</p>
                </div>
              )}
              {final ? (
                <>
                  {final.weekLogImpactLines?.length > 0 && (
                    <>
                      <h4>중간 사건 후폭풍</h4>
                      <ol>{final.weekLogImpactLines.map((line, i) => <li key={i}>{line}</li>)}</ol>
                    </>
                  )}
                  <h4>비밀 미션 근거</h4>
                  <ol>{final.missionEvidenceLines?.map((line, i) => <li key={i}>{line}</li>)}</ol>
                  <h4>종합 판정 근거</h4>
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
          <li>조직개편 생존 판정과 미션 달성 판정이 서로 다르게 나온 이유는 무엇입니까?</li>
          <li>비밀 미션 기준 중 충족하지 못한 항목은 어떤 판단 습관에서 비롯되었습니까?</li>
          <li>중간 사건 로그 중 우리 팀의 선택을 가장 크게 흔든 주차는 언제였습니까?</li>
          <li>후폭풍으로 남은 리스크는 다음 현업에서 어떻게 먼저 낮출 수 있습니까?</li>
          <li>팀 안의 인물 카드 구성은 선택의 장점과 부작용에 어떤 영향을 주었습니까?</li>
          <li>이 팀은 자기 기능 전문성에 맞는 증거를 충분히 남겼습니까?</li>
          <li>다음 주 현업에서 바로 바꿀 행동 하나는 무엇입니까?</li>
        </ol>
      </section>
    </Layout>
  );
}
