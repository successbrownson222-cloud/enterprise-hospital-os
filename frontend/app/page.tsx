"use client";
import { useState } from "react";

type Patient = { id: string; name: string; age: number; status: string; doctor: string; date: string };

const initialPatients: Patient[] = [
  { id: "P-001", name: "Adebayo Johnson", age: 34, status: "Admitted", doctor: "Dr. Success Brownson", date: "2026-10-28" },
  { id: "P-002", name: "Chioma Okoro", age: 28, status: "Discharged", doctor: "Dr. Emeka N.", date: "2026-10-27" },
  { id: "P-003", name: "Musa Ibrahim", age: 45, status: "In Surgery", doctor: "Dr. Aisha Bello", date: "2026-10-28" },
];

export default function HospitalOS() {
  const [tab, setTab] = useState("dashboard");
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", age: "", doctor: "" });

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addPatient = () => {
    if (!newPatient.name) return;
    setPatients([{ id: `P-${Math.floor(Math.random()*900)+100}`, name: newPatient.name, age: parseInt(newPatient.age)||30, status: "Admitted", doctor: newPatient.doctor||"Dr. Success", date: new Date().toISOString().split('T')[0] }, ...patients]);
    setNewPatient({ name: "", age: "", doctor: "" });
    setShowAdd(false);
  };

  return (
    <div style={{ fontFamily: "system-ui", background: "#f5f7fb", minHeight: "100vh" }}>
      <header style={{ background: "#0f172a", color: "white", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "18px" }}>🏥 Enterprise Hospital OS</h1>
        <span style={{ background: "#22c55e", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>LIVE ● Vercel</span>
      </header>

      <div style={{ display: "flex", gap: "8px", padding: "16px", flexWrap: "wrap" }}>
        {["dashboard","patients","doctors","appointments","billing"].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #ddd", background: tab===t ? "#0f172a" : "white", color: tab===t ? "white" : "#0f172a", textTransform: "capitalize", cursor: "pointer", fontWeight: 600 }}>{t}</button>
        ))}
      </div>

      <main style={{ padding: "0 16px 40px" }}>
        {tab==="dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "12px" }}>
            {[{k:"Total Patients",v:patients.length},{k:"Admitted",v:patients.filter(p=>p.status==="Admitted").length},{k:"Doctors",v:12},{k:"Revenue Today",v:"₦2.4M"}].map(c=>(
              <div key={c.k} style={{ background:"white", padding:"20px", borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ color:"#64748b", fontSize:"13px" }}>{c.k}</div>
                <div style={{ fontSize:"24px", fontWeight:700, marginTop:"6px" }}>{c.v}</div>
              </div>
            ))}
            <div style={{ gridColumn:"1/-1", background:"white", padding:"20px", borderRadius:"12px", marginTop:"8px" }}>
              <h3>System Status</h3>
              <p>Frontend: <b style={{color:"green"}}>● Deployed on Vercel</b></p>
              <p>Backend Go API: <b style={{color:"orange"}}>○ Deploy to Render.com</b></p>
              <p>AI Service (Python): <b style={{color:"orange"}}>○ Deploy to Render.com</b></p>
              <p style={{color:"#64748b", fontSize:"13px", marginTop:"12px"}}>Next step: Deploy backend to Render and add NEXT_PUBLIC_API_URL in Vercel → Settings → Environment Variables</p>
            </div>
          </div>
        )}

        {tab==="patients" && (
          <div style={{ background:"white", borderRadius:"12px", padding:"16px" }}>
            <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient..." style={{ flex:1, padding:"10px", borderRadius:"8px", border:"1px solid #ddd" }} />
              <button onClick={()=>setShowAdd(!showAdd)} style={{ padding:"10px 16px", background:"#2563eb", color:"white", border:"none", borderRadius:"8px", cursor:"pointer" }}>{showAdd ? "Close" : "+ Add Patient"}</button>
            </div>

            {showAdd && (
              <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap", background:"#f8fafc", padding:"12px", borderRadius:"8px" }}>
                <input placeholder="Full Name" value={newPatient.name} onChange={e=>setNewPatient({...newPatient,name:e.target.value})} style={{ flex:1, padding:"8px", borderRadius:"6px", border:"1px solid #ddd" }} />
                <input placeholder="Age" value={newPatient.age} onChange={e=>setNewPatient({...newPatient,age:e.target.value})} style={{ width:"80px", padding:"8px", borderRadius:"6px", border:"1px solid #ddd" }} />
                <input placeholder="Doctor" value={newPatient.doctor} onChange={e=>setNewPatient({...newPatient,doctor:e.target.value})} style={{ flex:1, padding:"8px", borderRadius:"6px", border:"1px solid #ddd" }} />
                <button onClick={addPatient} style={{ padding:"8px 14px", background:"#0f172a", color:"white", border:"none", borderRadius:"6px" }}>Save</button>
              </div>
            )}

            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ textAlign:"left", color:"#64748b", fontSize:"13px" }}><th style={{padding:"10px"}}>ID</th><th>Name</th><th>Age</th><th>Status</th><th>Doctor</th><th>Date</th></tr></thead>
                <tbody>{filtered.map(p=>(
                  <tr key={p.id} style={{ borderTop:"1px solid #eee" }}><td style={{padding:"10px"}}>{p.id}</td><td style={{fontWeight:600}}>{p.name}</td><td>{p.age}</td><td><span style={{ background: p.status==="Admitted" ? "#dcfce7" : p.status==="In Surgery" ? "#fee2e2" : "#e0e7ff", padding:"4px 8px", borderRadius:"20px", fontSize:"12px" }}>{p.status}</span></td><td>{p.doctor}</td><td>{p.date}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab!=="dashboard" && tab!=="patients" && (
          <div style={{ background:"white", padding:"40px", borderRadius:"12px", textAlign:"center" }}>
            <h2 style={{ textTransform:"capitalize" }}>{tab} Module</h2>
            <p style={{ color:"#64748b" }}>This module will connect to your {tab} API on Render.</p>
            <p style={{ marginTop:"12px" }}>Go API Endpoint: <code>/api/{tab}</code></p>
            <button onClick={()=>alert(`${tab} feature coming when backend is deployed to Render!`)} style={{ marginTop:"16px", padding:"10px 18px", background:"#0f172a", color:"white", border:"none", borderRadius:"8px" }}>Test Button</button>
          </div>
        )}
      </main>
    </div>
  );
}