import React from 'react';
import { Check } from '@phosphor-icons/react';

interface Props {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

const ProgressBar = ({ step, setStep }: Props) => {
  const steps: string[] = ['Name', 'Tagline', 'Bio', 'Skills', 'Pictures', 'Socials', 'Location'];
  return (
    <div className="w-full max-md:hidden flex flex-col animate-fade_half">
      <div className="w-full h-full relative">
        <div className="w-full flex justify-between z-[1]">
          {steps.map((title, index) => (
            <div key={index} className="flex flex-col gap-1 items-center relative">
              <div
                onClick={() => {
                  if (step - 1 > index) setStep(index + 1);
                }}
                className={`w-10 h-10 rounded-full flex-center ${
                  step - 1 > index
                    ? ' bg-blue-300 border-blue-200'
                    : step - 1 == index
                    ? 'bg-white border-primary_comp_hover'
                    : 'bg-white border-primary_comp'
                } border-4 transition-ease-300 delay-500 ${step - 1 > index && 'cursor-pointer'}`}
              >
                <Check
                  className={`${
                    step - 1 > index ? 'opacity-100' : 'opacity-0'
                  } text-blue-800 transition-ease-300 delay-300`}
                  weight="bold"
                />
              </div>
              <div className="w-fit absolute -bottom-4 translate-y-1/2 text-sm font-medium">{title}</div>
            </div>
          ))}
        </div>
        <div
          style={{ width: `${((step - 1) * 100) / (steps.length - 1)}%` }}
          className="w-full h-2 bg-primary_comp_active absolute top-1/2 -translate-y-1/2 -z-[1] rounded-xl transition-ease-500"
        ></div>
        <div className="w-full h-2 bg-primary_comp_active absolute top-1/2 -translate-y-1/2 -z-[1] rounded-xl opacity-25"></div>
      </div>
    </div>
  );
};

export default ProgressBar;
