package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/cors"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
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

type User struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
	UserType string `json:"user_type"` // admin, doctor, nurse
	Name     string `json:"name"`
}

var db *sql.DB
var jwtSecret = []byte("hospital-os-super-secret-2026")

func initDB() {
	url := os.Getenv("DATABASE_URL")
	if s := os.Getenv("JWT_SECRET"); s != "" { jwtSecret = []byte(s) }
	if url == "" { log.Println("No DATABASE_URL - memory mode"); return }
	var err error
	db, err = sql.Open("postgres", url)
	if err != nil { log.Fatal(err) }
	if err = db.Ping(); err != nil { log.Println("DB ping failed:", err); db = nil; return }
	db.Exec(`CREATE TABLE IF NOT EXISTS patients (id TEXT PRIMARY KEY, name TEXT, age INT, status TEXT, ward TEXT, doctor TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS staff (id TEXT PRIMARY KEY, name TEXT, role TEXT, specialty TEXT, status TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS billing (id TEXT PRIMARY KEY, patient_id TEXT, patient TEXT, amount INT, status TEXT, date TEXT, details TEXT, method TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, user_type TEXT, name TEXT, created_at TIMESTAMP DEFAULT NOW())`)
	db.Exec(`CREATE TABLE IF NOT EXISTS beds (id TEXT PRIMARY KEY, ward TEXT, status TEXT, patient TEXT, type TEXT)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS ambulance (id TEXT PRIMARY KEY, status TEXT, location TEXT, eta TEXT, driver TEXT, plate TEXT)`)
	log.Println("Postgres connected + all tables ready")
}

func hashPassword(pw string) string { h,_ := bcrypt.GenerateFromPassword([]byte(pw), 10); return string(h) }
func checkPassword(hash, pw string) bool { return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil }

func createToken(u User) string {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": u.ID, "email": u.Email, "user_type": u.UserType, "exp": time.Now().Add(time.Hour * 72).Unix(),
	})
	s,_ := token.SignedString(jwtSecret)
	return s
}

func authMiddleware(next http.HandlerFunc, requireAdmin bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" { auth = r.URL.Query().Get("token") }
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		if tokenStr == "" {
			if !requireAdmin { next(w,r); return } // allow public for some
			w.WriteHeader(401); json.NewEncoder(w).Encode(map[string]string{"error":"unauthorized"}); return
		}
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) { return jwtSecret, nil })
		if err != nil || !token.Valid { w.WriteHeader(401); json.NewEncoder(w).Encode(map[string]string{"error":"invalid token"}); return }
		claims := token.Claims.(jwt.MapClaims)
		if requireAdmin && claims["user_type"] != "admin" {
			w.WriteHeader(403); json.NewEncoder(w).Encode(map[string]string{"error":"admin only"}); return
		}
		r.Header.Set("X-User-Type", claims["user_type"].(string))
		next(w,r)
	}
}

func main() {
	initDB()
	mux := http.NewServeMux()

	// CORS headers helper
	setCORS := func(w http.ResponseWriter) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	}

	// HEALTH
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok", "db": func() string { if db != nil { return "connected" } else { return "memory" } }(), "time": time.Now().Format(time.RFC3339)})
	})

	// AUTH: REGISTER - ADMIN ONLY AFTER FIRST ADMIN
	mux.HandleFunc("/api/auth/register", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		var req struct{ Email, Password, Name, UserType string }
		json.NewDecoder(r.Body).Decode(&req)
		if req.Email == "" || req.Password == "" { w.WriteHeader(400); json.NewEncoder(w).Encode(map[string]string{"error":"email password required"}); return }
		if db == nil { json.NewEncoder(w).Encode(map[string]string{"message":"registered memory mode", "token":"mock-token-admin"}); return }

		// Check admin count
		var adminCount int
		db.QueryRow("SELECT COUNT(*) FROM users WHERE user_type='admin'").Scan(&adminCount)
		if adminCount > 0 {
			// require admin token
			auth := r.Header.Get("Authorization")
			tokenStr := strings.TrimPrefix(auth, "Bearer ")
			if tokenStr == "" { w.WriteHeader(403); json.NewEncoder(w).Encode(map[string]string{"error":"Only admin can register. Login as admin."}); return }
			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) { return jwtSecret, nil })
			if err != nil || !token.Valid { w.WriteHeader(403); json.NewEncoder(w).Encode(map[string]string{"error":"admin auth required"}); return }
			if token.Claims.(jwt.MapClaims)["user_type"] != "admin" { w.WriteHeader(403); json.NewEncoder(w).Encode(map[string]string{"error":"admin only"}); return }
		}
		if req.UserType == "" { req.UserType = "doctor" }
		id := "U-" + time.Now().Format("150405")
		_, err := db.Exec("INSERT INTO users (id,email,password,user_type,name) VALUES ($1,$2,$3,$4,$5)", id, req.Email, hashPassword(req.Password), req.UserType, req.Name)
		if err != nil { w.WriteHeader(400); json.NewEncoder(w).Encode(map[string]string{"error": err.Error()}); return }
		u := User{ID: id, Email: req.Email, UserType: req.UserType, Name: req.Name}
		json.NewEncoder(w).Encode(map[string]string{"token": createToken(u), "user_type": u.UserType, "id": id})
	})

	mux.HandleFunc("/api/auth/login", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		var req struct{ Email, Password string }
		json.NewDecoder(r.Body).Decode(&req)
		if db == nil {
			if req.Email == "admin@hospital.com" { json.NewEncoder(w).Encode(map[string]string{"token":"mock-admin","user_type":"admin"}); return }
			json.NewEncoder(w).Encode(map[string]string{"token":"mock-doctor","user_type":"doctor"}); return
		}
		var u User
		var pw string
		err := db.QueryRow("SELECT id,email,password,user_type,name FROM users WHERE email=$1", req.Email).Scan(&u.ID, &u.Email, &pw, &u.UserType, &u.Name)
		if err != nil || !checkPassword(pw, req.Password) { w.WriteHeader(401); json.NewEncoder(w).Encode(map[string]string{"error":"invalid credentials"}); return }
		json.NewEncoder(w).Encode(map[string]any{"token": createToken(u), "user_type": u.UserType, "name": u.Name, "id": u.ID})
	})

	// PATIENTS
	mux.HandleFunc("/api/patients", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
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
			// ADMIN ONLY ADMIT
			authMiddleware(func(w http.ResponseWriter, r *http.Request){
				var p Patient
				json.NewDecoder(r.Body).Decode(&p)
				if p.ID == "" { p.ID = "P-" + time.Now().Format("150405") }
				if p.Status == "" { p.Status = "Admitted" }
				if db != nil { db.Exec("INSERT INTO patients (id,name,age,status,ward,doctor) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET status=$4, ward=$5", p.ID, p.Name, p.Age, p.Status, p.Ward, p.Doctor) }
				json.NewEncoder(w).Encode(p)
			}, true)(w,r)
		}
	})

	// STAFF
	mux.HandleFunc("/api/staff", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		list := []map[string]string{
			{"id": "S-1", "name": "Dr. Success Brownson", "role": "Doctor", "specialty": "ICU", "status": "On Duty"},
			{"id": "S-2", "name": "Dr. Aisha Bello", "role": "Nurse", "specialty": "ER", "status": "On Duty"},
			{"id": "S-3", "name": "Dr. Emeka", "role": "Doctor", "specialty": "General", "status": "Off Duty"},
		}
		json.NewEncoder(w).Encode(list)
	})

	mux.HandleFunc("/api/billing", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "INV-001", "patient": "Adebayo Johnson", "patient_id": "P-1042", "amount": 450000, "status": "Paid", "date": time.Now().Format("2006-01-02"), "details": "ICU 3 days + Ventilator + Labs", "method": "Transfer"},
			{"id": "INV-002", "patient": "Chioma Okoro", "patient_id": "P-1043", "amount": 120000, "status": "Pending", "date": time.Now().Format("2006-01-02"), "details": "Ward W-4 + CBC Lab", "method": "Cash"},
			{"id": "INV-003", "patient": "Musa Ibrahim", "patient_id": "P-1044", "amount": 890000, "status": "Paid", "date": time.Now().Format("2006-01-02"), "details": "ER + CT Scan + Emergency", "method": "Card"},
		})
	})

	mux.HandleFunc("/api/ai", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode(map[string]any{
			"predictions": []map[string]any{
				{"patient": "P-1044 Musa Ibrahim", "risk": "High", "condition": "Sepsis Risk", "confidence": 87, "action": "Immediate blood culture + antibiotics", "vitals": "BP 90/60, HR 115, Temp 39.2C"},
				{"patient": "P-1042 Adebayo Johnson", "risk": "Medium", "condition": "Readmission Likely", "confidence": 64, "action": "Schedule follow-up in 7 days", "vitals": "Stable but low SpO2 91%"},
				{"patient": "P-1043 Chioma Okoro", "risk": "Low", "condition": "Stable - Ready for Discharge", "confidence": 92, "action": "Discharge tomorrow", "vitals": "All normal"},
			},
			"bedOccupancy": 84, "revenueForecast": 28400000, "aiStatus": "Active",
		})
	})

	// ENTERPRISE
	mux.HandleFunc("/api/beds", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		if r.Method == "GET" {
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
			return
		}
	})

	// ACTIONS - make clickable work
	mux.HandleFunc("/api/beds/", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 4 && parts[3] == "assign" {
			json.NewEncoder(w).Encode(map[string]string{"status":"assigned", "bed": parts[2]})
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"status":"ok"})
	})

	mux.HandleFunc("/api/ambulance", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "AMB-01", "status": "Available", "location": "Lagos Main", "eta": "5 min", "driver": "John O.", "plate": "LND-234AB"},
			{"id": "AMB-02", "status": "On Mission", "location": "Ikeja - En route", "eta": "12 min", "driver": "Emeka K.", "plate": "LND-511XY"},
			{"id": "AMB-03", "status": "Available", "location": "VI", "eta": "3 min", "driver": "Aisha T.", "plate": "LND-902CD"},
		})
	})

	mux.HandleFunc("/api/ambulance/", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode(map[string]string{"status":"dispatched"})
	})

	mux.HandleFunc("/api/equipment", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "EQ-VEN-01", "name": "Ventilator Philips V60", "ward": "ICU-2", "status": "In Use", "lastService": "2026-10-20", "nextService": "2026-12-20"},
			{"id": "EQ-MON-02", "name": "Patient Monitor Mindray", "ward": "W-4", "status": "Available", "lastService": "2026-11-01", "nextService": "2026-12-01"},
			{"id": "EQ-XRAY-01", "name": "Mobile X-Ray GE", "ward": "ER-1", "status": "Maintenance", "lastService": "2026-10-28", "nextService": "2026-11-05"},
			{"id": "EQ-DEF-01", "name": "Defibrillator Zoll", "ward": "ER-1", "status": "Available", "lastService": "2026-11-02", "nextService": "2026-12-02"},
		})
	})

	mux.HandleFunc("/api/labs", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode([]map[string]any{
			{"id": "LAB-1001", "patient": "P-1042 Adebayo", "test": "Blood Culture", "status": "Completed", "result": "Negative - No growth", "doctor": "Dr. Brownson"},
			{"id": "LAB-1002", "patient": "P-1044 Musa", "test": "CT Scan Chest", "status": "Pending", "result": "In Progress - Radiology", "doctor": "Dr. Aisha"},
			{"id": "LAB-1003", "patient": "P-1043 Chioma", "test": "CBC + Electrolytes", "status": "Completed", "result": "Normal WBC 7.2, Hb 12.4", "doctor": "Dr. Emeka"},
		})
	})

	mux.HandleFunc("/api/billing/", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		json.NewEncoder(w).Encode(map[string]string{"status":"paid"})
	})

	mux.HandleFunc("/api/analytics", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		var count int
		if db != nil { db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&count) } else { count = 4 }
		json.NewEncoder(w).Encode(map[string]any{"totalPatients": count, "bedOccupancy": 75, "availableBeds": 3, "revenue": 1690000, "staffOnDuty": 3, "availableAmbulance": 2})
	})

	mux.HandleFunc("/api/patients/action", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		var req struct{ ID, Action, Ward string }
		json.NewDecoder(r.Body).Decode(&req)
		if db != nil {
			if req.Action == "admit" { db.Exec("UPDATE patients SET status='Admitted' WHERE id=$1", req.ID) }
			if req.Action == "discharge" { db.Exec("UPDATE patients SET status='Discharged' WHERE id=$1", req.ID) }
		}
		json.NewEncoder(w).Encode(map[string]string{"id": req.ID, "newStatus": req.Action})
	})

	mux.HandleFunc("/api/seed", func(w http.ResponseWriter, r *http.Request) {
		setCORS(w)
		if db == nil { json.NewEncoder(w).Encode(map[string]string{"error": "db not connected"}); return }
		db.Exec("INSERT INTO users (id,email,password,user_type,name) VALUES ('U-ADMIN','admin@hospital.com',$1,'admin','Super Admin') ON CONFLICT (email) DO NOTHING", hashPassword("Admin123!"))
		db.Exec("INSERT INTO patients (id,name,age,status,ward,doctor) VALUES ('P-1042','Adebayo Johnson',34,'Admitted','ICU-2','Dr. Success Brownson') ON CONFLICT (id) DO NOTHING")
		json.NewEncoder(w).Encode(map[string]any{"seeded": true, "admin": "admin@hospital.com / Admin123!"})
	})

	handler := cors.AllowAll().Handler(mux)
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	log.Println("Go API Enterprise LIVE on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}