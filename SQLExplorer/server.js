import express from "express";
import {dirname} from "path";
import {fileURLToPath} from "url";
import mysql from "mysql";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = express();
const port = 7780;

server.use(express.static(__dirname));
server.use(express.json({type: '*/*'}));

const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "1986@LitvinMaster",
};

server.get("/dataBases", (request, response) => {

  const connection = mysql.createConnection(connectionConfig);
  connection.connect(err => {
    if (err) {
      console.log(err);
    } else {
      console.log("open connection to get dataBases");
      connection.query("show dataBases;", (err, results) => {
        if (err) {
          console.log("request error", err);
        } else {
          const arrayDatabase = results.map(base => base.Database);
          response.send(arrayDatabase);
        }
        connection.end(() => {
          console.log("close connection");
        });
      });
    }
  });
});

server.post("/dataBase", (request, response) => {
  connectionConfig.database = request.body.db;
  const connection = mysql.createConnection(connectionConfig);

  try {
    connection.connect();
    connection.query(request.body.query, (err, results) => {
      if (err) {
        response.send({error:err});
      } else {
        if(Array.isArray(results)) {
          response.send({array: results});
        }else{
          console.log(results)
          response.send({object:results})
        }
      }
      connection.end();
    });

  } catch (error) {
    if (connection)
      connection.end();
  }
  // response.send(request.body);
});

server.listen(port, () => {
  console.log("server working...")
})