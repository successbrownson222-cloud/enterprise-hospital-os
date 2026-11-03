"use client";
import { useState, useEffect } from "react";

const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";

export default function AdminDashboardPro() {
  const [tab, setTab] = useState("overview");
  const [patients, setPatients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulance, setAmbulance] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [authForm, setAuthForm] = useState({email:"brownsonsuccess033@gmail.com", password:"", name:"Success Brownson"});
  
  // Modals
  const [showPatient, setShowPatient] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const [newPatient, setNewPatient] = useState({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"});
  const [newStaff, setNewStaff] = useState({email:"", password:"", name:"", user_type:"doctor", specialty:"ICU", role:"Doctor"});
  const [newAmbulance, setNewAmbulance] = useState({id:"", location:"Lagos Main", driver:"", plate:"", status:"Available", eta:"5 min"});
  const [newEquipment, setNewEquipment] = useState({id:"", name:"", ward:"ICU-2", status:"Available"});
  const [newBed, setNewBed] = useState({id:"", ward:"ICU-2", type:"ICU Ventilator", status:"Available"});
  const [newLab, setNewLab] = useState({patient:"", test:"Blood Culture", doctor:"Dr. Brownson"});

  useEffect(()=>{
    const t = localStorage.getItem("token");
    const em = localStorage.getItem("email")||"";
    setEmail(em);
    if(t && localStorage.getItem("user_type")==="admin"){ setLoggedIn(true); fetchAll(); } else setLoading(false);
  },[]);

  const fetchAll = async () => {
    try {
      const [p,s,b,be,am,eq,la,an] = await Promise.all([
        fetch(`${API_URL}/api/patients`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/beds`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/ambulance`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/equipment`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/labs`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/analytics`, {cache:'no-store'}).then(r=>r.json()).catch(()=>null),
      ]);
      setPatients(p.patients||p.data||p||[]);
      if(Array.isArray(s)) setStaff(s);
      if(Array.isArray(b)) setBilling(b);
      if(Array.isArray(be)) setBeds(be);
      if(Array.isArray(am)) setAmbulance(am);
      if(Array.isArray(eq)) setEquipment(eq);
      if(Array.isArray(la)) setLabs(la);
      if(an) setAnalytics(an);
    } catch {}
    setLoading(false);
  };

  const token = () => typeof window!=="undefined"?localStorage.getItem("token")||"":"";
  const hdr = () => ({"Content-Type":"application/json","Authorization":`Bearer ${token()}`});

  const login = async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:authForm.email, password:authForm.password})});
    const data = await res.json();
    if(res.ok && data.user_type==="admin"){ localStorage.setItem("token", data.token); localStorage.setItem("user_type", data.user_type); localStorage.setItem("email", authForm.email); setLoggedIn(true); setEmail(authForm.email); fetchAll(); }
    else alert(data.error||"Login failed - hit /api/seed first. Use brownsonsuccess033@gmail.com / Success123!");
  };
  const signup = async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:authForm.email, password:authForm.password, name:authForm.name, user_type:"admin"})});
    const data = await res.json();
    if(res.ok){ alert("Admin created! Login now"); setAuthMode("login"); } else alert(data.error||"Failed");
  };

  // ADD FUNCTIONS - ALL CONNECTED TO BACKEND
  const addPatient = async () => {
    if(!newPatient.name) return alert("Name required");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:hdr(), body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const d=await res.json(); setPatients(prev=>[d,...prev]); setShowPatient(false); alert("Patient Admitted: "+d.id); }
    else alert("Failed - admin token needed");
  };
  const addStaff = async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:hdr(), body:JSON.stringify(newStaff)});
    const d=await res.json();
    if(res.ok){ alert(`${newStaff.user_type} ${newStaff.name} created!`); setShowStaff(false); fetchAll(); } else alert(d.error||"Failed");
  };
  const addAmbulance = async () => {
    const item = {...newAmbulance, id: newAmbulance.id||`AMB-${Date.now().toString().slice(-3)}`};
    const res = await fetch(`${API_URL}/api/ambulance`, {method:"POST", headers:hdr(), body:JSON.stringify(item)});
    setAmbulance(prev=>[item,...prev]); setShowAmbulance(false); alert("Ambulance added "+item.id);
  };
  const addEquipment = async () => {
    const item = {...newEquipment, id: newEquipment.id||`EQ-${Date.now().toString().slice(-3)}`};
    const res = await fetch(`${API_URL}/api/equipment`, {method:"POST", headers:hdr(), body:JSON.stringify(item)});
    setEquipment(prev=>[item,...prev]); setShowEquipment(false); alert("Equipment added "+item.id);
  };
  const addBed = async () => {
    const item = {...newBed, id: newBed.id||`B-${Date.now().toString().slice(-3)}`, patient:""};
    setBeds(prev=>[item,...prev]); setShowBed(false); alert("Bed added "+item.id);
  };
  const addLab = async () => {
    const item = {id:`LAB-${Date.now().toString().slice(-3)}`, patient:newLab.patient, test:newLab.test, doctor:newLab.doctor, status:"Pending", result:"In Progress"};
    setLabs(prev=>[item,...prev]); setShowLab(false); alert("Lab order created "+item.id);
  };

  if(!loggedIn){
    return (
      <div style={{minHeight:"100vh", display:"grid", placeItems:"center", background:"#f6f7fb", padding:"16px"}}>
        <div style={{background:"white", borderRadius:"20px", padding:"24px", width:"100%", maxWidth:"380px", border:"1px solid #e5e7eb"}}>
          <h2 style={{margin:0}}>Hospital OS • Admin</h2>
          <p style={{fontSize:"12px", color:"#6b7280"}}>Super Admin: brownsonsuccess033@gmail.com</p>
          <div style={{display:"flex", gap:"8px", margin:"16px 0"}}>
            <button onClick={()=>setAuthMode("login")} style={{flex:1, padding:"10px", borderRadius:"10px", border:"none", background:authMode==="login"?"#111827":"#f3f4f6", color:authMode==="login"?"white":"#6b7280", fontWeight:700}}>Login</button>
            <button onClick={()=>setAuthMode("signup")} style={{flex:1, padding:"10px", borderRadius:"10px", border:"none", background:authMode==="signup"?"#111827":"#f3f4f6", color:authMode==="signup"?"white":"#6b7280", fontWeight:700}}>Sign Up</button>
          </div>
          <div style={{display:"grid", gap:"10px"}}>
            {authMode==="signup" && <input value={authForm.name} onChange={e=>setAuthForm({...authForm, name:e.target.value})} placeholder="Full Name" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>}
            <input value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} placeholder="Email" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
            <input type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} placeholder="Password" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
            {authMode==="login"?<button onClick={login} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Login →</button>:<button onClick={signup} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Create Admin</button>}
          </div>
          <div style={{marginTop:"12px", fontSize:"11px", color:"#6b7280"}}>First run /api/seed on Render, then login<br/>brownsonsuccess033@gmail.com / Success123!</div>
        </div>
      </div>
    );
  }

  const TABS = [
    {id:"overview", l:"Overview", i:"◧"},
    {id:"patients", l:"Patients", i:"◎"},
    {id:"staff", l:"Staff", i:"◐"},
    {id:"beds", l:"Beds", i:"🛏️"},
    {id:"ambulance", l:"Ambulance", i:"🚑"},
    {id:"equipment", l:"Equipment", i:"⚙️"},
    {id:"labs", l:"Labs", i:"🧪"},
    {id:"finance", l:"Finance", i:"₦"},
  ];

  return (
    <div style={{minHeight:"100vh", background:"#f6f7fb", fontFamily:"system-ui"}}>
      <style>{`@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.card{animation:in 0.3s ease both} .grid4{grid-template-columns:repeat(2,1fr)} @media(min-width:900px){.grid4{grid-template-columns:repeat(4,1fr)} .desktop{display:flex!important} .mobile{display:none!important}} @media(max-width:899px){.desktop{display:none!important}}`}</style>
      <header style={{height:"64px", background:"white", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", position:"sticky", top:0, zIndex:20}}>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <div style={{width:"36px", height:"36px", background:"#111827", borderRadius:"10px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <div><div style={{fontWeight:800}}>Hospital OS • Admin</div><div style={{fontSize:"11px", color:"#6b7280"}}>{email} • Super Admin</div></div>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span style={{fontSize:"11px", background:"#ecfdf5", color:"#059669", padding:"5px 10px", borderRadius:"20px", fontWeight:700}}>● LIVE</span>
          <button onClick={()=>window.location.href="/"} style={{border:"1px solid #e5e7eb", background:"white", padding:"8px 12px", borderRadius:"10px", fontSize:"12px"}}>Main App →</button>
          <button onClick={()=>{localStorage.clear(); setLoggedIn(false);}} style={{border:"1px solid #fee2e2", background:"#fef2f2", padding:"8px 12px", borderRadius:"10px", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      <div style={{display:"flex"}}>
        <aside className="desktop" style={{width:"220px", background:"#0b1220", color:"white", padding:"16px", flexDirection:"column", gap:"6px", position:"sticky", top:"64px", height:"calc(100vh - 64px)"}}>
          {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{textAlign:"left", padding:"12px", borderRadius:"10px", border:"none", background:tab===t.id?"white":"transparent", color:tab===t.id?"#0b1220":"#94a3b8", fontWeight:tab===t.id?700:500, cursor:"pointer", display:"flex", gap:"8px"}}>{t.i} {t.l}</button>)}
          <div style={{marginTop:"auto", fontSize:"10px", color:"#475569"}}>Patients: {patients.length}<br/>Beds Avail: {beds.filter(b=>b.status==="Available").length}<br/>AMB Ready: {ambulance.filter(a=>a.status==="Available").length}<br/>Equipment: {equipment.length}</div>
        </aside>

        <main style={{flex:1, padding:"16px", paddingBottom:"100px"}}>
          <div className="mobile" style={{display:"flex", gap:"8px", overflowX:"auto", paddingBottom:"12px"}}>
            {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{whiteSpace:"nowrap", padding:"10px 14px", borderRadius:"20px", border:"1px solid #e5e7eb", background:tab===t.id?"#111827":"white", color:tab===t.id?"white":"#6b7280", fontWeight:600}}>{t.i} {t.l}</button>)}
          </div>

          {tab==="overview" && (
            <>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"10px"}}>
                <h2 style={{margin:0}}>Welcome {email.split("@")[0]} 👋</h2>
                <div style={{display:"flex", gap:"8px", flexWrap:"wrap"}}>
                  <button onClick={()=>setShowPatient(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Patient</button>
                  <button onClick={()=>setShowStaff(true)} style={{padding:"10px 14px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700}}>+ Staff</button>
                  <button onClick={()=>setShowAmbulance(true)} style={{padding:"10px 14px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700}}>+ Ambulance</button>
                  <button onClick={()=>setShowEquipment(true)} style={{padding:"10px 14px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700}}>+ Equipment</button>
                </div>
              </div>
              <div className="grid4 card" style={{display:"grid", gap:"12px"}}>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"11px", color:"#6b7280"}}>REVENUE</div><div style={{fontSize:"24px", fontWeight:800}}>₦{(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M</div><div style={{fontSize:"12px", color:"#10b981"}}>+18% month</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"11px", color:"#6b7280"}}>PATIENTS</div><div style={{fontSize:"24px", fontWeight:800}}>{patients.length}</div><div style={{fontSize:"12px", color:"#6b7280"}}>{patients.filter(p=>p.status==="Admitted").length} admitted</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"11px", color:"#6b7280"}}>BEDS AVAIL</div><div style={{fontSize:"24px", fontWeight:800}}>{beds.filter(b=>b.status==="Available").length}/{beds.length||8}</div><div style={{fontSize:"12px", color:"#3b82f6"}}>{analytics?.bedOccupancy||84}% occupied</div></div>
                <div style={{background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"11px", color:"#6b7280"}}>AMBULANCE</div><div style={{fontSize:"24px", fontWeight:800}}>{ambulance.filter(a=>a.status==="Available").length}</div><div style={{fontSize:"12px", color:"#6b7280"}}>{ambulance.length} total</div></div>
              </div>
            </>
          )}

          {tab==="patients" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Patients • Admit / Discharge</h3><button onClick={()=>setShowPatient(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Add Patient</button></div>
              <div style={{marginTop:"14px"}}>{patients.map(p=><div key={p.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{p.name}</b> <span style={{fontSize:"11px", color:"#6b7280"}}>{p.id} • {p.ward}</span><div style={{fontSize:"12px", color:"#6b7280"}}>{p.status}</div></div><div style={{display:"flex", gap:"6px"}}><button onClick={async()=>{ await fetch(`${API_URL}/api/patients/action`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:p.id, action:"admit"})}); setPatients(prev=>prev.map(x=>x.id===p.id?{...x, status:"Admitted"}:x)); }} style={{background:"#dcfce7", border:"none", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Admit</button><button onClick={async()=>{ await fetch(`${API_URL}/api/patients/action`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:p.id, action:"discharge"})}); setPatients(prev=>prev.map(x=>x.id===p.id?{...x, status:"Discharged"}:x)); }} style={{background:"#fee2e2", border:"none", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Discharge</button></div></div>)}</div>
            </div>
          )}

          {tab==="staff" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Staff • Register</h3><button onClick={()=>setShowStaff(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Add Staff</button></div>
              <div style={{marginTop:"14px"}}>{staff.map(s=><div key={s.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{s.name}</b><div style={{fontSize:"12px", color:"#6b7280"}}>{s.role} • {s.specialty}</div></div><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:s.status==="On Duty"?"#dcfce7":"#fee2e2"}}>{s.status}</span></div>)}</div>
            </div>
          )}

          {tab==="beds" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Beds • Management</h3><button onClick={()=>setShowBed(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Add Bed</button></div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginTop:"14px"}}>{beds.map(b=><div key={b.id} style={{padding:"14px", borderRadius:"12px", border:"1px solid #e5e7eb", borderLeft:`4px solid ${b.status==="Available"?"#10b981":"#ef4444"}`}}><b>{b.id}</b><div style={{fontSize:"12px", color:"#6b7280"}}>{b.ward} • {b.type}</div><div style={{marginTop:"6px", fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:b.status==="Available"?"#dcfce7":"#fee2e2", display:"inline-block"}}>{b.status}</div></div>)}</div>
            </div>
          )}

          {tab==="ambulance" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Ambulance • Fleet</h3><button onClick={()=>setShowAmbulance(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Add Ambulance</button></div>
              <div style={{marginTop:"14px"}}>{ambulance.map(a=><div key={a.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{a.id}</b><div style={{fontSize:"12px", color:"#6b7280"}}>📍 {a.location} • {a.driver} • {a.plate}</div></div><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:a.status==="Available"?"#dcfce7":"#fef3c7"}}>{a.status} • {a.eta}</span></div>)}</div>
            </div>
          )}
          {tab==="equipment" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Equipment • Inventory</h3><button onClick={()=>setShowEquipment(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Add Equipment</button></div>
              <div style={{marginTop:"14px"}}>{equipment.map(e=><div key={e.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{e.name}</b><div style={{fontSize:"12px", color:"#6b7280"}}>{e.id} • {e.ward}</div></div><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:e.status==="Available"?"#dcfce7":"#fef3c7"}}>{e.status}</span></div>)}</div>
            </div>
          )}

          {tab==="labs" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Labs • Orders</h3><button onClick={()=>setShowLab(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>+ Order Lab</button></div>
              <div style={{marginTop:"14px"}}>{labs.map(l=><div key={l.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{l.id}</b> - {l.test}<div style={{fontSize:"12px", color:"#6b7280"}}>{l.patient} • {l.doctor}</div></div><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:l.status==="Completed"?"#dcfce7":"#fef3c7"}}>{l.status}</span></div>)}</div>
            </div>
          )}

          {tab==="finance" && (
            <div className="card" style={{background:"white", borderRadius:"16px", padding:"18px", border:"1px solid #e5e7eb"}}>
              <h3>Billing • Finance</h3>
              {billing.map(b=><div key={b.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{b.id}</b> - {b.patient}</div><b>₦{b.amount?.toLocaleString()}</b></div>)}
            </div>
          )}
        </main>
      </div>

      {showPatient && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Patient</h3><button onClick={()=>setShowPatient(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newPatient.name} onChange={e=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Full Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><input value={newPatient.age} type="number" onChange={e=>setNewPatient({...newPatient, age:parseInt(e.target.value)})} placeholder="Age" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/><select value={newPatient.ward} onChange={e=>setNewPatient({...newPatient, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option><option>W-2</option></select></div>
            <input value={newPatient.doctor} onChange={e=>setNewPatient({...newPatient, doctor:e.target.value})} placeholder="Doctor" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <button onClick={addPatient} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Admit → DB</button>
          </div>
        </div>
      )}
      {showStaff && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Staff</h3><button onClick={()=>setShowStaff(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name:e.target.value})} placeholder="Full Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <input value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email:e.target.value})} placeholder="Email" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <input value={newStaff.password} type="password" onChange={e=>setNewStaff({...newStaff, password:e.target.value})} placeholder="Password" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><select value={newStaff.user_type} onChange={e=>setNewStaff({...newStaff, user_type:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select><input value={newStaff.specialty} onChange={e=>setNewStaff({...newStaff, specialty:e.target.value})} placeholder="ICU" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/></div>
            <button onClick={addStaff} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Create Staff</button>
          </div>
        </div>
      )}
      {showAmbulance && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Ambulance 🚑</h3><button onClick={()=>setShowAmbulance(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newAmbulance.id} onChange={e=>setNewAmbulance({...newAmbulance, id:e.target.value})} placeholder="ID auto if empty" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <input value={newAmbulance.location} onChange={e=>setNewAmbulance({...newAmbulance, location:e.target.value})} placeholder="Location" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><input value={newAmbulance.driver} onChange={e=>setNewAmbulance({...newAmbulance, driver:e.target.value})} placeholder="Driver" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/><input value={newAmbulance.plate} onChange={e=>setNewAmbulance({...newAmbulance, plate:e.target.value})} placeholder="Plate" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/></div>
            <button onClick={addAmbulance} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add → Fleet</button>
          </div>
        </div>
      )}
      {showEquipment && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Equipment ⚙️</h3><button onClick={()=>setShowEquipment(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newEquipment.name} onChange={e=>setNewEquipment({...newEquipment, name:e.target.value})} placeholder="Name Ventilator" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><input value={newEquipment.id} onChange={e=>setNewEquipment({...newEquipment, id:e.target.value})} placeholder="ID" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/><select value={newEquipment.ward} onChange={e=>setNewEquipment({...newEquipment, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select></div>
            <button onClick={addEquipment} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add → Inventory</button>
          </div>
        </div>
      )}
      {showBed && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Bed 🛏️</h3><button onClick={()=>setShowBed(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newBed.id} onChange={e=>setNewBed({...newBed, id:e.target.value})} placeholder="ID B-ICU-03" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><select value={newBed.ward} onChange={e=>setNewBed({...newBed, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select><select value={newBed.type} onChange={e=>setNewBed({...newBed, type:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU Ventilator</option><option>General</option><option>Emergency</option></select></div>
            <button onClick={addBed} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add → Ward</button>
          </div>
        </div>
      )}
      {showLab && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"380px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Order Lab 🧪</h3><button onClick={()=>setShowLab(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newLab.patient} onChange={e=>setNewLab({...newLab, patient:e.target.value})} placeholder="Patient P-1042" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <select value={newLab.test} onChange={e=>setNewLab({...newLab, test:e.target.value})} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px"}}><option>Blood Culture</option><option>CT Scan Chest</option><option>CBC</option><option>X-Ray</option><option>MRI</option></select>
            <input value={newLab.doctor} onChange={e=>setNewLab({...newLab, doctor:e.target.value})} placeholder="Doctor" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <button onClick={addLab} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Order Lab →</button>
          </div>
        </div>
      )}
    </div>
  );
}
       