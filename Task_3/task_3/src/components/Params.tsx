type ParamsProps = {
  params?: { id: number, key: string, value: string }[];
  setParams: (value: { id: number, key: string, value: string }[]) => void;
  deleteParam: (array: { id: number, key: string, value: string }[], setProps: (value: { id: number, key: string, value: string }[]) => void, id: number) => void;
  error: { id: number, key: boolean, value: boolean }[];
}

const Params = ({params, setParams, deleteParam, error}: ParamsProps) => {
  const changeValue = (value: { id: number, key: string, value: string }) => {
    setParams(params!.map(param => {
      if (param.id === value.id) {
        return value;
      } else {
        return param;
      }
    }))
  };

  return <div>
    <h4 className="title">Parameters</h4>
    <div className="params">
      {params!.map(param => {
        return <div key={param.id} className="param">
          <input
            type="text"
            value={param.key}
            className={error.some(er=>{ return er.id === param.id && !er.key})  ? "error" : ""}
            onChange={(e) => {
              changeValue({id: param.id, key: e.target.value, value: param.value});
            }}/>
          <input
            type="text"
            value={param.value}
            className={error.some(er=>{ return er.id === param.id && !er.value})  ? "error" : ""}
            onChange={(e) => {
              changeValue({id: param.id, key: param.key, value: e.target.value});
            }}
          />
          <button
            onClick={() => deleteParam(params!, setParams, param.id)}
          >
            Delete
          </button>
        </div>
      })}
    </div>
  </div>
};
export default Params;