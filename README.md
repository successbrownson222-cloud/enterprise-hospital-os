# 🏥 ENTERPRISE HOSPITAL OS
> Polyglot Microservices | HIPAA-Ready | Real-time Command Center

Live Demo: `ehms.vercel.app` | API Docs: `api.ehms.com/docs`

### Architecture
Next.js (Frontend) -> NestJS Core API -> Go Auth Service + Python AI Service
PostgreSQL + Redis + S3 + Socket.io

### Tech Stack
- **Frontend:** Next.js 14, TypeScript, Tailwind, Shadcn UI
- **Auth Service:** Golang, JWT, 2FA, RBAC (6 roles)
- **Core API:** NestJS, TypeORM, Swagger
- **AI Service:** Python FastAPI, Whisper, Analytics
- **Data:** PostgreSQL, Redis, AWS S3

### Unique Dashboard Tabs (My Innovation)
1. **Command Center** - Live hospital map, beds, staff, ER
2. **Patient Timeline** - Facebook-style health journey
3. **AI Scribe** - Voice to clinical notes
4. **Revenue Pulse** - Trading-style revenue dashboard
5. **Audit Vault** - Who accessed what, when

### Security Features
- RBAC, JWT + Refresh, 2FA, Rate Limiting
- Encryption AES-256, Audit Logs, Input Sanitization
- CORS, Helmet, HIPAA compliant masking

### API Endpoints (50+)
`POST /api/v1/auth/login`
`GET /api/v1/patients`, `POST /api/v1/patients`
`GET /api/v1/appointments/queue`
`GET /api/v1/beds/live`, `POST /api/v1/billing/invoice`
Full docs in /docs folder

### Folder Structure