import { Link, useLocation } from 'react-router-dom';
import RoundTimeline from './RoundTimeline.jsx';

const facilitatorNavPrefixes = ['/host/', '/compare/', '/report/', '/guide/', '/admin/', '/competencies/'];

export default function Layout({ children, roomId }) {
  const location = useLocation();
  const showFacilitatorNav = Boolean(roomId && facilitatorNavPrefixes.some(prefix => location.pathname.startsWith(prefix)));
  const showParticipantBadge = Boolean(roomId && !showFacilitatorNav);
  const participantBadgeText = location.pathname.startsWith('/player/') ? '확장 개인 입력 화면' : '팀 진행 화면';

  return (
    <div>
      <header className="top">
        <Link to="/" className="brand">리더십 딜레마 365</Link>
        {showFacilitatorNav && (
          <nav className="hostNav">
            <Link to={`/host/${roomId}`}>Host</Link>
            <Link to={`/compare/${roomId}`}>다팀 비교</Link>
            <Link to={`/report/${roomId}`}>교육 리포트</Link>
            <Link to={`/guide/${roomId}`}>강사 가이드</Link>
            <Link to={`/admin/${roomId}`}>운영</Link>
          </nav>
        )}
        {showParticipantBadge && (
          <nav className="participantNav" aria-label="참가자 화면 안내">
            <span>{participantBadgeText}</span>
          </nav>
        )}
      </header>
      <RoundTimeline roomId={roomId} />
      <main className="container">{children}</main>
    </div>
  );
}
