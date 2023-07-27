import React, {useEffect, useState} from "react";
import "./App.css";
import Params from "./components/Params";
import Headers from "./components/Headers";
import Body from "./components/Body";
import Select from "./components/Select";
import {validation} from "./validation.js";

function App() {

  const path = "http://localhost:7780/";
  // const path = "http://178.172.195.18:7780/";

  const [url, setUrl] = useState("");
  const [parameters, setParameters] = useState<{ id: number, key: string, value: string }[]>([]);
  const [headers, setHeaders] = useState<{ id: number, key: string, value: string }[]>([]);
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("");
  const [dataRequest, setDataRequest] = useState<{ method: string, url: string, body: string, parameters: { id: number, key: string, value: string }[], headers: { id: number, key: string, value: string }[] }[]>([]);
  const [dataHeader, setDataHeader] = useState();
  const [dataBody, setDataBody] = useState();
  const [errorUrl, setErrorUrl] = useState("");
  const [errorParam, setErrorParam] = useState<{ id: number, key: boolean, value: boolean }[]>([{
    id: 0,
    key: true,
    value: true
  }]);
  const [errorHeader, setErrorHeader] = useState<{ id: number, key: boolean, value: boolean }[]>([{
    id: 0,
    key: true,
    value: true
  }]);

  useEffect(() => {
    setErrorUrl("");
  }, [url]);

  useEffect(() => {
    setErrorHeader([{id: 0, key: true, value: true}]);
  }, [headers]);

  useEffect(() => {
    setErrorParam([{id: 0, key: true, value: true}]);
  }, [parameters]);

  useEffect(() => {
    getRequests();
  }, []);

  useEffect(() => {
    if (method !== "GET") {
      setParameters([]);
    } else {
      setBody("");
    }
  }, [method]);

  const valueHeader = ["", "Content-type", "Origin", "Accept", "api_key"];
  const methods = ["GET", "POST", "PUT", "DELETE"];

  const deleteParam = (array: { id: number, key: string, value: string }[], setProps: (value: { id: number, key: string, value: string }[]) => void, id: number) => {
    setProps(array!.filter(param => param.id !== id));
  };

  const addParam = () => {
    setParameters([...parameters, {id: parameters.length, key: "", value: ""}])
  };
  const addHeader = () => {
    if (headers.length < valueHeader.length - 1) {
      setHeaders([...headers, {id: headers.length, key: "", value: ""}])
    }
  };
  const getOptions = (options: {
    method: string, url: string, body: string, parameters: { id: number, key: string, value: string }[], headers: { id: number, key: string, value: string }[]
  }) => {
    setMethod(options.method);
    setUrl(options.url);
    setParameters(options.parameters);
    setHeaders(options.headers);
    setBody(options.body);
  };

  const saveRequest = async () => {
    const response = await fetch(`${path}writeFile`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({method: method, url: url, parameters: parameters, body: body, headers: headers})
    });
    const data = await response.json();
    setDataRequest(data.file);
  };

  const getRequests = async () => {
    const response = await fetch(`${path}readFile`);
    const data = await response.json();
    setDataRequest(data);
    return data;
  }

  const sendRequest = async () => {
    const errors: { url?: string, parameters?: { id: number, key: boolean, value: boolean }[], headers?: { id: number, key: boolean, value: boolean }[] }[] = validation({
      method: method,
      url: url,
      parameters: parameters,
      body: body,
      headers: headers
    });
    if (errors.length > 0) {
      errors.forEach(error => {
        if (error.url) {
          setErrorUrl(error.url);
        }
        if (error.parameters) {
          setErrorParam(error.parameters);
        }
        if (error.headers) {
          setErrorHeader(error.headers);
        }
      })
    } else {
      const response = await fetch(`${path}request`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({method: method, url: url, parameters: parameters, body: body, headers: headers})
      });
      const data = await response.json();
      setDataHeader(data.header);
      setDataBody(data.body);
    }
  };

  const clearForm = () => {
    setMethod("");
    setUrl("");
    setBody("");
    setParameters([]);
    setHeaders([]);
  };

  const iteratorObject = (obj: { value: string }) => {
    let key: keyof typeof obj;
    let array = [];
    for (key in obj) {
      array.push(key + " : " + obj[key]);
    }
    return array;
  };

  return (
    <div className="App">
      <div className="request">
        <div className="result">
          <h3>Save requests</h3>
          {dataRequest && dataRequest.map((request, index) => {
            return <button
              className="buttonReq"
              key={index}
              onClick={() => getOptions(request)}>{JSON.stringify(request)}
            </button>
          })}
        </div>
        <div className="options">
          <div className="main_part">
            <label htmlFor="method" className="title">Method
              <Select array={methods} props={method} setProps={setMethod} className="field"/>
            </label>
            <label htmlFor="url" className="title">URL
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                }}
                className={errorUrl ? "error field" : "field"}/>
            </label>
          </div>
          {method === "GET" || method === ""
            ? <div>
              {parameters.length > 0
                && <Params
                  params={parameters}
                  setParams={setParameters}
                  deleteParam={deleteParam}
                  error={errorParam}
                />}
              <button onClick={addParam}>Add parameter</button>
            </div>
            : <Body body={body} setBody={setBody}/>}
          <div>
            {headers.length > 0 &&
              <Headers
                valueHeader={valueHeader}
                headers={headers}
                setHeaders={setHeaders}
                deleteParam={deleteParam}
                error={errorHeader}
              />}
            <button onClick={addHeader}>Add header</button>
          </div>
          <div className="buttons">
            <button onClick={saveRequest}>Save request
            </button>
            <button onClick={sendRequest}>Send request</button>
            <button onClick={clearForm}> Clear form</button>
          </div>
        </div>
      </div>
      <div className="response">
        <div className="bodyResponse">
          <h3>Response body</h3>
          {dataBody}
        </div>
        <div className="headerResponse">
          <h3>Response headers</h3>
          {iteratorObject(dataHeader!).map(head => {
            return <p>{head}</p>;
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
