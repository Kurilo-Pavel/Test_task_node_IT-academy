import Select from "./Select";
import {useState} from "react";

type HeadersProps = {
  valueHeader: string[];
  headers: { id: number, key: string, value: string }[];
  setHeaders: (value: { id: number, key: string, value: string }[]) => void;
  deleteParam: (array: { id: number, key: string, value: string }[], setProps: (value: { id: number, key: string, value: string }[]) => void, id: number) => void;
}

const Headers = ({valueHeader, headers, setHeaders, deleteParam}: HeadersProps) => {

  const changeValue = (value: { id: number, key: string, value: string }) => {
    setHeaders(headers.map(field => {
      if (field.id === value.id) {
        return value;
      } else {
        return field;
      }
    }))
  };

  return <div>
    <h4 className="title">Headers</h4>
    <div className="params">
      {headers.map(item => {
        return <div key={item.id} className="param">
          <Select array={valueHeader} props={item.key}
                  onChange={(e) => changeValue({id: item.id, key: e, value: item.value})}/>
          <input type="text" value={item.value}
                 onChange={(e) => changeValue({id: item.id, key: item.key, value: e.target.value})}/>
          <button onClick={() => deleteParam(headers, setHeaders, item.id)}>Delete</button>
        </div>
      })}
    </div>
  </div>
};
export default Headers;