const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.json({ status: 'realtime ok', service: 'hospital chat' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-ward', (ward) => {
    socket.join(ward);
    console.log(`${socket.id} joined ${ward}`);
  });

  socket.on('chat-message', (data) => {
    // data = { ward, sender, message, role }
    io.to(data.ward).emit('new-message', data);
  });

  socket.on('bed-update', (data) => {
    io.emit('bed-status-changed', data);
  });

  socket.on('triage-alert', (data) => {
    io.emit('critical-patient', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Realtime server running on ${PORT}`));