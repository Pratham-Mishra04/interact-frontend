import React from 'react';

interface Props {
  label?: string;
  options: any[];
  val: any;
  setVal: any;
  required?: boolean;
  styles?: React.CSSProperties;
  caption?: string;
}

const Select = ({ label, options, val, setVal, required = false, styles, caption }: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500 dark:text-gray-300">
          {label}
          {required && '*'}
        </div>
      )}
      <select
        onChange={el => setVal(el.target.value)}
        value={val}
        className="w-full h-11 border-[1px] border-primary_btn dark:border-dark_primary_btn dark:text-white bg-primary_comp dark:bg-dark_primary_comp focus:outline-none rounded-lg block p-2"
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
      {caption && <div className="text-xs text-gray-400 mt-1">{caption}</div>}
    </div>
  );
};

export default Select;
