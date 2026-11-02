"use client";
import { useState, useEffect } from "react";

const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";

export default function AdminDashboard() {
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState("overview");
  const [patients, setPatients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newPatient, setNewPatient] = useState({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"});
  const [newStaff, setNewStaff] = useState({email:"", password:"", name:"", user_type:"doctor"});
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    const ut = localStorage.getItem("user_type") || "";
    setUserType(ut);
    if(ut !== "admin"){ 
      alert("Admin only! Login as admin@hospital.com / Admin123!"); 
      window.location.href="/login"; 
      return; 
    }
    const fetchAll = async () => {
      try {
        const [p, s, b, a] = await Promise.all([
          fetch(`${API_URL}/api/patients`, {cache:'no-store'}).then(r=>r.json()),
          fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()),
          fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()),
          fetch(`${API_URL}/api/analytics`, {cache:'no-store'}).then(r=>r.json()).catch(()=>null),
        ]);
        setPatients(p.patients||p.data||p||[]);
        if(Array.isArray(s)) setStaff(s);
        if(Array.isArray(b)) setBilling(b);
        if(a) setAnalytics(a);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const token = () => {
    if(typeof window !== "undefined") return localStorage.getItem("token") || "";
    return "";
  };

  const admitPatient = async () => {
    if(!newPatient.name) return alert("Enter name");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const data = await res.json(); setPatients(prev=>[data, ...prev]); setNewPatient({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"}); alert("Admitted "+data.id); }
    else alert("Failed - admin token needed");
  };

  const discharge = async (id:string) => {
    await fetch(`${API_URL}/api/patients/action`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, action:"discharge"})});
    setPatients(prev=>prev.map(p=>p.id===id?{...p, status:"Discharged"}:p));
  };

  const admitExisting = async (id:string) => {
    await fetch(`${API_URL}/api/patients/action`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, action:"admit"})});
    setPatients(prev=>prev.map(p=>p.id===id?{...p, status:"Admitted"}:p));
  };

  const registerStaff = async () => {
    if(!newStaff.email || !newStaff.password) return alert("Email+Password required");
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify(newStaff)});
    const d = await res.json();
    if(res.ok){ alert(`Staff ${newStaff.user_type} created!`); setNewStaff({email:"", password:"", name:"", user_type:"doctor"}); }
    else alert(d.error||"Failed");
  };

  const stats = [
    { label: "Total Revenue", value: `₦${(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M`, sub: "+18% this month", color: "#10b981", bar: 80 },
    { label: "Bed Occupancy", value: `${analytics?.bedOccupancy||84}%`, sub: `${patients.length} patients`, color: "#3b82f6", bar: analytics?.bedOccupancy||84 },
    { label: "Staff On Duty", value: `${staff.filter(s=>s.status==="On Duty").length||42}`, sub: `${staff.length} total staff`, color: "#8b5cf6", bar: 60 },
    { label: "Total Patients", value: `${patients.length}`, sub: `${patients.filter(p=>p.status==="Admitted").length} admitted`, color: "#ef4444", bar: 50 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", fontFamily: "system-ui" }}>
      <style>{`@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.card{animation:in 0.4s ease both}@media(min-width:768px){.mobile-only{display:none!important}.desktop-only{display:flex!important}.grid-4{grid-template-columns:repeat(4,1fr)}}@media(max-width:767px){.desktop-only{display:none!important}.grid-4{grid-template-columns:repeat(2,1fr)}}`}</style>

      <header style={{ height: "60px", background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="mobile-only" onClick={() => setMenu(!menu)} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white" }}>☰</button>
          <div style={{ width: "36px", height: "36px", background: "#111827", borderRadius: "10px", display: "grid", placeItems: "center", color: "white", fontWeight: 800 }}>A</div>
          <div><div style={{ fontWeight: 800 }}>Admin • Hospital OS</div><div style={{ fontSize: "11px", color: "#6b7280" }}>Super Admin • {userType}</div></div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#059669", padding: "5px 10px", borderRadius: "20px", fontWeight: 700 }}>● ADMIN LIVE</span>
          <button onClick={()=>{localStorage.clear(); window.location.href="/login"}} style={{background:"none", border:"1px solid #e5e7eb", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <aside className="desktop-only" style={{ width: "220px", background: "#0b1220", color: "white", padding: "18px", flexDirection: "column", gap: "6px", position: "sticky", top: "60px", height: "calc(100vh - 60px)" }}>
          {[{ id: "overview", l: "Overview", i: "◧" },{ id: "patients", l: "Admit / Patients", i: "◎" },{ id: "staff", l: "Register Staff", i: "◐" },{ id: "finance", l: "Finance", i: "₦" }].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ textAlign: "left", padding: "12px", borderRadius: "10px", border: "none", background: tab === n.id ? "white" : "transparent", color: tab === n.id ? "#0b1220" : "#94a3b8", fontWeight: tab === n.id ? 700 : 500, cursor: "pointer" }}>{n.i} {n.l}</button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: "16px", paddingBottom: "90px" }}>
          {tab === "overview" && (
            <>
              <h2 style={{ margin: "0 0 14px", fontSize: "20px" }}>Welcome Admin 👋 {loading?"Loading...":""}</h2>
              <div className="grid-4" style={{ display: "grid", gap: "12px" }}>
                {stats.map(s => (
                  <div key={s.label} className="card" style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{s.label}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{s.sub}</div>
                    <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "10px", marginTop: "12px" }}><div style={{ width: `${s.bar}%`, height: "100%", background: s.color, borderRadius: "10px" }} /></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "patients" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
              <h3 style={{marginTop:0}}>Admit New Patient (Admin Only)</h3>
              <div style={{display:"grid", gap:"10px"}}>
                <input value={newPatient.name} onChange={e=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Full Name" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                  <input value={newPatient.age} type="number" onChange={e=>setNewPatient({...newPatient, age:parseInt(e.target.value)})} placeholder="Age" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                  <select value={newPatient.ward} onChange={e=>setNewPatient({...newPatient, ward:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option><option>W-2</option></select>
                </div>
                <button onClick={admitPatient} style={{padding:"14px", background:"#0a0f1e", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Admit Patient → DB</button>
              </div>
              <div style={{marginTop:"20px"}}>
                {patients.map(p=>(
                  <div key={p.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}>
                    <div><div style={{fontWeight:600}}>{p.name} <span style={{fontSize:"11px", color:"#6b7280"}}>{p.id}</span></div><div style={{fontSize:"12px", color:"#6b7280"}}>{p.ward} • {p.status}</div></div>
                    <div style={{display:"flex", gap:"6px"}}>
                      <button onClick={()=>admitExisting(p.id)} style={{background:"#dcfce7", border:"none", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Admit</button>
                      <button onClick={()=>discharge(p.id)} style={{background:"#fee2e2", border:"none", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Discharge</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "staff" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
              <h3>Register Staff (Admin Only)</h3>
              <div style={{display:"grid", gap:"10px"}}>
                <input value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name:e.target.value})} placeholder="Full Name" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <input value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email:e.target.value})} placeholder="Email" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <input value={newStaff.password} type="password" onChange={e=>setNewStaff({...newStaff, password:e.target.value})} placeholder="Password" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <select value={newStaff.user_type} onChange={e=>setNewStaff({...newStaff, user_type:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select>
                <button onClick={registerStaff} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Create Staff Account</button>
              </div>
            </div>
          )}

          {tab === "finance" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
              <h3>Billing - Finance</h3>
              {billing.map(b=><div key={b.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{b.id}</b> - {b.patient}</div><div style={{fontWeight:700}}>₦{b.amount?.toLocaleString()}</div></div>)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}