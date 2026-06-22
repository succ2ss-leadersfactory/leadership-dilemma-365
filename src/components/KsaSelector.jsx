import { useState } from 'react';
function ToggleGroup({ title, items, selected, onChange }) {
  const toggle = item => onChange(selected.includes(item) ? selected.filter(x=>x!==item) : selected.length < 3 ? [...selected, item] : selected);
  return <div><h4>{title} <span className="muted">{selected.length}/3</span></h4><div className="chips">{items.map(item => <button type="button" key={item} className={selected.includes(item)?'chip on':'chip'} onClick={()=>toggle(item)}>{item}</button>)}</div></div>;
}
export default function KsaSelector({ options, selectedKSA, onSubmit }) {
  const [ksa, setKsa] = useState(selectedKSA || { knowledge:[], skill:[], attitude:[] });
  return <div className="card stack"><h3>Round 0 · KSA 선택</h3><ToggleGroup title="지식" items={options.knowledge} selected={ksa.knowledge} onChange={v=>setKsa({...ksa, knowledge:v})}/><ToggleGroup title="기술" items={options.skill} selected={ksa.skill} onChange={v=>setKsa({...ksa, skill:v})}/><ToggleGroup title="태도" items={options.attitude} selected={ksa.attitude} onChange={v=>setKsa({...ksa, attitude:v})}/><button className="primary" onClick={()=>onSubmit(ksa)}>KSA 저장</button></div>;
}
