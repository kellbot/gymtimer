const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
const { Sequence } = require('./Sequence');

let timers = [];

fs.readFile('./timers/10326248.json','utf8', (error, data) => {
  if(error){
     console.log(error);
     return;
  }
  timers[10326248] = new Sequence(JSON.parse(data), 10326248);

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
        console.log(msg);
        io.emit('stop timer', {});
        const tm = timers[msg];
        if (!tm) throw new Error(`Timer ${msg} not found`);
        tm.start();
        io.emit('start timer');
    });
    socket.on('fetch timer', (timerId) => {
      const tm = timers[timerId];
      if (!tm) {
        console.log(`Timer ${timerId} not found`);
        return;
      }
      io.emit('setup timer', tm);
    
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});