const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const server = express();
const port = 7722;
const pathFile = path.join(__dirname, '/file.txt');
const pathLog = path.join(__dirname, '/server.log');

const writeLog = (logFilePath, logLine) => {
  const date = new Date();
  let time = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  let fullLogLine = time + ' ' + logLine;
  const fdLog = fs.openSync(logFilePath, 'a+');
  fs.writeSync(fdLog, fullLogLine + os.EOL);
  fs.closeSync(fdLog);
};

const users = () => {
  return fs.readFileSync(pathFile, "utf8");
};

server.use(express.json());

server.get('/', (request, response) => {
  response.sendFile(path.join(__dirname, '/index.html'));
});

server.get('/variants', (request, response) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'variants called');
  response.send(JSON.parse(users()).map(user => {
    return {id: user.id, name: user.name};
  }));
});

server.get('/stat', (request, response) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'stat called');
  response.send(JSON.parse(users()).map(user => {
    return {id: user.id, votes: user.votes};
  }));
});

server.post('/vote', (request, response) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'vote called');
  const currentUsers = JSON.parse(users()).map(user => {
    if (user.id === request.body.id) {
      user.votes++;
    }
    return user;
  });
  fs.writeFile(pathFile, JSON.stringify(currentUsers), (err) => {
    if (err) {
      console.log(err);
    }
  });
  response.send(request.body);
})

server.listen(port, () => {
  console.log("server start");
});