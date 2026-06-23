import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import RoundCard from '../components/RoundCard.jsx';
import StrategicEventCard from '../components/StrategicEventCard.jsx';
import TwelveWeekTimeline from '../components/TwelveWeekTimeline.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import KsaSelector from '../components/KsaSelector.jsx';
import OutputForm from '../components/OutputForm.jsx';
import ResultCard from '../components/ResultCard.jsx';
import ParticipantStepGuide from '../components/ParticipantStepGuide.jsx';
import FinalJudgmentCard from '../components/FinalJudgmentCard.jsx';
import TeamDecisionSummary from '../components/TeamDecisionSummary.jsx';
import TeamDiscussionGuide from '../components/TeamDiscussionGuide.jsx';
import TeamDeclarationGuide from '../components/TeamDeclarationGuide.jsx';
import StatusNoticeCard from '../components/StatusNoticeCard.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { getCurrentRound, moveToNextRound, revealRoundResult } from '../services/roundService';
import { getTeamVotes } from '../services/voteService';
import { saveTeamKSA, submitTeamDecision, getTeamDecision } from '../services/teamService';
import { submitRoundOutput, getSubmission } from '../services/submissionService';
import { calculateAllTeamResultsForRound, generateFinalResults } from '../services/calculationService';
import { defaultResultCard } from '../data/seedResultCards';
import '../styles/teamDecisionWorkshop.css';

const PHASE_LABELS = {
  ksaSelection: 'KSA 선택',
  playerVote: '개인 생각',
  teamDecision: '팀 토의와 최종 선택',
  outputSubmission: '산출물 작성',
  resultReview: '결과 카드 확인',
  finalReflection: '개인 성찰',
  teamDeclaration: '팀 선언문 작성',
  finalResult: '최종 판정 확인',
};

function getRoundLabel(round) {
  if (round.roundId === 'round0') return 'Round 0';
  if (round.roundId === 'week12') return 'Week 12';
  return `Week ${round.week}`;
}

function isKsaComplete(selectedKSA) {
  return (
    selectedKSA?.knowledge?.length === 3 &&
    selectedKSA?.skill?.length === 3 &&
    selectedKSA?.attitude?.length === 3
  );
}

export default function TeamPage() {
  const { roomId, teamId } = useParams();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [finalChoiceId, setFinalChoiceId] = useState('');
  const [discussionSummaryDraft, setDiscussionSummaryDraft] = useState(null);
  const [teamDeclarationDraft, setTeamDeclarationDraft] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  const round = getCurrentRound(roomId);

  if (!room || !round) {
    return <Layout><div className="card">팀 정보를 찾을 수 없습니다.</div></Layout>;
  }

  const team = room.teams[teamId];
  const expertiseLens = db.gameContent.teamExpertiseLenses?.[teamId];
  const strategicEvent = db.gameContent.strategicEvents?.[round.strategicEventId];
  const choices = db.gameContent.choices
    .filter(c => round.choiceIds.includes(c.choiceId))
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const votes = getTeamVotes(roomId, round.roundId, teamId);
  const decision = getTeamDecision(roomId, round.roundId, teamId);
  const outputRequirement = db.gameContent.outputRequirements[round.outputRequirementId];
  const submission = getSubmission(roomId, round.roundId, teamId);
  const calculation = room.roundCalculations[`${round.roundId}_${teamId}`];
  const resultCard = db.gameContent.resultCards[calculation?.resultCardId] || defaultResultCard;
  const finalResult = room.finalResults?.[teamId];
  const declaration = room.declarations?.[teamId];
  const canEdit = !room.roomProgress.isScreenLocked;
  const ksaComplete = isKsaComplete(team.selectedKSA);
  const canRevealResult = Boolean(decision && submission);
  const currentPhaseLabel = PHASE_LABELS[room.roomProgress.currentPhase] || room.roomProgress.currentPhase;
  const roundLabel = getRoundLabel(round);
  const resultReadinessItems = [
    decision ? '팀 최종 선택 저장 완료' : '팀 최종 선택을 먼저 저장해야 합니다.',
    submission ? '산출물 저장 완료' : '산출물을 먼저 저장해야 합니다.'
  ];

  function startWeek1PlayerVote() {
    updateDb(db2 => {
      const targetRoom = db2.rooms[roomId];
      targetRoom.roomProgress.currentRoundId = 'week1';
      targetRoom.roomProgress.currentPhase = 'playerVote';
      targetRoom.roomProgress.currentRoundOrder = 2;
      targetRoom.roomProgress.resultVisible = false;
      targetRoom.roomProgress.updatedAt = Date.now();
      if (targetRoom.roundProgress.round0) {
        targetRoom.roundProgress.round0.status = 'completed';
        targetRoom.roundProgress.round0.resultRevealed = true;
      }
      if (targetRoom.roundProgress.week1) {
        targetRoom.roundProgress.week1.status = 'active';
        targetRoom.roundProgress.week1.phase = 'playerVote';
      }
    });
    setMsg('Week 1이 열렸습니다. 먼저 상황을 읽고 각자 1분 동안 선택 방향을 생각한 뒤 팀 토의로 이어가세요.');
    navigate(`/team/${roomId}/${teamId}`);
  }

  function calculateAndReveal() {
    try {
      calculateAllTeamResultsForRound(roomId, round.roundId);
      revealRoundResult(roomId);
      setMsg('결과 카드를 공개했습니다. 이번 선택의 피드백을 확인한 뒤 다음 라운드로 이동하세요.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  function goNextRound() {
    try {
      moveToNextRound(roomId);
      setFinalChoiceId('');
      setDiscussionSummaryDraft(null);
      setTeamDeclarationDraft(null);
      setMsg('다음 라운드가 열렸습니다. 새 상황을 읽고 각자 1분 개인 생각 후 팀 토의로 이어가세요.');
      navigate(`/team/${roomId}/${teamId}`);
    } catch (e) {
      setMsg(e.message);
    }
  }

  function createFinalJudgment() {
    try {
      generateFinalResults(roomId);
      updateDb(db2 => {
        const targetRoom = db2.rooms[roomId];
        targetRoom.roomProgress.currentPhase = 'finalResult';
        targetRoom.roomProgress.finalResultVisible = true;
        Object.values(targetRoom.finalResults).forEach(result => { result.visible = true; });
      });
      setMsg('최종 판정을 생성했습니다. 12주 판단 흐름과 팀 선언문을 함께 확인하세요.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <Layout roomId={roomId}>
      <RoundCard round={round} />
      <ParticipantStepGuide mode="team" roundId={round.roundId} resultVisible={room.roomProgress.resultVisible} />
      <StrategicEventCard event={strategicEvent} teamId={teamId} />
      <TwelveWeekTimeline rounds={db.gameContent.rounds} weekLogs={db.gameContent.weekLogs} currentWeek={round.week} teamId={teamId} compact />

      <section className="card team-status-card">
        <div className="team-status-card__main">
          <div>
            <p className="team-status-card__eyebrow">TEAM JOURNEY</p>
            <h2>{team.teamName}</h2>
            <p className="team-status-card__slogan">{team.slogan}</p>
          </div>
          <div className="team-status-card__phase">
            <span>현재 단계</span>
            <strong>{currentPhaseLabel}</strong>
            <small>{room.roomProgress.currentPhase}</small>
          </div>
        </div>
        <div className="team-status-card__meta">
          <span>{roundLabel}</span>
          <span>{room.roomProgress.resultVisible ? '결과 확인 중' : '팀 판단 진행 중'}</span>
          <span>{canEdit ? '팀 대표 입력 가능' : '화면 잠금'}</span>
        </div>
        {msg && <div className="notice">{msg}</div>}
        {!canEdit && <StatusNoticeCard type="locked" title="현재 화면이 잠겨 있습니다" meta={[currentPhaseLabel, roundLabel]}>강사가 화면 잠금을 해제하면 팀 최종 선택, 토론 요약, 산출물 입력을 다시 진행할 수 있습니다.</StatusNoticeCard>}
      </section>

      <section className="card team-single-screen-guide">
        <h3>팀 단일 화면 운영 안내</h3>
        <p>이 화면은 팀 대표 입력 화면입니다. 각 팀은 화면 하나만 사용해 상황을 읽고, 각자 1분 동안 선택 방향을 생각한 뒤 토의합니다.</p>
        <div className="team-decision-workshop-card__notice">
          <b>입력은 한 명만</b>
          <span>팀원들은 토의에 참여하고, 팀 대표가 최종 선택·토론 요약·산출물을 이 화면에 입력하면 됩니다.</span>
        </div>
      </section>

      {round.roundId === 'round0' && (
        <>
          <KsaSelector
            options={db.gameContent.ksaOptions[teamId]}
            selectedKSA={team.selectedKSA}
            onSubmit={(ksa) => {
              try {
                saveTeamKSA(roomId, teamId, ksa);
                setMsg('KSA가 저장되었습니다. 이제 Week 1 상황 읽기와 개인 생각을 시작할 수 있습니다.');
              } catch (e) {
                setMsg(e.message);
              }
            }}
          />
          <section className="card next-step-card">
            <h3>다음에 할 일</h3>
            <p>KSA 저장을 마쳤다면 Week 1 상황 읽기와 개인 생각으로 넘어가세요.</p>
            {!ksaComplete && <StatusNoticeCard title="KSA 선택 대기" items={['지식 3개를 선택합니다.', '기술 3개를 선택합니다.', '태도 3개를 선택합니다.']}>세 영역이 모두 3개씩 선택되어야 Week 1로 이동할 수 있습니다.</StatusNoticeCard>}
            <div className="actions">
              <button className="primary" disabled={!ksaComplete} onClick={startWeek1PlayerVote}>Week 1 시작하기</button>
            </div>
            <p className="muted">전체 진행과 리포트 관리는 강사 화면에서 별도로 운영됩니다.</p>
          </section>
        </>
      )}

      {choices.length > 0 && (
        <section className="card team-decision-workshop-card">
          <TeamDecisionSummary choices={choices} opinions={votes} />
          <div className="team-decision-workshop-card__header">
            <p className="team-decision-workshop-card__eyebrow">TEAM AGREEMENT</p>
            <h3>팀 최종 선택</h3>
            <p>각자 먼저 생각한 선택 방향을 나눈 뒤, 팀으로 감수할 선택을 정하는 단계입니다. 좋은 점과 남는 부담을 함께 말한 뒤 최종 선택을 저장하세요.</p>
          </div>
          <div className="team-decision-workshop-card__notice">
            <b>지금 할 일</b>
            <span>가장 먼저 떠오른 선택을 그대로 따르기보다, 팀이 책임질 수 있는 기준과 부담을 함께 확인하세요.</span>
          </div>
          {!canEdit && <StatusNoticeCard type="locked" title="팀 결정 입력 대기">현재는 강사가 화면을 잠근 상태입니다. 화면이 열리면 최종 선택과 토론 요약을 저장할 수 있습니다.</StatusNoticeCard>}
          <ChoiceList choices={choices} selectedChoiceId={finalChoiceId || decision?.finalChoiceId} onSelect={setFinalChoiceId} disabled={!canEdit} />
          <TeamDiscussionGuide />
          <label className="team-decision-summary-field">토론 요약
            <small>합의한 기준, 갈린 의견, 감수할 부담, 다음 확인 시점을 짧게 남겨 주세요.</small>
            <textarea value={discussionSummaryDraft ?? decision?.discussionSummary ?? ''} onChange={e => setDiscussionSummaryDraft(e.target.value)} placeholder="예: 고객 신뢰 회복을 우선 기준으로 삼고 B안을 선택했다. 단, 내부 일정 지연 부담이 남아 다음 회의에서 담당자와 확인 시점을 정한다." />
          </label>
          <div className="team-decision-save-bar">
            <button className="primary" onClick={() => {
              try {
                submitTeamDecision({ roomId, roundId: round.roundId, teamId, finalChoiceId: finalChoiceId || decision?.finalChoiceId, discussionSummary: discussionSummaryDraft ?? decision?.discussionSummary ?? '', submittedBy: 'team' });
                setMsg('팀 최종 선택을 저장했습니다. 이어서 산출물에 다음 행동과 남는 부담을 남겨 주세요.');
              } catch (e) { setMsg(e.message); }
            }}>팀 최종 선택 저장</button>
            <p>저장 후 산출물 입력에서 이 선택을 실제 행동 조건으로 바꿉니다.</p>
          </div>
        </section>
      )}

      {choices.length > 0 && (
        <section className="card">
          <h3>산출물 입력</h3>
          <OutputForm
            outputRequirement={outputRequirement}
            initialAnswers={submission?.answers}
            expertiseLens={expertiseLens}
            evidenceReview={submission?.evidenceReview}
            onSubmit={(answers) => {
              try {
                submitRoundOutput({ roomId, roundId: round.roundId, teamId, answers, submittedBy: 'team' });
                setMsg('산출물이 저장되었습니다. 결과 공개 후 산출물 피드백과 다음 행동을 확인하세요.');
              } catch (e) { setMsg(e.message); }
            }}
          />
        </section>
      )}

      {choices.length > 0 && !room.roomProgress.resultVisible && (
        <section className="card next-step-card">
          <h3>다음에 할 일</h3>
          <p>팀 최종 선택과 산출물을 저장했다면 결과를 계산하고 피드백을 확인하세요.</p>
          {!canRevealResult && <StatusNoticeCard title="결과 공개 대기" items={resultReadinessItems}>결과 공개는 팀 최종 선택과 산출물이 모두 저장된 뒤 가능합니다.</StatusNoticeCard>}
          <div className="actions">
            <button className="primary" disabled={!canRevealResult} onClick={calculateAndReveal}>결과 계산하고 피드백 확인</button>
          </div>
        </section>
      )}

      {room.roomProgress.resultVisible && calculation && (
        <>
          <ResultCard card={resultCard} calculation={calculation} audience="participant" />
          <section className="card next-step-card">
            <h3>다음에 할 일</h3>
            <p>결과 피드백을 확인했다면 다음 라운드를 시작하세요.</p>
            <div className="actions">
              <button className="primary" onClick={goNextRound}>다음 라운드 시작하기</button>
            </div>
            <p className="muted">강사용 리포트와 다팀 비교는 강사가 마무리 단계에서 안내합니다.</p>
          </section>
        </>
      )}

      {round.roundId === 'week12' && (
        <>
          <section className="card team-declaration-workshop-card">
            <div className="team-declaration-workshop-card__header">
              <p className="team-declaration-workshop-card__eyebrow">WEEK 12 DECLARATION</p>
              <h3>팀 선언문</h3>
              <p>12주 동안 우리 팀이 지키려 했던 기준과, 현업으로 가져갈 행동을 한 문장으로 남깁니다.</p>
            </div>
            <TeamDeclarationGuide />
            <label className="team-declaration-field">우리 팀 선언문
              <small>판정 결과를 맞히기 위한 문장이 아니라, 현업으로 돌아가서 함께 지킬 기준을 적어 주세요.</small>
              <textarea value={teamDeclarationDraft ?? declaration?.teamDeclaration ?? ''} placeholder="예: 우리는 빠른 결정보다, 고객과 팀원에게 남는 부담을 먼저 확인하는 팀이 되겠습니다." onChange={e => setTeamDeclarationDraft(e.target.value)} />
            </label>
            <div className="team-declaration-save-bar">
              <button className="primary" onClick={() => {
                updateDb(db2 => {
                  db2.rooms[roomId].declarations[teamId] = { ...(db2.rooms[roomId].declarations[teamId] || { teamId }), teamDeclaration: teamDeclarationDraft ?? declaration?.teamDeclaration ?? '', submittedAt: Date.now() };
                });
                setMsg('팀 선언문이 저장되었습니다. 이제 최종 판정을 생성하고 우리 팀의 판단 흐름을 확인하세요.');
              }}>팀 선언문 저장</button>
              <p>저장한 선언문은 최종 판정을 확인할 때 우리 팀의 판단 기준과 함께 돌아보는 문장으로 사용됩니다.</p>
            </div>
          </section>

          <section className="card next-step-card">
            <h3>마지막으로 할 일</h3>
            <p>팀 선언문을 저장했다면 최종 판정을 생성하고, 12주 동안 반복한 판단 습관을 확인하세요.</p>
            {!declaration?.teamDeclaration && <StatusNoticeCard title="팀 선언문 저장 대기">최종 판정은 생성할 수 있지만, 먼저 팀 선언문을 저장하면 결과를 우리 팀의 행동 약속과 함께 돌아볼 수 있습니다.</StatusNoticeCard>}
            <div className="actions">
              <button className="primary" onClick={createFinalJudgment}>최종 판정 생성하고 확인</button>
            </div>
            <p className="muted">최종 리포트와 전체 비교는 강사가 별도로 안내합니다.</p>
          </section>

          <FinalJudgmentCard finalResult={finalResult} audience="participant" />
        </>
      )}
    </Layout>
  );
}
