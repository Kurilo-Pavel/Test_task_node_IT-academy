const url = "http://178.172.195.18:7780/";
// const url = "http://localhost:7780";

const getFiles = async () => {
  const token = localStorage.getItem("token");
  console.log(token)
  const response = await fetch("/read", {
    method: "POST",
    headers: new Headers({"Authorization": `${token}`})
  });
  const data = await response.json();
  readFile(data.result);
};

const sendFile = async () => {
  const inputFile = document.getElementById("upload");
  const file = inputFile.files[0];
  const inputComment = document.getElementById("comment");
  const comment = inputComment.value;
  const token = localStorage.getItem("token");
  let userId;

  const postReq = async () => {
    const formData = new FormData();
    formData.append("id", userId.toString());
    formData.append("file", file);
    formData.append("comment", comment);
    const response = await fetch(url + "/loading", {
      method: "POST",
      headers: new Headers({"Authorization": `${token}`}),
      body: formData
    });
    const data = await response.json();
    await readFile(data.result);
  }

  if (file && comment) {
    let connection = new WebSocket(`ws://178.172.195.18:7781/`);
    // let connection = new WebSocket(`ws://localhost:7781/`);
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
  div.innerHTML = data.value + " Bytes";
  if (data.status !== "run") {
    div.innerHTML = data.value + " file " + data.status;
  }
};

const readFile = (data) => {
  const div = document.getElementsByClassName("allFiles")[0];
  div.innerHTML = null;
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
  // const connection = new WebSocket(`ws://localhost:7781/`);
  const token = localStorage.getItem("token");
  connection.onopen = () => {
    connection.send(JSON.stringify("download"));
    if (work) {
      const res = async () => {
        const response = await fetch(url + "/downloading", {
          method: "POST",
          headers: new Headers({"Authorization": `${token}`}),
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
};

const isOpenFileStorage = (name) => {
  const user = document.getElementsByClassName("user")[0];
  const title = document.getElementsByClassName("title")[0];
  const authorization = document.getElementsByClassName("authorization")[0];
  if (localStorage.getItem("token")) {
    authorization.style.display = "none";
    user.style.display = "flex";
    title.textContent = name;
    getFiles();
  } else {
    user.style.display = "none";
    authorization.style.display = "flex";
  }
};

const logout = () => {
  delete localStorage.token;
  isOpenFileStorage();
}

const openModal = () => {
  const reg = document.getElementsByClassName("registration")[0];
  if (reg.style.display === "none" || !reg.style.display) {
    reg.style.display = "flex";
  } else {
    reg.style.display = "none";
  }
};

const logIn = async () => {
  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const response = await fetch(url + "/login", {
    method: "POST",
    body: JSON.stringify({login: login, password: password})
  });
  const data = await response.json();
  const err = document.getElementsByClassName("error")[0];
  if (data.error) {
    err.innerHTML = data.error;
  } else {
    err.innerHTML = "";
    localStorage.setItem("token", data.token);
    isOpenFileStorage(data.login);
    readFile(data.result);
  }
};

const registration = async () => {
  const login = document.getElementsByName("login")[0].value;
  const email = document.getElementsByName("email")[0].value;
  const password = document.getElementsByName("password")[0].value;

  const response = await fetch(url + "/registration", {
    method: "POST",
    body: JSON.stringify({login: login, password: password, email: email})
  });
  const data = await response.json();
  const err = document.getElementsByClassName("error")[0];
  if (data.error) {
    err.innerHTML = data.error;
  } else {
    err.innerHTML = "";
    openModal();
  }
};


isOpenFileStorage();