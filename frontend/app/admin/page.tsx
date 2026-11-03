"use client";
import { useState, useEffect } from "react";
import AdminUI from "./components";

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
    else alert(data.error||"Login failed");
  };
  const signup = async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email:authForm.email, password:authForm.password, name:authForm.name, user_type:"admin"})});
    if(res.ok){ alert("Admin created! Login"); setAuthMode("login"); } else { const d=await res.json(); alert(d.error||"Failed"); }
  };
  const addStaff = async () => {
    if(!newStaff.email || !newStaff.password || !newStaff.name) return alert("Required");
    const res = await fetch(`${API_URL}/api/auth/register`, {method:"POST", headers:hdr(), body:JSON.stringify(newStaff)});
    const d = await res.json();
    if(res.ok){
      const newEntry = {id:d.id||`S-${Date.now()}`, name:`${newStaff.name} (${newStaff.email})`, role:newStaff.user_type, specialty:newStaff.specialty, status:"On Duty"};
      setStaff(prev=>[newEntry, ...prev]);
      setShowStaff(false);
      setNewStaff({email:"", password:"", name:"", user_type:"doctor", specialty:"ICU", role:"Doctor"});
      alert(`✅ Staff added!`);
      fetchAll();
    } else alert(d.error||"Failed");
  };
  const addPatient = async () => {
    if(!newPatient.name) return alert("Name required");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:hdr(), body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const d=await res.json(); setPatients(prev=>[d,...prev]); setShowPatient(false); }
  };
  const addAmbulance = async () => { const item={...newAmbulance, id:newAmbulance.id||`AMB-${Date.now().toString().slice(-3)}`, eta:"5 min", status:"Available"}; setAmbulance(prev=>[item,...prev]); setShowAmbulance(false); };
  const addEquipment = async () => { const item={...newEquipment, id:newEquipment.id||`EQ-${Date.now().toString().slice(-3)}`}; setEquipment(prev=>[item,...prev]); setShowEquipment(false); };
  const addBed = async () => { const item={...newBed, id:newBed.id||`B-${Date.now().toString().slice(-3)}`, patient:""}; setBeds(prev=>[item,...prev]); setShowBed(false); };
  const addLab = async () => { const item={id:`LAB-${Date.now().toString().slice(-3)}`, patient:newLab.patient, test:newLab.test, doctor:newLab.doctor, status:"Pending"}; setLabs(prev=>[item,...prev]); setShowLab(false); };

  return (
    <AdminUI
      menuOpen={menuOpen} setMenuOpen={setMenuOpen} tab={tab} setTab={setTab}
      patients={patients} staff={staff} billing={billing} beds={beds} ambulance={ambulance} equipment={equipment} labs={labs}
      loggedIn={loggedIn} email={email} authMode={authMode} setAuthMode={setAuthMode} authForm={authForm} setAuthForm={setAuthForm}
      showPatient={showPatient} setShowPatient={setShowPatient} showStaff={showStaff} setShowStaff={setShowStaff}
      showAmbulance={showAmbulance} setShowAmbulance={setShowAmbulance} showEquipment={showEquipment} setShowEquipment={setShowEquipment}
      showBed={showBed} setShowBed={setShowBed} showLab={showLab} setShowLab={setShowLab}
      newPatient={newPatient} setNewPatient={setNewPatient} newStaff={newStaff} setNewStaff={setNewStaff}
      newAmbulance={newAmbulance} setNewAmbulance={setNewAmbulance} newEquipment={newEquipment} setNewEquipment={setNewEquipment}
      newBed={newBed} setNewBed={setNewBed} newLab={newLab} setNewLab={setNewLab}
      login={login} signup={signup} addStaff={addStaff} addPatient={addPatient} addAmbulance={addAmbulance} addEquipment={addEquipment} addBed={addBed} addLab={addLab}
      setLoggedIn={setLoggedIn}
    />
  );
}