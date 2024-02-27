import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
}

const PrimaryButton = ({ label, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      className="w-fit text-lg py-2 font-medium px-4 shadow-md hover:bg-[#ffffff40] hover:shadow-lg transition-ease-500 rounded-xl cursor-pointer"
    >
      {label}
    </div>
  );
};

export default PrimaryButton;
