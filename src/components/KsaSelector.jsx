import { useState } from 'react';
import '../styles/ksaUx.css';

const groupGuide = {
  knowledge: '상황을 해석할 때 우리 팀이 먼저 꺼내 볼 관점입니다.',
  skill: '결정을 실행으로 옮길 때 우리 팀이 활용할 방법입니다.',
  attitude: '압박 속에서도 우리 팀이 지키려는 태도입니다.'
};

function ToggleGroup({ type, title, items, selected, onChange }) {
  const toggle = item => onChange(selected.includes(item) ? selected.filter(x => x !== item) : selected.length < 3 ? [...selected, item] : selected);

  return (
    <div className={`ksaGroup ksaGroup--${type}`}>
      <div className="ksaGroupHeader">
        <div>
          <h4>{title}</h4>
          <p>{groupGuide[type] || '3개를 선택해 주세요.'}</p>
        </div>
        <span className={selected.length === 3 ? 'ksaCount done' : 'ksaCount'}>{selected.length}/3</span>
      </div>
      <div className="chips ksaChipList">
        {items.map(item => {
          const isSelected = selected.includes(item);
          return (
            <button
              type="button"
              key={item}
              className={isSelected ? 'chip on' : 'chip'}
              onClick={() => toggle(item)}
              aria-pressed={isSelected}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function KsaSelector({ options, selectedKSA, onSubmit }) {
  const [ksa, setKsa] = useState(selectedKSA || { knowledge: [], skill: [], attitude: [] });
  const ready = ksa.knowledge.length === 3 && ksa.skill.length === 3 && ksa.attitude.length === 3;
  const total = ksa.knowledge.length + ksa.skill.length + ksa.attitude.length;

  return (
    <div className="card stack ksaSelectorCard">
      <div className="ksaIntro">
        <p className="ksaIntroEyebrow">ROUND 0 KSA SETTING</p>
        <h3>우리 팀의 KSA 선택</h3>
        <p>KSA는 이번 12주 동안 우리 팀이 어떤 기준으로 판단하고 실행할지 정하는 출발점입니다.</p>
        <div className="ksaProgress">
          <div><b>{ksa.knowledge.length}/3</b><span>지식</span></div>
          <div><b>{ksa.skill.length}/3</b><span>기술</span></div>
          <div><b>{ksa.attitude.length}/3</b><span>태도</span></div>
          <div><b>{total}/9</b><span>전체</span></div>
        </div>
      </div>

      <ToggleGroup type="knowledge" title="지식" items={options.knowledge} selected={ksa.knowledge} onChange={v => setKsa({ ...ksa, knowledge: v })} />
      <ToggleGroup type="skill" title="기술" items={options.skill} selected={ksa.skill} onChange={v => setKsa({ ...ksa, skill: v })} />
      <ToggleGroup type="attitude" title="태도" items={options.attitude} selected={ksa.attitude} onChange={v => setKsa({ ...ksa, attitude: v })} />

      <div className="ksaSaveGuide">
        <p>{ready ? 'KSA 선택이 완료되었습니다. 저장하면 초기 역량 프로필이 생성됩니다.' : '지식·기술·태도를 각각 3개씩 선택하면 저장할 수 있습니다.'}</p>
      </div>
      <button className="primary" disabled={!ready} onClick={() => onSubmit(ksa)}>KSA 저장</button>
    </div>
  );
}
