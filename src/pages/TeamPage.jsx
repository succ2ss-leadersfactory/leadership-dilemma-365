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
import { subscribe, readDb, updateDb } from '../services/storage';
import { getCurrentRound, moveToNextRound, revealRoundResult } from '../services/roundService';
import { getTeamVotes } from '../services/voteService';
import { saveTeamKSA, submitTeamDecision, getTeamDecision } from '../services/teamService';
import { submitRoundOutput, getSubmission } from '../services/submissionService';
import { calculateAllTeamResultsForRound, generateFinalResults } from '../services/calculationService';
import { defaultResultCard } from '../data/seedResultCards';

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
  const [summary, setSummary] = useState('');
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
    setMsg('Week 1 개인 선택 단계로 이동했습니다. 아래에서 선택지와 선택 이유를 입력하세요.');
    navigate(`/team/${roomId}/${teamId}`);
  }

  function calculateAndReveal() {
    try {
      calculateAllTeamResultsForRound(roomId, round.roundId);
      revealRoundResult(roomId);
      setMsg('결과를 공개했습니다. 결과 카드를 확인한 뒤 다음 라운드로 이동하세요.');
    } catch (e) {
      setMsg(e.message);
    }
  }

  function goNextRound() {
    try {
      moveToNextRound(roomId);
      setFinalChoiceId('');
      setSummary('');
      setMsg('다음 라운드로 이동했습니다. 새 상황을 확인하고 선택을 이어가세요.');
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
      setMsg('최종 판정을 생성했습니다. 아래 요약을 확인하고 팀 선언문과 연결해 보세요.');
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

      <section className="card">
        <h2>{team.teamName}</h2>
        <p>{team.slogan}</p>
        <p className="muted">현재 단계: {room.roomProgress.currentPhase}</p>
        {msg && <div className="notice">{msg}</div>}
      </section>

      {round.roundId === 'round0' && (
        <>
          <KsaSelector
            options={db.gameContent.ksaOptions[teamId]}
            selectedKSA={team.selectedKSA}
            onSubmit={(ksa) => {
              try {
                saveTeamKSA(roomId, teamId, ksa);
                setMsg('KSA를 저장했습니다. 이제 바로 Week 1 개인 선택 단계로 이동할 수 있습니다.');
              } catch (e) {
                setMsg(e.message);
              }
            }}
          />
          <section className="card next-step-card">
            <h3>다음 행동</h3>
            <p>KSA 저장을 마쳤다면 아래 버튼으로 바로 Week 1의 개인 선택 단계로 이동하세요.</p>
            {!ksaComplete && <p className="muted">지식·기술·태도 각 3개씩 선택 후 KSA를 저장하면 이동할 수 있습니다.</p>}
            <div className="actions">
              <button className="primary" disabled={!ksaComplete} onClick={startWeek1PlayerVote}>KSA 저장하고 Week 1 개인 선택으로 이동</button>
            </div>
            <p className="muted">전체 진행과 리포트 관리는 강사 화면에서 별도로 운영됩니다.</p>
          </section>
        </>
      )}

      {choices.length > 0 && (
        <section className="card">
          <TeamDecisionSummary choices={choices} opinions={votes} />
          <h3>팀 최종 선택</h3>
          <div className="notice">
            <b>지금 할 일:</b> 개인 선택을 참고하되, 팀으로 감수할 선택을 정하는 단계입니다. 좋은 점과 남는 부담을 함께 말한 뒤 최종 선택을 저장하세요.
          </div>
          <ChoiceList choices={choices} selectedChoiceId={finalChoiceId || decision?.finalChoiceId} onSelect={setFinalChoiceId} disabled={!canEdit} />
          <label>토론 요약<textarea value={summary || decision?.discussionSummary || ''} onChange={e => setSummary(e.target.value)} /></label>
          <button className="primary" onClick={() => {
            try {
              submitTeamDecision({ roomId, roundId: round.roundId, teamId, finalChoiceId: finalChoiceId || decision?.finalChoiceId, discussionSummary: summary || decision?.discussionSummary, submittedBy: 'team' });
              setMsg('팀 결정을 저장했습니다. 이어서 산출물에 다음 행동과 남는 부담을 남겨 주세요.');
            } catch (e) { setMsg(e.message); }
          }}>팀 결정 저장</button>
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
                setMsg('산출물을 저장했습니다. 결과를 공개하면 산출물 피드백과 다음 행동을 확인할 수 있습니다.');
              } catch (e) { setMsg(e.message); }
            }}
          />
        </section>
      )}

      {choices.length > 0 && !room.roomProgress.resultVisible && (
        <section className="card next-step-card">
          <h3>다음 행동</h3>
          <p>팀 결정과 산출물 저장을 마쳤다면 결과를 공개하고, 이번 선택이 남긴 피드백을 확인하세요.</p>
          {!canRevealResult && <p className="muted">팀 결정과 산출물이 모두 저장되어야 결과 공개가 가능합니다.</p>}
          <div className="actions">
            <button className="primary" disabled={!canRevealResult} onClick={calculateAndReveal}>결과 공개하고 피드백 확인</button>
          </div>
        </section>
      )}

      {room.roomProgress.resultVisible && calculation && (
        <>
          <ResultCard card={resultCard} calculation={calculation} audience="participant" />
          <section className="card next-step-card">
            <h3>다음 행동</h3>
            <p>결과를 확인했다면 다음 라운드로 이동해 같은 흐름을 이어가세요.</p>
            <div className="actions">
              <button className="primary" onClick={goNextRound}>다음 라운드로 이동</button>
            </div>
            <p className="muted">강사용 리포트와 다팀 비교는 강사가 마무리 단계에서 안내합니다.</p>
          </section>
        </>
      )}

      {round.roundId === 'week12' && (
        <>
          <section className="card">
            <h3>팀 선언문</h3>
            <p className="muted">12주 동안 우리 팀이 지키려 했던 기준과, 현업으로 가져갈 행동을 한 문장으로 남깁니다.</p>
            <textarea defaultValue={declaration?.teamDeclaration || ''} placeholder="우리는 12주 동안..." onChange={e => setSummary(e.target.value)} />
            <button className="primary" onClick={() => {
              updateDb(db2 => {
                db2.rooms[roomId].declarations[teamId] = { ...(db2.rooms[roomId].declarations[teamId] || { teamId }), teamDeclaration: summary || declaration?.teamDeclaration || '', submittedAt: Date.now() };
              });
              setMsg('팀 선언문을 저장했습니다. 이제 최종 판정을 생성하고 우리 팀의 판단 흐름을 확인하세요.');
            }}>선언문 저장</button>
          </section>

          <section className="card next-step-card">
            <h3>마지막 단계</h3>
            <p>팀 선언문을 저장했다면 최종 판정을 생성하고, 12주 동안 반복한 판단 습관을 확인하세요.</p>
            <div className="actions">
              <button className="primary" onClick={createFinalJudgment}>최종 판정 생성</button>
            </div>
            <p className="muted">최종 리포트와 전체 비교는 강사가 별도로 안내합니다.</p>
          </section>

          <FinalJudgmentCard finalResult={finalResult} audience="participant" />
        </>
      )}
    </Layout>
  );
}
