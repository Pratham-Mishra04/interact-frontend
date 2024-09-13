import React from 'react';

interface Props {
  label?: string;
  val: string;
  setVal: React.Dispatch<React.SetStateAction<string>>;
  maxLength: number;
  placeholder?: string;
  required?: boolean;
  styles?: React.CSSProperties;
  type?: React.HTMLInputTypeAttribute;
}

const Input = ({ label, val, setVal, maxLength, placeholder, required = false, styles, type = 'text' }: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">
          {label}
          {required && '*'}{' '}
          {type == 'text' && (
            <>
              ({val.trim().length}/{maxLength})
            </>
          )}
        </div>
      )}
      <input
        value={val}
        onChange={el => setVal(el.target.value)}
        maxLength={maxLength}
        type={type}
        className="w-full font-medium bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
        placeholder={placeholder}
        style={styles}
      />
    </div>
  );
};

export default Input;
