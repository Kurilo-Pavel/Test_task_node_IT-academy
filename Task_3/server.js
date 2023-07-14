const express = require('express');
const request = require('request')
const fs = require('fs');
const path = require('path');
const querystring = require("querystring");

const webserver = express();
const port = 7780;

const pathRequest = path.join(__dirname, '/request.json');
webserver.use(express.json());

webserver.options('/*', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
  res.send("");
});

webserver.get("/", (req, res) => {
  try {
    const originalUrlDecoded = querystring.unescape(req.originalUrl);
    const filePath = path.resolve(__dirname, "task_3/build", "index.html");
    const stats = fs.statSync(filePath);
    res.setHeader("Content-Type", "text/html");
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.status(404).end();
  }
})

webserver.post("/request", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
  try {
    const paramObj = (array) => {
      const obj = {};
      for (let i = 0; i < array.length; i++) {
        obj[array[i].key] = array[i].value;
      }
      return obj;
    };
    const requestData = req.body;
    request({
      method: requestData.method,
      url: requestData.url,
      qs: paramObj(requestData.parameters),
      headers: paramObj(requestData.headers),
      body: requestData.body
    }, (er, re, body) => {
      res.send({body: body, header: req.headers});
    })
  } catch (err) {
    console.log("ошибка в отправке запроса ", err);
    res.status(404).end();
  }
});


webserver.get("/readFile", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
  try {
    fs.readFile(pathRequest, "utf8", (err, data) => {
      let requestData = data === '' ? 'null' : data;
      res.send(requestData);
    });
  } catch (err) {
    console.log("ошибка в чтении файла ", err);
    res.status(404).end();
  }
});

webserver.post("/writeFile", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,DELETE,POST,PUT");
  try {
    fs.readFile(pathRequest, "utf8", (err, data) => {
      let dataFile;
      if (data === "") {
        dataFile = [req.body];
      } else {
        dataFile = [...JSON.parse(data), req.body];
      }
      fs.writeFile(pathRequest, JSON.stringify(dataFile), (err) => {
        if (err) {
          console.log(err);
        }
      });
      res.send(dataFile);
    });
  } catch (err) {
    console.log("ошибка в записи файла ", err);
    res.status(404).end();
  }
});

webserver.listen(port, () => {
  console.log("server started...");
})