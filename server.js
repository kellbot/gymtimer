const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const path = require('path');
const { Sequence } = require('./Sequence');

let timers = [];
let activeTimer = "bugs";

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
          console.log(interval);
          io.emit('setup interval', {interval: interval});
        });
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