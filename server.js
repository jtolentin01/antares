const express = require('express');
const cors = require('cors');
const http = require('http');
const routes = require('./src/routes/index');
const { Server } = require('socket.io');
const key = require('ckey');
const models = require('./src/models/index');
const app = express();
const port = process.env.PORT || 80;

const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: key.PROD_URL ? key.PROD_URL : key.CLIENT_URL,
//         methods: ['GET', 'POST'],
//     },
// });

// app.use(express.static(path.join(__dirname, 'client/dist/listings-alternative/browser')));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(cors());

routes.initRoutes({ app });

models.connectDB();

// io.on('connection', async (socket) => {
//   socket.on('message', async (data) => {
//     let ws = await wsOnInit(data, io);
//     socket.emit('message', ws);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client/dist/listings-alternative/browser/index.html'));
// });

server.listen(port, () => console.log(`Server running on port ${port}`));
