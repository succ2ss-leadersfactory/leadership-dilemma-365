import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import StrategicEventCard from '../components/StrategicEventCard.jsx';
import TwelveWeekTimeline from '../components/TwelveWeekTimeline.jsx';
import PilotRunbookPanel from '../components/PilotRunbookPanel.jsx';
import TeamExpertiseLensPanel from '../components/TeamExpertiseLensPanel.jsx';
import FinalOperationGuidePanel from '../components/FinalOperationGuidePanel.jsx';
import { subscribe, readDb } from '../services/storage';
import { stateLabels } from '../utils/statusLabels';
import { getFacilitatorInterventions } from '../utils/facilitatorInterventionUtils';

const roundFocus = {
  week1: {
    title: 'Week 1 · 위기 선언',
    intent: '첫 메시지가 팀의 위기 해석 기준을 어떻게 만드는지 보게 합니다.',
    questions: [
      '우리 팀은 위기 앞에서 가장 먼저 무엇을 통제하려 했습니까?',
      '첫 메시지는 팀원에게 압박으로 들렸습니까, 기준으로 들렸습니까?',
      '전략 이벤트 카드에서 본 압박과 숨은 대가 중 무엇을 더 크게 보았습니까?',
      '현업에서 위기 메시지를 줄 때 반드시 같이 말해야 할 것은 무엇입니까?'
    ]
  },
  week2: {
    title: 'Week 2 · 고객 반응 분기',
    intent: '빠른 반응과 조심스러운 불안 신호를 구분하는 판단을 보게 합니다.',
    questions: [
      '우리 팀은 빠른 관심과 오래 남을 불안을 어떻게 구분했습니까?',
      '이번 주 증거는 숫자입니까, 고객의 말입니까, 행동 변화입니까?',
      '고객 반응을 하나의 평균으로 뭉개지는 않았습니까?',
      '현업에서 반응군별 다음 행동을 어떻게 다르게 설계하겠습니까?'
    ]
  },
  week3: {
    title: 'Week 3 · 실무자 불만 확산',
    intent: '불만을 태도 문제로만 볼지, 실행 기준과 부담 신호로 볼지 보게 합니다.',
    questions: [
      '팀원들의 불만은 저항입니까, 기준 부족 신호입니까?',
      '우리 팀은 불편한 말을 줄였습니까, 다룰 수 있게 만들었습니까?',
      '성과 압박이 특정 사람에게 몰리고 있지는 않습니까?',
      '현업에서 불만을 생산적인 정보로 바꾸려면 무엇을 먼저 물어야 합니까?'
    ]
  },
  week4: {
    title: 'Week 4 · 상무 중간 점검',
    intent: '성과를 말하는 방식이 실제 증거와 연결되어 있는지 보게 합니다.',
    questions: [
      '우리 팀은 보여주고 싶은 성과와 실제 증거를 구분했습니까?',
      '상무가 믿을 수 있는 증거는 무엇이었습니까?',
      '부족한 점을 감췄습니까, 다음 증거로 연결했습니까?',
      '현업에서 중간 보고를 할 때 어떤 지표와 이야기를 함께 제시하겠습니까?'
    ]
  },
  week5: {
    title: 'Week 5 · 핵심 인재 부담',
    intent: '성과를 만드는 방식이 특정 사람에게 과도하게 의존하고 있지 않은지 보게 합니다.',
    questions: [
      '우리 팀은 성과를 위해 누구의 부담을 당연하게 여겼습니까?',
      '핵심 인재를 보호하는 일은 배려입니까, 성과관리입니까?',
      '이 이벤트에서 단기 완성도와 팀 지속성 중 무엇을 선택했습니까?',
      '다음 현업에서 부담을 나누기 위해 줄일 일 하나는 무엇입니까?'
    ]
  },
  week6: {
    title: 'Week 6 · 협업 병목',
    intent: '타부서 지연을 불만으로만 볼지, 합의 조건과 병목으로 볼지 보게 합니다.',
    questions: [
      '우리 팀은 타부서 협조 지연의 원인을 확인했습니까?',
      '병목은 사람 문제입니까, 기준과 순서 문제입니까?',
      '협업 요청에 필요한 조건을 분명히 말했습니까?',
      '현업에서 타부서와 다시 합의해야 할 최소 기준은 무엇입니까?'
    ]
  },
  week7: {
    title: 'Week 7 · TF 후보 거론',
    intent: '성장 기회와 원팀 공백을 함께 설계하는 판단을 보게 합니다.',
    questions: [
      'TF 파견을 사람 선발 문제로 보았습니까, 공백 설계 문제로 보았습니까?',
      '파견되는 사람의 성장 기회와 남는 팀의 부담을 함께 봤습니까?',
      '상무에게 조건 없이 사람만 보낸 것은 아닙니까?',
      '현업에서 핵심 인력 차출이 있을 때 어떤 보완 계획이 필요합니까?'
    ]
  },
  week8: {
    title: 'Week 8 · AI 자동화 TF',
    intent: '전사 기회와 원팀 공백을 동시에 관리하는 판단을 보게 합니다.',
    questions: [
      'TF 파견을 사람 선발 문제로 보았습니까, 공백 설계 문제로 보았습니까?',
      '성장 기회와 실행 안정성 중 무엇을 더 크게 보았습니까?',
      '이 이벤트에서 우리 팀이 얻을 수 있는 전략적 기회는 무엇입니까?',
      '타부서 협업에서 미리 합의해야 할 조건은 무엇입니까?'
    ]
  },
  week9: {
    title: 'Week 9 · 경쟁팀 선보고',
    intent: '비교 압박 앞에서 따라 할 것과 지킬 기준을 구분하는 판단을 보게 합니다.',
    questions: [
      '우리 팀은 경쟁팀 성과를 그대로 따라가려 했습니까, 기준을 다시 세웠습니까?',
      '겉으로 좋아 보이는 성과 뒤에 숨은 비용이나 부담을 보았습니까?',
      '상무에게 우리 팀만의 증거를 무엇으로 보여주려 했습니까?',
      '현업에서 비교 압박이 올 때 버리지 말아야 할 기준은 무엇입니까?'
    ]
  },
  week10: {
    title: 'Week 10 · 루머 확산',
    intent: '불확실성 속에서 사실, 추측, 감정을 구분하는 리더십을 보게 합니다.',
    questions: [
      '우리 팀은 불안을 다뤘습니까, 덮었습니까, 흘려보냈습니까?',
      '말할 수 있는 것과 말하지 말아야 할 것을 어떻게 구분했습니까?',
      '이 이벤트에서 확인된 사실, 확인 중인 내용, 추측은 무엇입니까?',
      '현업에서 루머가 돌 때 팀장이 먼저 정해야 할 기준은 무엇입니까?'
    ]
  },
  week11: {
    title: 'Week 11 · 마지막 승부수',
    intent: '마지막 기회 앞에서 무엇을 걸고 무엇을 포기하는지 보게 합니다.',
    questions: [
      '우리 팀은 마지막에 성과, 기준, 사람, 협업 중 무엇을 우선했습니까?',
      '선택하지 않은 것의 대가를 충분히 말했습니까?',
      '이 이벤트에서 우리 팀이 증명하려 한 하나의 증거는 무엇입니까?',
      '현업에서 마지막 승부수를 정할 때 버릴 일을 어떻게 정하겠습니까?'
    ]
  },
  week12: {
    title: 'Week 12 · 최종 판정',
    intent: '판정이 승패가 아니라 반복된 판단 습관의 거울임을 정리합니다.',
    questions: [
      '우리 팀의 최종 판정은 어떤 반복 판단의 결과입니까?',
      '남은 부담은 개인의 역량 문제입니까, 구조와 운영 방식의 문제입니까?',
      '전략 이벤트 카드들 앞에서 반복한 선택 습관은 무엇입니까?',
      '다음 주 현업에서 바로 바꿀 행동 하나는 무엇입니까?'
    ]
  }
};

function getRiskText(room) {
  const states = Object.values(room.stateValues || {});
  const sorted = states.sort((a, b) => (b.maxRiskValue || 0) - (a.maxRiskValue || 0));
  const top = sorted[0];
  if (!top) return '아직 상태값이 없습니다.';
  const team = room.teams[top.teamId]?.teamName || top.teamId;
  return `${team}의 ${stateLabels[top.maxRiskKey] || top.maxRiskKey}이 가장 크게 남아 있습니다.`;
}

export default function FacilitatorGuidePage() {
  const { roomId } = useParams();
  const [tick, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  if (!room) return <Layout><div className="card">방 정보를 찾을 수 없습니다.</div></Layout>;

  const currentRoundId = room.roomProgress.currentRoundId;
  const currentRound = db.gameContent.rounds.find(r => r.roundId === currentRoundId);
  const strategicEvent = db.gameContent.strategicEvents?.[currentRound?.strategicEventId];
  const focus = roundFocus[currentRoundId] || roundFocus.week12;
  const finalCount = Object.keys(room.finalResults || {}).length;
  const reflectionCount = Object.values(room.declarations || {}).reduce((sum, d) => sum + Object.keys(d.individualReflections || {}).length, 0);
  const teamInterventions = getFacilitatorInterventions({ room, gameContent: db.gameContent, currentRoundId });

  return (
    <Layout roomId={roomId}>
      <section className="card hero">
        <p className="eyebrow">강사용 진행 가이드</p>
        <h2>{focus.title}</h2>
        <p>{focus.intent}</p>
        <div className="actions">
          <Link className="secondary" to={`/host/${roomId}`}>Host 화면</Link>
          <Link className="secondary" to={`/admin/${roomId}`}>운영 QA</Link>
          <Link className="secondary" to={`/report/${roomId}`}>교육 리포트</Link>
        </div>
      </section>

      <FinalOperationGuidePanel roomId={roomId} />
      <PilotRunbookPanel round={currentRound} progress={room.roomProgress} />
      <StrategicEventCard event={strategicEvent} />
      <TwelveWeekTimeline rounds={db.gameContent.rounds} weekLogs={db.gameContent.weekLogs} currentWeek={currentRound?.week || 0} />

      <section className="grid2">
        <div className="card">
          <h3>현재 운영 체크</h3>
          <p><b>현재 라운드:</b> {room.roomProgress.currentRoundId}</p>
          <p><b>현재 단계:</b> {room.roomProgress.currentPhase}</p>
          <p><b>전략 이벤트:</b> {strategicEvent?.title || '없음'}</p>
          <p><b>최종 판정 생성:</b> {finalCount}개 팀</p>
          <p><b>개인 성찰 제출:</b> {reflectionCount}건</p>
          <p><b>리스크 포인트:</b> {getRiskText(room)}</p>
        </div>
        <div className="card">
          <h3>강사 멘트 예시</h3>
          <p>좋은 선택을 찾는 시간이 아니라, 우리 팀이 선택할 때 반복한 기준과 그 대가를 확인하는 시간입니다.</p>
          <p>이벤트 카드와 중간 사건 로그는 정답을 추가하는 장치가 아니라, 같은 선택 안에 숨어 있는 압박과 기회를 보이게 하는 장치입니다.</p>
          <p>결과가 낮게 나왔다면 실패로 보지 말고, 현업에서 먼저 고쳐야 할 부담이 드러난 것으로 보겠습니다.</p>
        </div>
      </section>

      <TeamExpertiseLensPanel teams={room.teams} lenses={db.gameContent.teamExpertiseLenses} />

      <section className="card debriefBox">
        <h3>팀별 관찰·개입 가이드</h3>
        {teamInterventions.map(team => (
          <div className="reflectionItem" key={team.teamId}>
            <h4>{team.teamName}</h4>
            <p><b>인물 카드 구성:</b> {team.personaMix}</p>
            <p><b>현재 선택:</b> {team.choiceText} <span className="muted">({team.choiceType})</span></p>
            {team.interventions.length ? (
              <ol>
                {team.interventions.map((item, index) => (
                  <li key={`${team.teamId}_${item.title}_${index}`}>
                    <b>[{item.priority}] {item.title}</b>
                    <p><b>관찰 신호:</b> {item.signal}</p>
                    <p><b>개입 멘트:</b> {item.intervention}</p>
                    <p><b>질문:</b> {item.question}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="muted">아직 개입 신호가 없습니다. 팀 결정과 결과 계산 후 더 구체적인 질문이 표시됩니다.</p>}
          </div>
        ))}
      </section>

      <section className="card debriefBox">
        <h3>핵심 질문</h3>
        <ol>
          {focus.questions.map(q => <li key={q}>{q}</li>)}
        </ol>
      </section>

      <section className="card">
        <h3>진행 순서 제안</h3>
        <ol>
          <li>파일럿 운영용 최종 사용 가이드에서 전체 운영 흐름과 문제 발생 시 조치를 먼저 확인합니다.</li>
          <li>파일럿 진행 체크리스트에서 현재 단계의 강사 멘트와 버튼 순서를 확인합니다.</li>
          <li>12주 타임라인에서 지난 사건 로그와 현재 플레이 라운드의 연결을 먼저 확인합니다.</li>
          <li>전략 이벤트 카드에서 압박, 숨은 대가, 전략적 기회를 읽습니다.</li>
          <li>각 팀이 왜 그 선택을 했는지 1분씩 말하게 합니다.</li>
          <li>팀별 전문지식 렌즈에서 각 팀이 놓치기 쉬운 판단 기준을 확인합니다.</li>
          <li>팀별 관찰·개입 가이드에서 인물 카드 구성과 선택의 부작용을 확인합니다.</li>
          <li>결과 카드에서 작은 진전, 남은 부담, 인물 카드 영향을 구분해 읽습니다.</li>
          <li>팀별 핵심 리스크가 개인 문제인지 구조 문제인지 묻습니다.</li>
          <li>개인 성찰을 바탕으로 다음 현업 행동을 한 문장으로 정리합니다.</li>
          <li>마지막에는 교육 리포트에서 팀 선언문과 최종 판정을 함께 확인합니다.</li>
        </ol>
      </section>
    </Layout>
  );
}
