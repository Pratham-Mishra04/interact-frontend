import { ArrowRight } from '@phosphor-icons/react';
import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
}

const GlowButton = ({ label, onClick }: Props) => {
  return (
    <div onClick={onClick} className="flex items-center justify-center">
      <div className="relative group">
        <button className="relative inline-block p-px font-semibold leading-6 text-white bg-neutral-900 shadow-lg cursor-pointer rounded-2xl transition-ease-300 hover:scale-105 active:scale-95 hover:shadow-blue-200">
          <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-600 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
          <span className="relative z-10 block px-6 py-3 rounded-2xl bg-neutral-950">
            <div className="relative z-10 flex items-center space-x-3">
              <span className="transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-blue-200">
                {label}
              </span>
              <ArrowRight
                className="w-5 h-5 transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-blue-300"
                weight="bold"
              />
            </div>
          </span>
        </button>
      </div>
    </div>
  );
};

export default GlowButton;
