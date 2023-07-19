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

// const url = `http://localhost:7781`;
const url=`http://178.172.195.18:7781`;

server.engine("hbs", expressHbs.engine(
  {
    layoutsDir: `${__dirname}/views/layouts`,
    defaultLayout: "layout",
    extname: "hbs"
  }
));

server.set("view engine", "hbs");
server.set("views", `${__dirname}/views`);
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
      '<form method="post">' +
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

server.post("/", (req, res) => {
  if (req.body.name && req.body.password) {
    res.redirect(301, `${url}/user?name=${req.body.name}&password=${req.body.password}`);
  }else{
    res.redirect(301, `${url}/?name=${req.body.name}&password=${req.body.password}`)
  }
});

server.get("/user", (req, res) => {
  res.render("index", {name: req.query.name, password: req.query.password});
});


server.listen(port, () => {
  console.log("server start work Task 4");
});