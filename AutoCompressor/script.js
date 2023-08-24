import readline from "readline";
import autoCompressor from "./autoCompressor.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "path> "
});

rl.prompt();
rl.on("line", (Upath) => {
  if (!Upath) {
    rl.close();
  } else {
    console.log("result:")
    autoCompressor(Upath)

    rl.close()
  }
})


