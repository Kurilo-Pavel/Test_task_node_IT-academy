const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const server = express();
const port = 7780;
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
let currentUsers = users();

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

server.post('/stat', (request, response) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'stat called');
  response.send(JSON.parse(users()).map(user => {
    return {id: user.id, votes: user.votes};
  }));
});

server.post('/vote', (request, response) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'vote called');
  currentUsers = JSON.stringify(JSON.parse(users()).map(user => {
    if (user.id === request.body.id) {
      user.votes++;
    }
    return user;
  }));
  fs.writeFile(pathFile, currentUsers, (err) => {
    if (err) {
      console.log(err);
    }
  });
  response.send(request.body);
})


server.get('/download', (request, response) => {
  const fileType = request.headers["content-type"];
  let data = '';
  switch (fileType) {
    case 'application/xml':
      writeLog(pathLog, `[${port}]` + ' ' + 'send file xml');
      const fileXML = fs.createWriteStream('voice.xml');
      JSON.parse(currentUsers).forEach(user => {
        data += `<User><name>${user.name}</name><votes>${user.votes}</votes></User>` + os.EOL;
      });
      fileXML.write(`<Users>${os.EOL}${data}</Users>`, () => {
        response.sendFile(__dirname + '/voice.xml');
      });
      break;
    case 'application/json':
      writeLog(pathLog, `[${port}]` + ' ' + 'send file json');
      const fileJSON = fs.createWriteStream('voice.json');
      fileJSON.write(currentUsers, () => {
        response.sendFile(__dirname + '/voice.json');
      });
      break;
    case 'text/html':
      writeLog(pathLog, `[${port}]` + ' ' + 'send file html');
      const fileHTML = fs.createWriteStream('voice.html', {flags: 'w'});
      JSON.parse(currentUsers).forEach(user => {
        data += `<div><span>${user.name}</span> - <span>${user.votes}</span></div>` + os.EOL;
      });
      fileHTML.write(`<div>${os.EOL}${data}</div>`, () => {
        response.sendFile(__dirname + '/voice.html');
      });
      break;
  }
});

server.listen(port, () => {
  console.log("server start");
});