import { Link } from 'react-router-dom';
export default function Layout({ children, roomId }) {
  return <div><header className="top"><Link to="/" className="brand">리더십 딜레마 365</Link>{roomId && <nav><Link to={`/host/${roomId}`}>Host</Link><Link to={`/compare/${roomId}`}>다팀 비교</Link><Link to={`/report/${roomId}`}>교육 리포트</Link><Link to={`/admin/${roomId}`}>운영</Link></nav>}</header><main className="container">{children}</main></div>;
}
