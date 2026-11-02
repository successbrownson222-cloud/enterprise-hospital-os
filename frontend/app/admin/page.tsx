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

  useEffect(() => {
    const ut = localStorage.getItem("user_type");
    if(ut !== "admin"){ alert("Admin only! Login as admin@hospital.com / Admin123!"); location.href="/login"; return; }
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

  const token = () => localStorage.getItem("token") || "";

  const admitPatient = async () => {
    if(!newPatient.name) return alert("Enter name");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const data = await res.json(); setPatients(prev=>[data, ...prev]); setNewPatient({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"}); alert("Admitted "+data.id); }
    else alert("Failed - are you admin?");
  };

  const discharge = async (id:string) => {
    await fetch(`${API_URL}/api/patients/action`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id, action:"discharge"})});
    setPatients(prev=>prev.map(p=>p.id===id?{...p, status:"Discharged"}:p));
    alert(`Discharged ${id}`);
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
    else alert(d.error||"Failed - admin only");
  };

  const stats = [
    { label: "Total Revenue", value: `₦${(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M`, sub: "+18% this month", color: "#10b981", bar: 80 },
    { label: "Bed Occupancy", value: `${analytics?.bedOccupancy||84}%`, sub: `${patients.length} patients`, color: "#3b82f6", bar: analytics?.bedOccupancy||84 },
    { label: "Staff On Duty", value: `${staff.filter(s=>s.status==="On Duty").length||42}`, sub: `${staff.length} total staff`, color: "#8b5cf6", bar: 60 },
    { label: "Total Patients", value: `${patients.length}`, sub: `${patients.filter(p=>p.status==="Admitted").length} admitted`, color: "#ef4444", bar: 50 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", fontFamily: "system-ui" }}>
      <style>{`@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.card{animation:in 0.4s ease both}@media(min-width:768px){.mobile-only{display:none!important}.desktop-only{display:flex!important}.grid-2{grid-template-columns:1.6fr 1fr}.grid-4{grid-template-columns:repeat(4,1fr)}}@media(max-width:767px){.desktop-only{display:none!important}.grid-2{grid-template-columns:1fr}.grid-4{grid-template-columns:repeat(2,1fr)}}`}</style>

      <header style={{ height: "60px", background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="mobile-only" onClick={() => setMenu(!menu)} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white" }}>☰</button>
          <div style={{ width: "36px", height: "36px", background: "#111827", borderRadius: "10px", display: "grid", placeItems: "center", color: "white", fontWeight: 800 }}>A</div>
          <div><div style={{ fontWeight: 800 }}>Admin • Hospital OS</div><div style={{ fontSize: "11px", color: "#6b7280" }}>Super Admin • {localStorage.getItem("user_type")}</div></div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#059669", padding: "5px 10px", borderRadius: "20px", fontWeight: 700 }}>● ADMIN LIVE</span>
          <button onClick={()=>{localStorage.clear(); location.href="/login"}} style={{background:"none", border:"1px solid #e5e7eb", padding:"6px 10px", borderRadius:"8px", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        <aside className="desktop-only" style={{ width: "220px", background: "#0b1220", color: "white", padding: "18px", flexDirection: "column", gap: "6px", position: "sticky", top: "60px", height: "calc(100vh - 60px)" }}>
          {[{ id: "overview", l: "Overview", i: "◧" },{ id: "patients", l: "Admit / Patients", i: "◎" },{ id: "staff", l: "Register Staff", i: "◐" },{ id: "finance", l: "Finance", i: "₦" },{ id: "ai", l: "AI Control", i: "✦" }].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ textAlign: "left", padding: "12px", borderRadius: "10px", border: "none", background: tab === n.id ? "white" : "transparent", color: tab === n.id ? "#0b1220" : "#94a3b8", fontWeight: tab === n.id ? 700 : 500, cursor: "pointer", display: "flex", gap: "10px" }}>{n.i} {n.l}</button>
          ))}
        </aside>

        {menu && (<><div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 30 }} /><div style={{ position: "fixed", left: 0, top: 0, width: "280px", height: "100vh", background: "#0b1220", color: "white", padding: "20px", zIndex: 40 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}><b>Admin Menu</b><button onClick={() => setMenu(false)} style={{ background: "#ffffff14", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "8px" }}>✕</button></div>{["overview","patients","staff","finance","ai"].map(t => (<button key={t} onClick={() => { setTab(t); setMenu(false); }} style={{ width: "100%", textAlign: "left", padding: "14px", borderRadius: "10px", border: "none", background: tab === t ? "white" : "transparent", color: tab === t ? "#0b1220" : "white", marginBottom: "6px", textTransform: "capitalize" }}>{t}</button>))}</div></>)}

        <main style={{ flex: 1, padding: "16px", paddingBottom: "90px" }}>
          {tab === "overview" && (
            <>
              <h2 style={{ margin: "0 0 14px", fontSize: "20px" }}>Welcome back, Admin 👋 {loading?"...":""}</h2>
              <div className="grid-4" style={{ display: "grid", gap: "12px" }}>
                {stats.map(s => (
                  <div key={s.label} className="card" style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{s.sub}</div>
                    <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "10px", marginTop: "12px" }}><div style={{ width: `${s.bar}%`, height: "100%", background: s.color, borderRadius: "10px" }} /></div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
                  <b>Revenue Trend</b>
                  <div style={{ display: "flex", alignItems: "end", gap: "8px", height: "120px", marginTop: "20px" }}>
                    {[40, 65, 50, 85, 70, 95, 80].map((h, i) => (<div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}><div style={{ width: "100%", height: `${h}%`, background: i === 5 ? "#111827" : "#e5e7eb", borderRadius: "8px" }} /><span style={{ fontSize: "10px", color: "#6b7280" }}>{["M","T","W","T","F","S","S"][i]}</span></div>))}
                  </div>
                </div>
                <div className="card" style={{ background: "#111827", borderRadius: "16px", padding: "18px", color: "white" }}>
                  <b>🔴 Live Operations</b>
                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {patients.slice(0,3).map(p=><div key={p.id} style={{ background: "rgba(255,255,255,0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", justifyContent: "space-between" }}><div><div style={{ fontSize: "13px", fontWeight: 600 }}>{p.name} - {p.ward}</div><div style={{ fontSize: "11px", opacity: 0.7 }}>{p.status}</div></div><div style={{ fontSize: "11px", opacity: 0.7 }}>{p.doctor}</div></div>)}
                  </div>
                </div>
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
                <input value={newPatient.doctor} onChange={e=>setNewPatient({...newPatient, doctor:e.target.value})} placeholder="Doctor" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <button onClick={admitPatient} style={{padding:"14px", background:"#0a0f1e", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Admit Patient → DB</button>
              </div>

              <div style={{marginTop:"20px"}}>
                <b>All Patients - Click to Discharge/Admit</b>
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
              <h3 style={{marginTop:0}}>Register Staff (Admin Only)</h3>
              <div style={{display:"grid", gap:"10px"}}>
                <input value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name:e.target.value})} placeholder="Full Name" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <input value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email:e.target.value})} placeholder="Email" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <input value={newStaff.password} type="password" onChange={e=>setNewStaff({...newStaff, password:e.target.value})} placeholder="Password" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
                <select value={newStaff.user_type} onChange={e=>setNewStaff({...newStaff, user_type:e.target.value})} style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="admin">Admin</option></select>
                <button onClick={registerStaff} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Create Staff Account</button>
              </div>
              <div style={{marginTop:"20px"}}>
                <b>Current Staff</b>
                {staff.map(s=><div key={s.id} style={{padding:"10px 0", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between"}}><span>{s.name} • {s.role}</span><span style={{fontSize:"12px", background:s.status==="On Duty"?"#dcfce7":"#fee2e2", padding:"2px 8px", borderRadius:"10px"}}>{s.status}</span></div>)}
              </div>
            </div>
          )}

          {tab === "finance" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
              <h3>Billing - Finance</h3>
              {billing.map(b=><div key={b.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{b.id}</b> - {b.patient}<div style={{fontSize:"12px", color:"#6b7280"}}>{b.details}</div></div><div style={{textAlign:"right"}}><div style={{fontWeight:700}}>₦{b.amount?.toLocaleString()}</div><div style={{fontSize:"11px", padding:"2px 6px", borderRadius:"10px", background:b.status==="Paid"?"#dcfce7":"#fef3c7", display:"inline-block"}}>{b.status}</div></div></div>)}
            </div>
          )}

          {tab === "ai" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
              <h3>AI Control</h3>
              <p style={{color:"#6b7280"}}>Bed Occupancy: {analytics?.bedOccupancy||84}% • Revenue Forecast: ₦{(billing.reduce((s,b)=>s+b.amount,0)/1000000).toFixed(1)}M</p>
              <button onClick={()=>location.href="/"} style={{marginTop:"12px", width:"100%", padding:"12px", background:"#0a0f1e", color:"white", border:"none", borderRadius:"10px"}}>Go to Main Hospital OS</button>
            </div>
          )}
        </main>
      </div>

      <div className="mobile-only" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-around", padding: "8px 0 18px", zIndex: 20 }}>
        {["overview","patients","staff","finance","ai"].map(n => (<button key={n} onClick={() => setTab(n)} style={{ background: "none", border: "none", color: tab === n ? "#111827" : "#9ca3af", fontSize: "11px", fontWeight: tab === n ? 700 : 400, textTransform:"capitalize" }}>{n}</button>))}
      </div>
    </div>
  );
}