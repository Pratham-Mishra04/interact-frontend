import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
  animateIn?: boolean;
  disabled?: boolean;
  width?: string;
}

const PrimaryButton = ({ label, onClick, animateIn = true, disabled, width = '32' }: Props) => {
  const variants = ['w-32', 'w-40', 'w-fit'];
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-${width} text-lg text-center font-medium px-4 py-2 border-[1px] border-primary_comp_hover bg-primary_comp hover:bg-primary_comp_hover text-primary_text transition-ease-500 rounded-lg cursor-pointer ${
        animateIn && 'animate-fade_third'
      } disabled:opacity-50 disabled:hover:bg-primary_comp disabled:cursor-default`}
    >
      {label}
    </button>
  );
};

export default PrimaryButton;
