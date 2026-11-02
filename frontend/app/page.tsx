"use client";
import { useState, useMemo, useEffect } from "react";
import { io, Socket } from "socket.io-client";

type Patient = { id: string; name: string; age: number; status: "Admitted"|"Discharged"|"Critical"|"Stable"; doctor: string; ward: string; avatar: string; date: string; created_at?: string; };
type Staff = { id: string; name: string; role: string; specialty: string; status: string; };
type Billing = { id: string; patient: string; patient_id: string; amount: number; status: string; date: string; };
type AI = { predictions: {patient:string; risk:string; condition:string; confidence:number}[]; bedOccupancy:number; revenueForecast:number; aiStatus:string; };

const mockData: Patient[] = [
  { id: "P-1042", name: "Adebayo Johnson", age: 34, status: "Admitted", doctor: "Dr. Success Brownson", ward: "ICU-2", avatar: "AJ", date: "08:42" },
  { id: "P-1043", name: "Chioma Okoro", age: 28, status: "Stable", doctor: "Dr. Emeka", ward: "W-4", avatar: "CO", date: "09:12" },
  { id: "P-1044", name: "Musa Ibrahim", age: 45, status: "Critical", doctor: "Dr. Aisha Bello", ward: "ER-1", avatar: "MI", date: "10:03" },
];

const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || (process.env as any).API_URL || "https://enterprise-hospital-os.onrender.com";
const REALTIME_URL = (process.env as any).NEXT_PUBLIC_REALTIME_URL || "https://hospital-os-realtime.onrender.com";

async function fetchPatients(): Promise<Patient[]> {
  try {
    const res = await fetch(`${API_URL}/api/patients`, { cache: 'no-store' });
    if (!res.ok) throw new Error("fail");
    const json = await res.json();
    const list = json.patients || json.data || json;
    if(Array.isArray(list) && list.length > 0) return list.map((p:any)=> ({...p, avatar: p.avatar || p.name?.slice(0,2).toUpperCase() || "PA", date: p.date || new Date(p.created_at).toLocaleTimeString()}));
  } catch(e) {}
  return mockData;
}

export default function HospitalOSMobile() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<Patient[]>(mockData);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [billing, setBilling] = useState<Billing[]>([]);
  const [aiData, setAiData] = useState<AI|null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Patient|null>(null);
  const [socket, setSocket] = useState<Socket|null>(null);
  const [liveAlert, setLiveAlert] = useState<string|null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{user:string,text:string}[]>([{user:"System", text:"ICU-2 ward live — type to chat"}]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchPatients().then(p => { if(p.length > 0) setPatients(p); setLoading(false); });

    // FETCH ALL TABS - THIS FIXES STATIC ISSUE
    fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()).then(d=> { if(Array.isArray(d)) setStaff(d); }).catch(()=>{});
    fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()).then(d=> { if(Array.isArray(d)) setBilling(d); }).catch(()=>{});
    fetch(`${API_URL}/api/ai`, {cache:'no-store'}).then(r=>r.json()).then(d=> setAiData(d)).catch(()=>{});

    try {
      const s = io(REALTIME_URL, { transports: ['websocket', 'polling'] });
      s.on('connect', () => s.emit('join-ward', 'ICU-2'));
      s.on('critical-patient', (d: any) => { setLiveAlert(`🚨 ${d.patient_id || 'Patient'} Critical`); setTimeout(()=>setLiveAlert(null), 5000); });
      s.on('ward-message', (d: any) => setMessages(prev => [...prev, {user: d.user || 'Doctor', text: d.text || d.message}]));
      setSocket(s);
      return () => { s.disconnect(); }
    } catch(err) {}
  }, []);

  const sendMessage = () => {
    if(!chatInput.trim()) return;
    if(socket?.connected) socket.emit('ward-message', { ward: 'ICU-2', user: 'SB', text: chatInput });
    setMessages(prev => [...prev, {user:"You", text: chatInput}]);
    setChatInput("");
  }

  const filtered = useMemo(()=> patients.filter(p=> (p.name+p.id).toLowerCase().includes(q.toLowerCase())), [q, patients]);

  const nav = [
    {id:"dashboard", l:"Dashboard", i:"◧"},
    {id:"patients", l:"Patients", i:"◎"},
    {id:"doctors", l:"Staff", i:"◐"},
    {id:"ai", l:"AI Lab", i:"✦"},
    {id:"billing", l:"Billing", i:"₦"},
  ];

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui"}}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
        .animate-slide { animation: slideIn 0.3s ease; }
        .animate-fade { animation: fadeIn 0.35s ease; }
        @media (min-width: 768px) { .hide-desktop { display:none !important; } .show-desktop { display:flex !important; } }
        @media (max-width: 767px) { .show-desktop { display:none !important; } }
      `}</style>

      {liveAlert && <div style={{position:"fixed", top:"62px", left:"16px", right:"16px", background:"#ef4444", color:"white", padding:"12px", borderRadius:"12px", zIndex:100, textAlign:"center", fontWeight:700}}>{liveAlert}</div>}

      <header style={{height:"56px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:20}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="hide-desktop" style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"white", fontSize:"18px"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <b>Hospital OS</b>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span style={{fontSize:"11px", background: loading ? "#fef3c7" : "#dcfce7", color: loading ? "#d97706" : "#16a34a", padding:"4px 8px", borderRadius:"20px"}}>● {socket?.connected ? "LIVE" : loading ? "SYNCING" : "MOCK"}</span>
          <div style={{width:"32px", height:"32px", borderRadius:"50%", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontSize:"12px", fontWeight:700}}>SB</div>
        </div>
      </header>

      <div style={{display:"flex"}}>
        <aside className="show-desktop" style={{width:"240px", background:"#0a0f1e", color:"white", padding:"16px", flexDirection:"column", position:"sticky", top:"56px", height:"calc(100vh - 56px)"}}>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            {nav.map(n=>(
              <button key={n.id} onClick={()=>setActive(n.id)} style={{textAlign:"left", padding:"12px", borderRadius:"10px", border:"none", background: active===n.id ? "#ffffff14" : "transparent", color: active===n.id ? "white" : "#94a3b8", display:"flex", gap:"10px", fontWeight: active===n.id ? 700 : 500, cursor:"pointer"}}>{n.i} {n.l}</button>
            ))}
          </div>
          <div style={{marginTop:"auto", fontSize:"10px", color:"#475569", padding:"12px"}}>API: {API_URL}<br/>Sock: {socket?.connected ? "Connected" : "Connecting"}</div>
        </aside>

        {menuOpen && (
          <>
            <div onClick={()=>setMenuOpen(false)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:30}}/>
            <aside className="animate-slide" style={{position:"fixed", left:0, top:0, width:"280px", height:"100vh", background:"#0a0f1e", color:"white", padding:"20px", zIndex:40, display:"flex", flexDirection:"column"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px"}}>
                <b>Menu</b><button onClick={()=>setMenuOpen(false)} style={{background:"#ffffff14", border:"none", color:"white", width:"32px", height:"32px", borderRadius:"8px"}}>✕</button>
              </div>
              {nav.map(n=>(
                <button key={n.id} onClick={()=>{setActive(n.id); setMenuOpen(false);}} style={{textAlign:"left", padding:"14px", borderRadius:"12px", border:"none", background: active===n.id ? "#ffffff14" : "transparent", color:"white", display:"flex", gap:"12px", marginBottom:"6px", fontSize:"16px"}}>{n.i} {n.l}</button>
              ))}
            </aside>
          </>
        )}

        <main style={{flex:1, padding:"16px", paddingBottom:"90px"}}>
          <div className="animate-fade" style={{position:"relative", marginBottom:"16px"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search patients..." style={{width:"100%", padding:"14px 14px 14px 40px", borderRadius:"14px", border:"1px solid #e2e8f0", background:"white", outline:"none", fontSize:"16px"}}/>
            <span style={{position:"absolute", left:"14px", top:"14px", opacity:0.5}}>⌕</span>
          </div>

          {active==="dashboard" && (
            <div className="animate-fade">
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px"}}>
                {[{l:"Patients",v:loading ? "..." : patients.length,c:"#3b82f6"},{l:"Critical",v:patients.filter(p=>p.status==="Critical").length,c:"#ef4444"},{l:"Staff",v:staff.length || 3,c:"#10b981"},{l:"Revenue",v:`₦${(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M`,c:"#8b5cf6"}].map(card=>(
                  <div key={card.l} style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}>
                    <div style={{fontSize:"11px", color:"#64748b", textTransform:"uppercase"}}>{card.l}</div>
                    <div style={{fontSize:"22px", fontWeight:800, marginTop:"4px"}}>{card.v}</div>
                    <div style={{height:"4px", background:`${card.c}20`, borderRadius:"10px", marginTop:"10px"}}><div style={{width:"70%", height:"100%", background:card.c, borderRadius:"10px"}}/></div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:"16px", background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}><b>Recent</b><button onClick={()=>setActive("patients")} style={{color:"#3b82f6", background:"none", border:"none", fontSize:"13px"}}>See all</button></div>
                {filtered.map(p=>(
                  <div key={p.id} onClick={()=>setSelected(p)} style={{display:"flex", gap:"12px", padding:"12px", borderRadius:"12px", alignItems:"center", cursor:"pointer"}}>
                    <div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div>
                    <div style={{flex:1}}><div style={{fontWeight:600, fontSize:"14px"}}>{p.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{p.ward} • {p.date}</div></div>
                    <span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background: p.status==="Critical" ? "#fee2e2" : "#dcfce7"}}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active==="patients" && (
            <div className="animate-fade" style={{background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", overflow:"hidden"}}>
              {filtered.map(p=>(
                <div key={p.id} onClick={()=>setSelected(p)} style={{padding:"14px 16px", display:"flex", gap:"12px", borderBottom:"1px solid #f1f5f9", cursor:"pointer"}}>
                  <div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#e2e8f0", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600}}>{p.name} <span style={{fontSize:"11px", color:"#64748b"}}>{p.id}</span></div><div style={{fontSize:"12px", color:"#64748b"}}>{p.doctor}</div></div>
                  <div style={{fontSize:"11px", color:"#64748b"}}>{p.date}</div>
                </div>
              ))}
            </div>
          )}

          {active==="doctors" && (
            <div className="animate-fade">
              <h3 style={{margin:"0 0 12px 4px"}}>Staff On Duty - LIVE from DB</h3>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                {staff.map(s=>(
                  <div key={s.id} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0", display:"flex", gap:"12px", alignItems:"center"}}>
                    <div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>{s.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
                    <div style={{flex:1}}><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{s.role} • {s.specialty}</div></div>
                    <span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background: s.status==="On Duty" ? "#dcfce7" : "#fee2e2"}}>{s.status}</span>
                  </div>
                ))}
                {staff.length===0 && <div style={{background:"white", padding:"20px", borderRadius:"14px", textAlign:"center", color:"#64748b"}}>Loading staff from /api/staff...</div>}
              </div>
            </div>
          )}

          {active==="billing" && (
            <div className="animate-fade">
              <h3 style={{margin:"0 0 12px 4px"}}>Billing - LIVE ₦{billing.reduce((s,b)=>s+b.amount,0).toLocaleString()}</h3>
              <div style={{display:"flex", flexDirection:"column", gap:"10px"}}>
                {billing.map(b=>(
                  <div key={b.id} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0"}}>
                    <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"14px"}}>{b.id}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background: b.status==="Paid" ? "#dcfce7" : "#fef3c7"}}>{b.status}</span></div>
                    <div style={{fontSize:"13px", marginTop:"6px"}}>{b.patient} ({b.patient_id})</div>
                    <div style={{fontWeight:800, marginTop:"4px"}}>₦{b.amount.toLocaleString()}</div>
                    <div style={{fontSize:"11px", color:"#64748b"}}>{b.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active==="ai" && (
            <div className="animate-fade">
              <h3 style={{margin:"0 0 12px 4px"}}>AI Lab - LIVE Predictions</h3>
              {aiData ? (
                <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
                  <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px"}}>
                    <div style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>BED OCCUPANCY</div><div style={{fontSize:"22px", fontWeight:800}}>{aiData.bedOccupancy}%</div></div>
                    <div style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AI STATUS</div><div style={{fontSize:"14px", fontWeight:700, color:"#16a34a"}}>● {aiData.aiStatus}</div></div>
                  </div>
                  {aiData.predictions.map((pred,i)=>(
                    <div key={i} style={{background:"white", borderRadius:"14px", padding:"16px", border:"1px solid #e2e8f0", borderLeft:`4px solid ${pred.risk==="High" ? "#ef4444" : pred.risk==="Medium" ? "#f59e0b" : "#10b981"}`}}>
                      <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"13px"}}>{pred.patient}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background: pred.risk==="High" ? "#fee2e2" : pred.risk==="Medium" ? "#fef3c7" : "#dcfce7"}}>{pred.risk} RISK</span></div>
                      <div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>{pred.condition} — {pred.confidence}% confidence</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{background:"white", padding:"20px", borderRadius:"14px", textAlign:"center", color:"#64748b"}}>Loading AI from /api/ai...</div>
              )}
            </div>
          )}
        </main>
      </div>

      <div className="hide-desktop" style={{position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-around", padding:"8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex:20}}>
        {nav.slice(0,5).map(n=>(
          <button key={n.id} onClick={()=>setActive(n.id)} style={{background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", color: active===n.id ? "#0a0f1e" : "#94a3b8", cursor:"pointer"}}>
            <span style={{fontSize:"20px", background: active===n.id ? "#0a0f1e" : "transparent", color: active===n.id ? "white" : "#94a3b8", width:"36px", height:"28px", borderRadius:"10px", display:"grid", placeItems:"center"}}>{n.i}</span>
            <span style={{fontSize:"10px", fontWeight: active===n.id ? 700 : 400}}>{n.l}</span>
          </button>
        ))}
      </div>

      <div style={{position:"fixed", bottom:"90px", right:"16px", zIndex:40}}>
        {chatOpen ? (
          <div className="animate-fade" style={{width:"320px", height:"380px", background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", boxShadow:"0 10px 30px rgba(0,0,0,0.15)", display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div style={{padding:"12px", background:"#0a0f1e", color:"white", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <b style={{fontSize:"13px"}}>💬 ICU-2 Live {socket?.connected ? "● LIVE" : "○"}</b>
              <button onClick={()=>setChatOpen(false)} style={{background:"#ffffff20", border:"none", color:"white", width:"28px", height:"28px", borderRadius:"8px", cursor:"pointer"}}>✕</button>
            </div>
            <div style={{flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:"8px", background:"#f8fafc"}}>
              {messages.map((m,i)=>(
                <div key={i} style={{background: m.user==="You" ? "#0a0f1e" : "white", color: m.user==="You" ? "white" : "#0a0f1e", padding:"8px 12px", borderRadius:"12px", alignSelf: m.user==="You" ? "flex-end" : "flex-start", maxWidth:"80%", fontSize:"13px", border:"1px solid #e2e8f0"}}>
                  <div style={{fontSize:"10px", opacity:0.6}}>{m.user}</div>{m.text}
                </div>
              ))}
            </div>
            <div style={{padding:"10px", borderTop:"1px solid #e2e8f0", display:"flex", gap:"8px"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && sendMessage()} placeholder="Type message..." style={{flex:1, padding:"10px", borderRadius:"10px", border:"1px solid #e2e8f0", outline:"none", fontSize:"14px"}}/>
              <button onClick={sendMessage} style={{background:"#0a0f1e", color:"white", border:"none", padding:"0 14px", borderRadius:"10px", fontWeight:700, cursor:"pointer"}}>Send</button>
            </div>
          </div>
        ) : (
                   <button onClick={()=>setChatOpen(true)} style={{width:"56px", height:"56px", borderRadius:"50%", background:"#0a0f1e", color:"white", border:"none", fontSize:"24px", boxShadow:"0 8px 20px rgba(0,0,0,0.2)", cursor:"pointer"}}>💬</button>
        )}
      </div>

      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div onClick={e=>e.stopPropagation()} className="animate-fade" style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>{selected.name}</h3><button onClick={()=>setSelected(null)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px", cursor:"pointer"}}>✕</button></div>
            <div style={{marginTop:"16px", background:"#f8fafc", borderRadius:"12px", padding:"12px", fontSize:"13px", lineHeight:1.8}}>ID: <b>{selected.id}</b><br/>Ward: {selected.ward}<br/>Doctor: {selected.doctor}<br/>Status: {selected.status}</div>
            <button style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700, cursor:"pointer"}} onClick={()=>setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}