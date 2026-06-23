import '../styles/choiceListUx.css';

export default function ChoiceList({ choices, selectedChoiceId, onSelect, disabled }) {
  return (
    <div className="choiceGrid choiceCardGrid">
      {choices.map(choice => {
        const selected = selectedChoiceId === choice.choiceId;
        return (
          <button
            type="button"
            key={choice.choiceId}
            disabled={disabled}
            className={`choice choiceCard ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(choice.choiceId)}
          >
            <div className="choiceCardTop">
              <span className="choiceNumber">{choice.displayOrder}</span>
              <span className="choiceStatus">{selected ? '선택됨' : '선택지'}</span>
            </div>
            <span className="choiceText">{choice.choiceText}</span>
            <span className="choiceHint">이 선택으로 얻는 것과 뒤로 미루는 부담을 함께 생각해 보세요.</span>
          </button>
        );
      })}
    </div>
  );
}
