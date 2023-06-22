const express = require('express');
const fs = require('fs');
const os = require("os");
const path = require("path");

const server = express();
const port = 7781;
const pathLog = path.join(__dirname, '/server.log');

const writeLog = (logFilePath, logLine) => {
  const date = new Date();
  let time = date.toLocaleDateString() + " " + date.toLocaleTimeString();
  let fullLogLine = time + ' ' + logLine;
  const fdLog = fs.openSync(logFilePath, 'a+');
  fs.writeSync(fdLog, fullLogLine + os.EOL);
  fs.closeSync(fdLog);
};

server.get('/', (req, res) => {
  writeLog(pathLog, `[${port}]` + ' ' + 'form called');
  if (req.query.name && req.query.password) {
    res.send(`<h1>Your name - ${req.query.name} and password - ${req.query.password}</h1>`);
  } else {
    let name = '';
    let password = '';
    if (req.query.name !== undefined && req.query.name.length === 0) {
      name = 'You should enter name';
    }
    if (req.query.password !== undefined && req.query.password.length === 0) {
      password = 'You should enter password';
    }
    res.send(
      '<form method="get" action="http://178.172.195.18:7781/">' +
      '<label for="name"></label>' +
      `<input type="text" id="name"  name="name" value=${req.query.name === undefined ? '' : req.query.name} >` +
      `<span>${name}</span>` +
      '</br>' +
      '<label for="password"></label>' +
      `<input type="text" id="password" name="password" value=${req.query.password === undefined ? '' : req.query.password} >` +
      `<span>${password}</span>` +
      '</br>' +
      '<button type="submit">Send</button>' +
      '</form>'
    );
  }
});

server.listen(port, () => {
  console.log("server start work");
});