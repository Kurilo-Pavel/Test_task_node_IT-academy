const addParams = () => {
  const param = document.getElementsByClassName("params_contain")[0];
  const div = document.createElement("div");
  const labelKey = document.createElement("label");
  labelKey.for = "key";
  const key = document.createElement("input");
  const value = document.createElement("input");
  const button = document.createElement("button");
  key.name = "key";
  key.id="key";
  value.name = "value";
  button.textContent = "delete";
  button.onclick = (e) => deleteElement(e);
  button.type = "button";
  // div.appendChild(labelKey);
  div.appendChild(key);
  div.appendChild(value);
  div.appendChild(button);
  param.appendChild(div);
};

const deleteElement = (e) => {
  const element = e.target;
  element.parentElement.remove();
};

const sendRequest = () => {
  const data = document.forms.request.key.value
  console.log(data)
};