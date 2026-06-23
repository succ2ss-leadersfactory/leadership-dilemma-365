import { useState } from 'react';
import '../styles/outputFormUx.css';

const outputChecklist = [
  { title: '선택 기준', text: '왜 이 방향을 택했는지 한 문장으로 남깁니다.' },
  { title: '다음 행동', text: '회의가 끝난 뒤 바로 할 일을 씁니다.' },
  { title: '책임자', text: '누가 챙길지 이름이나 역할을 정합니다.' },
  { title: '확인 시점', text: '언제 다시 볼지 날짜나 시점을 남깁니다.' },
  { title: '남는 부담', text: '아직 불안한 점을 숨기지 않고 적습니다.' }
];

function buildParticipantEvidenceText(evidenceReview) {
  if (!evidenceReview) return null;
  const score = Number(evidenceReview.evidenceScore || 0);
  if (score >= 4) return '이전에 저장한 산출물은 판단 근거와 다음 행동이 비교적 분명합니다. 이번에도 같은 수준으로 구체성을 유지해 주세요.';
  if (score >= 3) return '이전에 저장한 산출물은 기본 방향이 보입니다. 이번에는 확인 시점과 남는 부담을 조금 더 분명히 적어 보세요.';
  if (score >= 2) return '이전에 저장한 산출물은 방향은 있지만 실행 조건이 더 필요합니다. 이번에는 누가, 언제, 무엇을 확인할지 남겨 주세요.';
  return '이전에 저장한 산출물은 메모에 가까웠습니다. 이번에는 선택 기준, 다음 행동, 책임자, 확인 시점을 꼭 남겨 주세요.';
}

function getFieldHint(field) {
  const text = `${field.label || ''} ${field.question || ''}`;
  if (/책임|담당|누가/.test(text)) return '예: 박대리 담당 / 팀장이 금요일 오전 확인';
  if (/시점|언제|날짜|기한|확인/.test(text)) return '예: 다음 주 수요일 15시 / 다음 라운드 시작 전';
  if (/리스크|부담|우려|위험/.test(text)) return '예: 고객 설득 근거 부족 / 특정 팀원에게 실행 부담 집중';
  if (/행동|실행|다음/.test(text)) return '예: 고객 의견 3건 확인 후 우선순위 다시 정리';
  return '짧아도 좋습니다. 판단 근거가 보이게 구체적으로 적어 주세요.';
}

export default function OutputForm({ outputRequirement, initialAnswers = {}, onSubmit, expertiseLens = null, evidenceReview = null, audience = 'participant' }) {
  const [answers, setAnswers] = useState(initialAnswers);
  if (!outputRequirement) return <p className="muted">이 라운드에는 산출물 입력이 없습니다.</p>;
  const change = (key, value) => setAnswers(a => ({ ...a, [key]: value }));
  const isFacilitator = audience === 'facilitator';
  const participantEvidenceText = buildParticipantEvidenceText(evidenceReview);

  return (
    <form className="stack outputForm" onSubmit={(e) => { e.preventDefault(); onSubmit(answers); }}>
      <div className="outputGuide">
        <p className="outputGuide__eyebrow">TEAM OUTPUT</p>
        <h4>산출물은 긴 글이 아니라 실행 약속입니다</h4>
        <p>팀 결정이 끝났다면, 그 선택을 실제 행동으로 옮기기 위해 필요한 최소 기준을 남겨 주세요.</p>
        <div className="outputChecklist">
          {outputChecklist.map(item => (
            <div key={item.title}>
              <b>{item.title}</b>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {expertiseLens && (
        <div className="outputLens">
          <h4>{expertiseLens.title}</h4>
          <p>{isFacilitator ? '이번 산출물은 팀의 전문성에 맞는 증거가 남았는지 확인하는 데 중요합니다.' : '우리 팀의 역할과 강점에 맞게, 판단 근거가 보이도록 써 주세요.'}</p>
          {isFacilitator && <p><b>좋은 산출물 기준:</b> {expertiseLens.evidenceStandards.join(' · ')}</p>}
          {isFacilitator && <p><b>주의할 오판:</b> {expertiseLens.commonBlindSpots.join(' · ')}</p>}
        </div>
      )}

      {evidenceReview && (
        <div className="outputSavedFeedback">
          <p className="eyebrow">저장된 산출물 피드백</p>
          {isFacilitator ? (
            <>
              <h4>{evidenceReview.evidenceLevel} · {evidenceReview.evidenceScore}/4</h4>
              <ul>
                {(evidenceReview.evidenceSignals || []).map(signal => <li key={signal}>{signal}</li>)}
              </ul>
            </>
          ) : (
            <p>{participantEvidenceText}</p>
          )}
        </div>
      )}

      <div className="outputFieldGrid">
        {outputRequirement.fields.map((f, index) => (
          <label className="outputFieldCard" key={f.fieldKey}>
            <span className="outputFieldCard__number">{index + 1}</span>
            <span className="outputFieldCard__label">{f.label}</span>
            <small>{f.question}</small>
            {f.type === 'select' ? (
              <select value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)}>
                <option value="">선택</option>
                {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)} placeholder={getFieldHint(f)} />
            ) : (
              <input value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)} placeholder={getFieldHint(f)} />
            )}
            <div className="outputFieldHint">{getFieldHint(f)}</div>
          </label>
        ))}
      </div>
      <div className="outputSubmitBar">
        <button className="primary">산출물 저장</button>
        <p className="outputSubmitHelp">저장 후에도 같은 라운드 안에서는 다시 수정할 수 있습니다. 완성도보다 실행 조건이 보이는지가 더 중요합니다.</p>
      </div>
    </form>
  );
}
