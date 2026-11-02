package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/rs/cors"
	_ "github.com/lib/pq"
)

type Patient struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Age       int       `json:"age"`
	Status    string    `json:"status"`
	Ward      string    `json:"ward"`
	Doctor    string    `json:"doctor"`
	CreatedAt time.Time `json:"created_at"`
	Avatar    string    `json:"avatar"`
}

var db *sql.DB

func initDB() {
	url := os.Getenv("DATABASE_URL")
	if url == "" { log.Println("No DATABASE_URL - memory mode"); return }
	var err error
	db, err = sql.Open("postgres", url)
	if err != nil { log.Fatal(err) }
	if err = db.Ping(); err != nil { log.Println("DB ping failed:", err); db = nil; return }
	db.Exec(`CREATE TABLE IF NOT EXISTS patients (id TEXT PRIMARY KEY, name TEXT, age INT, status TEXT, ward TEXT, doctor TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS staff (id TEXT PRIMARY KEY, name TEXT, role TEXT, specialty TEXT, status TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS billing (id TEXT PRIMARY KEY, patient_id TEXT, amount INT, status TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	log.Println("Postgres connected + all tables ready")
}

func main() {
	initDB()
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "db": func() string { if db != nil { return "connected" } else { return "memory" } }(), "time": time.Now().Format(time.RFC3339)})
	})

	mux.HandleFunc("/api/patients", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		if r.Method == "GET" {
			if db == nil {
				json.NewEncoder(w).Encode([]Patient{{ID: "P-1042", Name: "Adebayo Johnson", Status: "Admitted", Ward: "ICU-2"}})
				return
			}
			rows, _ := db.Query("SELECT id,name,age,status,ward,doctor,created_at FROM patients ORDER BY created_at DESC")
			if rows == nil { json.NewEncoder(w).Encode([]Patient{}); return }
			defer rows.Close()
			list := []Patient{}
			for rows.Next() { var p Patient; rows.Scan(&p.ID, &p.Name, &p.Age, &p.Status, &p.Ward, &p.Doctor, &p.CreatedAt); p.Avatar = string([]rune(p.Name)[:2]); list = append(list, p) }
			json.NewEncoder(w).Encode(list)
			return
		}
		if r.Method == "POST" {
			var p Patient
			json.NewDecoder(r.Body).Decode(&p)
			if p.ID == "" { p.ID = "P-" + time.Now().Format("150405") }
			if db != nil { db.Exec("INSERT INTO patients (id,name,age,status,ward,doctor) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET status=$4", p.ID, p.Name, p.Age, p.Status, p.Ward, p.Doctor) }
			json.NewEncoder(w).Encode(p)
		}
	})

	mux.HandleFunc("/api/staff", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		list := []map[string]string{
			{"id": "S-1", "name": "Dr. Success Brownson", "role": "Doctor", "specialty": "ICU", "status": "On Duty"},
			{"id": "S-2", "name": "Dr. Aisha Bello", "role": "Nurse", "specialty": "ER", "status": "On Duty"},
			{"id": "S-3", "name": "Dr. Emeka", "role": "Doctor", "specialty": "General", "status": "Off Duty"},
		}
		if db != nil {
			if rows, err := db.Query("SELECT id,name,role,specialty,status FROM staff ORDER BY created_at DESC"); err == nil && rows != nil {
				defer rows.Close()
				tmp := []map[string]string{}
				for rows.Next() { var id, name, role, specialty, status string; rows.Scan(&id, &name, &role, &specialty, &status); tmp = append(tmp, map[string]string{"id": id, "name": name, "role": role, "specialty": specialty, "status": status}) }
				if len(tmp) > 0 { list = tmp }
			}
		}
		json.NewEncoder(w).Encode(list)
	})

	mux.HandleFunc("/api/billing", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "INV-001", "patient": "Adebayo Johnson", "patient_id": "P-1042", "amount": 450000, "status": "Paid", "date": time.Now().Format("2006-01-02"), "details": "ICU 3 days + Ventilator + Labs", "method": "Transfer"},
			{"id": "INV-002", "patient": "Chioma Okoro", "patient_id": "P-1043", "amount": 120000, "status": "Pending", "date": time.Now().Format("2006-01-02"), "details": "Ward W-4 + CBC Lab", "method": "Cash"},
			{"id": "INV-003", "patient": "Musa Ibrahim", "patient_id": "P-1044", "amount": 890000, "status": "Paid", "date": time.Now().Format("2006-01-02"), "details": "ER + CT Scan + Emergency", "method": "Card"},
			{"id": "INV-004", "patient": "Grace Eze", "patient_id": "P-1045", "amount": 230000, "status": "Paid", "date": time.Now().Format("2006-01-02"), "details": "W-2 + Monitoring", "method": "Transfer"},
		})
	})

	mux.HandleFunc("/api/ai", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode(map[string]any{
			"predictions": []map[string]any{
				{"patient": "P-1044 Musa Ibrahim", "risk": "High", "condition": "Sepsis Risk", "confidence": 87, "action": "Immediate blood culture + antibiotics", "vitals": "BP 90/60, HR 115"},
				{"patient": "P-1042 Adebayo Johnson", "risk": "Medium", "condition": "Readmission Likely", "confidence": 64, "action": "Schedule follow-up in 7 days", "vitals": "Stable but low SpO2"},
				{"patient": "P-1043 Chioma Okoro", "risk": "Low", "condition": "Stable - Ready for Discharge", "confidence": 92, "action": "Discharge tomorrow", "vitals": "All normal"},
			},
			"bedOccupancy": 84, "revenueForecast": 28400000, "aiStatus": "Active",
		})
	})

	// NEW ENTERPRISE MODULES
	mux.HandleFunc("/api/beds", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "B-ICU-01", "ward": "ICU-2", "status": "Occupied", "patient": "P-1042 Adebayo", "type": "ICU Ventilator"},
			{"id": "B-ICU-02", "ward": "ICU-2", "status": "Available", "patient": "", "type": "ICU Ventilator"},
			{"id": "B-W4-01", "ward": "W-4", "status": "Occupied", "patient": "P-1043 Chioma", "type": "General"},
			{"id": "B-W4-02", "ward": "W-4", "status": "Available", "patient": "", "type": "General"},
			{"id": "B-ER-01", "ward": "ER-1", "status": "Occupied", "patient": "P-1044 Musa", "type": "Emergency"},
			{"id": "B-ER-02", "ward": "ER-1", "status": "Cleaning", "patient": "", "type": "Emergency"},
			{"id": "B-W2-01", "ward": "W-2", "status": "Occupied", "patient": "P-1045 Grace", "type": "General"},
			{"id": "B-W2-02", "ward": "W-2", "status": "Available", "patient": "", "type": "General"},
		})
	})

	mux.HandleFunc("/api/ambulance", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "AMB-01", "status": "Available", "location": "Lagos Main", "eta": "5 min", "driver": "John O.", "plate": "LND-234AB"},
			{"id": "AMB-02", "status": "On Mission", "location": "Ikeja - En route", "eta": "12 min", "driver": "Emeka K.", "plate": "LND-511XY"},
			{"id": "AMB-03", "status": "Available", "location": "VI", "eta": "3 min", "driver": "Aisha T.", "plate": "LND-902CD"},
		})
	})

	mux.HandleFunc("/api/equipment", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "EQ-VEN-01", "name": "Ventilator Philips V60", "ward": "ICU-2", "status": "In Use", "lastService": "2026-10-20", "nextService": "2026-12-20"},
			{"id": "EQ-MON-02", "name": "Patient Monitor Mindray", "ward": "W-4", "status": "Available", "lastService": "2026-11-01", "nextService": "2026-12-01"},
			{"id": "EQ-XRAY-01", "name": "Mobile X-Ray GE", "ward": "ER-1", "status": "Maintenance", "lastService": "2026-10-28", "nextService": "2026-11-05"},
			{"id": "EQ-DEF-01", "name": "Defibrillator Zoll", "ward": "ER-1", "status": "Available", "lastService": "2026-11-02", "nextService": "2026-12-02"},
			{"id": "EQ-INF-05", "name": "Infusion Pump", "ward": "ICU-2", "status": "Available", "lastService": "2026-11-02", "nextService": "2026-12-02"},
		})
	})

	mux.HandleFunc("/api/labs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "LAB-1001", "patient": "P-1042 Adebayo", "test": "Blood Culture", "status": "Completed", "result": "Negative - No growth", "doctor": "Dr. Brownson"},
			{"id": "LAB-1002", "patient": "P-1044 Musa", "test": "CT Scan Chest", "status": "Pending", "result": "In Progress - Radiology", "doctor": "Dr. Aisha"},
			{"id": "LAB-1003", "patient": "P-1043 Chioma", "test": "CBC + Electrolytes", "status": "Completed", "result": "Normal WBC 7.2, Hb 12.4", "doctor": "Dr. Emeka"},
			{"id": "LAB-1004", "patient": "P-1045 Grace", "test": "Malaria Parasite", "status": "Completed", "result": "Positive - Treatment started", "doctor": "Dr. Brownson"},
		})
	})

	mux.HandleFunc("/api/doctors", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		json.NewEncoder(w).Encode([]map[string]string{{"id": "D1", "name": "Dr. Success Brownson", "specialty": "ICU"}, {"id": "D2", "name": "Dr. Emeka", "specialty": "General"}})
	})

	mux.HandleFunc("/api/analytics", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		var count int
		if db != nil { db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&count) } else { count = 4 }
		json.NewEncoder(w).Encode(map[string]any{"totalPatients": count, "bedOccupancy": 75, "availableBeds": 3, "revenue": 1690000, "staffOnDuty": 3, "availableAmbulance": 2})
	})

	mux.HandleFunc("/api/patients/action", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		var req struct{ ID, Action, Ward string }
		json.NewDecoder(r.Body).Decode(&req)
		if db != nil {
			if req.Action == "admit" { db.Exec("UPDATE patients SET status='Admitted' WHERE id=$1", req.ID) }
			if req.Action == "discharge" { db.Exec("UPDATE patients SET status='Discharged' WHERE id=$1", req.ID) }
			if req.Action == "transfer" { db.Exec("UPDATE patients SET ward=$1 WHERE id=$2", req.Ward, req.ID) }
		}
		json.NewEncoder(w).Encode(map[string]string{"id": req.ID, "newStatus": req.Action})
	})

	mux.HandleFunc("/api/seed", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if db == nil { json.NewEncoder(w).Encode(map[string]string{"error": "db not connected"}); return }
		db.Exec("INSERT INTO staff (id,name,role,specialty,status) VALUES ('S-1','Dr. Success Brownson','Doctor','ICU','On Duty') ON CONFLICT (id) DO NOTHING")
		db.Exec("INSERT INTO staff (id,name,role,specialty,status) VALUES ('S-2','Dr. Aisha Bello','Nurse','ER','On Duty') ON CONFLICT (id) DO NOTHING")
		db.Exec("INSERT INTO staff (id,name,role,specialty,status) VALUES ('S-3','Dr. Emeka','Doctor','General','Off Duty') ON CONFLICT (id) DO NOTHING")
		patients := []Patient{{ID: "P-1042", Name: "Adebayo Johnson", Age: 34, Status: "Admitted", Ward: "ICU-2", Doctor: "Dr. Success Brownson"}, {ID: "P-1043", Name: "Chioma Okoro", Age: 28, Status: "Stable", Ward: "W-4", Doctor: "Dr. Emeka"}, {ID: "P-1044", Name: "Musa Ibrahim", Age: 45, Status: "Critical", Ward: "ER-1", Doctor: "Dr. Aisha Bello"}, {ID: "P-1045", Name: "Grace Eze", Age: 31, Status: "Admitted", Ward: "W-2", Doctor: "Dr. Success Brownson"}}
		c := 0
		for _, p := range patients {
			_, err := db.Exec("INSERT INTO patients (id,name,age,status,ward,doctor) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING", p.ID, p.Name, p.Age, p.Status, p.Ward, p.Doctor)
			if err == nil { c++ }
		}
		json.NewEncoder(w).Encode(map[string]any{"seeded": c, "message": "All tables seeded"})
	})

	handler := cors.AllowAll().Handler(mux)
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	log.Println("Go API on :" + port + " - Enterprise modules LIVE")
	log.Fatal(http.ListenAndServe(":"+port, handler))
}