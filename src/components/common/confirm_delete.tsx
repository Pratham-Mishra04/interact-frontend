import { X } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import DangerButton from '../buttons/danger_btn';

interface Props {
  handleDelete: () => void;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  title?: string;
  subtitle?: string;
  titleSize?: string;
}

const ConfirmDelete = ({
  handleDelete,
  setShow,
  title = 'Confirm Delete?',
  subtitle = 'Cannot revert this action.',
  titleSize = '4xl',
}: Props) => {
  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    document.documentElement.style.height = '100vh';

    return () => {
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    };
  }, []);
  const variants = ['text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl'];
  return (
    <>
      <div className="fixed top-48 max-md:top-20 w-1/3 max-lg:w-5/6 h-64 backdrop-blur-2xl bg-white dark:bg-[#ffe1fc22] flex flex-col gap-2 max-lg:gap-0 rounded-lg p-8 dark:text-white font-primary overflow-y-auto border-[1px] border-primary_btn  dark:border-dark_primary_btn right-1/2 shadow-lg translate-x-1/2 animate-fade_third z-50 max-lg:z-[60]">
        <div className="absolute top-3 right-3">
          <X className="cursor-pointer" onClick={() => setShow(false)} size={24} />
        </div>
        <div className="w-full max-lg:h-56 lg:flex-1 flex flex-col justify-between mt-4">
          <div className="w-full flex flex-col gap-2">
            <div className={`font-semibold text-${titleSize} text-gray-800 dark:text-white`}>{title}</div>
            <div className="font-medium text-sm">{subtitle}</div>
          </div>
          <DangerButton label="Confirm" onClick={handleDelete} />
        </div>
      </div>
      <div
        onClick={() => setShow(false)}
        className="bg-backdrop w-screen h-screen fixed top-0 left-0 animate-fade_third z-30 max-lg:z-[51]"
      ></div>
    </>
  );
};

export default ConfirmDelete;
