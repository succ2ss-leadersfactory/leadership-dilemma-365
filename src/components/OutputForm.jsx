import { useState } from 'react';
export default function OutputForm({ outputRequirement, initialAnswers = {}, onSubmit }) {
  const [answers, setAnswers] = useState(initialAnswers);
  if (!outputRequirement) return <p className="muted">이 라운드에는 산출물 입력이 없습니다.</p>;
  const change = (key, value) => setAnswers(a => ({ ...a, [key]: value }));
  return <form className="stack" onSubmit={(e)=>{e.preventDefault(); onSubmit(answers);}}>{outputRequirement.fields.map(f => <label key={f.fieldKey}>{f.label}<small>{f.question}</small>{f.type === 'select' ? <select value={answers[f.fieldKey] || ''} onChange={e=>change(f.fieldKey,e.target.value)}><option value="">선택</option>{(f.options||[]).map(o=><option key={o} value={o}>{o}</option>)}</select> : f.type === 'textarea' ? <textarea value={answers[f.fieldKey] || ''} onChange={e=>change(f.fieldKey,e.target.value)} /> : <input value={answers[f.fieldKey] || ''} onChange={e=>change(f.fieldKey,e.target.value)} />}</label>)}<button className="primary">산출물 저장</button></form>;
}
