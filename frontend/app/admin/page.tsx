"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState("overview");

  const stats = [
    { label: "Total Revenue", value: "₦28.4M", sub: "+18% this month", color: "#10b981", bar: 80 },
    { label: "Bed Occupancy", value: "84%", sub: "126 / 150 beds", color: "#3b82f6", bar: 84 },
    { label: "Staff On Duty", value: "42", sub: "8 doctors, 34 nurses", color: "#8b5cf6", bar: 60 },
    { label: "Critical Alerts", value: "5", sub: "2 in ICU", color: "#ef4444", bar: 35 },
  ];

const admit = async (id:string) => {
  await fetch("https://YOUR-GO-API-ON-RENDER.onrender.com/api/patients/action", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({id, action:"admit"})
  }); alert(`Admitted ${id}`)
}
const discharge = async (id:string) => {
  await fetch("https://YOUR-GO-API-ON-RENDER.onrender.com/api/patients/action", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({id, action:"discharge"})
  }); alert(`Discharged ${id}`)
}

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb", fontFamily: "system-ui" }}>
      <style>{`
        @keyframes in { from {opacity:0; transform: translateY(10px)} to {opacity:1; transform: translateY(0)} }
        .card { animation: in 0.4s ease both; }
        .card:nth-child(1){animation-delay:0.05s} .card:nth-child(2){animation-delay:0.1s} .card:nth-child(3){animation-delay:0.15s} .card:nth-child(4){animation-delay:0.2s}
        @media(min-width:768px){ .mobile-only{display:none!important} .desktop-only{display:flex!important} .grid-2{grid-template-columns: 1.6fr 1fr} .grid-4{grid-template-columns: repeat(4,1fr)} }
        @media(max-width:767px){ .desktop-only{display:none!important} .grid-2{grid-template-columns:1fr} .grid-4{grid-template-columns: repeat(2,1fr)} }
      `}</style>

      {/* HEADER */}
      <header style={{ height: "60px", background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="mobile-only" onClick={() => setMenu(!menu)} style={{ width: "40px", height: "40px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "white" }}>☰</button>
          <div style={{ width: "36px", height: "36px", background: "#111827", borderRadius: "10px", display: "grid", placeItems: "center", color: "white", fontWeight: 800 }}>A</div>
          <div><div style={{ fontWeight: 800 }}>Admin • Hospital OS</div><div style={{ fontSize: "11px", color: "#6b7280" }}>Lagos Enterprise • Super Admin</div></div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#059669", padding: "5px 10px", borderRadius: "20px", fontWeight: 700 }}>● LIVE VERIFIED</span>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#111827", color: "white", display: "grid", placeItems: "center", fontWeight: 700 }}>SA</div>
        </div>
      </header>

      <div style={{ display: "flex" }}>
        {/* DESKTOP SIDEBAR */}
        <aside className="desktop-only" style={{ width: "220px", background: "#0b1220", color: "white", padding: "18px", flexDirection: "column", gap: "6px", position: "sticky", top: "60px", height: "calc(100vh - 60px)" }}>
          {[
            { id: "overview", l: "Overview", i: "◧" },
            { id: "analytics", l: "Analytics", i: "◈" },
            { id: "staff", l: "Staff Mgmt", i: "◐" },
            { id: "finance", l: "Finance", i: "₦" },
            { id: "ai", l: "AI Control", i: "✦" },
          ].map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} style={{ textAlign: "left", padding: "12px", borderRadius: "10px", border: "none", background: tab === n.id ? "white" : "transparent", color: tab === n.id ? "#0b1220" : "#94a3b8", fontWeight: tab === n.id ? 700 : 500, cursor: "pointer", display: "flex", gap: "10px" }}>{n.i} {n.l}</button>
          ))}
          <div style={{ marginTop: "auto", background: "#ffffff0f", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
            Go API: <span style={{ color: "#f59e0b" }}>Deploy to Render</span><br />
            Python AI: <span style={{ color: "#f59e0b" }}>Deploy to Render</span>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {menu && (
          <>
            <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 30 }} />
            <div style={{ position: "fixed", left: 0, top: 0, width: "280px", height: "100vh", background: "#0b1220", color: "white", padding: "20px", zIndex: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}><b>Admin Menu</b><button onClick={() => setMenu(false)} style={{ background: "#ffffff14", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "8px" }}>✕</button></div>
              {["overview", "analytics", "staff", "finance", "ai"].map(t => (
                <button key={t} onClick={() => { setTab(t); setMenu(false); }} style={{ width: "100%", textAlign: "left", padding: "14px", borderRadius: "10px", border: "none", background: tab === t ? "white" : "transparent", color: tab === t ? "#0b1220" : "white", marginBottom: "6px", textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>
          </>
        )}

        {/* CONTENT */}
        <main style={{ flex: 1, padding: "16px", paddingBottom: "90px" }}>
          {tab === "overview" && (
            <>
              <h2 style={{ margin: "0 0 14px", fontSize: "20px" }}>Welcome back, Success 👋</h2>

              {/* KPI CARDS */}
              <div className="grid-4" style={{ display: "grid", gap: "12px" }}>
                {stats.map(s => (
                  <div key={s.label} className="card" style={{ background: "white", borderRadius: "16px", padding: "16px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "11px", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{s.sub}</div>
                    <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "10px", marginTop: "12px" }}><div style={{ width: `${s.bar}%`, height: "100%", background: s.color, borderRadius: "10px", transition: "width 1s ease" }} /></div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ display: "grid", gap: "12px", marginTop: "12px" }}>
                {/* REVENUE CHART (CSS ONLY, NO LIBRARY) */}
                <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><b>Revenue Trend</b><span style={{ fontSize: "12px", color: "#10b981" }}>+18% ↗</span></div>
                  <div style={{ display: "flex", alignItems: "end", gap: "8px", height: "120px", marginTop: "20px" }}>
                    {[40, 65, 50, 85, 70, 95, 80].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "100%", height: `${h}%`, background: i === 5 ? "#111827" : "#e5e7eb", borderRadius: "8px", transition: "height 0.8s ease", transitionDelay: `${i * 0.05}s` }} />
                        <span style={{ fontSize: "10px", color: "#6b7280" }}>{["M","T","W","T","F","S","S"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIVE OPS */}
                <div className="card" style={{ background: "#111827", borderRadius: "16px", padding: "18px", color: "white" }}>
                  <b>🔴 Live Operations</b>
                  <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { op: "Appendectomy - OR 2", doc: "Dr. Aisha", time: "In progress • 42m" },
                      { op: "C-Section - OR 1", doc: "Dr. Success", time: "Starting • now" },
                      { op: "Orthopedic - OR 3", doc: "Dr. Emeka", time: "Scheduled • 14:30" },
                    ].map(o => (
                      <div key={o.op} style={{ background: "rgba(255,255,255,0.08)", padding: "10px 12px", borderRadius: "10px", display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontSize: "13px", fontWeight: 600 }}>{o.op}</div><div style={{ fontSize: "11px", opacity: 0.7 }}>{o.doc}</div></div>
                        <div style={{ fontSize: "11px", opacity: 0.7 }}>{o.time}</div>
                      </div>
                    ))}
                  </div>
                  <button style={{ marginTop: "14px", width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: "white", color: "#111827", fontWeight: 700 }}>View OR Dashboard</button>
                </div>
              </div>

              {/* STAFF TABLE */}
              <div className="card" style={{ background: "white", borderRadius: "16px", padding: "18px", border: "1px solid #e5e7eb", marginTop: "12px" }}>
                <b>Top Performing Staff Today</b>
                <div style={{ marginTop: "12px" }}>
                  {[
                    { name: "Dr. Success Brownson", role: "Chief Surgeon", patients: 12, rating: "4.9" },
                    { name: "Dr. Aisha Bello", role: "Anesthesiologist", patients: 9, rating: "4.8" },
                    { name: "Nurse Grace N.", role: "ICU Lead", patients: 18, rating: "5.0" },
                  ].map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}><div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f3f4f6", display: "grid", placeItems: "center", fontWeight: 700 }}>{s.name[0]}</div><div><div style={{ fontWeight: 600, fontSize: "13px" }}>{s.name}</div><div style={{ fontSize: "11px", color: "#6b7280" }}>{s.role}</div></div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontSize: "13px", fontWeight: 700 }}>{s.patients} pts</div><div style={{ fontSize: "11px", color: "#f59e0b" }}>★ {s.rating}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {tab !== "overview" && (
            <div className="card" style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1px solid #e5e7eb" }}>
              <h2 style={{ textTransform: "capitalize" }}>{tab}</h2>
              <p style={{ color: "#6b7280" }}>Admin {tab} module — will connect to Go API / Python AI on Render</p>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-only" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-around", padding: "8px 0 18px", zIndex: 20 }}>
        {[
          { id: "overview", l: "Home" },
          { id: "analytics", l: "Stats" },
          { id: "staff", l: "Staff" },
          { id: "finance", l: "Finance" },
          { id: "ai", l: "AI" },
        ].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ background: "none", border: "none", color: tab === n.id ? "#111827" : "#9ca3af", fontSize: "11px", fontWeight: tab === n.id ? 700 : 400 }}>{n.l}</button>
        ))}
      </div>
    </div>
  );
}