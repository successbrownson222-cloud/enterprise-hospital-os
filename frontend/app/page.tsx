"use client";
import { useState, useMemo } from "react";

type Patient = { id: string; name: string; age: number; gender: string; status: "Admitted"|"Discharged"|"Critical"|"Stable"; doctor: string; ward: string; avatar: string; date: string; bp: string; temp: string };

const patientsData: Patient[] = [
  { id: "P-1042", name: "Adebayo Johnson", age: 34, gender: "M", status: "Admitted", doctor: "Dr. Success Brownson", ward: "ICU-2", avatar: "AJ", date: "Today 08:42", bp: "120/80", temp: "37.1°C" },
  { id: "P-1043", name: "Chioma Okoro", age: 28, gender: "F", status: "Stable", doctor: "Dr. Emeka", ward: "W-4", avatar: "CO", date: "Today 09:12", bp: "118/76", temp: "36.8°C" },
  { id: "P-1044", name: "Musa Ibrahim", age: 45, gender: "M", status: "Critical", doctor: "Dr. Aisha Bello", ward: "ER-1", avatar: "MI", date: "Today 10:03", bp: "145/95", temp: "38.2°C" },
  { id: "P-1045", name: "Grace Nwosu", age: 31, gender: "F", status: "Admitted", doctor: "Dr. Success Brownson", ward: "W-2", avatar: "GN", date: "Yesterday", bp: "110/70", temp: "36.9°C" },
];

export default function EnterpriseHospitalOS() {
  const [active, setActive] = useState("dashboard");
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(patientsData);
  const [selected, setSelected] = useState<Patient|null>(null);
  const [newP, setNewP] = useState({name:"",age:""});

  const filtered = useMemo(()=> patients.filter(p=> (p.name+p.id+p.doctor).toLowerCase().includes(q.toLowerCase())), [q, patients]);

  const add = () => {
    if(!newP.name) return;
    const p: Patient = { id:`P-${Math.floor(Math.random()*9000)}`, name:newP.name, age: parseInt(newP.age)||30, gender:"M", status:"Admitted", doctor:"Dr. Success Brownson", ward:"W-1", avatar:newP.name.slice(0,2).toUpperCase(), date:"Just now", bp:"120/80", temp:"37.0°C" };
    setPatients([p,...patients]); setNewP({name:"",age:""});
  };

  const tabs = [
    {id:"dashboard", label:"Overview", icon:"◧"},
    {id:"patients", label:"Patients", icon:"◎"},
    {id:"doctors", label:"Staff", icon:"◐"},
    {id:"ai", label:"AI Assistant", icon:"✦"},
    {id:"billing", label:"Billing", icon:"₦"},
  ];

  return (
    <div style={{display:"flex", minHeight:"100vh", background:"#f8fafc", fontFamily:"Inter, system-ui"}}>
      {/* SIDEBAR */}
      <aside style={{width:"260px", background:"#0a0f1e", color:"white", padding:"20px", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh"}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px", marginBottom:"28px"}}>
          <div style={{width:"36px", height:"36px", background:"linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius:"10px", display:"grid", placeItems:"center", fontWeight:800}}>H</div>
          <div><div style={{fontWeight:800, lineHeight:1}}>Hospital OS</div><div style={{fontSize:"11px", opacity:0.6}}>Enterprise v2.0 • Lagos</div></div>
        </div>
        <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)} style={{textAlign:"left", padding:"12px 14px", borderRadius:"10px", border:"none", background: active===t.id ? "rgba(255,255,255,0.12)" : "transparent", color: active===t.id ? "white" : "#94a3b8", cursor:"pointer", display:"flex", gap:"10px", fontWeight: active===t.id ? 700 : 500}}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        <div style={{marginTop:"auto", background:"rgba(255,255,255,0.06)", padding:"14px", borderRadius:"12px"}}>
          <div style={{fontSize:"12px", opacity:0.7}}>Backend Status</div>
          <div style={{fontSize:"13px", marginTop:"6px"}}>Frontend ● <span style={{color:"#22c55e"}}>Live on Vercel</span></div>
          <div style={{fontSize:"13px"}}>Go API ○ <span style={{color:"#f59e0b"}}>Pending Render</span></div>
          <div style={{fontSize:"13px"}}>Python AI ○ <span style={{color:"#f59e0b"}}>Pending Render</span></div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1}}>
        <header style={{height:"64px", background:"rgba(255,255,255,0.8)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", position:"sticky", top:0, zIndex:10}}>
          <div style={{display:"flex", alignItems:"center", gap:"12px", flex:1}}>
            <div style={{position:"relative", flex:"1", maxWidth:"420px"}}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search patients, doctors, press ⌘K" style={{width:"100%", padding:"10px 14px 10px 36px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"#f1f5f9", outline:"none"}}/>
              <span style={{position:"absolute", left:"12px", top:"10px", opacity:0.5}}>⌕</span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <button style={{padding:"8px 14px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"white"}}>Dr. Success Brownson ▾</button>
            <div style={{width:"36px", height:"36px", borderRadius:"50%", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>SB</div>
          </div>
        </header>

        <main style={{padding:"24px"}}>
          {active==="dashboard" && (
            <>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"14px"}}>
                {[
                  {label:"Total Patients", value:patients.length+128, change:"+12%", color:"#3b82f6"},
                  {label:"Critical", value:patients.filter(p=>p.status==="Critical").length+3, change:"+2", color:"#ef4444"},
                  {label:"Admitted Today", value:"24", change:"+8%", color:"#10b981"},
                  {label:"Revenue", value:"₦4.2M", change:"+14%", color:"#8b5cf6"},
                ].map(card=>(
                  <div key={card.label} style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e2e8f0", boxShadow:"0 1px 2px rgba(0,0,0,0.04)"}}>
                    <div style={{display:"flex", justifyContent:"space-between"}}><span style={{fontSize:"12px", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px"}}>{card.label}</span><span style={{fontSize:"12px", background:`${card.color}15`, color:card.color, padding:"2px 8px", borderRadius:"20px"}}>{card.change}</span></div>
                    <div style={{fontSize:"28px", fontWeight:800, marginTop:"8px"}}>{card.value}</div>
                    <div style={{height:"32px", marginTop:"12px", display:"flex", alignItems:"end", gap:"3px"}}>{[20,40,30,60,45,70,50].map((h,i)=><div key={i} style={{flex:1, height:`${h}%`, background:card.color, opacity:0.2+i*0.1, borderRadius:"4px"}}/>)}</div>
                  </div>
                ))}
              </div>

              <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:"14px", marginTop:"14px"}}>
                <div style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e2e8f0"}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px"}}><h3 style={{margin:0}}>Live Admissions</h3><button onClick={()=>setActive("patients")} style={{fontSize:"12px", color:"#3b82f6", background:"none", border:"none", cursor:"pointer"}}>View all →</button></div>
                  {filtered.slice(0,4).map(p=>(
                    <div key={p.id} onClick={()=>setSelected(p)} style={{display:"flex", alignItems:"center", gap:"12px", padding:"12px", borderRadius:"12px", cursor:"pointer", border:"1px solid transparent"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{width:"40px", height:"40px", borderRadius:"10px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div>
                      <div style={{flex:1}}><div style={{fontWeight:600}}>{p.name} <span style={{fontWeight:400, color:"#64748b", fontSize:"12px"}}>• {p.id}</span></div><div style={{fontSize:"12px", color:"#64748b"}}>{p.ward} • {p.doctor}</div></div>
                      <span style={{fontSize:"11px", padding:"4px 10px", borderRadius:"20px", background: p.status==="Critical" ? "#fee2e2" : p.status==="Admitted" ? "#dcfce7" : "#e0e7ff", color: p.status==="Critical" ? "#dc2626" : p.status==="Admitted" ? "#16a34a" : "#4f46e5"}}>{p.status}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:"#0a0f1e", borderRadius:"16px", padding:"18px", color:"white"}}>
                  <h3 style={{margin:"0 0 12px"}}>✦ AI Triage</h3>
                  <div style={{background:"rgba(255,255,255,0.08)", padding:"12px", borderRadius:"10px", fontSize:"13px", lineHeight:1.5}}>
                    Python AI service will analyze vitals here. <br/><br/>• Auto detect sepsis risk<br/>• Drug interaction check<br/>• Report summarization
                  </div>
                  <button onClick={()=>setActive("ai")} style={{marginTop:"14px", width:"100%", padding:"10px", borderRadius:"10px", background:"white", color:"#0a0f1e", border:"none", fontWeight:700, cursor:"pointer"}}>Open AI Lab</button>
                </div>
              </div>
            </>
          )}

          {active==="patients" && (
            <div style={{background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", overflow:"hidden"}}>
              <div style={{padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #e2e8f0", gap:"10px", flexWrap:"wrap"}}>
                <h3 style={{margin:0}}>Patients • {filtered.length}</h3>
                <div style={{display:"flex", gap:"8px"}}>
                  <input placeholder="Name" value={newP.name} onChange={e=>setNewP({...newP,name:e.target.value})} style={{padding:"8px 10px", borderRadius:"8px", border:"1px solid #e2e8f0"}}/>
                  <input placeholder="Age" value={newP.age} onChange={e=>setNewP({...newP,age:e.target.value})} style={{width:"70px", padding:"8px 10px", borderRadius:"8px", border:"1px solid #e2e8f0"}}/>
                  <button onClick={add} style={{padding:"8px 14px", background:"#0a0f1e", color:"white", borderRadius:"8px", border:"none", cursor:"pointer"}}>+ Add</button>
                </div>
              </div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%", borderCollapse:"collapse", fontSize:"14px"}}>
                  <thead style={{background:"#f8fafc", color:"#64748b", fontSize:"12px", textAlign:"left"}}><tr><th style={{padding:"12px 18px"}}>Patient</th><th>Vitals</th><th>Status</th><th>Ward</th><th>Time</th></tr></thead>
                  <tbody>{filtered.map(p=>(
                    <tr key={p.id} onClick={()=>setSelected(p)} style={{borderTop:"1px solid #f1f5f9", cursor:"pointer"}}><td style={{padding:"12px 18px", display:"flex", gap:"10px", alignItems:"center"}}><div style={{width:"36px", height:"36px", borderRadius:"8px", background:"#e2e8f0", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div><div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{p.id} • {p.age}y • {p.gender}</div></div></td><td style={{fontSize:"12px"}}>{p.bp} • {p.temp}</td><td><span style={{padding:"4px 10px", borderRadius:"20px", fontSize:"11px", background: p.status==="Critical" ? "#fee2e2" : "#dcfce7"}}>{p.status}</span></td><td style={{fontSize:"12px"}}>{p.ward}</td><td style={{fontSize:"12px", color:"#64748b"}}>{p.date}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {active==="ai" && (
            <div style={{background:"white", borderRadius:"16px", padding:"24px", border:"1px solid #e2e8f0"}}>
              <h2>✦ AI Python Lab</h2>
              <p style={{color:"#64748b"}}>This will connect to <code>backend/python-ai</code> on Render.</p>
              <div style={{marginTop:"16px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"12px"}}>
                {["Symptom Checker","Lab Report Summarizer","Drug Interaction"].map(f=>(
                  <div key={f} style={{border:"1px solid #e2e8f0", borderRadius:"12px", padding:"16px"}}><b>{f}</b><p style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>Endpoint: /ai/{f.toLowerCase().replace(" ","-")}</p><button style={{marginTop:"10px", padding:"8px 12px", borderRadius:"8px", border:"none", background:"#0a0f1e", color:"white", cursor:"pointer"}} onClick={()=>alert(`${f} — needs Python backend deployment`)}>Test AI</button></div>
                ))}
              </div>
            </div>
          )}

          {["doctors","billing"].includes(active) && (
            <div style={{background:"white", borderRadius:"16px", padding:"40px", textAlign:"center", border:"1px solid #e2e8f0"}}><h2 style={{textTransform:"capitalize"}}>{active}</h2><p style={{color:"#64748b"}}>API route /api/{active} — ready for Go backend.</p></div>
          )}
        </main>
      </div>

      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(4px)", display:"grid", placeItems:"center", zIndex:50}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white", borderRadius:"16px", padding:"20px", width:"90%", maxWidth:"400px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>{selected.name}</h3><button onClick={()=>setSelected(null)} style={{border:"none", background:"#f1f5f9", borderRadius:"8px", padding:"6px 10px", cursor:"pointer"}}>✕</button></div>
            <div style={{marginTop:"14px", display:"grid", gap:"8px", fontSize:"14px"}}><div>ID: <b>{selected.id}</b></div><div>Ward: {selected.ward}</div><div>Doctor: {selected.doctor}</div><div>BP: {selected.bp} | Temp: {selected.temp}</div><div>Status: {selected.status}</div></div>
            <button style={{marginTop:"16px", width:"100%", padding:"10px", background:"#0a0f1e", color:"white", borderRadius:"10px", border:"none"}} onClick={()=>{alert(`Chart for ${selected.name}`); setSelected(null)}}>Open Full Chart</button>
          </div>
        </div>
      )}
    </div>
  );
}