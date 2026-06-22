import { buildPilotRunbook } from '../utils/pilotRunbookUtils';

export default function PilotRunbookPanel({ round, progress }) {
  const guide = buildPilotRunbook({ round, progress });
  return (
    <section className="card debriefBox">
      <p className="eyebrow">Pilot Runbook</p>
      <h3>파일럿 진행 체크리스트</h3>
      <p><b>{guide.roundTitle}</b> · {guide.phaseLabel}</p>
      <div className="notice"><b>강사 멘트:</b> {guide.facilitatorScript}</div>
      <div className="grid2">
        <div>
          <h4>진행 행동</h4>
          <p>{guide.operatorAction}</p>
          <p><b>보여줄 화면:</b> {guide.screenToShow}</p>
          <p><b>권장 시간:</b> {guide.timeBox}</p>
        </div>
        <div>
          <h4>버튼 순서</h4>
          <ol>{guide.buttonOrder.map(item => <li key={item}>{item}</li>)}</ol>
        </div>
      </div>
      <h4>주의할 실수</h4>
      <p className="muted">{guide.caution}</p>
      <h4>바로 던질 질문</h4>
      <ol>{guide.debriefQuestions.map(q => <li key={q}>{q}</li>)}</ol>
    </section>
  );
}
