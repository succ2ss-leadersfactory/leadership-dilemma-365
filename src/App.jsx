import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import HostCreatePage from './pages/HostCreatePage.jsx';
import HostDashboardPage from './pages/HostDashboardPage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import PlayerPage from './pages/PlayerPage.jsx';
import TeamPage from './pages/TeamPage.jsx';
import MultiTeamComparePage from './pages/MultiTeamComparePage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import AdminOpsPage from './pages/AdminOpsPage.jsx';
import FacilitatorGuidePage from './pages/FacilitatorGuidePage.jsx';
import CompetencyProfilesPage from './pages/CompetencyProfilesPage.jsx';
import FirebaseCheckPage from './pages/FirebaseCheckPage.jsx';
import './styles/visualDesignSystem.css';
import './styles/responsivePolish.css';
import './styles/facilitatorBoundary.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/host/create" element={<HostCreatePage />} />
      <Route path="/host/:roomId" element={<HostDashboardPage />} />
      <Route path="/join/:joinCode" element={<JoinPage />} />
      <Route path="/player/:roomId/:playerId" element={<PlayerPage />} />
      <Route path="/team/:roomId/:teamId" element={<TeamPage />} />
      <Route path="/competencies/:roomId" element={<CompetencyProfilesPage />} />
      <Route path="/compare/:roomId" element={<MultiTeamComparePage />} />
      <Route path="/report/:roomId" element={<ReportPage />} />
      <Route path="/guide/:roomId" element={<FacilitatorGuidePage />} />
      <Route path="/admin/:roomId" element={<AdminOpsPage />} />
      <Route path="/firebase-check" element={<FirebaseCheckPage />} />
      <Route path="/firebase-check/:roomId" element={<FirebaseCheckPage />} />
    </Routes>
  );
}
