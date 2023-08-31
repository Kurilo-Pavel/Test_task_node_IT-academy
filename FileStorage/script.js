const url = "http://178.172.195.18:7780/";

const getFiles = async () => {
  const response = await fetch("/read");
  const data = await response.json();
  readFile(data);
};
getFiles();

const sendFile = async () => {
  const inputFile = document.getElementById("upload");
  const file = inputFile.files[0];
  const inputComment = document.getElementById("comment");
  const comment = inputComment.value;
  let userId;

  const postReq = async () => {
    const formData = new FormData();
    formData.append("id", userId.toString());
    formData.append("file", file);
    formData.append("comment", comment);
    const response = await fetch(url + "/loading", {method: "POST", body: formData});
    const data = await response.json();
    await readFile(data);
  }

  if (file && comment) {
    let connection = new WebSocket(`ws://178.172.195.18:7781/`);
    connection.onopen = event => {
      connection.send(JSON.stringify("load"));
    }
    connection.onmessage = (event) => {
      if (JSON.parse(event.data).mainId) {
        userId = JSON.parse(event.data).mainId;
        postReq();
      }
      if (userId === JSON.parse(event.data).id) {
        writePercent(JSON.parse(event.data));
      }

      if (JSON.parse(event.data).status === "loaded") {
        connection.close();
      }
    };

    connection.onerror = (err) => {
      console.log("err", err);
    };

    connection.onclose = (event) => {
      console.log("close-code: ", event.code);
      console.log("close-reason: ", event.reason);
      if (event.wasClean) {
        console.log("close connection with WebSocket");
      }
    };
  } else {
    writePercent({value: "Fill the form", status: "run"})
  }
};

const writePercent = (data) => {
  const div = document.getElementsByClassName("percent")[0];
  // div.innerHTML = data.value
  div.innerHTML = data.value + " Bytes";
  if (data.status !== "run") {
    div.innerHTML = data.value + " file " + data.status;
  }
};

const readFile = (data) => {
  const div = document.getElementsByClassName("allFiles")[0];
  data.map(file => {
    const dataFile = document.createElement("div");
    dataFile.className = "dataFile";
    const name = document.createElement("p");
    const comment = document.createElement("p");
    name.style.margin = "0";
    comment.style.margin = "0";
    name.textContent = "name: " + file.name;
    comment.textContent = "comment: " + file.comment;
    dataFile.appendChild(name);
    dataFile.appendChild(comment);
    div.prepend(dataFile);
    dataFile.addEventListener("click", () => {
      downloadFile(file);
    });
  });
};
let work;

const downloadFile = (data) => {
    work = true;
    const connection = new WebSocket(`ws://178.172.195.18:7781/`);
    connection.onopen = () => {
      connection.send(JSON.stringify("download"));
      if (work) {
        const res = async () => {
          const response = await fetch(url + "/downloading", {
            method: "POST",
            body: JSON.stringify(data)
          });
          const blob = await response.blob();
          let file = document.createElement("a");
          file.href = window.URL.createObjectURL(new Blob([blob]));
          file.download = data.name;
          file.click();
        }
        res()
        work = false;
      }
    };

    connection.onclose = () => {
      console.log("close connection with WebSocket");
    };
  }
;