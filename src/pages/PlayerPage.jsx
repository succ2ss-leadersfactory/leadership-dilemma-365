import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import RoundCard from '../components/RoundCard.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import ResultCard from '../components/ResultCard.jsx';
import CompetencyProfilePanel from '../components/CompetencyProfilePanel.jsx';
import ParticipantOnboardingPanel from '../components/ParticipantOnboardingPanel.jsx';
import ParticipantStepGuide from '../components/ParticipantStepGuide.jsx';
import StatusNoticeCard from '../components/StatusNoticeCard.jsx';
import { subscribe, readDb, updateDb } from '../services/storage';
import { getPlayer } from '../services/playerService';
import { getCurrentRound } from '../services/roundService';
import { submitVote, getVote } from '../services/voteService';
import { defaultResultCard } from '../data/seedResultCards';
import '../styles/playerDecisionUx.css';

const PLAYER_PHASE_LABELS = {
  ksaSelection: 'KSA 선택',
  playerVote: '확장 운영 개인 입력',
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

function playerWaitMessage(progress) {
  if (progress.isScreenLocked) return '강사가 화면을 잠근 상태입니다. 잠금이 해제되면 입력할 수 있습니다.';
  if (progress.currentPhase === 'ksaSelection') return 'Round 0과 기본 진행은 팀 화면에서 진행합니다. 개인별 입력은 확장 운영에서만 사용하세요.';
  if (progress.currentPhase !== 'playerVote') return '지금은 개인별 입력 단계가 아닙니다. 기본 운영은 팀 화면에서 토의와 결정을 진행합니다.';
  return '온라인/확장 운영에서 개인 판단을 입력할 수 있습니다.';
}

export default function PlayerPage() {
  const { roomId, playerId } = useParams();
  const [tick, setTick] = useState(0);
  const [choiceId, setChoiceId] = useState('');
  const [reasonDraft, setReasonDraft] = useState(null);
  const [habitDraft, setHabitDraft] = useState(null);
  const [nextBehaviorDraft, setNextBehaviorDraft] = useState(null);
  const [msg, setMsg] = useState('');
  const [showGuide, setShowGuide] = useState(() => localStorage.getItem(`participantGuide_${playerId}`) !== 'hidden');

  useEffect(() => subscribe(() => setTick(x => x + 1)), []);

  const db = readDb();
  const room = db.rooms[roomId];
  const player = getPlayer(roomId, playerId);
  const round = getCurrentRound(roomId);
  if (!room || !player || !round) return <Layout><div className="card">정보를 찾을 수 없습니다.</div></Layout>;

  const team = room.teams[player.teamId];
  const choices = db.gameContent.choices.filter(c => round.choiceIds.includes(c.choiceId)).sort((a, b) => a.displayOrder - b.displayOrder);
  const vote = getVote(roomId, round.roundId, player.teamId, playerId);
  const canVote = room.roomProgress.currentPhase === 'playerVote' && !room.roomProgress.isScreenLocked;
  const calculation = room.roundCalculations[`${round.roundId}_${player.teamId}`];
  const resultCard = db.gameContent.resultCards[calculation?.resultCardId] || defaultResultCard;
  const declaration = room.declarations?.[player.teamId];
  const reflection = declaration?.individualReflections?.[playerId];
  const competencyProfile = room.competencyProfiles?.[player.teamId]?.[playerId];
  const currentPhaseLabel = PLAYER_PHASE_LABELS[room.roomProgress.currentPhase] || room.roomProgress.currentPhase;
  const roundLabel = getRoundLabel(round);
  const showInputWait = choices.length > 0 && !canVote && !room.roomProgress.resultVisible;

  const save = () => {
    try {
      submitVote({ roomId, roundId: round.roundId, teamId: player.teamId, playerId, choiceId: choiceId || vote?.choiceId, reason: reasonDraft ?? vote?.reason ?? '' });
      setMsg('확장 운영용 개인 판단이 저장되었습니다. 기본 토의와 최종 결정은 팀 화면에서 이어가세요.');
    } catch (e) { setMsg(e.message); }
  };

  const saveReflection = () => {
    updateDb(db2 => {
      const d = db2.rooms[roomId].declarations[player.teamId] || { teamId: player.teamId, individualReflections: {} };
      d.individualReflections = {
        ...(d.individualReflections || {}),
        [playerId]: {
          habit: habitDraft ?? reflection?.habit ?? '',
          nextBehavior: nextBehaviorDraft ?? reflection?.nextBehavior ?? '',
          submittedAt: Date.now()
        }
      };
      db2.rooms[roomId].declarations[player.teamId] = d;
    });
    setMsg('개인 성찰이 저장되었습니다. 팀 선언문 작성으로 이어가세요.');
  };

  const hideGuide = () => {
    localStorage.setItem(`participantGuide_${playerId}`, 'hidden');
    setShowGuide(false);
  };

  return (
    <Layout roomId={roomId}>
      {showGuide && (
        <>
          <ParticipantOnboardingPanel mode="player" playerName={player.displayName} teamName={team.teamName} />
          <section className="card"><button className="secondary" onClick={hideGuide}>참가 안내 접기</button></section>
        </>
      )}
      <RoundCard round={round} />
      <ParticipantStepGuide mode="player" roundId={round.roundId} resultVisible={room.roomProgress.resultVisible} />
      <section className="card">
        <h3>확장 운영용 개인 입력 화면</h3>
        <p>이 화면은 기본 대면 운영에서 필수로 쓰지 않습니다. 팀 화면 하나로 진행하는 경우에는 각자 1분 동안 생각만 하고, 토의와 입력은 팀 화면에서 진행하세요.</p>
        <p className="muted"><Link to={`/team/${roomId}/${player.teamId}`}>팀 진행 화면으로 이동</Link></p>
      </section>
      <section className="card player-decision-card">
        <div className="playerDecisionHeader">
          <div>
            <p className="playerDecisionHeader__eyebrow">OPTIONAL PLAYER JOURNEY</p>
            <h2>{player.displayName}</h2>
            <p className="playerDecisionHeader__team">팀: <Link to={`/team/${roomId}/${player.teamId}`}>{team.teamName}</Link></p>
          </div>
          <div className="playerDecisionHeader__phase">
            <span>현재 단계</span>
            <strong>{currentPhaseLabel}</strong>
            <small>{room.roomProgress.currentPhase}</small>
          </div>
        </div>
        <div className="playerDecisionHeader__meta">
          <span>{roundLabel}</span>
          <span>{canVote ? '확장 개인 입력 가능' : '입력 대기 또는 잠금'}</span>
          <span>{vote?.choiceId ? '저장한 판단 있음' : '아직 저장 전'}</span>
        </div>
        {!showGuide && <button className="secondary" onClick={() => setShowGuide(true)}>참가 안내 다시 보기</button>}
        {msg && <div className="notice">{msg}</div>}
        {showInputWait && <StatusNoticeCard type={room.roomProgress.isScreenLocked ? 'locked' : 'waiting'} title="확장 운영 입력 대기" meta={[currentPhaseLabel, roundLabel]}>{playerWaitMessage(room.roomProgress)}</StatusNoticeCard>}

        {choices.length > 0 ? (
          <>
            <div className="notice">
              <b>확장 운영에서 할 일:</b> 팀 토의 전에 먼저 혼자 판단을 남기는 단계입니다. 기본 운영에서는 앱에 입력하지 않고 1분 동안 선택 방향만 생각해도 됩니다.
            </div>
            <div className="personalDecisionGuide">
              <h3>혼자 먼저 판단할 때 볼 3가지</h3>
              <p>팀 의견을 듣기 전에 내가 먼저 무엇을 중요하게 보았는지 정리하면, 토의에서 판단 차이가 더 잘 드러납니다.</p>
              <div className="personalDecisionChecklist">
                <div><b>문제의 핵심</b><span>지금 가장 먼저 풀어야 할 문제는 무엇입니까?</span></div>
                <div><b>얻는 것</b><span>이 선택으로 우리 팀이 바로 얻는 진전은 무엇입니까?</span></div>
                <div><b>미루는 부담</b><span>이 선택으로 뒤로 밀리는 부담은 무엇입니까?</span></div>
              </div>
            </div>
            <ChoiceList choices={choices} selectedChoiceId={choiceId || vote?.choiceId} onSelect={setChoiceId} disabled={!canVote} />
            <label className="personalReasonField">선택 이유<textarea disabled={!canVote} value={reasonDraft ?? vote?.reason ?? ''} onChange={e => setReasonDraft(e.target.value)} placeholder="예: 고객 신뢰 회복이 먼저라고 보았습니다. 다만 내부 실행 부담은 커질 수 있습니다." /></label>
            <div className="personalReasonGuide">
              <b>선택 이유에는 이런 내용이 들어가면 좋습니다</b>
              <ul>
                <li>내가 본 핵심 문제</li>
                <li>이 선택으로 얻는 것</li>
                <li>이 선택이 남길 수 있는 부담</li>
              </ul>
            </div>
            <div className="actions">
              <button className="primary" disabled={!canVote} onClick={save}>확장 운영: 개인 판단 저장하기</button>
              <Link className="secondary" to={`/team/${roomId}/${player.teamId}`}>팀 진행 화면 열기</Link>
            </div>
            <p className="personalDecisionAfterSave">기본 운영에서는 팀 화면에서 각자 생각한 방향을 말로 나눈 뒤, 팀 대표가 최종 선택을 입력합니다.</p>
          </>
        ) : round.roundId === 'week12' ? (
          <>
            <div className="personalReflectionPanel">
              <p className="personalReflectionPanel__eyebrow">WEEK 12 REFLECTION</p>
              <h3>개인 성찰</h3>
              <p>팀 선언문을 쓰기 전에, 내가 반복한 판단 습관과 현업에서 바꿀 행동을 먼저 남깁니다. 기본 운영에서는 강사의 안내에 따라 별도 활동지나 팀 토의로 진행할 수 있습니다.</p>
              <div className="personalReflectionChecklist">
                <div><b>반복한 판단 습관</b><span>12주 동안 비슷한 상황에서 내가 자주 선택한 기준을 떠올립니다.</span></div>
                <div><b>남기고 싶은 기준</b><span>현업으로 가져가도 좋을 판단 기준을 한 문장으로 잡아 봅니다.</span></div>
                <div><b>바꿀 행동</b><span>다음 회의나 1on1에서 바로 바꿔볼 작은 행동을 정합니다.</span></div>
              </div>
            </div>
            <label className="personalReflectionField">내가 반복한 판단 습관<textarea value={habitDraft ?? reflection?.habit ?? ''} onChange={e => setHabitDraft(e.target.value)} placeholder="예: 불확실하면 속도를 먼저 선택했다 / 기준을 세우느라 실행을 늦췄다" /></label>
            <label className="personalReflectionField">다음 현업에서 바꿀 행동<textarea value={nextBehaviorDraft ?? reflection?.nextBehavior ?? ''} onChange={e => setNextBehaviorDraft(e.target.value)} placeholder="예: 선택 전에 부담이 누구에게 몰리는지 먼저 확인하겠다" /></label>
            <div className="actions personalReflectionActions">
              <button className="primary" onClick={saveReflection}>개인 성찰 저장하기</button>
              <Link className="secondary" to={`/team/${roomId}/${player.teamId}`}>팀 선언문 작성하기</Link>
            </div>
            <p className="personalReflectionAfterSave">개인 성찰을 저장한 뒤 팀 선언문 작성으로 이동하면, 우리 팀이 지킬 기준을 함께 정리할 수 있습니다.</p>
          </>
        ) : <StatusNoticeCard title="팀 화면에서 먼저 진행합니다">KSA 선택은 팀 화면에서 진행합니다. 기본 운영에서는 팀 화면 하나로 KSA 선택과 Week 1 진행을 이어갑니다.</StatusNoticeCard>}
      </section>
      <CompetencyProfilePanel profiles={competencyProfile ? { [playerId]: competencyProfile } : {}} title="나의 초기 역량 프로필" />
      {room.roomProgress.resultVisible && calculation && <ResultCard card={resultCard} calculation={calculation} audience="participant" />}
    </Layout>
  );
}
