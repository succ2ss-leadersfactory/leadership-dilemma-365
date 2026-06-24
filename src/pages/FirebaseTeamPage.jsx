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
  registerFirebaseTeamRepresentative,
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

function roleStorageKey(roomId, teamId) {
  return `firebase_team_role_${roomId}_${teamId}`;
}

function showSelectedKsa(selectedKSA) {
  return ['knowledge', 'skill', 'attitude'].map(key => `${key}: ${(selectedKSA?.[key] || []).join(', ') || '미선택'}`).join(' / ');
}

function renderAnswers(answers = {}) {
  const entries = Object.entries(answers || {});
  if (!entries.length) return <p className="muted">아직 저장된 산출물이 없습니다.</p>;
  return <ul>{entries.map(([key, value]) => <li key={key}><b>{key}</b>: {String(value || '')}</li>)}</ul>;
}

export default function FirebaseTeamPage() {
  const { roomId, teamId } = useParams();
  const [remote, setRemote] = useState({ room: null, team: null, decision: null, submission: null, declaration: null, calculation: null, finalResult: null });
  const [msg, setMsg] = useState('');
  const [finalChoiceId, setFinalChoiceId] = useState('');
  const [discussionSummary, setDiscussionSummary] = useState('');
  const [declarationText, setDeclarationText] = useState('');
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem(roleStorageKey(roomId, teamId)) || 'viewer');
  const [pinInput, setPinInput] = useState('');
  const [newRepresentativeName, setNewRepresentativeName] = useState('');
  const [newRepresentativePin, setNewRepresentativePin] = useState('');

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
  const representativeRegistered = Boolean(remote.team?.representativePin);
  const isRepresentative = role === 'representative';
  const canEdit = isRepresentative;

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

  function enterRepresentativeMode() {
    if (!representativeRegistered) {
      setMsg('아직 팀대표가 등록되지 않았습니다. 대표 이름과 PIN을 먼저 등록하세요.');
      return;
    }
    if (pinInput !== remote.team?.representativePin) {
      setMsg('대표 PIN이 맞지 않습니다. 강사가 안내한 PIN을 확인하세요.');
      return;
    }
    localStorage.setItem(roleStorageKey(roomId, teamId), 'representative');
    setRole('representative');
    setPinInput('');
    setMsg('팀대표 입력 모드로 전환했습니다. 이제 저장 버튼을 사용할 수 있습니다.');
  }

  function leaveRepresentativeMode() {
    localStorage.removeItem(roleStorageKey(roomId, teamId));
    setRole('viewer');
    setMsg('팀원 보기 모드로 전환했습니다. 저장 버튼은 비활성화됩니다.');
  }

  async function registerRepresentative() {
    if (!newRepresentativeName.trim()) {
      setMsg('대표 이름을 입력하세요.');
      return;
    }
    if (!/^\d{4,6}$/.test(newRepresentativePin)) {
      setMsg('대표 PIN은 숫자 4~6자리로 입력하세요.');
      return;
    }
    setSaving(true);
    try {
      await registerFirebaseTeamRepresentative({ roomId, teamId, teamName, representativeName: newRepresentativeName.trim(), representativePin: newRepresentativePin });
      localStorage.setItem(roleStorageKey(roomId, teamId), 'representative');
      setRole('representative');
      setNewRepresentativePin('');
      setMsg('팀대표가 등록되었습니다. 이 브라우저는 팀대표 입력 모드로 전환됩니다.');
    } catch (error) {
      setMsg(`팀대표 등록 실패: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function saveKsa(ksa) {
    if (!canEdit) return setMsg('팀대표 입력 모드에서만 저장할 수 있습니다.');
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
    if (!canEdit) return setMsg('팀대표 입력 모드에서만 저장할 수 있습니다.');
    if (!finalChoiceId) return setMsg('팀 최종 선택을 먼저 고르세요.');
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
    if (!canEdit) return setMsg('팀대표 입력 모드에서만 저장할 수 있습니다.');
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
    if (!canEdit) return setMsg('팀대표 입력 모드에서만 저장할 수 있습니다.');
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
        <section className="card hero"><p className="eyebrow">FIREBASE TEAM</p><h2>Firebase 설정 확인 필요</h2><p>Vercel 환경변수 또는 Firebase 설정이 준비되지 않았습니다.</p><Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link></section>
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
          <div><b>{isRepresentative ? '팀대표' : '팀원'}</b><span>현재 모드</span></div>
          <div><b>{representativeRegistered ? '등록됨' : '미등록'}</b><span>팀대표</span></div>
        </div>
        {msg && <div className="notice">{msg}</div>}
        {!remote.room && <StatusNoticeCard title="Firestore 방 데이터 대기">먼저 /firebase-export/{roomId}에서 현재 방을 Firebase로 내보내야 합니다.</StatusNoticeCard>}
        <div className="actions"><Link className="secondary" to={`/firebase-export/${roomId}`}>Firebase 내보내기</Link><Link className="secondary" to={`/firebase-check/${roomId}`}>Firebase 연결 확인</Link><Link className="secondary" to={`/team/${roomId}/${teamId}`}>기존 팀 화면</Link></div>
      </section>

      <section className="card">
        <h3>팀대표 등록과 입력 모드</h3>
        {!representativeRegistered ? (
          <div className="grid2">
            <div className="reportInsight"><h4>팀대표 등록</h4><p>대표로 입력할 사람 1명이 이름과 숫자 PIN을 등록합니다. 등록한 브라우저는 바로 대표 입력 모드가 됩니다.</p><label>대표 이름<input value={newRepresentativeName} onChange={event => setNewRepresentativeName(event.target.value)} placeholder="예: 김대표" /></label><label>대표 PIN<input value={newRepresentativePin} onChange={event => setNewRepresentativePin(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="숫자 4~6자리" /></label><button className="primary" onClick={registerRepresentative} disabled={saving}>팀대표 등록</button></div>
            <div className="reportInsight"><h4>팀원 보기 모드</h4><p>팀원은 PIN 없이 같은 화면을 볼 수 있습니다. 대표가 저장하면 화면에 반영됩니다.</p></div>
          </div>
        ) : (
          <div className="grid2">
            <div className="reportInsight"><h4>대표 등록 상태</h4><p><b>등록된 대표:</b> {remote.team?.representativeName || '팀대표'}</p><p><b>현재 모드:</b> {isRepresentative ? '팀대표 입력 모드' : '팀원 보기 모드'}</p>{isRepresentative ? <button onClick={leaveRepresentativeMode}>팀원 보기 모드로 전환</button> : <><label>대표 PIN<input value={pinInput} onChange={event => setPinInput(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="대표 PIN" /></label><button className="primary" onClick={enterRepresentativeMode}>대표 입력 모드로 전환</button></>}</div>
            <div className="reportInsight"><h4>입력 권한</h4><p>{isRepresentative ? '현재 브라우저에서는 KSA, 팀 최종 선택, 산출물, 선언문을 저장할 수 있습니다.' : '현재는 보기 모드입니다. 대표가 저장한 내용을 확인할 수 있지만 직접 저장할 수는 없습니다.'}</p></div>
          </div>
        )}
      </section>

      {round?.roundId === 'round0' && ksaOptions && (
        <section className="card"><h3>Round 0 · 팀별 KSA 선택</h3>{canEdit ? <KsaSelector options={ksaOptions} selectedKSA={selectedKSA} onSubmit={saveKsa} /> : <StatusNoticeCard title="팀원 보기 모드" items={[showSelectedKsa(selectedKSA)]}>KSA 저장은 팀대표 입력 모드에서만 가능합니다.</StatusNoticeCard>}{saving && <p className="muted">저장 중입니다...</p>}</section>
      )}

      {choices.length > 0 && (
        <section className="card team-decision-workshop-card"><div className="team-decision-workshop-card__header"><p className="team-decision-workshop-card__eyebrow">TEAM AGREEMENT</p><h3>팀 최종 선택</h3><p>팀대표가 최종 선택과 토의 요약을 저장하면 같은 Firebase 팀 화면에 반영됩니다.</p></div><ChoiceList choices={choices} selectedChoiceId={finalChoiceId || remote.decision?.finalChoiceId} onSelect={setFinalChoiceId} disabled={!canEdit} /><TeamDiscussionGuide /><label className="team-decision-summary-field">토론 요약<small>합의한 기준, 갈린 의견, 감수할 부담, 다음 확인 시점을 짧게 남겨 주세요.</small><textarea disabled={!canEdit} value={discussionSummary} onChange={event => setDiscussionSummary(event.target.value)} placeholder="예: 고객 신뢰 회복을 우선 기준으로 삼고 B안을 선택했다. 단, 내부 일정 지연 부담이 남아 다음 회의에서 담당자와 확인 시점을 정한다." /></label><div className="team-decision-save-bar"><button className="primary" onClick={saveDecision} disabled={!canEdit || saving}>팀 최종 선택 Firebase 저장</button><p>{canEdit ? '팀대표 입력 모드입니다.' : '팀원 보기 모드입니다. 저장은 팀대표만 가능합니다.'}</p></div></section>
      )}

      {choices.length > 0 && outputRequirement && (
        <section className="card"><h3>산출물 입력</h3>{canEdit ? <OutputForm outputRequirement={outputRequirement} initialAnswers={remote.submission?.answers} expertiseLens={expertiseLens} evidenceReview={remote.submission?.evidenceReview} onSubmit={saveSubmission} /> : <div className="reportInsight"><h4>저장된 산출물</h4>{renderAnswers(remote.submission?.answers)}</div>}</section>
      )}

      {round?.roundId === 'week12' && (
        <section className="card team-declaration-workshop-card"><div className="team-declaration-workshop-card__header"><p className="team-declaration-workshop-card__eyebrow">WEEK 12 DECLARATION</p><h3>팀 선언문</h3><p>팀대표가 선언문을 저장하면 같은 팀원 화면에서도 확인할 수 있습니다.</p></div><TeamDeclarationGuide /><label className="team-declaration-field">우리 팀 선언문<small>지킬 기준, 멈출 습관, 다음 행동, 첫 확인 시점이 보이도록 적어 주세요.</small><textarea disabled={!canEdit} value={declarationText} onChange={event => setDeclarationText(event.target.value)} placeholder="예: 우리는 빠른 결론보다 남는 부담을 먼저 확인하고, 매주 월요일 회의에서 담당자와 확인 시점을 함께 남긴다." /></label><div className="team-declaration-save-bar"><button className="primary" onClick={saveDeclaration} disabled={!canEdit || saving}>팀 선언문 Firebase 저장</button><p>{remote.declaration?.teamDeclaration ? '최근 저장된 선언문이 있습니다.' : '아직 저장된 선언문이 없습니다.'}</p></div></section>
      )}

      <section className="card"><h3>Firebase 동기화 상태</h3><table><thead><tr><th>항목</th><th>상태</th></tr></thead><tbody><tr><td>방 문서</td><td>{remote.room ? '연결됨' : '대기'}</td></tr><tr><td>팀 문서</td><td>{remote.team ? '연결됨' : '대기'}</td></tr><tr><td>팀대표</td><td>{representativeRegistered ? `등록됨 · ${remote.team?.representativeName || '팀대표'}` : '미등록'}</td></tr><tr><td>현재 모드</td><td>{isRepresentative ? '팀대표 입력 모드' : '팀원 보기 모드'}</td></tr><tr><td>팀 결정</td><td>{remote.decision ? '저장됨' : '대기'}</td></tr><tr><td>산출물</td><td>{remote.submission ? '저장됨' : '대기'}</td></tr><tr><td>팀 선언문</td><td>{remote.declaration?.teamDeclaration ? '저장됨' : '대기'}</td></tr></tbody></table></section>
    </Layout>
  );
}
