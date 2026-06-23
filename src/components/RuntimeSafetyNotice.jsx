import { Link } from 'react-router-dom';
import { buildRuntimeSafetyWarnings } from '../utils/runtimeSafetyUtils';

export default function RuntimeSafetyNotice({ room, roomId, compact = false }) {
  const warnings = buildRuntimeSafetyWarnings(room);
  if (!warnings.length) return null;

  return (
    <section className={compact ? 'notice' : 'card'}>
      <p className="eyebrow">운영 데이터 점검</p>
      <h3>이전 데이터와 최신 계산 모델 차이 확인</h3>
      <p className="muted">기존 방 데이터나 가져온 JSON을 사용할 때 일부 화면이 기본값으로 임시 표시될 수 있습니다. 아래 항목이 보이면 운영 도구에서 보정하거나 재계산해 주세요.</p>
      <ul>
        {warnings.map(item => (
          <li key={item.key}>
            <b>[{item.level}] {item.title}</b>
            <p>{item.message}</p>
            <small>{item.action}</small>
          </li>
        ))}
      </ul>
      {roomId && <p><Link className="secondary" to={`/admin/${roomId}`}>운영 안정화 도구로 이동</Link></p>}
    </section>
  );
}
