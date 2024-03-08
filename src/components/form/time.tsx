import React from 'react';

interface Props {
  label?: string;
  val: string;
  setVal: React.Dispatch<React.SetStateAction<string>>;
  required?: boolean;
  styles?: React.CSSProperties;
  onChange?: (el: React.ChangeEvent<HTMLInputElement>) => void;
}

const Time = ({ label, val, setVal, required = false, onChange, styles }: Props) => {
  return (
    <div>
      {label && (
        <div className="text-xs ml-1 font-medium uppercase text-gray-500">
          {label}
          {required && '*'}
        </div>
      )}
      <input
        value={val}
        onChange={onChange ? onChange : el => setVal(el.target.value)}
        type="datetime-local"
        className="w-full bg-transparent focus:outline-none border-[1px] border-gray-400 rounded-lg p-2"
        style={styles}
      />
    </div>
  );
};

export default Time;
