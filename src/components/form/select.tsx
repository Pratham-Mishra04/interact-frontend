import React from 'react';

interface Props {
  label?: string;
  options: any[];
  val: any;
  setVal: React.Dispatch<React.SetStateAction<any>>;
  required?: boolean;
  styles?: React.CSSProperties;
}

const Select = ({ label, options, val, setVal, required = false, styles }: Props) => {
  return (
    <div>
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">
          {label}
          {required && '*'}
        </div>
      )}
      <select
        onChange={el => setVal(el.target.value)}
        value={val}
        className="w-full max-lg:w-full h-11 border-[1px] border-primary_btn  dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-[#10013b30] focus:outline-nonetext-sm rounded-lg block p-2"
        style={styles}
      >
        {options.map((c, i) => {
          return (
            <option className="bg-primary_comp_hover" key={i} value={c}>
              {c}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
