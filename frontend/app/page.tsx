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
    const fetchAll = async () => {
      try {
        const p = await fetch(`${API_URL}/api/patients`, {cache:'no-store'}).then(r=>r.json());
        const list = p.patients||p.data||p;
        if(Array.isArray(list)&&list.length>0) setPatients(list.map((x:any)=>({...x, avatar:x.avatar||x.name?.slice(0,2).toUpperCase()})));
      } catch {}
      fetch(`${API_URL}/api/staff`, {cache:'no-store'}).then(r=>r.json()).then(d=>{if(Array.isArray(d)) setStaff(d)}).catch(()=>{});
      fetch(`${API_URL}/api/billing`, {cache:'no-store'}).then(r=>r.json()).then(d=>{if(Array.isArray(d)) setBilling(d)}).catch(()=>{});
      fetch(`${API_URL}/api/ai`, {cache:'no-store'}).then(r=>r.json()).then(setAiData).catch(()=>{});
      fetch(`${API_URL}/api/beds`, {cache:'no-store'}).then(r=>r.json()).then(setBeds).catch(()=>{});
      fetch(`${API_URL}/api/ambulance`, {cache:'no-store'}).then(r=>r.json()).then(setAmbulance).catch(()=>{});
      fetch(`${API_URL}/api/equipment`, {cache:'no-store'}).then(r=>r.json()).then(setEquipment).catch(()=>{});
      fetch(`${API_URL}/api/labs`, {cache:'no-store'}).then(r=>r.json()).then(setLabs).catch(()=>{});
      setLoading(false);
      try {
        const s = io(REALTIME_URL, { transports: ['websocket','polling'] });
        s.on('ward-message', (d:any)=> setMessages(prev=>[...prev, {user:d.user||'Doctor', text:d.text||d.message}]));
        setSocket(s);
      } catch {}
    };
    fetchAll();
  }, []);

  const token = () => typeof window!=="undefined"?localStorage.getItem("token")||"":"";
  const isAdmin = userType==="admin";

  const admitPatient = async () => {
    if(!isAdmin) return alert("Admin only");
    if(!newPatient.name) return alert("Enter name");
    const res = await fetch(`${API_URL}/api/patients`, {method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${token()}`}, body:JSON.stringify({...newPatient, status:"Admitted"})});
    if(res.ok){ const data=await res.json(); setPatients(prev=>[data, ...prev]); setShowAdmit(false); alert("Admitted "+data.id); }
    else alert("Failed - login as admin");
  };

  const sendLiveMessage = () => {
    if(!chatInput.trim()) return;
    if(socket?.connected) socket.emit('ward-message', { ward: 'ICU-2', user: 'You', text: chatInput });
    setMessages(prev => [...prev, {user:"You", text: chatInput}]);
    setChatInput("");
  };

  const askAI = () => {
    if(!chatInput.trim()) return;
    const q = chatInput;
    setAiMessages(prev=>[...prev, {user:"You", text:q}]);
    setChatInput("");
    // Smart suggestion based on keywords + AI predictions
    let reply = "Based on your question, I suggest: rest, monitor vitals, and contact ICU-2 nurse if symptoms worsen. For urgent care, use Live Ward Chat.";
    const low = q.toLowerCase();
    if(low.includes("fever")||low.includes("head")) reply = "For fever/headache: Check temperature, drink water, take paracetamol if prescribed. If fever > 39°C or severe headache, message Live Ward Chat immediately.";
    if(low.includes("bed")) reply = `Available beds: ${beds.filter((b:any)=>b.status==="Available").length} of ${beds.length||8}. Tap Beds tab to see wards.`;
    if(low.includes("bill")||low.includes("pay")||low.includes("cost")) reply = `Your total billing is ₦${billing.reduce((s:any,b:any)=>s+b.amount,0).toLocaleString()}. Open Billing tab for receipt.`;
    if(low.includes("doctor")||low.includes("nurse")) reply = `On-duty staff: ${staff.filter((s:any)=>s.status==="On Duty").length}. Open Staff tab to message them via Live Chat.`;
    setTimeout(()=> setAiMessages(prev=>[...prev, {user:"AI Assistant", text:reply}]), 600);
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