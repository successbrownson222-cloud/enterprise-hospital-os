package main

import (
 "fmt"
 "log"
 "net/http"
 "time"
 "github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("super_secret_hospital_jwt_2026")

// ROLES FOR HOSPITAL
var Roles = []string{"ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST", "LAB_TECH", "PHARMACIST"}

func generateToken(userID, role string) (string, error) {
 claims := jwt.MapClaims{
  "user_id": userID,
  "role": role,
  "exp": time.Now().Add(time.Hour * 24).Unix(),
 }
 token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
 return token.SignedString(jwtSecret)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
 // Demo login - will connect to Postgres later
 token, _ := generateToken("user_123", "ADMIN")
 w.Header().Set("Content-Type", "application/json")
 fmt.Fprintf(w, `{"token":"%s","role":"ADMIN","message":"Hospital OS Auth Service Live"}`, token)
}

func main() {
 http.HandleFunc("/api/v1/auth/login", loginHandler)
 http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request){ w.Write([]byte("Go Auth Service OK")) })
 fmt.Println("Go Auth Service running on :4001 with RBAC:", Roles)
 log.Fatal(http.ListenAndServe(":4001", nil))
}