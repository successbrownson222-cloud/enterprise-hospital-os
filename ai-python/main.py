from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hospital OS AI")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status":"AI running","models":["triage","bed-predict","diagnosis"]}

@app.get("/api/ai/triage")
def triage(symptoms: str, age: int = 30): 
    risk = "Critical" if any(x in symptoms.lower() for x in ["chest pain","bleeding","unconscious"]) else "Stable"
    return {"input": symptoms, "risk": risk, "ward": "ICU" if risk=="Critical" else "General", "confidence": 0.91}

@app.get("/api/ai/diagnosis-assist")
def diagnosis(symptoms: str): return {"possible": ["Malaria","Typhoid"], "tests": ["Blood test","Widal"], "urgency": "24h"}

@app.get("/api/ai/predict-bed")
def predict(): return {"next_24h": 88, "next_72h": 92, "action": "Prepare 2 ICU beds"}

@app.get("/api/ai/staff-optimize")
def staff(): return {"suggestion": "Move 2 nurses from Ward 4 to ICU", "efficiency_gain": "18%"}

@app.get("/api/ai/billing-anomaly")
def billing(): return {"anomalies": 2, "amount": "₦120,000", "status": "Flagged"}