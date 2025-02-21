import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  label?: string;
  val: string;
  setVal: React.Dispatch<React.SetStateAction<string>> | ((val: string) => void);
  maxLength: number;
  placeholder?: string;
  required?: boolean;
  styles?: React.CSSProperties;
  type?: React.HTMLInputTypeAttribute;
  className?: string;
  labelClassName?: string;
}

const Input = ({
  label,
  val,
  setVal,
  maxLength,
  placeholder,
  required = false,
  styles,
  type = 'text',
  className,
  labelClassName,
}: Props) => {
  return (
    <div className="w-full">
      {label && (
        <div className={cn('text-xs ml-1 font-medium uppercase text-gray-500 dark:text-gray-300', labelClassName)}>
          {label}
          {required && '*'}{' '}
          {type === 'text' && val && (
            <>
              {val.trim().length}/{maxLength}
            </>
          )}
        </div>
      )}
      <input
        value={val}
        onChange={el => setVal(el.target.value)}
        maxLength={maxLength}
        type={type}
        className={cn(
          'w-full font-medium bg-transparent dark:text-white focus:outline-none border-[1px] border-gray-400 dark:border-dark_primary_btn rounded-lg p-2',
          className
        )}
        placeholder={placeholder}
        style={styles}
      />
    </div>
  );
};

export default Input;
