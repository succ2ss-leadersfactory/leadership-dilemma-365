import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import { createRoom } from '../services/roomService';
import { seedGameContent, resetDb } from '../services/seedService';
export default function HostCreatePage() {
  const nav = useNavigate(); const [title,setTitle]=useState('리더십 딜레마 365 - 파일럿'); const [companyName,setCompanyName]=useState('세림인사이트');
  return <Layout><section className="card"><h2>Host 방 생성</h2><label>세션명<input value={title} onChange={e=>setTitle(e.target.value)} /></label><label>회사명<input value={companyName} onChange={e=>setCompanyName(e.target.value)} /></label><div className="actions"><button className="secondary" onClick={()=>{seedGameContent(); alert('기본 콘텐츠를 초기화했습니다.')}}>기본 콘텐츠 초기화</button><button className="danger" onClick={()=>{ if(confirm('전체 테스트 데이터를 초기화할까요?')) resetDb();}}>전체 초기화</button><button className="primary" onClick={()=>{const r=createRoom({title,companyName}); nav(`/host/${r.roomId}`);}}>방 생성</button></div></section></Layout>;
}
