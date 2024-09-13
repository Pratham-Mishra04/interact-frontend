import React from 'react';

interface Props {
  label?: string;
  width?: string;
  onClick?: () => void;
}

const SecondaryButton = ({ label = 'Continue', width = 'full', onClick }: Props) => {
  const variants = ['w-32', 'w-40', 'w-fit', 'w-full'];
  return (
    <button
      onClick={onClick}
      type="submit"
      className={`w-${width} relative p-2 cursor-pointer gap-2 bg-primary_text hover:bg-[#345C98] active:bg-[#2D5185] text-white rounded-lg font-semibold transition-ease-300`}
    >
      <div>{label}</div>
    </button>
  );
};

export default SecondaryButton;
