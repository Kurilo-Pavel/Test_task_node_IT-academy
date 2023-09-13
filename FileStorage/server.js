import express from "express";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import progress from 'progress-stream';
import fs from "fs";
import multer from "multer";
import {WebSocketServer} from "ws";
import {sha256} from "js-sha256";
import nodemailer from "nodemailer";
import mysql from "mysql";


const salt = "d0fjb2dn8fsl5bkm7ds3bds";

const connectionConfig = {
  host: "localhost",
  user: "root",
  password: "1986@LitvinMaster",
  database: "filestorage"
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const webserver = express();
const port = 7780;

webserver.use(express.static(__dirname));
webserver.use(express.urlencoded({extended: true}));

const storageConfig = multer.diskStorage({
  destination: path.join(__dirname, "files"),
})
const upload = multer({storage: storageConfig});

const saveFile = upload.single("file");

webserver.post("/read", (request, response) => {
  const token = request.headers.authorization;
  const connection = mysql.createConnection(connectionConfig);
  connection.connect(err => {
    if (err) {
      console.log(err)
    } else {
      connection.query(`select * from files where id=(select id from sessions where token="${token}")`, (err, results) => {
        if (err) {
          console.log(err);
        } else {
          response.send({result: results});
          connection.end();
        }
      });
    }
  });
});

let users = [];
const wsPort = 7781;
const wsServer = new WebSocketServer({port: wsPort});

wsServer.on("connection", connection => {
  let id = Math.random();
  connection.on("message", message => {
    if (JSON.parse(message) === "load") {
      connection.send(JSON.stringify({mainId: id}));
      users.push({id: id, connection: connection});
    }
  })
  webserver.post("/loading", (request, response) => {
    const load = {value: 0};
    const loadProgress = progress();
    const token = request.headers.authorization;
    loadProgress.headers = request.headers;
    request.pipe(loadProgress);

    request.on("data", chunk => {
      users.forEach(user => {
        if (loadProgress.body.id === user.id.toString()) {
          load.status = "run";
          load.value = load.value + chunk.length;
          load.id = user.id;
          user.connection.send(JSON.stringify(load));
        }
      })
    });

    request.on("end", () => {
      users.forEach(user => {
        if (loadProgress.body.id === user.id.toString()) {
          load.status = "loaded";
          user.connection.send(JSON.stringify(load));
          user.connection.close(1000, "file loaded");
          user.id = null;
          users = users.filter(client => client.id);
        }
      })
    });
    connection.on("close", (code) => {
      console.log('code', code);
    });

    saveFile(loadProgress, response, async (err) => {
      if (err) {
        return response.status(500);
      } else {
        const connection = mysql.createConnection(connectionConfig);
        connection.connect(err => {
          if (err) {
            console.log(err);
          } else {
            connection.query(`insert into files (id,fileId,name,comment) values ((select id from sessions where token="${token}"),"${loadProgress.file.filename}","${loadProgress.file.originalname}","${loadProgress.body.comment}")`, (err, results) => {
              if (!err) {
                connection.query(`select * from files where id=(select id from sessions where token="${token}")`, (err, results) => {
                  if (!err) {
                    response.send({result: results});
                  }
                })
              }
            });
          }
        })
      }
    });
  });

  webserver.post("/downloading", express.json({type: '*/*'}), (request, response) => {
    let download = {};
    const token = request.headers.authorization;
    const SQLConnection = mysql.createConnection(connectionConfig);
    SQLConnection.connect(err => {
      if (!err) {
        SQLConnection.query(`select id from sessions where token="${token}"`, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            if (result.length) {
              download.name = request.body.name;
              connection.send(JSON.stringify(download));
              const readStream = fs.createReadStream(path.join(__dirname, "files", request.body.fileId));
              readStream.pipe(response);
              readStream.on("end", () => {
                connection.close();
              });
            }
          }
        })
      }
    })
  })
});

webserver.post("/login", express.json({type: '*/*'}), (request, response) => {
  const login = request.body.login;
  const password = sha256.hmac(request.body.password, salt);
  const token = Math.random();

  const connection = mysql.createConnection(connectionConfig);
  connection.connect(err => {
    if (err) {
      console.log("error", err);
    } else {
      connection.query(`select authorization from sessions where id=(select id from users where login="${login}" and password="${password}")`, (err, results) => {
        if (err) {
          console.log(err);
        } else {
          for (const key in results[0]) {
            if (results[0][key] === 1) {
              connection.query(`select * from files where id=(select id from users where login="${login}" and password="${password}")`, (err, result) => {
                if (err) {
                  console.log("bad request with login", err);
                } else {
                  connection.query(`update sessions set token="${token}" where id=(select id from users where login="${login}" and password="${password}")`)
                  response.send({login: login, result: result, token: token});
                  connection.end();
                }
              });
            } else {
              response.send({error: "not authorization"});
              connection.end();
            }
          }
        }
      })
    }
  })
});

webserver.post("/registration", express.json({type: '*/*'}), (request, response) => {
  const login = request.body.login;
  const password = sha256.hmac(request.body.password, salt);
  const email = request.body.email;
  const token = Math.random();
  const date = new Date().getTime();

  const connection = mysql.createConnection(connectionConfig);
  connection.connect(err => {
    if (err) {
      console.log(err);
    } else {
      let id;
      connection.query(`select login from users where login="${login}"`, (err, results, fields) => {
        if (results.length) {
          response.send({error: "choose another login"});
        } else {
          connection.query("select max(id) from users", (er, results) => {
            for (let key in results[0]) {
              if (!results[0][key]) {
                id = 1;
              } else {
                id = results[0][key] + 1;
              }
            }
            connection.query(`insert into users (id,login,PASSWORD) values (${id}, "${login}","${password}")`)
            connection.query(`insert into sessions (id,created,token,ADMIN,email,authorization) values (${id}, "${date}", "${token}",false,"${email}",false)`)
            connection.end();
            const transporter = nodemailer.createTransport({
              host: "smtp.yandex.ru",
              port: 465,
              secure: true,
              auth: {
                user: "pkuryla",
                pass: "hcarfnblkzgbehrs"
              }
            });

            const message = {
              from: "pkuryla@yandex.ru",
              to: [email],
              subject: "Confirm email",
              // text: `${email}/check?token=${token}`,
              html: `<a href="http://178.172.195.18:7780/check?token=${token}">Click me</a>`
            };

            transporter.sendMail(message, (err, info) => {
              if (err) {
                console.log("sendEmail - error", err)
                response.send({error: err})
              } else {
                response.send({data: `check email: ${email}`})
              }
            });
          });
        }
      })

    }
  })
});

webserver.get("/check", (request, response) => {
  const connection = mysql.createConnection(connectionConfig);
  connection.connect(err => {
    if (err) {
      console.log("not connect with bd", err)
    } else {
      connection.query(`select token from sessions where token="${request.query.token}"`, (err, results) => {
        if (err) {
          console.log("Error check token", err);
        } else {
          if (!results.length) {
            response.send("bad token");
          } else {
            connection.query(`update sessions set authorization=true where token="${request.query.token}"`)
            connection.end();
            response.redirect(301, `http://178.172.195.18:7780/`);
          }
        }
      })
    }
  })
})

webserver.listen(port, () => {
  console.log("server working...");
});

