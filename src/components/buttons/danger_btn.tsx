import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
  mxAuto?: boolean;
  disabled?: boolean;
}

const DangerButton = ({ label, onClick, disabled, mxAuto = true }: Props) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-fit ${
        mxAuto && 'mx-auto'
      } text-center border-2 border-[#ea333e] px-6 py-2 rounded-lg text-xl text-[#ea333e] disabled:opacity-40 font-medium hover:bg-[#ea333e20] disabled:hover:bg-transparent cursor-pointer disabled:cursor-default transition-ease-300`}
    >
      {label}
    </button>
  );
};

export default DangerButton;
