import express from "express";
import path, {dirname} from "path";
import {fileURLToPath} from "url";
import progress from 'progress-stream';
import fs from "fs";
import multer from "multer";
import {WebSocketServer} from "ws";

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

webserver.get("/read", (request, response) => {
  const allFiles = [];
  const readFolder = new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, "files"), (er, contentArray) => {
      if (er) {
        console.log("Error in reading folder: ", er);
      } else {
        resolve(contentArray);
      }
    });
  });
  readFolder.then((array) => {
    fs.readFile(path.join(__dirname, "data.json"), "utf8", (er, data) => {
      if (er) {
        console.log("Error in reading data.json: ", er)
      } else {
        const contentFile = JSON.parse(data);
        for (let i = 0; i < contentFile.length; i++) {
          array.forEach(file => {
            if (file === contentFile[i].id) {
              allFiles.push(contentFile[i]);
            }
          });
        }
      }

      fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(allFiles), {flag: "w"}, (er) => {
        if (er) {
          console.log("Error in writing data.json: ", er);
        }
        response.send(allFiles);
      });
    });
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
      console.log(code);
    });

    saveFile(loadProgress, response, async (err) => {
      if (err) {
        return response.status(500);
      } else {
        fs.readFile(path.join(__dirname, "data.json"), "utf8", (err, dataFile) => {
          let contentFile;
          if (!dataFile) {
            contentFile = [{
              id: loadProgress.file.filename,
              name: loadProgress.file.originalname,
              comment: loadProgress.body.comment
            }];
          } else {
            contentFile = [...JSON.parse(dataFile), {
              id: loadProgress.file.filename,
              name: loadProgress.file.originalname,
              comment: loadProgress.body.comment
            }];
          }
          fs.writeFile(path.join(__dirname, "data.json"), JSON.stringify(contentFile), (err) => {
            if (err) {
              console.log(err);
            } else {
              response.send([{
                id: loadProgress.file.filename,
                name: loadProgress.file.originalname,
                comment: loadProgress.body.comment
              }]);
            }
          });
        });
      }
    });
  });

  webserver.post("/downloading", express.json({type: '*/*'}), (request, response) => {
    let download = {};
      download.name = request.body.name;
      connection.send(JSON.stringify(download));
      const readStream = fs.createReadStream(path.join(__dirname, "files", request.body.id));
      readStream.pipe(response);

      readStream.on("end", () => {
       connection.close();
      });
    })
});


webserver.listen(port, () => {
  console.log("server working...");
});

