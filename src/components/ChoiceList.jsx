import '../styles/choiceListUx.css';

export default function ChoiceList({ choices, selectedChoiceId, onSelect, disabled }) {
  return (
    <div className="choiceGrid choiceCardGrid" aria-label="선택지 목록">
      {choices.map(choice => {
        const selected = selectedChoiceId === choice.choiceId;
        return (
          <button
            type="button"
            key={choice.choiceId}
            disabled={disabled}
            className={`choice choiceCard ${selected ? 'selected' : ''}`}
            onClick={() => onSelect(choice.choiceId)}
            aria-pressed={selected}
          >
            <div className="choiceCardTop">
              <span className="choiceNumber">{choice.displayOrder}</span>
              <span className="choiceStatus">{selected ? '선택됨' : '판단 방향'}</span>
            </div>
            <span className="choiceText">{choice.choiceText}</span>
            <span className="choiceTradeoffCue">얻는 것과 뒤로 미루는 부담을 함께 봅니다.</span>
            <span className="choiceHint">팀 결정 전, 이 선택의 실행 조건과 확인 시점을 생각해 보세요.</span>
          </button>
        );
      })}
    </div>
  );
}
