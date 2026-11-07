"use client";
import { useState, useMemo, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import HospitalUI from "./components";

export type Patient = { id: string; name: string; age: number; status: string; doctor: string; ward: string; avatar: string; date: string; };

const mockData: Patient[] = [
  { id: "P-1042", name: "Adebayo Johnson", age: 34, status: "Admitted", doctor: "Dr. Success Brownson", ward: "ICU-2", avatar: "AJ", date: "08:42" },
  { id: "P-1043", name: "Chioma Okoro", age: 28, status: "Stable", doctor: "Dr. Emeka", ward: "W-4", avatar: "CO", date: "09:12" },
];

const API_URL = (process.env as any).NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";
const REALTIME_URL = (process.env as any).NEXT_PUBLIC_REALTIME_URL || "https://hospital-os-realtime.onrender.com";

// FIX: API returns different shapes - normalize all
const norm = (d:any, key?:string) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (key && Array.isArray(d?.[key])) return d[key];
  if (Array.isArray(d?.patients)) return d.patients;
  if (Array.isArray(d?.items)) return d.items;
  return [];
};

export default function HospitalOSMobile() {
  const [active, setActive] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState<Patient[]>(mockData);
  const [staff, setStaff] = useState<any[]>([]);
  const [billing, setBilling] = useState<any[]>([]);
  const [aiData, setAiData] = useState<any>(null);
  const [beds, setBeds] = useState<any[]>([]);
  const [ambulance, setAmbulance] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [socket, setSocket] = useState<Socket|null>(null);
  const [chatType, setChatType] = useState<"ai"|"live"|null>(null);
  const [messages, setMessages] = useState<{user:string,text:string}[]>([{user:"System", text:"ICU-2 ward live — message doctors & nurses here"}]);
  const [aiMessages, setAiMessages] = useState<{user:string,text:string}[]>([{user:"AI Assistant", text:"Hello! Ask me about symptoms, ward, beds, or billing. I will suggest next steps."}]);
  const [chatInput, setChatInput] = useState("");
  const [userType, setUserType] = useState("");
  const [showAdmit, setShowAdmit] = useState(false);
  const [newPatient, setNewPatient] = useState({name:"", age:30, ward:"ICU-2", doctor:"Dr. Success Brownson"});

  useEffect(() => {
    setUserType(localStorage.getItem("user_type")||"guest");

    const get = async (path:string) => {
      try {
        const r = await fetch(`${API_URL}${path}`, {cache:'no-store'});
        if(!r.ok) return null;
        return await r.json();
      } catch { return null; }
    };

    const refreshAll = async () => {
      const p = await get("/api/patients");
      const list = norm(p, "patients");
      if(list.length>0) setPatients(list.map((x:any)=>({...x, avatar:x.avatar||x.name?.slice(0,2).toUpperCase()})));
      const s = await get("/api/staff"); if(s) setStaff(norm(s,"staff"));
      const b = await get("/api/billing"); if(b) setBilling(norm(b,"billing"));
      const ai = await get("/api/ai"); if(ai) setAiData(ai);
      const bd = await get("/api/beds"); if(bd) setBeds(norm(bd,"beds"));
      const am = await get("/api/ambulance"); if(am) setAmbulance(norm(am,"ambulance"));
      const eq = await get("/api/equipment"); if(eq) setEquipment(norm(eq,"equipment"));
      const lb = await get("/api/labs"); if(lb) setLabs(norm(lb,"labs"));
      setLoading(false);
    };

    refreshAll();

    // AUTO-REFRESH: Admin adds will show in 5s without reload
    const interval = setInterval(refreshAll, 5000);

    let s: Socket | null = null;
    try {
      s = io(REALTIME_URL, { transports: ['websocket','polling'] });
      s.on('ward-message', (d:any)=> setMessages(prev=>[...prev, {user:d.user||'Doctor', text:d.text||d.message}]));
      // LIVE UPDATE from Admin
      s.on('ambulance-updated', async ()=>{ const d = await get("/api/ambulance"); if(d) setAmbulance(norm(d,"ambulance")); });
      s.on('labs-updated', async ()=>{ const d = await get("/api/labs"); if(d) setLabs(norm(d,"labs")); });
      s.on('equipment-updated', async ()=>{ const d = await get("/api/equipment"); if(d) setEquipment(norm(d,"equipment")); });
      s.on('beds-updated', async ()=>{ const d = await get("/api/beds"); if(d) setBeds(norm(d,"beds")); });
      s.on('patients-updated', async ()=>{ const d = await get("/api/patients"); const l = norm(d,"patients"); if(l.length>0) setPatients(l); });
      setSocket(s);
    } catch {}

    return () => { clearInterval(interval); if(s) s.disconnect(); };
  }, []);

  const token = () => typeof window!=="undefined"?localStorage.getItem("token")||"":"";
  const isAdmin = userType==="admin";

  const admitPatient = async () => {
    if(!isAdmin) return alert("Admin only");
    if(!newPatient.name) return alert("Enter name");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const data=await res.json(); const one = data?.data || data; setPatients(prev=>[one, ...prev]); setShowAdmit(false); alert("Admitted "+(one.id||"")); }
    else alert("Failed - login as admin");
  };

  const sendLiveMessage = () => {
    if(!chatInput.trim()) return;
    if(socket?.connected) socket.emit('ward-message', { ward: 'ICU-2', user: 'You', text: chatInput });
    setMessages(prev => [...prev, {user:"You", text: chatInput}]);
    setChatInput("");
  };

  const askAI = async () => {
  if(!chatInput.trim()) return;
  const qText = chatInput;
  setAiMessages(prev=>[...prev, {user:"You", text:qText}]);
  setChatInput("");
  setAiMessages(prev=>[...prev, {user:"AI Assistant", text:"Thinking..."}]);

  try {
    const res = await fetch(`${API_URL}/api/ai/ask`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        question: qText,
        context: {
          bedsAvailable: beds.filter((b:any)=>b.status==="Available").length,
          bedsTotal: beds.length||8,
          billingTotal: billing.reduce((s:any,b:any)=>s+(b.amount||0),0),
          staffOnDuty: staff.filter((s:any)=>s.status==="On Duty").length,
          ambulanceAvailable: ambulance.filter((a:any)=>a.status==="Available").length,
          labsPending: labs.filter((l:any)=>l.status==="Pending").length,
          patientsCount: patients.length,
        }
      })
    });
    const data = await res.json();
    setAiMessages(prev=> prev.filter(m=>m.text!=="Thinking..."));
    setAiMessages(prev=>[...prev, {user:"AI Assistant", text: data.answer || "Sorry, try again with more detail."}]);
  } catch {
    setAiMessages(prev=> prev.filter(m=>m.text!=="Thinking..."));
    setAiMessages(prev=>[...prev, {user:"AI Assistant", text:"AI backend is offline. Try again, or use Live Ward Chat for doctors."}]);
  }
};

  const filtered = useMemo(()=> patients.filter(p=> (p.name+p.id).toLowerCase().includes(q.toLowerCase())), [q, patients]);

  return (
    <HospitalUI
      active={active} setActive={setActive} menuOpen={menuOpen} setMenuOpen={setMenuOpen} q={q} setQ={setQ}
      patients={patients} staff={staff} billing={billing} aiData={aiData} beds={beds} ambulance={ambulance} equipment={equipment} labs={labs}
      loading={loading} selected={selected} setSelected={setSelected} socket={socket}
      chatType={chatType} setChatType={setChatType} messages={messages} aiMessages={aiMessages}
      chatInput={chatInput} setChatInput={setChatInput} userType={userType} isAdmin={isAdmin}
      showAdmit={showAdmit} setShowAdmit={setShowAdmit} newPatient={newPatient} setNewPatient={setNewPatient}
      filtered={filtered} admitPatient={admitPatient} sendLiveMessage={sendLiveMessage} askAI={askAI}
    />
  );
}