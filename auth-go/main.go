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
	ID string `json:"id"`; Name string `json:"name"`; Age int `json:"age"`; Status string `json:"status"`; Ward string `json:"ward"`; Doctor string `json:"doctor"`; CreatedAt time.Time `json:"created_at"`
}

var db *sql.DB

func initDB() {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		log.Println("No DATABASE_URL - using memory mode for local dev")
		return
	}
	var err error
	db, err = sql.Open("postgres", url)
	if err != nil { log.Fatal(err) }
	// Create table if not exists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS patients (
		id TEXT PRIMARY KEY, name TEXT, age INT, status TEXT, ward TEXT, doctor TEXT, created_at TIMESTAMP DEFAULT NOW()
	)`)
	if err != nil { log.Fatal(err) }
	log.Println("Postgres connected + table ready")
}

func main() {
	initDB()
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request){
		json.NewEncoder(w).Encode(map[string]string{"status":"ok", "db": func() string { if db!=nil {return "connected"} else {return "memory"} }() })
	})

	mux.HandleFunc("/api/patients", func(w http.ResponseWriter, r *http.Request){
		w.Header().Set("Content-Type","application/json")
		if db == nil { // fallback memory
			json.NewEncoder(w).Encode([]Patient{{ID:"P-1042", Name:"Adebayo (memory)", Status:"Admitted"}}); return
		}
		if r.Method == "GET" {
			rows, _ := db.Query("SELECT id,name,age,status,ward,doctor,created_at FROM patients ORDER BY created_at DESC")
			defer rows.Close()
			var list []Patient
			for rows.Next() { var p Patient; rows.Scan(&p.ID,&p.Name,&p.Age,&p.Status,&p.Ward,&p.Doctor,&p.CreatedAt); list = append(list,p) }
			json.NewEncoder(w).Encode(list)
		}
		if r.Method == "POST" {
			var p Patient; json.NewDecoder(r.Body).Decode(&p)
			_, err := db.Exec("INSERT INTO patients (id,name,age,status,ward,doctor) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO UPDATE SET status=$4, ward=$5", p.ID,p.Name,p.Age,p.Status,p.Ward,p.Doctor)
			if err != nil { http.Error(w, err.Error(), 500); return }
			json.NewEncoder(w).Encode(p)
		}
	})

	mux.HandleFunc("/api/patients/action", func(w http.ResponseWriter, r *http.Request){
		var req struct{ ID, Action, Ward string }
		json.NewDecoder(r.Body).Decode(&req)
		if db == nil { json.NewEncoder(w).Encode(req); return }
		if req.Action == "admit" { db.Exec("UPDATE patients SET status='Admitted' WHERE id=$1", req.ID) }
		if req.Action == "discharge" { db.Exec("UPDATE patients SET status='Discharged' WHERE id=$1", req.ID) }
		if req.Action == "transfer" { db.Exec("UPDATE patients SET ward=$1 WHERE id=$2", req.Ward, req.ID) }
		json.NewEncoder(w).Encode(map[string]string{"id":req.ID,"newStatus":req.Action})
	})

	mux.HandleFunc("/api/analytics", func(w http.ResponseWriter, r *http.Request){
		var count int
		if db != nil { db.QueryRow("SELECT COUNT(*) FROM patients").Scan(&count) }
		json.NewEncoder(w).Encode(map[string]any{"totalPatients":count,"bedOccupancy":84,"revenue":28400000})
	})

	handler := cors.AllowAll().Handler(mux)
	port := os.Getenv("PORT"); if port=="" {port="8080"}
	log.Println("Go API with Postgres on :"+port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}