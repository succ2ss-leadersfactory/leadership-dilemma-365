import { useState } from 'react';

export default function OutputForm({ outputRequirement, initialAnswers = {}, onSubmit, expertiseLens = null, evidenceReview = null }) {
  const [answers, setAnswers] = useState(initialAnswers);
  if (!outputRequirement) return <p className="muted">이 라운드에는 산출물 입력이 없습니다.</p>;
  const change = (key, value) => setAnswers(a => ({ ...a, [key]: value }));

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); onSubmit(answers); }}>
      {expertiseLens && (
        <div className="notice">
          <b>{expertiseLens.title}</b>
          <p>이번 산출물은 글을 길게 쓰는 것보다, 팀의 전문성에 맞는 증거를 분명히 남기는 것이 중요합니다.</p>
          <p><b>좋은 산출물 기준:</b> {expertiseLens.evidenceStandards.join(' · ')}</p>
          <p><b>주의할 오판:</b> {expertiseLens.commonBlindSpots.join(' · ')}</p>
        </div>
      )}

      {evidenceReview && (
        <div className="card">
          <p className="eyebrow">저장된 증거 수준</p>
          <h4>{evidenceReview.evidenceLevel} · {evidenceReview.evidenceScore}/4</h4>
          <ul>
            {evidenceReview.evidenceSignals.map(signal => <li key={signal}>{signal}</li>)}
          </ul>
        </div>
      )}

      {outputRequirement.fields.map(f => (
        <label key={f.fieldKey}>
          {f.label}
          <small>{f.question}</small>
          {f.type === 'select' ? (
            <select value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)}>
              <option value="">선택</option>
              {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)} />
          ) : (
            <input value={answers[f.fieldKey] || ''} onChange={e => change(f.fieldKey, e.target.value)} />
          )}
        </label>
      ))}
      <button className="primary">산출물 저장</button>
    </form>
  );
}
