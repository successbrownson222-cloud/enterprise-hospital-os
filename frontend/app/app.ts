const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://enterprise-hospital-os.onrender.com";
const AI_URL = process.env.NEXT_PUBLIC_AI_API_URL || "https://hospital-os-ai-python.onrender.com";

// Fetch real patients from Go API
async function fetchPatients() {
  try {
    const res = await fetch(`${API_URL}/api/patients`);
    if(!res.ok) throw new Error("API down");
    const json = await res.json();
    return json.patients || json; // depends on Go response
  } catch(e) {
    console.log("Using mock, Go API not ready:", e);
    return data; // fallback to your mock
  }
}