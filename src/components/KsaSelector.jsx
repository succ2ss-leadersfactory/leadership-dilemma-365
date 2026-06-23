import { useState } from 'react';
import '../styles/ksaUx.css';

function ToggleGroup({ title, items, selected, onChange }) {
  const toggle = item => onChange(selected.includes(item) ? selected.filter(x => x !== item) : selected.length < 3 ? [...selected, item] : selected);
  return <div className="ksaGroup"><h4>{title} <span className={selected.length === 3 ? 'ksaCount done' : 'ksaCount'}>{selected.length}/3</span></h4><div className="chips">{items.map(item => <button type="button" key={item} className={selected.includes(item)?'chip on':'chip'} onClick={()=>toggle(item)}>{item}</button>)}</div></div>;
}
export default function KsaSelector({ options, selectedKSA, onSubmit }) {
  const [ksa, setKsa] = useState(selectedKSA || { knowledge:[], skill:[], attitude:[] });
  const ready = ksa.knowledge.length === 3 && ksa.skill.length === 3 && ksa.attitude.length === 3;
  return <div className="card stack ksaSelectorCard"><div className="ksaIntro"><h3>Round 0 · 우리 팀의 KSA 선택</h3><p>KSA는 이번 12주 동안 우리 팀이 어떤 기준으로 판단하고 실행할지 정하는 출발점입니다.</p></div><ToggleGroup title="지식" items={options.knowledge} selected={ksa.knowledge} onChange={v=>setKsa({...ksa, knowledge:v})}/><ToggleGroup title="기술" items={options.skill} selected={ksa.skill} onChange={v=>setKsa({...ksa, skill:v})}/><ToggleGroup title="태도" items={options.attitude} selected={ksa.attitude} onChange={v=>setKsa({...ksa, attitude:v})}/><div className="ksaSaveGuide"><p>{ready ? 'KSA 선택이 완료되었습니다. 저장하면 초기 역량 프로필이 생성됩니다.' : '지식·기술·태도를 각각 3개씩 선택하면 저장할 수 있습니다.'}</p></div><button className="primary" disabled={!ready} onClick={()=>onSubmit(ksa)}>KSA 저장</button></div>;
}
