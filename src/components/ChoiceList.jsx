export default function ChoiceList({ choices, selectedChoiceId, onSelect, disabled }) {
  return <div className="choiceGrid">{choices.map(c => <button type="button" key={c.choiceId} disabled={disabled} className={`choice ${selectedChoiceId === c.choiceId ? 'selected' : ''}`} onClick={() => onSelect(c.choiceId)}><b>{c.displayOrder}</b><span>{c.choiceText}</span></button>)}</div>;
}
