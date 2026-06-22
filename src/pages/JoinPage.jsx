import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { joinRoom } from '../services/playerService';
import { seedTeams } from '../data/seedTeams';
export default function JoinPage() {
  const params=useParams(); const [joinCode,setJoinCode]=useState(params.joinCode === 'DEMO' ? '' : params.joinCode); const [displayName,setDisplayName]=useState(''); const [teamId,setTeamId]=useState('sales'); const [error,setError]=useState(''); const nav=useNavigate();
  const submit=()=>{try{const r=joinRoom({joinCode:joinCode.trim().toUpperCase(), displayName, teamId}); nav(`/player/${r.roomId}/${r.playerId}`);}catch(e){setError(e.message)}};
  return <Layout><section className="card"><h2>참가자 입장</h2>{error&&<div className="error">{error}</div>}<label>입장 코드<input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}/></label><label>이름<input placeholder="김박사" value={displayName} onChange={e=>setDisplayName(e.target.value)}/></label><label>팀 선택<select value={teamId} onChange={e=>setTeamId(e.target.value)}>{seedTeams.map(t=><option key={t.teamId} value={t.teamId}>{t.teamName}</option>)}</select></label><button className="primary" onClick={submit}>입장하기</button></section></Layout>;
}
