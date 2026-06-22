import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
export default function LandingPage() {
  return <Layout><section className="card hero"><h1>리더십 딜레마 365: 위기의 12주</h1><p>조직개편 심사까지 12주, 팀의 판단이 생존을 결정합니다.</p><div className="actions"><Link className="primary" to="/host/create">Host로 시작</Link><Link className="secondary" to="/join/DEMO">입장 코드로 참가</Link></div></section></Layout>;
}
