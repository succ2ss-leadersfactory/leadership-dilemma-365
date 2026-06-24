import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ChoiceList from '../components/ChoiceList.jsx';
import KsaSelector from '../components/KsaSelector.jsx';
import OutputForm from '../components/OutputForm.jsx';
import StatusNoticeCard from '../components/StatusNoticeCard.jsx';
import TeamDiscussionGuide from '../components/TeamDiscussionGuide.jsx';
import TeamDeclarationGuide from '../components/TeamDeclarationGuide.jsx';
import { readDb } from '../services/storage';
import { analyzeDiscussionSummary } from '../utils/discussionQualityUtils';
import { calculateSubmissionQuality } from '../utils/qualityUtils';
import { analyzeTeamDeclaration } from '../utils/reflectionQualityUtils';
import { buildTeamOutputEvidenceReview } from '../utils/teamOutputEvidenceUtils';
import {
  isFirebaseTeamReady,
  saveFirebaseRoundSubmission,
  saveFirebaseTeamDecision,
  saveFirebaseTeamDeclaration,
  saveFirebaseTeamKsa,
  subscribeFirebaseTeamScreen
} from '../services/firebaseTeamRealtimeService';

const phaseLabels = {
  ksaSelection: 'KSA 선택',
  playerVote: '개인 생각',
  teamDecision: '팀 토의와 최종 선택',
  outputSubmission: '산출물 작성',
  resultReview: '결과 확인',
  finalReflection: '개인 성찰',
  teamDeclaration: '팀 선언문',
  finalResult: '최종 판정'
};

function buildTeamChoices(choices, round) {
  return choices.filter(choice => round?.choiceIds?.includes(choice.choiceId)).sort((a, b) => a.displayOrder - b.displayOrder);
}

function isKsaComplete(selectedKSA) {
  return selectedKSA?.knowledge?.length === 3 && selectedKSA?.skill?.length === 3 && selectedKSA?.attitude?.length === 3;
}

export default function FirebaseTeamPage() {
  const { roomId, teamId } = useParams();
  const [remote, setRemote] = useState({ room: null, team: null, decision: null, submission: null, declaration: null, calculation: null, finalResult: null });
  const [msg, setMsg] = useState('');
  const [finalChoiceId, setFinalChoiceId] = useState('');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [declarationText, setDeclarationText] = useState('');
  const [saving, setSaving] = useState(false);

  const db = readDb();
  const gameContent = db.gameContent;
  const currentRoundId = remote.room?.roomProgress?.currentRoundId || 'round0';
  const round = useMemo(() => gameContent.rounds.find(item => item.roundId === currentRoundId) || gameContent.rounds[0], [gameContent.rounds, currentRoundId]);
  const choices = useMemo(() => buildTeamChoices(gameContent.choices, round), [gameContent.choices, round]);
  const outputRequirement = gameContent.outputRequirements?.[round?.outputRequirementId];
  const expertiseLens = gameContent.teamExpertiseLenses?.[teamId];
  const ksaOptions = gameContent.ksaOptions?.[teamId];
  const teamName = remote.team?.teamName || gameContent.teams?.find(team => team.teamId === teamId)?.teamName || teamId;
  const canUseFirebase = isFirebaseTeamReady();
  const selectedKSA = remote.team?.selectedKSA || { knowledge: [], skill: [], attitude: [] };
  const currentPhase = remote.room?.roomProgress?.currentPhase || 'firebaseTeam';
  const phaseLabel = phaseLabels[currentPhase] || currentPhase;

  useEffect(() => {
    if (!canUseFirebase || !roomId || !teamId) return undefined;
    setMsg('Firebase 팀 화면을 연결하고 있습니다.');
    return subscribeFirebaseTeamScreen({
      roomId,
      teamId,
      roundId: currentRoundId,
      onChange: data => {
        setRemote(data);
        setMsg('Firebase 팀 화면이 연결되었습니다. 대표가 저장하면 같은 팀 화면에 반영됩니다.');
      },
      onError: error => setMsg(`Firebase 팀 화면 연결 확인 필요: ${error.message}`)
    });
  }, [canUseFirebase, roomId, teamId, currentRoundId]);

  useEffect(() => {
    if (remote.decision?.finalChoiceId) setFinalChoiceId(remote.decision.finalChoiceId);
    if (remote.decision?.discussionSummary) setDiscussionSummary(remote.decision.discussionSummary);
    if (remote.declaration?.teamDeclaration) setDeclarationText(remote.declaration.teamDeclaration);
  }, [remote.decision?.finalChoiceId, remote.decision?.discussionSummary, remote.declaration?.teamDeclaration]);

  async function saveKsa(ksa) {
    setSaving(true);
    try {
      await saveFirebaseTeamKsa({ roomId, teamId, teamName, selectedKSA: ksa });
      setMsg('KSA가 Firebase에 저장되었습니다. 같은 팀 화면에도 반영됩니다.');
    } catch (error) {
      setMsg(`KSA 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveDecision() {
    if (!finalChoiceId) {
      setMsg('팀 최종 선택을 먼저 고르세요.');
      return;
    }
    setSaving(true);
    try {
      const discussionQualityReview = analyzeDiscussionSummary(discussionSummary || '');
      await saveFirebaseTeamDecision({ roomId, teamId, roundId: round.roundId, finalChoiceId, discussionSummary, discussionQualityReview });
      setMsg('팀 최종 선택과 토의 요약이 Firebase에 저장되었습니다.');
    } catch (error) {
      setMsg(`팀 최종 선택 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveSubmission(answers) {
    setSaving(true);
    try {
      const evidenceReview = buildTeamOutputEvidenceReview({ answers, expertiseLens });
      const qualityResult = calculateSubmissionQuality(outputRequirement, answers, evidenceReview, remote.decision?.discussionQualityReview || null);
      await saveFirebaseRoundSubmission({ roomId, teamId, roundId: round.roundId, submission: { answers, evidenceReview, ...qualityResult } });
      setMsg('산출물이 Firebase에 저장되었습니다. 같은 팀 화면에도 반영됩니다.');
    } catch (error) {
      setMsg(`산출물 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveDeclaration() {
    setSaving(true);
    try {
      const declarationQualityReview = analyzeTeamDeclaration(declarationText || '');
      await saveFirebaseTeamDeclaration({ roomId, teamId, teamDeclaration: declarationText, declarationQualityReview });
      setMsg('팀 선언문이 Firebase에 저장되었습니다.');
    } catch (error) {
      setMsg(`팀 선언문 저장 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (!canUseFirebase) {
    return (
      <Layout roomId={roomId}>
        <section className="card hero">
          <p className="eyebrow">FIREBASE TEAM</p>
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
        <p className="eyebrow">FIREBASE TEAM SCREEN</p>
        <h2>{teamName} · Firebase 팀 화면</h2>
        <p>같은 팀원이 이 주소로 함께 들어오면 대표가 저장한 내용이 Firestore를 통해 공유됩니다.</p>
        <div className="summaryCards">
          <div><b>{roomId}</b><span>방 ID</span></div>
          <div><b>{teamId}</b><span>팀 ID</span></div>
          <div><b>{round?.title || currentRoundId}</b><span>현재 라운드</span></div>
          <div><b>{phaseLabel}</b><span>현재 단계</span></div>
          <div><b>{isKsaComplete(selectedKSA) ? '완료' : '대기'}</b><span>KSA</span></div>
          <div><b>{remote.decision ? '저장' : '대기'}</b><span>팀 결정</span></div>
        </div>
        {msg && <div className="notice">{msg}</div>}
        {!remote.room && <StatusNoticeCard title="Firestore 방 데이터 대기">먼저 /firebase-export/{roomId}에서 현재 방을 Firebase로 내보내야 합니다.</StatusNoticeCard>}
        <div className="actions">
          <Link className="secondary" to={`/firebase-export/${roomId}`}>Firebase 내보내기</Link>
          <Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link>
          <Link className="secondary" to={`/team/${roomId}/${teamId}`}>기존 팀 화면</Link>
        </div>
      </section>

      {round?.roundId === 'round0' && ksaOptions && (
        <section className="card">
          <h3>Round 0 · 팀별 KSA 선택</h3>
          <KsaSelector options={ksaOptions} selectedKSA={selectedKSA} onSubmit={saveKsa} />
          {saving && <p className="muted">저장 중입니다...</p>}
        </section>
      )}

      {choices.length > 0 && (
        <section className="card team-decision-workshop-card">
          <div className="team-decision-workshop-card__header">
            <p className="team-decision-workshop-card__eyebrow">TEAM AGREEMENT</p>
            <h3>팀 최종 선택</h3>
            <p>팀 대표가 최종 선택과 토의 요약을 저장하면 같은 Firebase 팀 화면에 반영됩니다.</p>
          </div>
          <ChoiceList choices={choices} selectedChoiceId={finalChoiceId || remote.decision?.finalChoiceId} onSelect={setFinalChoiceId} />
          <TeamDiscussionGuide />
          <label className="team-decision-summary-field">토론 요약
            <small>합의한 기준, 갈린 의견, 감수할 부담, 다음 확인 시점을 짧게 남겨 주세요.</small>
            <textarea value={discussionSummary} onChange={event => setDiscussionSummary(event.target.value)} placeholder="예: 고객 신뢰 회복을 우선 기준으로 삼고 B안을 선택했다. 단, 내부 일정 지연 부담이 남아 다음 회의에서 담당자와 확인 시점을 정한다." />
          </label>
          <div className="team-decision-save-bar">
            <button className="primary" onClick={saveDecision} disabled={saving}>팀 최종 선택 Firebase 저장</button>
            <p>{remote.decision ? '최근 저장된 팀 최종 선택이 있습니다.' : '아직 Firebase에 저장된 팀 최종 선택이 없습니다.'}</p>
          </div>
        </section>
      )}

      {choices.length > 0 && outputRequirement && (
        <section className="card">
          <h3>산출물 입력</h3>
          <OutputForm outputRequirement={outputRequirement} initialAnswers={remote.submission?.answers} expertiseLens={expertiseLens} evidenceReview={remote.submission?.evidenceReview} onSubmit={saveSubmission} />
        </section>
      )}

      {round?.roundId === 'week12' && (
        <section className="card team-declaration-workshop-card">
          <div className="team-declaration-workshop-card__header">
            <p className="team-declaration-workshop-card__eyebrow">WEEK 12 DECLARATION</p>
            <h3>팀 선언문</h3>
            <p>팀 대표가 선언문을 저장하면 같은 팀원 화면에서도 확인할 수 있습니다.</p>
          </div>
          <TeamDeclarationGuide />
          <label className="team-declaration-field">우리 팀 선언문
            <small>지킬 기준, 멈출 습관, 다음 행동, 첫 확인 시점이 보이도록 적어 주세요.</small>
            <textarea value={declarationText} onChange={event => setDeclarationText(event.target.value)} placeholder="예: 우리는 빠른 결론보다 남는 부담을 먼저 확인하고, 매주 월요일 회의에서 담당자와 확인 시점을 함께 남긴다." />
          </label>
          <div className="team-declaration-save-bar">
            <button className="primary" onClick={saveDeclaration} disabled={saving}>팀 선언문 Firebase 저장</button>
            <p>{remote.declaration?.teamDeclaration ? '최근 저장된 선언문이 있습니다.' : '아직 저장된 선언문이 없습니다.'}</p>
          </div>
        </section>
      )}

      <section className="card">
        <h3>Firebase 동기화 상태</h3>
        <table>
          <thead><tr><th>항목</th><th>상태</th></tr></thead>
          <tbody>
            <tr><td>방 문서</td><td>{remote.room ? '연결됨' : '대기'}</td></tr>
            <tr><td>팀 문서</td><td>{remote.team ? '연결됨' : '대기'}</td></tr>
            <tr><td>팀 결정</td><td>{remote.decision ? '저장됨' : '대기'}</td></tr>
            <tr><td>산출물</td><td>{remote.submission ? '저장됨' : '대기'}</td></tr>
            <tr><td>팀 선언문</td><td>{remote.declaration?.teamDeclaration ? '저장됨' : '대기'}</td></tr>
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
