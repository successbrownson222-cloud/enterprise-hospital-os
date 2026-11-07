"use client";
export default function HospitalUI(props:any){
  const { active, setActive, menuOpen, setMenuOpen, q, setQ, patients, staff, billing, aiData, beds, ambulance, equipment, labs,
    loading, selected, setSelected, socket, chatType, setChatType, messages, aiMessages, chatInput, setChatInput,
    userType, isAdmin, showAdmit, setShowAdmit, newPatient, setNewPatient, filtered, admitPatient, sendLiveMessage, askAI } = props;

  const nav = [
    {id:"dashboard", l:"Dashboard", i:"◧"},
    {id:"patients", l:"Patients", i:"◎"},
    {id:"doctors", l:"Staff", i:"◐"},
    {id:"ai", l:"AI Lab", i:"✦"},
    {id:"billing", l:"Billing", i:"₦"},
    {id:"beds", l:"Beds", i:"🛏️"},
    {id:"ambulance", l:"Ambulance", i:"🚑"},
    {id:"equipment", l:"Equipment", i:"⚙️"},
    {id:"labs", l:"Labs", i:"🧪"},
  ];

  const card:any = {background:"white", borderRadius:"16px", padding:"16px", border:"1px solid #e2e8f0"};

  return (
    <div style={{minHeight:"100vh", background:"#f8fafc", fontFamily:"system-ui"}}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.animate-fade{animation:fadeIn .3s ease} @media(min-width:768px){.hide-desktop{display:none!important}.show-desktop{display:flex!important}} @media(max-width:767px){.show-desktop{display:none!important}}`}</style>

      <header style={{height:"56px", background:"white", borderBottom:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px", position:"sticky", top:0, zIndex:20}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} className="hide-desktop" style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e2e8f0", background:"white"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"#0a0f1e", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <b style={{fontSize:"15px"}}>Hospital OS Pro</b>
          <span style={{fontSize:"10px", background:isAdmin?"#dcfce7":"#e0e7ff", color:"#1e293b", padding:"4px 8px", borderRadius:"20px", fontWeight:700, textTransform:"capitalize"}}>{userType||"guest"}</span>
        </div>
        <div style={{display:"flex", gap:"8px", alignItems:"center"}}>
          <span style={{fontSize:"11px", background: socket?.connected?"#dcfce7":"#fef3c7", padding:"4px 8px", borderRadius:"20px"}}>● {socket?.connected?"LIVE":loading?"SYNCING":"READY"}</span>
          {isAdmin && <button onClick={()=>setShowAdmit(true)} style={{background:"#0a0f1e", color:"white", border:"none", padding:"8px 12px", borderRadius:"10px", fontSize:"12px", fontWeight:700}}>+ Admit</button>}
          <button onClick={()=>{localStorage.clear(); window.location.href="/login"}} style={{background:"white", border:"1px solid #e2e8f0", padding:"7px 10px", borderRadius:"8px", fontSize:"12px"}}>Logout</button>
        </div>
      </header>

      <div style={{display:"flex"}}>
        <aside className="show-desktop" style={{width:"240px", background:"#0a0f1e", color:"white", padding:"16px", flexDirection:"column", position:"sticky", top:"56px", height:"calc(100vh - 56px)"}}>
          {nav.map((n:any)=><button key={n.id} onClick={()=>setActive(n.id)} style={{textAlign:"left", padding:"12px", borderRadius:"10px", border:"none", background: active===n.id?"rgba(255,255,255,0.12)":"transparent", color: active===n.id?"white":"#94a3b8", display:"flex", gap:"10px", cursor:"pointer", fontWeight: active===n.id?700:500, marginBottom:"4px"}}>{n.i} {n.l}</button>)}
          <div style={{marginTop:"auto", fontSize:"11px", color:"#64748b", lineHeight:1.7}}>Beds: {beds.filter((b:any)=>b.status==="Available").length} available<br/>Ambulance: {ambulance.filter((a:any)=>a.status==="Available").length} ready<br/>Role: {userType}</div>
        </aside>

        {menuOpen && (<><div onClick={()=>setMenuOpen(false)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:30}}/><aside className="animate-fade" style={{position:"fixed", left:0, top:0, width:"280px", height:"100vh", background:"#0a0f1e", color:"white", padding:"20px", zIndex:40}}><div style={{display:"flex", justifyContent:"space-between", marginBottom:"20px"}}><b>Menu</b><button onClick={()=>setMenuOpen(false)} style={{background:"rgba(255,255,255,0.1)", border:"none", color:"white", width:"32px", height:"32px", borderRadius:"8px"}}>✕</button></div>{nav.map((n:any)=><button key={n.id} onClick={()=>{setActive(n.id); setMenuOpen(false);}} style={{textAlign:"left", padding:"14px", borderRadius:"12px", border:"none", background: active===n.id?"rgba(255,255,255,0.12)":"transparent", color:"white", display:"flex", gap:"12px", marginBottom:"6px", width:"100%"}}>{n.i} {n.l}</button>)}</aside></>)}

        <main style={{flex:1, padding:"16px", paddingBottom:"100px", maxWidth:"100%", overflowX:"hidden"}}>
          <div className="animate-fade" style={{position:"relative", marginBottom:"16px"}}>
            <input value={q} onChange={(e:any)=>setQ(e.target.value)} placeholder="Search patients, staff, ward..." style={{width:"100%", padding:"14px 14px 14px 40px", borderRadius:"14px", border:"1px solid #e2e8f0", background:"white", fontSize:"15px", boxSizing:"border-box"}}/>
            <span style={{position:"absolute", left:"14px", top:"14px", opacity:0.5}}>⌕</span>
          </div>

          {active==="dashboard" && (
            <div className="animate-fade">
              <div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px"}}>
                <div style={card}><div style={{fontSize:"11px", color:"#64748b"}}>PATIENTS</div><div style={{fontSize:"22px", fontWeight:800}}>{patients.length}</div></div>
                <div style={card}><div style={{fontSize:"11px", color:"#64748b"}}>AVAILABLE BEDS</div><div style={{fontSize:"22px", fontWeight:800}}>{beds.filter((b:any)=>b.status==="Available").length}/{beds.length||8}</div></div>
                <div style={card}><div style={{fontSize:"11px", color:"#64748b"}}>AMBULANCE</div><div style={{fontSize:"22px", fontWeight:800}}>{ambulance.filter((a:any)=>a.status==="Available").length}</div></div>
                <div style={card}><div style={{fontSize:"11px", color:"#64748b"}}>REVENUE</div><div style={{fontSize:"22px", fontWeight:800}}>₦{(billing.reduce((s:any,b:any)=>s+b.amount,0)/1000000).toFixed(1)}M</div></div>
              </div>
              <div style={{marginTop:"14px", display:"flex", gap:"8px"}}>
                <button onClick={()=>setChatType("ai")} style={{flex:1, padding:"12px", borderRadius:"12px", border:"1px solid #e2e8f0", background:"#0a0f1e", color:"white", fontWeight:700, fontSize:"13px"}}>✦ Ask AI Assistant</button>
                <button onClick={()=>setChatType("live")} style={{flex:1, padding:"12px", borderRadius:"12px", border:"1px solid #e2e8f0", background:"white", fontWeight:700, fontSize:"13px"}}>💬 Live Ward Chat</button>
              </div>
              <div style={{...card, marginTop:"14px"}}>
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:"10px"}}><b>Recent Patients</b><button onClick={()=>setActive("patients")} style={{color:"#3b82f6", background:"none", border:"none", fontWeight:700}}>See all →</button></div>
                {filtered.map((p:any)=><div key={p.id} onClick={()=>setSelected(p)} style={{display:"flex", gap:"12px", padding:"12px 0", borderBottom:"1px solid #f1f5f9", alignItems:"center", cursor:"pointer"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div><div style={{flex:1}}><div style={{fontWeight:600, fontSize:"14px"}}>{p.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{p.ward} • {p.date}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:"#dcfce7"}}>{p.status}</span></div>)}
              </div>
            </div>
          )}

          {active==="patients" && (<div className="animate-fade" style={{...card, padding:0, overflow:"hidden"}}>{isAdmin && <button onClick={()=>setShowAdmit(true)} style={{margin:"12px", background:"#0a0f1e", color:"white", border:"none", padding:"12px", borderRadius:"10px", width:"calc(100% - 24px)", fontWeight:700}}>+ Admit New Patient</button>}{filtered.map((p:any)=><div key={p.id} onClick={()=>setSelected(p)} style={{padding:"14px 16px", display:"flex", gap:"12px", borderBottom:"1px solid #f1f5f9", cursor:"pointer"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#e2e8f0", display:"grid", placeItems:"center", fontWeight:700}}>{p.avatar}</div><div><div style={{fontWeight:600}}>{p.name} <span style={{fontSize:"11px", color:"#64748b"}}>{p.id}</span></div><div style={{fontSize:"12px", color:"#64748b"}}>{p.doctor} • {p.ward}</div></div></div>)}</div>)}
          {active==="doctors" && (<div className="animate-fade"><h3 style={{margin:"4px 0 12px"}}>Staff</h3>{staff.map((s:any)=><div key={s.id} onClick={()=>setSelected(s)} style={{...card, marginTop:"10px", display:"flex", gap:"12px", cursor:"pointer"}}><div style={{width:"44px", height:"44px", borderRadius:"12px", background:"#0a0f1e", color:"white", display:"grid", placeItems:"center", fontWeight:700}}>{s.name?.slice(0,2)}</div><div style={{flex:1}}><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:"12px", color:"#64748b"}}>{s.role} • {s.specialty}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:s.status==="On Duty"?"#dcfce7":"#fee2e2", height:"fit-content"}}>{s.status}</span></div>)}</div>)}
          {active==="billing" && (<div className="animate-fade"><h3 style={{margin:"4px 0 12px"}}>Billing</h3>{billing.map((b:any)=><div key={b.id} onClick={()=>setSelected(b)} style={{...card, marginTop:"10px", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{b.id}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:b.status==="Paid"?"#dcfce7":"#fef3c7"}}>{b.status}</span></div><div style={{fontSize:"13px", marginTop:"6px"}}>{b.patient}</div><div style={{fontWeight:800}}>₦{b.amount?.toLocaleString()}</div></div>)}</div>)}
          {active==="ai" && (<div className="animate-fade"><h3 style={{margin:"4px 0 6px"}}>✦ AI Predictions</h3><p style={{fontSize:"12px", color:"#64748b", margin:"0 0 12px"}}>AI suggests risk & next steps. Tap to view.</p>{aiData?.predictions?.map((p:any,i:number)=><div key={i} onClick={()=>setSelected(p)} style={{...card, marginTop:"10px", borderLeft:`4px solid ${p.risk==="High"?"#ef4444":p.risk==="Medium"?"#f59e0b":"#10b981"}`, cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{p.patient}</b><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:p.risk==="High"?"#fee2e2":"#dcfce7"}}>{p.risk} Risk</span></div><div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>{p.condition} • {p.confidence}% confidence</div></div>)}{!aiData?.predictions && <div style={card}>No AI predictions yet — backend /api/ai will fill this.</div>}<button onClick={()=>setChatType("ai")} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>✦ Ask AI Assistant</button></div>)}
          {active==="beds" && (<div className="animate-fade"><h3>🛏️ Beds</h3><div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"12px", marginTop:"12px"}}>{beds.map((b:any)=><div key={b.id} onClick={()=>setSelected(b)} style={{...card, borderLeft:`4px solid ${b.status==="Available"?"#10b981":"#ef4444"}`, cursor:"pointer"}}><b>{b.id}</b><div style={{fontSize:"12px", color:"#64748b"}}>{b.ward}</div><div style={{marginTop:"6px", fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:b.status==="Available"?"#dcfce7":"#fee2e2", display:"inline-block"}}>{b.status}</div></div>)}</div></div>)}
          {active==="ambulance" && (<div className="animate-fade"><h3>🚑 Ambulance</h3>{ambulance.map((a:any)=><div key={a.id} onClick={()=>setSelected(a)} style={{...card, marginTop:"12px", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{a.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:a.status==="Available"?"#dcfce7":"#fef3c7"}}>{a.status}</span></div><div style={{fontSize:"12px", color:"#64748b", marginTop:"6px"}}>📍 {a.location} • ETA {a.eta||"5 min"}</div></div>)}</div>)}
          {active==="equipment" && (<div className="animate-fade"><h3>⚙️ Equipment</h3>{equipment.map((e:any)=><div key={e.id} onClick={()=>setSelected(e)} style={{...card, marginTop:"12px", cursor:"pointer"}}><b>{e.name||e.id}</b><div style={{fontSize:"12px", color:"#64748b"}}>{e.id} • {e.ward}</div><div style={{display:"flex", justifyContent:"space-between", marginTop:"8px"}}><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:"#dcfce7"}}>{e.status}</span><span style={{fontSize:"11px"}}>Service: {e.nextService||"—"}</span></div></div>)}</div>)}
          {active==="labs" && (<div className="animate-fade"><h3>🧪 Labs</h3>{labs.map((l:any)=><div key={l.id} onClick={()=>setSelected(l)} style={{...card, marginTop:"12px", cursor:"pointer"}}><div style={{display:"flex", justifyContent:"space-between"}}><b>{l.id}</b><span style={{fontSize:"11px", padding:"4px 8px", borderRadius:"20px", background:l.status==="Completed"?"#dcfce7":"#fef3c7"}}>{l.status}</span></div><div style={{fontSize:"13px", marginTop:"6px"}}>{l.patient} - {l.test}</div></div>)}</div>)}
        </main>
      </div>

      <div className="hide-desktop" style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #e2e8f0", display:"flex", justifyContent:"space-around", padding:"8px 0", zIndex:20, overflowX:"auto"}}>
        {nav.map((n:any)=><button key={n.id} onClick={()=>setActive(n.id)} style={{background:"none", border:"none", display:"flex", flexDirection:"column", alignItems:"center", gap:"2px", color: active===n.id?"#0a0f1e":"#94a3b8", minWidth:"52px"}}><span style={{fontSize:"16px"}}>{n.i}</span><span style={{fontSize:"9px", fontWeight: active===n.id?700:400}}>{n.l.split(" ")[0]}</span></button>)}
      </div>

      {/* PROFESSIONAL FLOATING CHAT - TWO BUTTONS */}
      <div style={{position:"fixed", bottom:"80px", right:"14px", zIndex:40, display:"flex", flexDirection:"column", gap:"10px", alignItems:"flex-end"}}>
        {chatType && (
          <div className="animate-fade" style={{width:"min(340px, calc(100vw - 28px))", height:"400px", background:"white", borderRadius:"18px", border:"1px solid #e2e8f0", boxShadow:"0 12px 32px rgba(0,0,0,0.16)", display:"flex", flexDirection:"column", overflow:"hidden"}}>
            <div style={{padding:"14px", background: chatType==="ai"?"#0a0f1e":"#065f46", color:"white", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div><div style={{fontWeight:800, fontSize:"13px"}}>{chatType==="ai"?"✦ AI Assistant":"💬 Live Ward Chat"}</div><div style={{fontSize:"11px", opacity:0.8}}>{chatType==="ai"?"Ask & get suggestions":"Direct to Doctors & Nurses • ICU-2"}</div></div>
              <button onClick={()=>setChatType(null)} style={{background:"rgba(255,255,255,0.2)", border:"none", color:"white", width:"30px", height:"30px", borderRadius:"8px"}}>✕</button>
            </div>
            <div style={{flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:"8px", background:"#f8fafc"}}>
              {(chatType==="ai"?aiMessages:messages).map((m:any,i:number)=>(
                <div key={i} style={{alignSelf: m.user==="You"?"flex-end":"flex-start", maxWidth:"85%", background: m.user==="You"?"#0a0f1e":"white", color: m.user==="You"?"white":"#1e293b", padding:"9px 12px", borderRadius:"14px", border:"1px solid #e2e8f0", fontSize:"13px", lineHeight:1.4}}>
                  <div style={{fontSize:"10px", opacity:0.6, marginBottom:"2px", fontWeight:700}}>{m.user}</div>{m.text}
                </div>
              ))}
            </div>
            <div style={{display:"flex", gap:"8px", padding:"10px", borderTop:"1px solid #e2e8f0", background:"white"}}>
              <input value={chatInput} onChange={(e:any)=>setChatInput(e.target.value)} onKeyDown={(e:any)=>{if(e.key==="Enter"){chatType==="ai"?askAI():sendLiveMessage()}}} placeholder={chatType==="ai"?"Ask AI: fever, bed, billing...":"Message doctors..."} style={{flex:1, padding:"11px", borderRadius:"10px", border:"1px solid #e2e8f0", fontSize:"13px"}}/>
              <button onClick={()=>{chatType==="ai"?askAI():sendLiveMessage()}} style={{padding:"11px 14px", background:"#0a0f1e", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Send</button>
            </div>
            <div style={{display:"flex", gap:"6px", padding:"0 10px 10px", background:"white"}}>
              <button onClick={()=>setChatType("ai")} style={{flex:1, padding:"8px", borderRadius:"8px", border:"1px solid #e2e8f0", background: chatType==="ai"?"#0a0f1e":"white", color: chatType==="ai"?"white":"#334155", fontSize:"11px", fontWeight:700}}>✦ AI</button>
              <button onClick={()=>setChatType("live")} style={{flex:1, padding:"8px", borderRadius:"8px", border:"1px solid #e2e8f0", background: chatType==="live"?"#065f46":"white", color: chatType==="live"?"white":"#334155", fontSize:"11px", fontWeight:700}}>💬 Live Ward</button>
            </div>
          </div>
        )}
        <div style={{display:"flex", gap:"8px"}}>
          <button onClick={()=>setChatType(chatType==="ai"?null:"ai")} style={{height:"52px", padding:"0 14px", borderRadius:"26px", background:"#0a0f1e", color:"white", border:"none", fontSize:"13px", fontWeight:700, boxShadow:"0 8px 20px rgba(0,0,0,0.2)"}}>✦ AI</button>
          <button onClick={()=>setChatType(chatType==="live"?null:"live")} style={{height:"52px", padding:"0 14px", borderRadius:"26px", background:"#065f46", color:"white", border:"none", fontSize:"13px", fontWeight:700, boxShadow:"0 8px 20px rgba(0,0,0,0.2)"}}>💬 Live {socket?.connected?"●":"○"}</button>
        </div>
      </div>

      {showAdmit && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:60, padding:"16px"}}>
          <div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Admit Patient</h3><button onClick={()=>setShowAdmit(false)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button></div>
            <input value={newPatient.name} onChange={(e:any)=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Patient Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"12px", boxSizing:"border-box"}}/>
            <input value={newPatient.age} type="number" onChange={(e:any)=>setNewPatient({...newPatient, age:parseInt(e.target.value)})} placeholder="Age" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"10px", boxSizing:"border-box"}}/>
            <select value={newPatient.ward} onChange={(e:any)=>setNewPatient({...newPatient, ward:e.target.value})} style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e2e8f0", marginTop:"10px"}}><option>ICU-2</option><option>W-4</option><option>ER-1</option></select>
            <button onClick={admitPatient} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}}>Admit Patient</button>
          </div>
        </div>
      )}

      {selected && (
        <div onClick={()=>setSelected(null)} style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}>
          <div onClick={(e:any)=>e.stopPropagation()} style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <h3 style={{margin:0}}>Details</h3>
              <button onClick={()=>setSelected(null)} style={{border:"none", background:"#f1f5f9", width:"32px", height:"32px", borderRadius:"10px"}}>✕</button>
            </div>
            <div style={{marginTop:"16px", background:"#f8fafc", borderRadius:"12px", padding:"12px", fontSize:"13px", lineHeight:1.9, maxHeight:"300px", overflowY:"auto"}}>
              {Object.entries(selected).map(([k,v]:any)=><div key={k}><b>{k}:</b> {String(v)}</div>)}
            </div>
            <button onClick={()=>setSelected(null)} style={{marginTop:"14px", width:"100%", padding:"12px", background:"#0a0f1e", color:"white", borderRadius:"12px", border:"none", fontWeight:700}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 