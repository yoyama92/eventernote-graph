import { JSX } from "preact/jsx-runtime";

type Option = {
  value: string;
  label: string;
};

type YearSelectProps = {
  options: Array<Option>;
  onChange: (value: string) => void;
};

export const YearSelect = ({ options, onChange }: YearSelectProps) => {
  const handleChange: JSX.GenericEventHandler<HTMLSelectElement> = (e) => {
    onChange(e.currentTarget.value);
  };
  return (
    <>
      <span>表示年：</span>
      <select id="year" defaultValue="" onChange={handleChange}>
        <option value="" label="累計"></option>
        {options.map(({ value, label }) => {
          return <option value={value} label={label}></option>;
        })}
      </select>
    </>
  );
};
