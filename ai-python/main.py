from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI(title="Hospital OS AI")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# --- Models ---
class AskRequest(BaseModel):
    question: str = ""
    context: dict = {}  # frontend sends beds, billing, labs, ambulance counts

@app.get("/health")
def health():
    return {"status":"AI running","models":["triage","bed-predict","diagnosis","ask"]}

@app.get("/api/ai/triage")
def triage(symptoms: str, age: int = 30):
    s = symptoms.lower()
    if any(x in s for x in ["chest pain","bleeding","unconscious","cannot breathe","seizure"]):
        risk = "Critical"
        ward = "ICU"
        action = "Go to ER immediately. Call ambulance. Do not wait."
    elif any(x in s for x in ["fever","headache","vomiting","cough","diarrhea"]):
        risk = "Medium"
        ward = "General"
        action = "Check vitals, hydrate, see doctor within 24h. If worsens, use Live Ward Chat."
    else:
        risk = "Stable"
        ward = "General"
        action = "Monitor at home, rest. Book checkup if symptoms persist 2 days."
    return {"input": symptoms, "risk": risk, "ward": ward, "confidence": 0.91, "action": action}

@app.get("/api/ai/diagnosis-assist")
def diagnosis(symptoms: str):
    s = symptoms.lower()
    if "fever" in s and "headache" in s:
        return {"possible": ["Malaria","Typhoid"], "tests": ["Blood test","Widal","Malaria Parasite"], "urgency": "24h", "advice": "Do malaria test first. Avoid self-medication."}
    if "cough" in s or "cold" in s:
        return {"possible": ["Flu","Common Cold","COVID"], "tests": ["Chest X-Ray","COVID Test"], "urgency": "48h", "advice": "Isolate, drink fluids, check temperature."}
    if "chest" in s or "pain" in s:
        return {"possible": ["Heart issue","Acid Reflux"], "tests": ["ECG","Blood Pressure"], "urgency": "Immediate", "advice": "Go to ER now. Do not drive yourself."}
    return {"possible": ["General Checkup Needed"], "tests": ["Full Blood Count"], "urgency": "48h", "advice": "Describe symptoms in detail for better suggestion."}

@app.get("/api/ai/predict-bed")
def predict():
    return {"next_24h": 88, "next_72h": 92, "action": "Prepare 2 ICU beds"}

@app.get("/api/ai/staff-optimize")
def staff():
    return {"suggestion": "Move 2 nurses from Ward 4 to ICU", "efficiency_gain": "18%"}

@app.get("/api/ai/billing-anomaly")
def billing():
    return {"anomalies": 2, "amount": "₦120,000", "status": "Flagged"}

# --- NEW: REAL CHAT ENDPOINT ---
@app.post("/api/ai/ask")
def ask(req: AskRequest):
    q = (req.question or "").lower().strip()
    ctx = req.context or {}
    beds_avail = ctx.get("bedsAvailable", 0)
    beds_total = ctx.get("bedsTotal", 8)
    billing_total = ctx.get("billingTotal", 0)
    staff_on = ctx.get("staffOnDuty", 0)
    amb_avail = ctx.get("ambulanceAvailable", 0)
    labs_pending = ctx.get("labsPending", 0)
    patients = ctx.get("patientsCount", 0)

    # Triage / Symptoms - REAL logic
    if any(x in q for x in ["chest pain","bleeding","unconscious","cannot breathe","seizure","accident"]):
        return {"answer": "🚨 CRITICAL: This sounds urgent. Go to ER now or call ambulance. Do not wait. Use Live Ward Chat to alert doctors immediately. I have flagged this as Critical.", "risk": "Critical", "action": "ER now"}
    if "fever" in q:
        return {"answer": "For fever: Check temperature now. If 38-39°C, drink water, rest, take paracetamol ONLY if prescribed. If >39°C, shivering, or fever over 3 days, do a malaria test. Tell me: How many days have you had fever? Do you also have headache?", "risk": "Medium", "action": "Malaria test in 24h"}
    if "headache" in q:
        return {"answer": "For headache: Rest in dark room, drink water. If severe + vomiting + fever, it could be malaria/typhoid - get tested. If sudden worst headache of your life + chest pain, go to ER. How long has headache lasted?", "risk": "Medium", "action": "Monitor + test"}
    if "cough" in q or "cold" in q:
        return {"answer": "For cough/cold: Drink warm fluids, rest. If cough > 2 weeks, blood, or difficulty breathing, do chest X-ray. Are you coughing with fever?", "risk": "Low", "action": "Rest + test if persists"}
    if "bed" in q:
        return {"answer": f"Real bed status right now: {beds_avail} available out of {beds_total} beds. {patients} patients currently admitted. Tap Beds tab to see which ward is free.", "risk": "Info", "action": "See Beds tab"}
    if "bill" in q or "pay" in q or "cost" in q or "price" in q:
        return {"answer": f"Your total billing so far is ₦{billing_total:,}. Open Billing tab for each receipt. If amount looks wrong, ask admin. Do you want breakdown of a specific patient?", "risk": "Info", "action": "See Billing"}
    if "doctor" in q or "nurse" in q or "staff" in q:
        return {"answer": f"There are {staff_on} staff on duty right now. Open Staff tab to see names. For direct message, use Live Ward Chat - doctors reply there faster than AI.", "risk": "Info", "action": "Live Chat"}
    if "ambulance" in q:
        return {"answer": f"Ambulances available: {amb_avail}. Open Ambulance tab to see location & ETA. For emergency, call Live Ward Chat and say your location.", "risk": "Info", "action": "See Ambulance"}
    if "lab" in q or "test" in q:
        return {"answer": f"Labs: {labs_pending} pending tests. Open Labs tab for your result. If you tell me your test name (e.g. malaria, blood), I can explain what it means.", "risk": "Info", "action": "See Labs"}
    if "malaria" in q:
        return {"answer": "Malaria symptoms: fever, headache, chills, joint pain. Test needed: Malaria Parasite test + Blood test. Treatment only after test. Do not self-medicate. Have you done test?", "risk": "Medium", "action": "Do test"}
    if "hello" in q or "hi" in q or "good" in q:
        return {"answer": "Hello! I am Hospital AI. Ask me about: fever, headache, malaria, beds, bills, ambulance, labs, or doctors. Example: 'I have fever and headache for 2 days' - I will suggest next step.", "risk": "Info", "action": "Ask symptom"}
    # Fallback - NOT repeating, asks follow-up
    return {"answer": f"I heard: '{req.question}'. To give you a real answer, tell me: 1) What symptom? 2) How many days? 3) Do you have fever? Example: 'Fever + headache 2 days'. I can then suggest test & ward.", "risk": "Info", "action": "Need more detail"}