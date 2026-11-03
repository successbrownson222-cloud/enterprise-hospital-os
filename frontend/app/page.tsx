"use client";
import { useState, useMemo, useEffect } from "react";
import { io, Socket } from "socket.io-client";

type Patient = { id: string; name: string; age: number; status: string; doctor: string; ward: string; avatar: string; date: string; };

const mockData: Patient[] = [
  { id: "P-1042", name: "Adebayo Johnson", age: 34, status: "Admitted", doctor: "Dr. Success Brownson", ward: "ICU-2", avatar: "AJ", date: "08:42" },
  { id: "P-1043", name: "Chioma Okoro", age: 28, status: "Stable", doctor: "Dr. Emeka", ward: "W-4", avatar: "CO", date: "09:12" },
];

const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";
const REALTIME_URL = (process.env as any).NEXT_PUBLIC_REALTIME_URL || "https://hospital-os-realtime.onrender.com";

export default function HospitalOSMobile() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<Patient[]>(mockData);
  const [staff, setStaff] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any>(null);
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulance, setAmbulance] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [socket, setSocket] = useState<Socket|null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{user:string,text:string}[]>([{user:"System", text:"ICU-2 ward live — type to chat"}]);
  const [chatInput, setChatInput] = useState("");
  const [userType, setUserType] = useState("");
  const [showAdmit, setShowAdmit] = useState(false);
  const [newPatient, setNewPatient] = useState({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"});

  useEffect(() => {
    setUserType(localStorage.getItem("user_type")||"guest");
    const fetchAll = async () => {
      try {
        const p = await fetch(`${API_URL}/api/patients`, {cache:'no-store'}).then(r=>r.json());
        const list = p.patients||p.data||p;
        if(Array.isArray(list)&&list.length>0) setPatients(list.map((x:any)=>({...x, avatar:x.avatar||x.name?.slice(0,2).toUpperCase()})));
      } catch {}
      fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()).then(d=>{if(Array.isArray(d)) setStaff(d)}).catch(()=>{});
      fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()).then(d=>{if(Array.isArray(d)) setBilling(d)}).catch(()=>{});
      fetch(`${API_URL}/api/ai`, {cache:'no-store'}).then(r=>r.json()).then(setAiData).catch(()=>{});
      fetch(`${API_URL}/api/beds`, {cache:'no-store'}).then(r=>r.json()).then(setBeds).catch(()=>{});
      fetch(`${API_URL}/api/ambulance`, {cache:'no-store'}).then(r=>r.json()).then(setAmbulance).catch(()=>{});
      fetch(`${API_URL}/api/equipment`, {cache:'no-store'}).then(r=>r.json()).then(setEquipment).catch(()=>{});
      fetch(`${API_URL}/api/labs`, {cache:'no-store'}).then(r=>r.json()).then(setLabs).catch(()=>{});
      setLoading(false);
      try {
        const s = io(REALTIME_URL, { transports: ['websocket','polling'] });
        s.on('ward-message', (d:any)=> setMessages(prev=>[...prev, {user:d.user||'Doctor', text:d.text||d.message}]));
        setSocket(s);
      } catch {}
    };
    fetchAll();
  }, []);

  const token = () => typeof window!=="undefined"?localStorage.getItem("token")||"":"";
  const isAdmin = userType==="admin";

  const admitPatient = async () => {
    if(!isAdmin) return alert("Admin only");
    if(!newPatient.name) return alert("Enter name");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const data=await res.json(); setPatients(prev=>[data, ...prev]); setShowAdmit(false); alert("Admitted "+data.id); }
    else alert("Failed - login as admin@hospital.com / Admin123!");
  };

  const sendMessage = () => {
    if(!chatInput.trim()) return;
    if(socket?.connected) socket.emit('ward-message', { ward: 'ICU-2', user: 'SB', text: chatInput });
    setMessages(prev => [...prev, {user:"You", text: chatInput}]);
    setChatInput("");
  };

  const filtered = useMemo(()=> patients.filter(p=> (p.name+p.id).toLowerCase().includes(q.toLowerCase())), [q, patients]);

  const nav = [
    {id:"dashboard", l:"Dashboard", i:"◧"},
    {id:"patients", l:"Patients", i:"◎"},
    {id:"doctors", l:"Staff", i:"◐"},
    {id:"ai", l:"AI Lab", i:"✦"},
    {id:"billing", l:"Billing", i:"₦"},
    {id:"beds", l:"Beds 🛏️", i:"🛏️"},
    {id:"ambulance", l:"Ambulance", i:"🚑"},
    {id:"equipment", l:"Equipment", i:"⚙️"},
    {id:"labs", l:"Labs", i:"🧪"},
  ];

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui"}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.animate-fade{animation:fadeIn 0.35s ease}
        @media(min-width:768px){.hide-desktop{display:none!important}.show-desktop{display:flex!important}}
        @media(max-width:767px){.show-desktop{display:none!important}}
      `}</style>

      <header style={{height:"56px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:20}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="hide-desktop" style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"white"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <b>Hospital OS Pro</b>
          <span style={{fontSize:"10px", background:isAdmin?"#dcfce7":"#fef3c7", padding:"3px 8px", borderRadius:"20px"}}>{userType||"guest"}</span>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span style={{fontSize:"11px", background: loading?"#fef3c7":"#dcfce7", color: loading?"#d97706":"#16a34a", padding:"4px 8px", borderRadius:"20px"}}>● {socket?.connected?"LIVE":loading?"SYNC":"MOCK"}</span>
          {isAdmin && <button onClick={()=>setShowAdmit(true)} style={{background:"#0a0f1e", color:"white", border:"none", padding:"7px 12px", borderRadius:"10px", fontSize:"12px", fontWeight:700}}>+ Admit</button>}
          <button onClick={()=>{localStorage.clear(); window.location.href="/login"}} style={{background:"white", border:"1px solid #e2e8f0", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      <div style={{display:"flex"}}>
        <aside className="show-desktop" style={{width:"240px", background:"#0a0f1e", color:"white", padding:"16px", flexDirection:"column", position:"sticky", top:"56px", height:"calc(100vh - 56px)"}}>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            {nav.map(n=><button key={n.id} onClick={()=>setActive(n.id)} style={{textAlign:"left", padding:"12px", borderRadius:"10px", border:"none", background: active===n.id?"#ffffff14":"transparent", color: active===n.id?"white":"#94a3b8", display:"flex", gap:"10px", cursor:"pointer", fontWeight: active===n.id?700:500}}>{n.i} {n.l}</button>)}
          </div>
          <div style={{marginTop:"auto", fontSize:"10px", color:"#475569", lineHeight:1.6}}>Beds: {beds.filter(b=>b.status==="Available").length} avail<br/>AMB: {ambulance.filter(a=>a.status==="Available").length} ready<br/>User: {userType}</div>
        </aside>

        {menuOpen && (<><div onClick={()=>setMenuOpen(false)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:30}}/><aside className="animate-fade" style={{position:"fixed", left:0, top:0, width:"280px", height:"100vh", background:"#0a0f1e", color:"white", padding:"20px", zIndex:40, display:"flex", flexDirection:"column"}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:"24px"}}><b>Menu</b><button onClick={()=>setMenuOpen(false)} style={{background:"#ffffff14", border:"none", color:"white", width:"32px", height:"32px", borderRadius:"8px"}}>✕</button></div>{nav.map(n=><button key={n.id} onClick={()=>{setActive(n.id); setMenuOpen(false);}} style={{textAlign:"left", padding:"14px", borderRadius:"12px", border:"none", background: active===n.id?"#ffffff14":"transparent", color:"white", display:"flex", gap:"12px", marginBottom:"6px", fontSize:"16px", width:"100%"}}>{n.i} {n.l}</button>)}</aside></>)}

        <main style={{flex:1, padding:"16px", paddingBottom:"100px", maxWidth:"100%", overflowX:"hidden"}}>
          <div className="animate-fade" style={{position:"relative", marginBottom:"16px"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search patients..." style={{width:"100%", padding:"14px 14px 14px 40px", borderRadius:"14px", border:"1px solid #e2e8f0", background:"white", outline:"none", fontSize:"16px", boxSizing:"border-box"}}/>
            <span style={{position:"absolute", left:"14px", top:"14px", opacity:0.5}}>⌕</span>
          </div>

          {active==="dashboard" && (
            <div className="animate-fade">
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px"}}>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>PATIENTS</div><div style={{fontSize:"22px", fontWeight:800}}>{patients.length}</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AVAIL BEDS</div><div style={{fontSize:"22px", fontWeight:800}}>{beds.filter(b=>b.status==="Available").length}/{beds.length||8}</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AMBULANCE</div><div style={{fontSize:"22px", fontWeight:800}}>{ambulance.filter(a=>a.status==="Available").length}</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>REVENUE</div><div style={{fontSize:"22px", fontWeight:800}}>₦{(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M</div></div>
              </div>
              <div style={{marginTop:"16px", background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}><b>Recent</b><button onClick={()=>setActive("patients")} style={{color:"#3b82f6", background:"none", border:"none"}}>See all</button></div>
                {filtered.map(p=><div key={p.id} onClick={()=>setSelected(p)} style={{display:"flex", gap:"12px", padding:"12px", borderRadius:"12px", alignItems:"center", cursor:"pointer", borderBottom:"1px solid #f8fafc"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700, flexShrink:0}}>{p.avatar}</div><div style={{flex:1, minWidth:0}}><div style={{fontWeight:600, fontSize:"14px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{p.ward} • {p.date}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:"#dcfce7", flexShrink:0}}>{p.status}</span></div>)}
              </div>
            </div>
          )}

          {active==="patients" && (
            <div className="animate-fade" style={{background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", overflow:"hidden"}}>
              {isAdmin && <button onClick={()=>setShowAdmit(true)} style={{margin:"12px", background:"#0a0f1e", color:"white", border:"none", padding:"12px", borderRadius:"10px", width:"calc(100% - 24px)", fontWeight:700}}>+ Admit New Patient (Admin)</button>}
              {filtered.map(p=><div key={p.id} onClick={()=>setSelected(p)} style={{padding:"14px 16px", display:"flex", gap:"12px", borderBottom:"1px solid #f1f5f9", cursor:"pointer", alignItems:"center"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#e2e8f0", display:"grid", placeItems:"center", fontWeight:700, flexShrink:0}}>{p.avatar}</div><div style={{flex:1, minWidth:0}}><div style={{fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{p.name} <span style={{fontSize:"11px", color:"#64748b"}}>{p.id}</span></div><div style={{fontSize:"12px", color:"#64748b"}}>{p.doctor}</div></div></div>)}
            </div>
          )}

          {active==="doctors" && (<div className="animate-fade"><h3>Staff - Tap to view</h3>{staff.map(s=><div key={s.id} onClick={()=>setSelected(s)} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0", marginTop:"10px", display:"flex", gap:"12px", cursor:"pointer"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700, flexShrink:0}}>{s.name?.slice(0,2)}</div><div style={{flex:1}}><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{s.role} • {s.specialty}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:s.status==="On Duty"?"#dcfce7":"#fee2e2", height:"fit-content"}}>{s.status}</span></div>)}</div>)}
          {active==="billing" && (<div className="animate-fade"><h3>Billing - Tap for receipt</h3>{billing.map(b=><div key={b.id} onClick={()=>setSelected(b)} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0", marginTop:"10px", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{b.id}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:b.status==="Paid"?"#dcfce7":"#fef3c7"}}>{b.status}</span></div><div style={{fontSize:"13px", marginTop:"6px"}}>{b.patient}</div><div style={{fontWeight:800}}>₦{b.amount?.toLocaleString()}</div></div>)}</div>)}
          {active==="ai" && (<div className="animate-fade"><h3>AI Lab - Tap for action</h3>{aiData?.predictions?.map((p:any,i:number)=><div key={i} onClick={()=>setSelected(p)} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0", marginTop:"10px", borderLeft:`4px solid ${p.risk==="High"?"#ef4444":p.risk==="Medium"?"#f59e0b":"#10b981"}`, cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{p.patient}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:p.risk==="High"?"#fee2e2":"#dcfce7"}}>{p.risk}</span></div><div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>{p.condition} • {p.confidence}%</div></div>)}</div>)}
          {active==="beds" && (<div className="animate-fade"><h3>🛏️ Beds - Tap to assign</h3><div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginTop:"12px"}}>{beds.map(b=><div key={b.id} onClick={()=>setSelected(b)} style={{background:"white", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", borderLeft:`4px solid ${b.status==="Available"?"#10b981":"#ef4444"}`, cursor:"pointer"}}><b>{b.id}</b><div style={{fontSize:"12px", color:"#64748b"}}>{b.ward}</div><div style={{marginTop:"6px", fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:b.status==="Available"?"#dcfce7":"#fee2e2", display:"inline-block"}}>{b.status}</div></div>)}</div></div>)}
          {active==="ambulance" && (<div className="animate-fade"><h3>🚑 Ambulance - Tap to dispatch</h3>{ambulance.map(a=><div key={a.id} onClick={()=>setSelected(a)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{a.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:a.status==="Available"?"#dcfce7":"#fef3c7"}}>{a.status}</span></div><div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>📍 {a.location} • {a.eta}</div></div>)}</div>)}
          {active==="equipment" && (<div className="animate-fade"><h3>⚙️ Equipment</h3>{equipment.map(e=><div key={e.id} onClick={()=>setSelected(e)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}><b>{e.name}</b><div style={{fontSize:"12px", color:"#64748b"}}>{e.id} • {e.ward}</div><div style={{display:"flex", justifyContent:"space-between", marginTop:"8px"}}><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:e.status==="Available"?"#dcfce7":"#fef3c7"}}>{e.status}</span><span style={{fontSize:"11px"}}>Next: {e.nextService}</span></div></div>)}</div>)}
          {active==="labs" && (<div className="animate-fade"><h3>🧪 Labs</h3>{labs.map(l=><div key={l.id} onClick={()=>setSelected(l)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{l.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:l.status==="Completed"?"#dcfce7":"#fef3c7"}}>{l.status}</span></div><div style={{fontSize:"13px", marginTop:"6px"}}>{l.patient} - {l.test}</div></div>)}</div>)}
        </main>
      </div>

      <div className="hide-desktop" style={{position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.98)", backdropFilter:"blur(20px)", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-around", padding:"8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex:20, overflowX:"auto"}}>
        {nav.map(n=><button key={n.id} onClick={()=>setActive(n.id)} style={{background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", color: active===n.id?"#0a0f1e":"#94a3b8", cursor:"pointer", minWidth:"56px"}}><span style={{fontSize:"18px", background: active===n.id?"#0a0f1e":"transparent", color: active===n.id?"white":"#94a3b8", width:"32px", height:"26px", borderRadius:"10px", display:"grid", placeItems:"center"}}>{n.i}</span><span style={{fontSize:"9px", fontWeight: active===n.id?700:400}}>{n.l.split(" ")[0]}</span></button>)}
      </div>

      {/* CHAT BUTTON - RESTORED */}
      <div style={{position:"fixed", bottom:"90px", right:"16px", zIndex:40}}>
        {chatOpen ? (
          <div className="animate-fade" style={{width:"320px", height:"380px", background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", boxShadow:"0 10px 30px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div style={{padding:"12px", background:"#0a0f1e", color:"white", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <b style={{fontSize:"13px"}}>💬 ICU-2 Live {socket?.connected ? "● LIVE" : "○"}</b>
              <button onClick={()=>setChatOpen(false)} style={{background:"#ffffff20", border:"none", color:"white", width:"28px", height:"28px", borderRadius:"8px", cursor:"pointer"}}>✕</button>
            </div>
            <div style={{flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:"8px", background:"#f8fafc"}}>
              {messages.map((m,i)=><div key={i} style={{background: m.user==="You"?"#0a0f1e":"white", color: m.user==="You"?"white":"#0a0f1e", padding:"8px 12px", borderRadius:"12px", alignSelf: m.user==="You"?"flex-end":"flex-start", maxWidth:"80%", fontSize:"13px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"10px", opacity:0.6}}>{m.user}</div>{m.text}</div>)}
            </div>
            <div style={{padding:"10px", borderTop:"1px solid #e2e8f0", display:"flex", gap:"8px"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && sendMessage()} placeholder="Type..." style={{flex:1, padding:"10px", borderRadius:"10px", border:"1px solid #e2e8f0", outline:"none"}}/>
              <button onClick={sendMessage} style={{background:"#0a0f1e", color:"white", border:"none", padding:"0 14px", borderRadius:"10px", fontWeight:700}}>Send</button>
            </div>
          </div>
        ) : (
          <button onClick={()=>setChatOpen(true)} style={{width:"56px", height:"56px", borderRadius:"50%", background:"#0a0f1e", color:"white", border:"none", fontSize:"24px", boxShadow:"0 8px 20px rgba(0,0,0,0.2)", cursor:"pointer", display:"grid", placeItems:"center"}}>💬</button>
        )}
      </div>

      {showAdmit && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:60, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Admit</h3><button onClick={()=>setShowAdmit(false)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newPatient.name} onChange={e=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Patient Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"12px", boxSizing:"border-box"}}/>
            <input value={newPatient.age} type="number" onChange={e=>setNewPatient({...newPatient, age:parseInt(e.target.value)})} placeholder="Age" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"10px", boxSizing:"border-box"}}/>
            <select value={newPatient.ward} onChange={e=>setNewPatient({...newPatient, ward:e.target.value})} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"10px"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select>
            <button onClick={admitPatient} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}}>Admit Patient</button>
          </div>
        </div>
      )}

      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Details</h3><button onClick={()=>setSelected(null)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <div style={{marginTop:"16px", background:"#f8fafc", borderRadius:"12px", padding:"12px", fontSize:"13px", lineHeight:1.9, maxHeight:"300px", overflowY:"auto"}}>
              {Object.entries(selected).map(([k,v]:any)=><div key={k}><b>{k}:</b> {String(v)}</div>)}
            </div>
            <button onClick={()=>setSelected(null)} style={{marginTop:"14px", width:"100%", padding:"12px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}