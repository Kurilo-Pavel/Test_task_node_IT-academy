import React from "react";

type SelectProps = {
  array: string[];
  props?: string;
  setProps?: (value: string) => void;
  changeValue?: (value: { id: number, key: string, value: string }) => void;
  onChange?: (value: string) => void;
}
const Select = ({array, props, setProps, onChange}: SelectProps) => {
  return <select
    id="method"
    className="field"
    value={props}
    onChange={(e) => {
      setProps ? setProps(e.target.value) : onChange!(e.target.value);
    }}>
    {array.map(value => {
      return <option key={value} value={value}>{value}</option>
    })}
  </select>
};
export default Select;