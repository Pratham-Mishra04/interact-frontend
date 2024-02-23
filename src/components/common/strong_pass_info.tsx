import { CheckSquare, XSquare } from '@phosphor-icons/react';
import X from '@phosphor-icons/react/dist/icons/X';
import React from 'react';

interface Props {
  password: string;
  confirmPassword: string;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const StrongPassInfo = ({ password, confirmPassword, setShow }: Props) => {
  const Checker = (condition: boolean, message: string) => (
    <div className="flex gap-2 items-center">
      {condition ? <CheckSquare weight="bold" /> : <XSquare className="text-primary_danger" weight="bold" />}
      {message}
    </div>
  );
  return (
    <>
      <div className="fixed top-24 max-md:top-20 w-1/3 max-md:w-5/6 h-fit backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-2 max-md:gap-0 rounded-lg p-8 dark:text-white font-primary border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 shadow-2xl translate-x-1/2 animate-fade_third z-50">
        <div className="w-full flex justify-end">
          <X className="lg:hidden cursor-pointer" onClick={() => setShow(false)} size={32} />
        </div>
        <div className="w-full md:flex-1 flex flex-col justify-between gap-4">
          <div className="w-full flex flex-col gap-8">
            <div className="font-semibold text-4xl max-md:text-2xl text-gray-800 dark:text-white capitalize">
              What makes a Password Strong? 💪🏼
            </div>

            <div className="w-full flex flex-col gap-4 text-xl max-md:text-lg font-medium max-md:font-normal">
              {Checker(password.trim().length >= 8, 'At Least 8 Characters')}
              {Checker(/\d/.test(password), 'At Least 1 Number')}
              {Checker(/[A-Z]/.test(password), 'At Least 1 Upper Case Letter')}
              {Checker(/[a-z]/.test(password), 'At Least 1 Lower Case Letter')}
              {Checker(/[!@#$%^&*(),.?":|<>]/.test(password), 'At Least 1 Special Character')}
              {Checker(password === confirmPassword, 'Passwords Should Match')}
            </div>
          </div>
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-30"
      ></div>
    </>
  );
};

export default StrongPassInfo;
