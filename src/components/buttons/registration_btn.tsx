import { ArrowRight } from '@phosphor-icons/react';
import React from 'react';

interface Props {
  label?: string;
  onClick?: () => void;
}

const RegistrationButton = ({ label = 'Continue', onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      type="submit"
      className="w-full relative p-2 border-2 after:absolute after:-top-[3px] after:-left-[3px] after:-right-[3px] after:-bottom-[3.5px] after:-z-10 after:bg-[#395887] after:rounded-xl flex items-center cursor-pointer justify-center gap-2 bg-[#3D6DB3] hover:bg-[#345C98] active:bg-[#2D5185] border-[#d1d1d1a7] text-white py-2 rounded-xl font-semibold"
    >
      <div>{label}</div>
      <ArrowRight size={20} weight="regular" />
    </button>
  );
};

export default RegistrationButton;
