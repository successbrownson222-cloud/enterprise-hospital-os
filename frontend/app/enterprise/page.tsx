"use client";
import { useEffect, useState, useMemo } from "react";
const API = "https://enterprise-hospital-os.onrender.com";

type Bed = { id:string; ward:string; status:string; patient:string; type:string; };
type Amb = { id:string; status:string; location:string; eta:string; driver:string; plate:string; };
type Eq = { id:string; name:string; ward:string; status:string; lastService:string; nextService:string; };
type Lab = { id:string; patient:string; test:string; status:string; result:string; doctor:string; };

export default function EnterpriseOS() {
  const [active, setActive] = useState("dashboard");
  const [beds, setBeds] = useState<Bed[]>([]);
  const [amb, setAmb] = useState<Amb[]>([]);
  const [eq, setEq] = useState<Eq[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [ai, setAi] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);

  useEffect(()=>{
    fetch(`${API}/api/patients`).then(r=>r.json()).then(d=> setPatients(Array.isArray(d)?d:[])).catch(()=>{});
    fetch(`${API}/api/beds`).then(r=>r.json()).then(setBeds).catch(()=>{});
    fetch(`${API}/api/ambulance`).then(r=>r.json()).then(setAmb).catch(()=>{});
    fetch(`${API}/api/equipment`).then(r=>r.json()).then(setEq).catch(()=>{});
    fetch(`${API}/api/labs`).then(r=>r.json()).then(setLabs).catch(()=>{});
    fetch(`${API}/api/billing`).then(r=>r.json()).then(setBilling).catch(()=>{});
    fetch(`${API}/api/ai`).then(r=>r.json()).then(setAi).catch(()=>{});
    fetch(`${API}/api/staff`).then(r=>r.json()).then(setStaff).catch(()=>{});
  },[]);

  const availBeds = beds.filter(b=>b.status==="Available").length;
  const availAmb = amb.filter(a=>a.status==="Available").length;
  const totalRev = billing.reduce((s,b)=>s+(b.amount||0),0);

  const nav = [
    {id:"dashboard", l:"Dashboard"},
    {id:"beds", l:`Beds 🛏️ ${availBeds}`},
    {id:"ambulance", l:`Ambulance 🚑 ${availAmb}`},
    {id:"equipment", l:"Equipment ⚙️"},
    {id:"labs", l:"Labs 🧪"},
    {id:"billing", l:"Billing ₦"},
    {id:"ai", l:"AI Lab ✦"},
  ];

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui", paddingBottom:"90px"}}>
      <header style={{height:"56px", background:"white", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", padding:"0 16px", position:"sticky", top:0, zIndex:10, justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}><div style={{width:"32px", height:"32px", background:"#0a0f1e", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div><b>Hospital OS Pro</b></div>
        <a href="/" style={{fontSize:"12px", color:"#3b82f6"}}>← Old UI</a>
      </header>

      <div style={{display:"flex", gap:"8px", overflowX:"auto", padding:"12px 16px", background:"white", borderBottom:"1px solid #e2e8f0", position:"sticky", top:"56px", zIndex:9}}>
        {nav.map(n=>(
          <button key={n.id} onClick={()=>setActive(n.id)} style={{whiteSpace:"nowrap", padding:"8px 14px", borderRadius:"20px", border:"1px solid #e2e8f0", background: active===n.id ? "#0a0f1e" : "white", color: active===n.id ? "white" : "#334155", fontSize:"13px", fontWeight: active===n.id ? 700 : 400}}>{n.l}</button>
        ))}
      </div>

      <main style={{padding:"16px"}}>

        {active==="dashboard" && (
          <div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px"}}>
              <div style={{background:"white", padding:"16px", borderRadius:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>TOTAL PATIENTS</div><div style={{fontSize:"24px", fontWeight:800}}>{patients.length || 4}</div></div>
              <div style={{background:"white", padding:"16px", borderRadius:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AVAILABLE BEDS 🛏️</div><div style={{fontSize:"24px", fontWeight:800, color:"#10b981"}}>{availBeds} / {beds.length || 8}</div></div>
              <div style={{background:"white", padding:"16px", borderRadius:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AMBULANCE 🚑</div><div style={{fontSize:"24px", fontWeight:800, color:"#3b82f6"}}>{availAmb} Ready</div></div>
              <div style={{background:"white", padding:"16px", borderRadius:"16px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>REVENUE</div><div style={{fontSize:"18px", fontWeight:800}}>₦{totalRev.toLocaleString()}</div></div>
            </div>

            <div style={{marginTop:"16px", background:"white", borderRadius:"16px", border:"1px solid #e2e8f0", padding:"16px"}}>
              <b>Live Critical Alerts</b>
              {ai?.predictions?.map((p:any,i:number)=>(
                <div key={i} onClick={()=>setSel(p)} style={{marginTop:"10px", padding:"12px", borderRadius:"12px", background: p.risk==="High" ? "#fee2e2" : "#f8fafc", border:"1px solid #e2e8f0", cursor:"pointer"}}>
                  <div style={{display:"flex", justifyContent:"space-between"}}><b style={{fontSize:"13px"}}>{p.patient}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:p.risk==="High" ? "#ef4444" : "#f59e0b", color:"white"}}>{p.risk}</span></div>
                  <div style={{fontSize:"12px", color:"#64748b", marginTop:"4px"}}>{p.condition} - Click for action plan</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {active==="beds" && (
          <div>
            <h3>🛏️ Bed Management - Click any bed to view</h3>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginTop:"12px"}}>
              {beds.map(b=>(
                <div key={b.id} onClick={()=>setSel(b)} style={{background:"white", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", borderLeft:`4px solid ${b.status==="Available"?"#10b981":b.status==="Occupied"?"#ef4444":"#f59e0b"}`, cursor:"pointer"}}>
                  <b>{b.id}</b><div style={{fontSize:"12px", color:"#64748b"}}>{b.ward} • {b.type}</div>
                  <div style={{marginTop:"8px", fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background: b.status==="Available"?"#dcfce7":"#fee2e2", display:"inline-block"}}>{b.status}</div>
                  {b.patient && <div style={{fontSize:"11px", marginTop:"4px"}}>{b.patient}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {active==="ambulance" && (
          <div>
            <h3>🚑 Ambulance - Tap to dispatch</h3>
            {amb.map(a=>(
              <div key={a.id} onClick={()=>setSel(a)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b>{a.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background: a.status==="Available"?"#dcfce7":"#fef3c7"}}>{a.status}</span></div>
                <div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>📍 {a.location} • ETA {a.eta} • Driver {a.driver} • {a.plate}</div>
              </div>
            ))}
          </div>
        )}

        {active==="equipment" && (
          <div>
            <h3>⚙️ Equipment - Tap to see service history</h3>
            {eq.map(e=>(
              <div key={e.id} onClick={()=>setSel(e)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}>
                <b>{e.name}</b><div style={{fontSize:"12px", color:"#64748b"}}>{e.id} • {e.ward}</div>
                <div style={{display:"flex", justifyContent:"space-between", marginTop:"8px"}}><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background: e.status==="Available"?"#dcfce7":e.status==="In Use"?"#dbeafe":"#fef3c7"}}>{e.status}</span><span style={{fontSize:"11px"}}>Next: {e.nextService}</span></div>
              </div>
            ))}
          </div>
        )}

        {active==="labs" && (
          <div>
            <h3>🧪 Labs - Tap to view full result</h3>
            {labs.map(l=>(
              <div key={l.id} onClick={()=>setSel(l)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b>{l.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background: l.status==="Completed"?"#dcfce7":"#fef3c7"}}>{l.status}</span></div>
                <div style={{fontSize:"13px", marginTop:"6px"}}>{l.patient} - {l.test}</div><div style={{fontSize:"11px", color:"#64748b"}}>Dr: {l.doctor}</div>
              </div>
            ))}
          </div>
        )}

        {active==="billing" && (
          <div>
            <h3>Billing - Tap invoice to view details</h3>
            {billing.map((b:any)=>(
              <div key={b.id} onClick={()=>setSel(b)} style={{background:"white", marginTop:"12px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", cursor:"pointer"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b>{b.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background: b.status==="Paid"?"#dcfce7":"#fef3c7"}}>{b.status}</span></div>
                <div style={{fontSize:"13px", marginTop:"6px"}}>{b.patient} ({b.patient_id})</div>
                <div style={{fontWeight:800, marginTop:"4px"}}>₦{b.amount?.toLocaleString()}</div>
                <div style={{fontSize:"11px", color:"#64748b"}}>Click to view breakdown</div>
              </div>
            ))}
          </div>
        )}

        {active==="ai" && (
          <div>
            <h3>AI Lab - Tap prediction to see action</h3>
            <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginBottom:"12px"}}>
              <div style={{background:"white", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>OCCUPANCY</div><div style={{fontSize:"20px", fontWeight:800}}>{ai?.bedOccupancy || 84}%</div></div>
              <div style={{background:"white", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0"}}><div style={{fontSize:"11px", color:"#64748b"}}>AI</div><div style={{fontWeight:700, color:"#16a34a"}}>● {ai?.aiStatus}</div></div>
            </div>
            {ai?.predictions?.map((p:any,i:number)=>(
              <div key={i} onClick={()=>setSel(p)} style={{background:"white", marginTop:"10px", padding:"16px", borderRadius:"14px", border:"1px solid #e2e8f0", borderLeft:`4px solid ${p.risk==="High"?"#ef4444":p.risk==="Medium"?"#f59e0b":"#10b981"}`, cursor:"pointer"}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><b>{p.patient}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:"#0a0f1e", color:"white"}}>{p.confidence}%</span></div>
                <div style={{fontSize:"12px", marginTop:"6px"}}>{p.condition} - {p.risk} Risk</div>
                <div style={{fontSize:"11px", color:"#64748b", marginTop:"4px"}}>Tap for vitals & action</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {sel && (
        <div onClick={()=>setSel(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Details</h3><button onClick={()=>setSel(null)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <div style={{marginTop:"12px", background:"#f8fafc", borderRadius:"12px", padding:"12px", fontSize:"13px", lineHeight:1.8, maxHeight:"300px", overflowY:"auto"}}>
              {Object.entries(sel).map(([k,v]:any)=><div key={k}><b>{k}:</b> {String(v)}</div>)}
            </div>
            <button style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}} onClick={()=>{ if(sel.id?.startsWith("B-") && sel.status==="Available"){ alert(`Assigning bed ${sel.id}...`); } if(sel.id?.startsWith("AMB-")){ alert(`Dispatching ${sel.id} to ${sel.location}`);} setSel(null); }}>Take Action</button>
          </div>
        </div>
      )}
    </div>
  );
}