"use client";
import { useState, useMemo } from "react";

type Patient = { id: string; name: string; age: number; status: "Admitted"|"Discharged"|"Critical"|"Stable"; doctor: string; ward: string; avatar: string; date: string; };

const data: Patient[] = [
  { id: "P-1042", name: "Adebayo Johnson", age: 34, status: "Admitted", doctor: "Dr. Success Brownson", ward: "ICU-2", avatar: "AJ", date: "08:42" },
  { id: "P-1043", name: "Chioma Okoro", age: 28, status: "Stable", doctor: "Dr. Emeka", ward: "W-4", avatar: "CO", date: "09:12" },
  { id: "P-1044", name: "Musa Ibrahim", age: 45, status: "Critical", doctor: "Dr. Aisha Bello", ward: "ER-1", avatar: "MI", date: "10:03" },
];

export default function HospitalOSMobile() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(data);
  const [selected, setSelected] = useState<Patient|null>(null);

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

      {/* TOP BAR */}
      <header style={{height:"56px", background:"rgba(255,255,255,0.9)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:20}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="hide-desktop" style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"white", fontSize:"18px"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <b>Hospital OS</b>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span style={{fontSize:"11px", background:"#dcfce7", color:"#16a34a", padding:"4px 8px", borderRadius:"20px"}}>● LIVE</span>
          <div style={{width:"32px", height:"32px", borderRadius:"50%", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontSize:"12px", fontWeight:700}}>SB</div>
        </div>
      </header>

      <div style={{display:"flex"}}>
        {/* SIDEBAR - DESKTOP */}
        <aside className="show-desktop" style={{width:"240px", background:"#0a0f1e", color:"white", padding:"16px", flexDirection:"column", position:"sticky", top:"56px", height:"calc(100vh - 56px)"}}>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            {nav.map(n=>(
              <button key={n.id} onClick={()=>setActive(n.id)} style={{textAlign:"left", padding:"12px", borderRadius:"10px", border:"none", background: active===n.id ? "#ffffff14" : "transparent", color: active===n.id ? "white" : "#94a3b8", display:"flex", gap:"10px", fontWeight: active===n.id ? 700 : 500, cursor:"pointer", transition:"0.2s"}}>{n.i} {n.l}</button>
            ))}
          </div>
        </aside>

        {/* SIDEBAR - MOBILE DRAWER */}
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

        {/* CONTENT */}
        <main style={{flex:1, padding:"16px", paddingBottom:"90px"}}>
          {/* Search */}
          <div className="animate-fade" style={{position:"relative", marginBottom:"16px"}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search patients..." style={{width:"100%", padding:"14px 14px 14px 40px", borderRadius:"14px", border:"1px solid #e2e8f0", background:"white", outline:"none", fontSize:"16px"}}/>
            <span style={{position:"absolute", left:"14px", top:"14px", opacity:0.5}}>⌕</span>
          </div>

          {active==="dashboard" && (
            <div className="animate-fade">
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px"}}>
                {[{l:"Patients",v:filtered.length+132,c:"#3b82f6"},{l:"Critical",v:3,c:"#ef4444"},{l:"Today",v:"24",c:"#10b981"},{l:"Revenue",v:"₦4.2M",c:"#8b5cf6"}].map(card=>(
                  <div key={card.l} style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0", transition:"transform 0.2s"}} onTouchStart={e=>e.currentTarget.style.transform="scale(0.97)"} onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}>
                    <div style={{fontSize:"11px", color:"#64748b", textTransform:"uppercase"}}>{card.l}</div>
                    <div style={{fontSize:"22px", fontWeight:800, marginTop:"4px"}}>{card.v}</div>
                    <div style={{height:"4px", background:`${card.c}20`, borderRadius:"10px", marginTop:"10px"}}><div style={{width:"70%", height:"100%", background:card.c, borderRadius:"10px"}}/></div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:"16px", background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px"}}><b>Recent</b><button onClick={()=>setActive("patients")} style={{color:"#3b82f6", background:"none", border:"none", fontSize:"13px"}}>See all</button></div>
                {filtered.map(p=>(
                  <div key={p.id} onClick={()=>setSelected(p)} style={{display:"flex", gap:"12px", padding:"12px", borderRadius:"12px", alignItems:"center"}}>
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
                <div key={p.id} onClick={()=>setSelected(p)} style={{padding:"14px 16px", display:"flex", gap:"12px", borderBottom:"1px solid #f1f5f9"}}>
                  <div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#e2e8f0", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600}}>{p.name} <span style={{fontSize:"11px", color:"#64748b"}}>{p.id}</span></div><div style={{fontSize:"12px", color:"#64748b"}}>{p.doctor}</div></div>
                  <div style={{fontSize:"11px", color:"#64748b"}}>{p.date}</div>
                </div>
              ))}
            </div>
          )}

          {active!=="dashboard" && active!=="patients" && (
            <div className="animate-fade" style={{background:"white", borderRadius:"16px", padding:"32px", textAlign:"center", border:"1px solid #e2e8f0"}}>
              <div style={{fontSize:"32px", marginBottom:"8px"}}>{nav.find(n=>n.id===active)?.i}</div><h3 style={{textTransform:"capitalize", margin:0}}>{active}</h3><p style={{color:"#64748b", fontSize:"13px", marginTop:"6px"}}>Connects to /api/{active} on Render Go API</p>
              <button onClick={()=>alert(`${active} module — backend deploy needed on Render`)} style={{marginTop:"16px", padding:"12px 18px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", width:"100%"}}>Test {active} API</button>
            </div>
          )}
        </main>
      </div>

      {/* BOTTOM TAB BAR - MOBILE */}
      <div className="hide-desktop" style={{position:"fixed", bottom:0, left:0, right:0, background:"rgba(255,255,255,0.95)", backdropFilter:"blur(20px)", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-around", padding:"8px 0 calc(8px + env(safe-area-inset-bottom))", zIndex:20}}>
        {nav.slice(0,5).map(n=>(
          <button key={n.id} onClick={()=>setActive(n.id)} style={{background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", color: active===n.id ? "#0a0f1e" : "#94a3b8"}}>
            <span style={{fontSize:"20px", background: active===n.id ? "#0a0f1e" : "transparent", color: active===n.id ? "white" : "#94a3b8", width:"36px", height:"28px", borderRadius:"10px", display:"grid", placeItems:"center", transition:"0.2s"}}>{n.i}</span>
            <span style={{fontSize:"10px", fontWeight: active===n.id ? 700 : 400}}>{n.l}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div onClick={e=>e.stopPropagation()} className="animate-fade" style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>{selected.name}</h3><button onClick={()=>setSelected(null)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <div style={{marginTop:"16px", background:"#f8fafc", borderRadius:"12px", padding:"12px", fontSize:"13px", lineHeight:1.8}}>ID: <b>{selected.id}</b><br/>Ward: {selected.ward}<br/>Doctor: {selected.doctor}<br/>Status: {selected.status}</div>
            <button style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}} onClick={()=>setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}