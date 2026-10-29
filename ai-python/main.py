from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health(): return {"status": "Python AI running"}

@app.get("/api/ai/triage")
def triage(symptoms: str = "fever"):
    # Simple AI mock - replace with real model later
    risk = "High" if "chest" in symptoms.lower() else "Medium"
    return {"symptoms": symptoms, "risk": risk, "suggestion": f"Route to {risk} care", "confidence": 0.89}

@app.get("/api/ai/predict-bed")
def predict_bed():
    return {"icu_occupancy_next_24h": "88%", "recommended_action": "Open 2 beds"}