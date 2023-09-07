const url = "http://178.172.195.18:7780";
// const url = "http://localhost:7780";
(async () => {
  const request = await fetch(url + "/dataBases");
  const data = await request.json();
  const select = document.getElementById("select");
  data.forEach(base => {
    const option = document.createElement("option")
    option.value = base;
    option.text = base;
    select.appendChild(option);
  });
})();

const sendRequest = async () => {
  const table = document.getElementsByClassName("table")[0];
  if (table) {
    table.remove();
  }
  const dataRequest = document.getElementsByName('sql')[0].value;
  const dataResponse = document.getElementsByClassName("response")[0];
  const select = document.getElementById("select");
  const request = await fetch(url + "/dataBase", {
    method: "POST",
    body: JSON.stringify({db: select.value, query: dataRequest})
  });
  const data = await request.json();
  const db = document.createElement("table");
  db.className = "table";
  dataResponse.appendChild(db)

  let nameColumn = [];
  if (data.array) {
    data.array.forEach(data => {
      let mainTR = document.createElement("tr");
      const tr = document.createElement("tr");
      for (const value in data) {
        if (!nameColumn.some(name => value === name)) {
          nameColumn = [...nameColumn, value];
          const column = document.createElement("td");
          column.className = "mainColumn";
          column.textContent = value;
          mainTR.appendChild(column);
        } else {
          mainTR = null
        }
        const col = document.createElement("td");
        col.className = "column";
        col.textContent = data[value];
        tr.appendChild(col);
      }
      if (mainTR) {
        db.appendChild(mainTR);
      }
      db.appendChild(tr);

    })
  }
  if (data.object) {
    db.innerHTML = "number of rows changed: " + data.object.changedRows;

  }
  if (data.error) {
    db.innerHTML = JSON.stringify(data.error);
  }
};

