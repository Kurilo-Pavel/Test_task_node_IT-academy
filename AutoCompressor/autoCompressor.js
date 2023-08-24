import fs from "fs";
import path from "path";
import CheckFile from "./autowork.js";
import zlib from "zlib";

const taskFile = new CheckFile();

const autoCompressor = async (userPath) => {

    const readFolder = (pathNew) => {
      console.log("Open: ", path.parse(pathNew).base);
      return new Promise((resolve, reject) => {
        fs.readdir(pathNew, (er, contentArray) => {
          resolve(contentArray);
        });
      });
    };

    const workFile = (newPath, arrayFile) => {
      for (let obj of arrayFile) {
        function compressing() {
          console.log("started compress", obj);
          const gzip = zlib.createGzip();
          return new Promise((res, rej) => {
            let source = fs.createReadStream(path.join(newPath, obj));
            let destination = fs.createWriteStream(path.join(newPath, obj + '.gz'));
            source.pipe(gzip).pipe(destination);

            source.on("data", chunk => {
              console.log("compressing....", chunk.length);
            })
            destination.on("close", () => {
              console.log("finished compress", obj);
              res();
            });
          })
        }

        const checkFile = (value) => {
            fs.stat(path.join(newPath, value), (er, stats) => {
              if (stats.isFile()) {
                if (path.parse(value).ext !== ".gz") {
                  const gzFile = arrayFile.filter(file => file === value + ".gz");
                  if (gzFile.length) {
                    fs.stat(path.join(newPath, gzFile[0]), async (err, gzStats) => {
                      if (stats.mtimeMs > gzStats.mtimeMs) {
                       taskFile.addFile(compressing);
                      }
                    })
                  } else {
                    taskFile.addFile(compressing);
                  }
                }
              } else {
                taskFile.addFile(() => autoCompressor(path.join(newPath, value)));
              }
            })
        }
        checkFile(obj);
      }
    }

    readFolder(userPath).then(filesArray => {
      workFile(userPath, filesArray);
    });
};
export default autoCompressor;