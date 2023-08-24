import EventEmitter from "events";

class CheckFile extends EventEmitter {
  constructor() {
    super();
    this.fileArray = [];
    this.runningWork = false;
  }

  addFile(file) {
    this.fileArray.push(file);
    this.runNextWork();
  }

  runNextWork() {
    if (!this.runningWork) {
      if (this.fileArray.length) {
        let work = this.fileArray.shift();
        let workPromise = work();
        this.runningWork = true;
        workPromise.then(() => {
          this.runningWork = false;
          this.runNextWork();
        });
      } else {
        this.emit("done");
      }
    }
  }
}

// console.log(CheckFile.fileArray)
export default CheckFile;