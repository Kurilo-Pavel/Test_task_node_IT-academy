const express = require('express');
const fs = require('fs');
const os = require("os");
const path = require("path");
const expressHbs = require("express-handlebars");
const hbs = require("hbs");

const server = express();
const port = 7781;
const pathLog = path.join(__dirname, '/server.log');

server.use(express.urlencoded({extended: true}));

const url = `http://localhost:7781`;
// const url=`http://178.172.195.18:7781`;

server.engine("hbs", expressHbs.engine(
  {
    layoutsDir: "Task_4/views/layouts",
    defaultLayout: "layout",
    extname: "hbs"
  }
));

server.set("view engine", "hbs");
server.set("views", "Task_4/views");
hbs.registerPartials(__dirname + "/views/partials");

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
  res.send(
    `<form method="post" action=${url}>` +
    '<label for="name"></label>' +
    `<input type="text" id="name"  name="name" value=${req.query.name === undefined ? '' : req.query.name} >` +
    '</br>' +
    '<label for="password"></label>' +
    `<input type="text" id="password" name="password" value=${req.query.password === undefined ? '' : req.query.password} >` +
    '</br>' +
    '<button type="submit">Send</button>' +
    '</form>'
  );
});

server.post("/", (req, res) => {
  if (req.body.name && req.body.password) {
    res.redirect(301, `/user?name=${req.body.name}&password=${req.body.password}`);
  } else {
    res.redirect(301, "/notfound");
  }
});

server.get("/user", (req, res) => {
  res.render("index", {name: req.query.name, password: req.query.password});
});

server.get("/notfound", (req, res) => {
  res.status(404);
  res.render("notFound.hbs");
});

server.listen(port, () => {
  console.log("server start work Task 4");
});