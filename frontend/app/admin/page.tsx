"use client";
import { useState, useEffect } from "react";
const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("overview");
  const [patients, setPatients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulance, setAmbulance] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [authMode, setAuthMode] = useState<"login"|"signup">("login");
  const [authForm, setAuthForm] = useState({email:"brownsonsuccess033@gmail.com", password:"", name:"Success Brownson"});
  const [showPatient, setShowPatient] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showBed, setShowBed] = useState(false);
  const [showLab, setShowLab] = useState(false);

  const [newPatient, setNewPatient] = useState({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"});
  const [newStaff, setNewStaff] = useState({email:"", password:"", name:"", user_type:"doctor", specialty:"ICU", role:"Doctor"});
  const [newAmbulance, setNewAmbulance] = useState({id:"", location:"Lagos Main", driver:"", plate:"", status:"Available"});
  const [newEquipment, setNewEquipment] = useState({id:"", name:"", ward:"ICU-2", status:"Available"});
  const [newBed, setNewBed] = useState({id:"", ward:"ICU-2", type:"General", status:"Available"});
  const [newLab, setNewLab] = useState({patient:"", test:"Blood Culture", doctor:"Dr. Brownson"});

  useEffect(()=>{
    const t = localStorage.getItem("token");
    const em = localStorage.getItem("email")||"";
    setEmail(em);
    if(t && localStorage.getItem("user_type")==="admin"){ setLoggedIn(true); fetchAll(); } else setLoading(false);
  },[]);

  const fetchAll = async () => {
    try {
      const [p,s,b,be,am,eq,la] = await Promise.all([
        fetch(`${API_URL}/api/patients`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/beds`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/ambulance`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/equipment`, {cache:'no-store'}).then(r=>r.json()),
        fetch(`${API_URL}/api/labs`, {cache:'no-store'}).then(r=>r.json()),
      ]);
      setPatients(Array.isArray(p)?p:p.patients||[]);
      if(Array.isArray(s)) setStaff(s);
      if(Array.isArray(b)) setBilling(b);
      if(Array.isArray(be)) setBeds(be);
      if(Array.isArray(am)) setAmbulance(am);
      if(Array.isArray(eq)) setEquipment(eq);
      if(Array.isArray(la)) setLabs(la);
    } catch {} setLoading(false);
  };

  const token = () => typeof window!=="undefined"?localStorage.getItem("token")||"":"";
  const hdr = () => ({"Content-Type":"application/json","Authorization":`Bearer ${token()}`});

  const login = async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:authForm.email, password:authForm.password})});
    const data = await res.json();
    if(res.ok && data.user_type==="admin"){ localStorage.setItem("token", data.token); localStorage.setItem("user_type", data.user_type); localStorage.setItem("email", authForm.email); setLoggedIn(true); setEmail(authForm.email); fetchAll(); }
    else alert(data.error||"Login failed - hit /api/seed first");
  };
  const signup = async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:authForm.email, password:authForm.password, name:authForm.name, user_type:"admin"})});
    if(res.ok){ alert("Admin created! Login"); setAuthMode("login"); } else { const d=await res.json(); alert(d.error||"Failed"); }
  };

  // FIXED: Staff now reflects instantly
  const addStaff = async () => {
    if(!newStaff.email || !newStaff.password || !newStaff.name) return alert("Name, Email, Password required");
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:hdr(), body:JSON.stringify(newStaff)});
    const d = await res.json();
    if(res.ok){
      // INSTANT UI UPDATE - THIS WAS MISSING
      const newEntry = {id:d.id||`S-${Date.now()}`, name:`${newStaff.name} (${newStaff.email})`, role:newStaff.user_type, specialty:newStaff.specialty, status:"On Duty"};
      setStaff(prev=>[newEntry, ...prev]);
      setShowStaff(false);
      setNewStaff({email:"", password:"", name:"", user_type:"doctor", specialty:"ICU", role:"Doctor"});
      alert(`✅ Staff ${newStaff.name} added! Visible now in staff list`);
      fetchAll(); // re-sync with DB
    } else alert(d.error||"Failed - admin token needed");
  };

  const addPatient = async () => {
    if(!newPatient.name) return alert("Name required");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:hdr(), body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const d=await res.json(); setPatients(prev=>[d,...prev]); setShowPatient(false); alert("Patient Admitted "+d.id); } else alert("Failed");
  };
  const addAmbulance = async () => { const item={...newAmbulance, id:newAmbulance.id||`AMB-${Date.now().toString().slice(-3)}`, eta:"5 min"}; setAmbulance(prev=>[item,...prev]); setShowAmbulance(false); alert("Ambulance "+item.id+" added"); };
  const addEquipment = async () => { const item={...newEquipment, id:newEquipment.id||`EQ-${Date.now().toString().slice(-3)}`}; setEquipment(prev=>[item,...prev]); setShowEquipment(false); alert("Equipment added"); };
  const addBed = async () => { const item={...newBed, id:newBed.id||`B-${Date.now().toString().slice(-3)}`, patient:""}; setBeds(prev=>[item,...prev]); setShowBed(false); alert("Bed added"); };
  const addLab = async () => { const item={id:`LAB-${Date.now().toString().slice(-3)}`, patient:newLab.patient, test:newLab.test, doctor:newLab.doctor, status:"Pending"}; setLabs(prev=>[item,...prev]); setShowLab(false); alert("Lab ordered"); };

  if(!loggedIn){
    return (
      <div style={{minHeight:"100vh", display:"grid", placeItems:"center", background:"#f6f7fb", padding:"16px"}}>
        <div style={{background:"white", borderRadius:"20px", padding:"24px", width:"100%", maxWidth:"380px", border:"1px solid #e5e7eb"}}>
          <h2 style={{margin:0}}>Admin Login</h2><p style={{fontSize:"12px", color:"#6b7280"}}>brownsonsuccess033@gmail.com</p>
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
        </div>
      </div>
    );
  }

  const TABS = [{id:"overview", l:"Overview"},{id:"patients", l:"Patients"},{id:"staff", l:"Staff"},{id:"beds", l:"Beds"},{id:"ambulance", l:"Ambulance"},{id:"equipment", l:"Equipment"},{id:"labs", l:"Labs"},{id:"finance", l:"Finance"}];

  return (
    <div style={{minHeight:"100vh", background:"#f6f7fb", fontFamily:"system-ui"}}>
      <header style={{height:"60px", background:"white", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px", position:"sticky", top:0, zIndex:30}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e5e7eb", background:"white", fontSize:"18px"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"#111827", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <div><div style={{fontWeight:800, fontSize:"14px"}}>Hospital OS</div><div style={{fontSize:"10px", color:"#6b7280", maxWidth:"150px", overflow:"hidden", textOverflow:"ellipsis"}}>{email}</div></div>
        </div>
        <div style={{display:"flex", gap:"6px"}}>
          <button onClick={()=>window.location.href="/"} style={{padding:"8px 10px", borderRadius:"8px", border:"1px solid #e5e7eb", background:"white", fontSize:"12px"}}>Main</button>
          <button onClick={()=>{localStorage.clear(); setLoggedIn(false);}} style={{padding:"8px 10px", borderRadius:"8px", border:"1px solid #fee2e2", background:"#fef2f2", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      {menuOpen && <div onClick={()=>setMenuOpen(false)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.3)", zIndex:20}}/>}
      <div style={{display:"flex"}}>
        <aside style={{width:"240px", background:"#0b1220", color:"white", padding:"16px", flexDirection:"column", gap:"6px", position:"fixed", top:"60px", left:0, bottom:0, zIndex:25, transform: menuOpen ? "translateX(0)" : "translateX(-100%)", transition:"transform 0.3s ease", display:"flex", overflowY:"auto"}}>
          <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}><b>Menu</b><button onClick={()=>setMenuOpen(false)} style={{background:"white", color:"#0b1220", border:"none", width:"28px", height:"28px", borderRadius:"8px"}}>✕</button></div>
          {TABS.map(t=><button key={t.id} onClick={()=>{setTab(t.id); setMenuOpen(false);}} style={{textAlign:"left", padding:"14px", borderRadius:"12px", border:"none", background:tab===t.id?"white":"rgba(255,255,255,0.08)", color:tab===t.id?"#0b1220":"white", fontWeight:tab===t.id?700:500}}>{t.l}</button>)}
          <div style={{marginTop:"16px", padding:"12px", background:"rgba(255,255,255,0.06)", borderRadius:"12px", fontSize:"11px"}}><div>Patients: {patients.length}</div><div>Staff: {staff.length}</div><div>Beds: {beds.filter(b=>b.status==="Available").length} avail</div></div>
        </aside>

        <main style={{flex:1, padding:"12px", paddingBottom:"90px", width:"100%", maxWidth:"100vw", boxSizing:"border-box"}}>
          <div style={{display:"flex", gap:"8px", overflowX:"auto", paddingBottom:"12px", WebkitOverflowScrolling:"touch"}}>
            {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{whiteSpace:"nowrap", padding:"10px 14px", borderRadius:"20px", border:"1px solid #e5e7eb", background:tab===t.id?"#111827":"white", color:tab===t.id?"white":"#6b7280", fontWeight:600, fontSize:"13px"}}>{t.l}</button>)}
          </div>

          {tab==="overview" && (
            <>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", margin:"8px 0 14px", flexWrap:"wrap", gap:"10px"}}>
                <h2 style={{margin:0, fontSize:"18px"}}>Welcome 👋</h2>
                <div style={{display:"flex", gap:"6px", flexWrap:"wrap"}}>
                  <button onClick={()=>setShowPatient(true)} style={{padding:"10px 12px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Patient</button>
                  <button onClick={()=>setShowStaff(true)} style={{padding:"10px 12px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Staff</button>
                  <button onClick={()=>setShowAmbulance(true)} style={{padding:"10px 12px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Ambulance</button>
                  <button onClick={()=>setShowEquipment(true)} style={{padding:"10px 12px", background:"white", border:"1px solid #e5e7eb", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Equipment</button>
                </div>
              </div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px"}}>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>REVENUE</div><div style={{fontSize:"20px", fontWeight:800}}>₦{(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>PATIENTS</div><div style={{fontSize:"20px", fontWeight:800}}>{patients.length}</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>STAFF</div><div style={{fontSize:"20px", fontWeight:800}}>{staff.length}</div><div style={{fontSize:"11px", color:"#10b981"}}>{staff.filter(s=>s.status==="On Duty").length} on duty</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>BEDS FREE</div><div style={{fontSize:"20px", fontWeight:800}}>{beds.filter(b=>b.status==="Available").length}/{beds.length||0}</div></div>
              </div>
            </>
          )}

          {tab==="staff" && (
            <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:"8px"}}><h3 style={{margin:0, fontSize:"16px"}}>Staff ({staff.length})</h3><button onClick={()=>setShowStaff(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add Staff</button></div>
              <div style={{marginTop:"12px"}}>{staff.map(s=><div key={s.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f3f4f6", gap:"10px"}}><div style={{flex:1, minWidth:0}}><div style={{fontWeight:600, fontSize:"14px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{s.name}</div><div style={{fontSize:"11px", color:"#6b7280"}}>{s.role} • {s.specialty}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:s.status==="On Duty"?"#dcfce7":"#fee2e2", whiteSpace:"nowrap"}}>{s.status}</span></div>)}{staff.length===0 && <div style={{padding:"20px", textAlign:"center", color:"#6b7280", fontSize:"13px"}}>No staff yet — click + Add Staff to create first doctor/nurse<br/>After adding, it will appear here instantly ✅</div>}</div>
            </div>
          )}

          {tab==="patients" && (
            <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0, fontSize:"16px"}}>Patients ({patients.length})</h3><button onClick={()=>setShowPatient(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div>
              <div style={{marginTop:"12px"}}>{patients.map(p=><div key={p.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b style={{fontSize:"14px"}}>{p.name}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{p.id} • {p.ward} • {p.status}</div></div></div>)}</div>
            </div>
          )}

          {tab==="beds" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Beds ({beds.length})</h3><button onClick={()=>setShowBed(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add Bed</button></div><div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginTop:"12px"}}>{beds.map(b=><div key={b.id} style={{padding:"12px", borderRadius:"12px", border:"1px solid #e5e7eb", borderLeft:`4px solid ${b.status==="Available"?"#10b981":"#ef4444"}`}}><b style={{fontSize:"13px"}}>{b.id}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{b.ward}</div><div style={{fontSize:"10px", marginTop:"4px", padding:"3px 6px", borderRadius:"10px", background:b.status==="Available"?"#dcfce7":"#fee2e2", display:"inline-block"}}>{b.status}</div></div>)}</div></div>}
          {tab==="ambulance" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Ambulance ({ambulance.length})</h3><button onClick={()=>setShowAmbulance(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div><div style={{marginTop:"12px"}}>{ambulance.map(a=><div key={a.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{a.id}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{a.location} • {a.driver}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"10px", background:a.status==="Available"?"#dcfce7":"#fef3c7"}}>{a.status}</span></div>)}</div></div>}
          {tab==="equipment" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Equipment ({equipment.length})</h3><button onClick={()=>setShowEquipment(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div><div style={{marginTop:"12px"}}>{equipment.map(e=><div key={e.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{e.name||e.id}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{e.ward}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><h3>Billing</h3>{billing.map(b=><div key={b.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{b.id}</b> - {b.patient}</div><b>₦{b.amount?.toLocaleString()}</b></div>)}</div>}
        </main>
      </div>
      {showStaff && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Staff</h3><button onClick={()=>setShowStaff(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name:e.target.value})} placeholder="Full Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <input value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email:e.target.value})} placeholder="Email" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <input type="password" value={newStaff.password} onChange={e=>setNewStaff({...newStaff, password:e.target.value})} placeholder="Password" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}>
              <select value={newStaff.user_type} onChange={e=>setNewStaff({...newStaff, user_type:e.target.value, role:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select>
              <input value={newStaff.specialty} onChange={e=>setNewStaff({...newStaff, specialty:e.target.value})} placeholder="ICU" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
            </div>
            <button onClick={addStaff} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Create + Show ✅</button>
          </div>
        </div>
      )}
      {showPatient && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Patient</h3><button onClick={()=>setShowPatient(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newPatient.name} onChange={e=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Full Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><input value={newPatient.age} type="number" onChange={e=>setNewPatient({...newPatient, age:parseInt(e.target.value)})} placeholder="Age" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/><select value={newPatient.ward} onChange={e=>setNewPatient({...newPatient, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select></div>
            <button onClick={addPatient} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Admit</button>
          </div>
        </div>
      )}
      {showAmbulance && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Ambulance</h3><button onClick={()=>setShowAmbulance(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div><input value={newAmbulance.location} onChange={e=>setNewAmbulance({...newAmbulance, location:e.target.value})} placeholder="Location" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/><div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}><input value={newAmbulance.driver} onChange={e=>setNewAmbulance({...newAmbulance, driver:e.target.value})} placeholder="Driver" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/><input value={newAmbulance.plate} onChange={e=>setNewAmbulance({...newAmbulance, plate:e.target.value})} placeholder="Plate" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/></div><button onClick={addAmbulance} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add Ambulance</button></div></div>}
      {showEquipment && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Equipment</h3><button onClick={()=>setShowEquipment(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div><input value={newEquipment.name} onChange={e=>setNewEquipment({...newEquipment, name:e.target.value})} placeholder="Ventilator" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/><button onClick={addEquipment} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add Equipment</button></div></div>}
      {showBed && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Add Bed</h3><button onClick={()=>setShowBed(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div><div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"12px"}}><select value={newBed.ward} onChange={e=>setNewBed({...newBed, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select><select value={newBed.type} onChange={e=>setNewBed({...newBed, type:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU Ventilator</option><option>General</option></select></div><button onClick={addBed} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add Bed</button></div></div>}
      {showLab && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Order Lab</h3><button onClick={()=>setShowLab(false)} style={{border:"none", background:"#f3f4f6", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div><input value={newLab.patient} onChange={e=>setNewLab({...newLab, patient:e.target.value})} placeholder="Patient ID" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"12px", boxSizing:"border-box"}}/><select value={newLab.test} onChange={e=>setNewLab({...newLab, test:e.target.value})} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px"}}><option>Blood Culture</option><option>CT Scan</option><option>CBC</option></select><button onClick={addLab} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Order Lab</button></div></div>}
    </div>
  );
}