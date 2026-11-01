const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Auto-create tables on boot
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        ward VARCHAR(50) NOT NULL,
        sender VARCHAR(100),
        role VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS bed_logs (
        id SERIAL PRIMARY KEY,
        ward VARCHAR(50),
        bed_id VARCHAR(50),
        status VARCHAR(50),
        patient_id VARCHAR(50),
        updated_by VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS triage_alerts (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(50),
        ward VARCHAR(50),
        severity VARCHAR(20),
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("DB tables ready");
  } catch (e) {
    console.error("DB init error - running without DB:", e.message);
  }
}
initDB();

app.get('/', (req, res) => res.json({ status: 'realtime ok', service: 'hospital chat + db' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// REST endpoints to load history
app.get('/api/chat/:ward', async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM chat_messages WHERE ward=$1 ORDER BY created_at ASC LIMIT 100",
      [req.params.ward]
    );
    res.json(rows);
  } catch { res.json([]); }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM triage_alerts ORDER BY created_at DESC LIMIT 50");
    res.json(rows);
  } catch { res.json([]); }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-ward', (ward) => {
    socket.join(ward);
    console.log(`${socket.id} joined ${ward}`);
  });

  socket.on('chat-message', async (data) => {
    // data = { ward, sender, message, role }
    io.to(data.ward).emit('new-message', data);
    try {
      await pool.query(
        "INSERT INTO chat_messages (ward, sender, role, message) VALUES ($1,$2,$3,$4)",
        [data.ward, data.sender, data.role || 'staff', data.message]
      );
    } catch (e) { console.log("chat save failed:", e.message); }
  });

  socket.on('bed-update', async (data) => {
    io.emit('bed-status-changed', data);
    try {
      await pool.query(
        "INSERT INTO bed_logs (ward, bed_id, status, patient_id, updated_by) VALUES ($1,$2,$3,$4,$5)",
        [data.ward, data.bed_id, data.status, data.patient_id, data.updated_by]
      );
    } catch (e) { console.log("bed log failed:", e.message); }
  });

  socket.on('triage-alert', async (data) => {
    io.emit('critical-patient', data);
    try {
      await pool.query(
        "INSERT INTO triage_alerts (patient_id, ward, severity, data) VALUES ($1,$2,$3,$4)",
        [data.patient_id, data.ward, data.severity || 'critical', JSON.stringify(data)]
      );
    } catch (e) { console.log("alert save failed:", e.message); }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Realtime+DB server running on ${PORT}`));