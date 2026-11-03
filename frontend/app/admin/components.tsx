"use client";
export default function AdminUI(props:any){
  const { menuOpen, setMenuOpen, tab, setTab, patients, staff, billing, beds, ambulance, equipment, labs,
    loggedIn, email, authMode, setAuthMode, authForm, setAuthForm,
    showPatient, setShowPatient, showStaff, setShowStaff, showAmbulance, setShowAmbulance,
    showEquipment, setShowEquipment, showBed, setShowBed, showLab, setShowLab,
    newPatient, setNewPatient, newStaff, setNewStaff, newAmbulance, setNewAmbulance,
    newEquipment, setNewEquipment, newBed, setNewBed, newLab, setNewLab,
    login, signup, addStaff, addPatient, addAmbulance, addEquipment, addBed, addLab, setLoggedIn } = props;

  const TABS = [{id:"overview", l:"Overview"},{id:"patients", l:"Patients"},{id:"staff", l:"Staff"},{id:"beds", l:"Beds"},{id:"ambulance", l:"Ambulance"},{id:"equipment", l:"Equipment"},{id:"labs", l:"Labs"},{id:"finance", l:"Finance"}];

  if(!loggedIn){
    return (
      <div style={{minHeight:"100vh", display:"grid", placeItems:"center", background:"#f6f7fb", padding:"16px"}}>
        <div style={{background:"white", borderRadius:"20px", padding:"24px", width:"100%", maxWidth:"380px", border:"1px solid #e5e7eb"}}>
          <h2 style={{margin:0}}>Admin Login</h2>
          <p style={{fontSize:"12px", color:"#6b7280"}}>{email||"brownsonsuccess033@gmail.com"}</p>
          <div style={{display:"flex", gap:"8px", margin:"16px 0"}}>
            <button onClick={()=>setAuthMode("login")} style={{flex:1, padding:"10px", borderRadius:"10px", border:"none", background:authMode==="login"?"#111827":"#f3f4f6", color:authMode==="login"?"white":"#6b7280", fontWeight:700}}>Login</button>
            <button onClick={()=>setAuthMode("signup")} style={{flex:1, padding:"10px", borderRadius:"10px", border:"none", background:authMode==="signup"?"#111827":"#f3f4f6", color:authMode==="signup"?"white":"#6b7280", fontWeight:700}}>Sign Up</button>
          </div>
          <div style={{display:"grid", gap:"10px"}}>
            {authMode==="signup" && <input value={authForm.name} onChange={(e:any)=>setAuthForm({...authForm, name:e.target.value})} placeholder="Full Name" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>}
            <input value={authForm.email} onChange={(e:any)=>setAuthForm({...authForm, email:e.target.value})} placeholder="Email" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
            <input type="password" value={authForm.password} onChange={(e:any)=>setAuthForm({...authForm, password:e.target.value})} placeholder="Password" style={{padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb"}}/>
            {authMode==="login"?<button onClick={login} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Login →</button>:<button onClick={signup} style={{padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700}}>Create Admin</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh", background:"#f6f7fb", fontFamily:"system-ui"}}>
      <header style={{height:"60px", background:"white", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 12px", position:"sticky", top:0, zIndex:30}}>
        <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{width:"40px", height:"40px", borderRadius:"10px", border:"1px solid #e5e7eb", background:"white", fontSize:"18px"}}>☰</button>
          <div style={{width:"32px", height:"32px", background:"#111827", borderRadius:"8px", display:"grid", placeItems:"center", color:"white", fontWeight:800}}>H</div>
          <div><div style={{fontWeight:800, fontSize:"14px"}}>Hospital OS</div><div style={{fontSize:"10px", color:"#6b7280"}}>{email}</div></div>
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
          {TABS.map((t:any)=><button key={t.id} onClick={()=>{setTab(t.id); setMenuOpen(false);}} style={{textAlign:"left", padding:"14px", borderRadius:"12px", border:"none", background:tab===t.id?"white":"rgba(255,255,255,0.08)", color:tab===t.id?"#0b1220":"white", fontWeight:tab===t.id?700:500}}>{t.l}</button>)}
          <div style={{marginTop:"16px", padding:"12px", background:"rgba(255,255,255,0.06)", borderRadius:"12px", fontSize:"11px"}}><div>Patients: {patients.length}</div><div>Staff: {staff.length}</div><div>Beds: {beds.filter((b:any)=>b.status==="Available").length} avail</div></div>
        </aside>

        <main style={{flex:1, padding:"12px", paddingBottom:"90px", width:"100%", maxWidth:"100vw", boxSizing:"border-box"}}>
          <div style={{display:"flex", gap:"8px", overflowX:"auto", paddingBottom:"12px"}}>
            {TABS.map((t:any)=><button key={t.id} onClick={()=>setTab(t.id)} style={{whiteSpace:"nowrap", padding:"10px 14px", borderRadius:"20px", border:"1px solid #e5e7eb", background:tab===t.id?"#111827":"white", color:tab===t.id?"white":"#6b7280", fontWeight:600, fontSize:"13px"}}>{t.l}</button>)}
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
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>REVENUE</div><div style={{fontSize:"20px", fontWeight:800}}>₦{(billing.reduce((s:any,b:any)=>s+b.amount,0)/1000000).toFixed(1)}M</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>PATIENTS</div><div style={{fontSize:"20px", fontWeight:800}}>{patients.length}</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>STAFF</div><div style={{fontSize:"20px", fontWeight:800}}>{staff.length}</div></div>
                <div style={{background:"white", borderRadius:"14px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{fontSize:"10px", color:"#6b7280"}}>BEDS FREE</div><div style={{fontSize:"20px", fontWeight:800}}>{beds.filter((b:any)=>b.status==="Available").length}/{beds.length||0}</div></div>
              </div>
            </>
          )}

          {tab==="staff" && (
            <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Staff ({staff.length})</h3><button onClick={()=>setShowStaff(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add Staff</button></div>
              <div style={{marginTop:"12px"}}>{staff.map((s:any)=><div key={s.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><div style={{fontWeight:600}}>{s.name}</div><div style={{fontSize:"11px", color:"#6b7280"}}>{s.role} • {s.specialty}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:"#dcfce7"}}>{s.status}</span></div>)}</div>
            </div>
          )}

          {tab==="patients" && (
            <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}>
              <div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Patients ({patients.length})</h3><button onClick={()=>setShowPatient(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div>
              <div style={{marginTop:"12px"}}>{patients.map((p:any)=><div key={p.id} style={{padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><b>{p.name}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{p.id} • {p.ward}</div></div>)}</div>
            </div>
          )}

          {tab==="beds" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Beds ({beds.length})</h3><button onClick={()=>setShowBed(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add Bed</button></div><div style={{display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginTop:"12px"}}>{beds.map((b:any)=><div key={b.id} style={{padding:"12px", borderRadius:"12px", border:"1px solid #e5e7eb"}}><b>{b.id}</b><div style={{fontSize:"11px"}}>{b.ward} • {b.status}</div></div>)}</div></div>}

          {tab==="ambulance" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Ambulance ({ambulance.length})</h3><button onClick={()=>setShowAmbulance(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div><div style={{marginTop:"12px"}}>{ambulance.map((a:any)=><div key={a.id} style={{padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><b>{a.id}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{a.location} • {a.driver}</div></div>)}</div></div>}

          {tab==="equipment" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Equipment ({equipment.length})</h3><button onClick={()=>setShowEquipment(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Add</button></div><div style={{marginTop:"12px"}}>{equipment.map((e:any)=><div key={e.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{e.name||e.id}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{e.ward}</div></div><span style={{fontSize:"10px", padding:"4px 8px", borderRadius:"20px", background:"#dcfce7"}}>{e.status}</span></div>)}</div></div>}

          {tab==="labs" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><div style={{display:"flex", justifyContent:"space-between"}}><h3 style={{margin:0}}>Labs ({labs.length})</h3><button onClick={()=>setShowLab(true)} style={{padding:"10px 14px", background:"#111827", color:"white", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"12px"}}>+ Order</button></div><div style={{marginTop:"12px"}}>{labs.map((l:any)=><div key={l.id} style={{padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><b>{l.id} - {l.test}</b><div style={{fontSize:"11px", color:"#6b7280"}}>{l.patient}</div></div>)}</div></div>}

          {tab==="finance" && <div style={{background:"white", borderRadius:"16px", padding:"14px", border:"1px solid #e5e7eb"}}><h3 style={{margin:0}}>Billing</h3><div style={{marginTop:"12px"}}>{billing.map((b:any)=><div key={b.id} style={{display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:"1px solid #f3f4f6"}}><div><b>{b.id}</b> - {b.patient}</div><b>₦{b.amount?.toLocaleString()}</b></div>)}</div></div>}
        </main>
      </div>

      {showStaff && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Add Staff</h3><input value={newStaff.name} onChange={(e:any)=>setNewStaff({...newStaff, name:e.target.value})} placeholder="Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><input value={newStaff.email} onChange={(e:any)=>setNewStaff({...newStaff, email:e.target.value})} placeholder="Email" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><input type="password" value={newStaff.password} onChange={(e:any)=>setNewStaff({...newStaff, password:e.target.value})} placeholder="Password" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><button onClick={addStaff} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Create Staff ✅</button><button onClick={()=>setShowStaff(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}

      {showPatient && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Add Patient</h3><input value={newPatient.name} onChange={(e:any)=>setNewPatient({...newPatient, name:e.target.value})} placeholder="Name" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><button onClick={addPatient} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Admit</button><button onClick={()=>setShowPatient(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}

      {showAmbulance && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Add Ambulance</h3><input value={newAmbulance.location} onChange={(e:any)=>setNewAmbulance({...newAmbulance, location:e.target.value})} placeholder="Location" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><button onClick={addAmbulance} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add</button><button onClick={()=>setShowAmbulance(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}

      {showEquipment && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Add Equipment</h3><input value={newEquipment.name} onChange={(e:any)=>setNewEquipment({...newEquipment, name:e.target.value})} placeholder="Ventilator" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><button onClick={addEquipment} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add</button><button onClick={()=>setShowEquipment(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}

      {showBed && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Add Bed</h3><button onClick={addBed} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Add Bed</button><button onClick={()=>setShowBed(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}

      {showLab && <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"grid", placeItems:"center", zIndex:50, padding:"16px"}}><div style={{background:"white", borderRadius:"20px", padding:"20px", width:"100%", maxWidth:"360px"}}><h3>Order Lab</h3><input value={newLab.patient} onChange={(e:any)=>setNewLab({...newLab, patient:e.target.value})} placeholder="Patient ID" style={{width:"100%", padding:"12px", borderRadius:"10px", border:"1px solid #e5e7eb", marginTop:"10px", boxSizing:"border-box"}}/><button onClick={addLab} style={{marginTop:"14px", width:"100%", padding:"14px", background:"#111827", color:"white", border:"none", borderRadius:"12px", fontWeight:700}}>Order Lab</button><button onClick={()=>setShowLab(false)} style={{marginTop:"8px", width:"100%", padding:"10px", background:"#f3f4f6", border:"none", borderRadius:"10px"}}>Cancel</button></div></div>}
    </div>
  );
} 