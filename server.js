const express = require('express');
const fs = require('fs');
const app = express();
const https = require('https');
let server;
if (process.env.NODE_ENV === 'production') {
  server = https.createServer(    {
    key: fs.readFileSync("keys/key.pem"),
    cert: fs.readFileSync("keys/cert.pem"),
  },app);
} else {
  const http = require('http');
  server = http.createServer(app);
}

const { Server } = require("socket.io");
const io = new Server(server);
const path = require('path');
const { Sequence } = require('./Sequence');

let timers = [];
let activeTimer = false;

const directoryPath = './timers/';
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory: ', err);
    return;
  }

  files.forEach( (file) => {
    const filePath = path.join(directoryPath, file);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      const ext = path.extname(file);
      const sinext = path.basename(file, ext);
      timers[sinext] = new Sequence(JSON.parse(data), file);

    })
  })
})




app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/controls', (req, res) => {
    res.render('index', { controls: true});
  });

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('connected');
});

io.on('connection', (socket) => {
    socket.on('start timer', (msg) => {

        io.emit('stop timer', {});
        if (!activeTimer) throw new Error(`Timer ${msg} not found`);
        activeTimer.start();
        io.emit('start timer');

        activeTimer.on('interval start', (interval) => {
          io.emit('setup interval', interval);
        });

        activeTimer.on('set start', (msg) => {  
          io.emit('setup clock', activeTimer);
        });

        activeTimer.on('timer complete', (msg) => {
          io.emit('timer complete');
        })
    });

    socket.on('pause timer', (msg) => {
      activeTimer.pause();
      io.emit('pause timer');
    });

    socket.on('resume timer', (msg) => {
      activeTimer.resume();
      io.emit('resume timer');
    });

    socket.on('fetch sequence', (timerId) => {
      activeTimer = timers[timerId];
      if (!activeTimer) {
        console.log(`Timer ${timerId} not found`);
        return;
      }

      io.emit('setup clock', activeTimer);
    
    });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});
