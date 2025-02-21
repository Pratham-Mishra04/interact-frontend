import { X } from '@phosphor-icons/react';
import React, { useEffect } from 'react';
import DangerButton from '../buttons/danger_btn';
import ModalWrapper from '@/wrappers/modal';

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
    <ModalWrapper setShow={setShow} width="1/3" height="1/4" blur={true} modalStyles={{ top: '40%' }}>
      <div className="w-full h-full flex flex-col gap-2 max-lg:gap-0 rounded-lg dark:text-white font-primary max-lg:z-[60]">
        <div className="absolute top-3 right-3">
          <X className="cursor-pointer" onClick={() => setShow(false)} size={24} />
        </div>
        <div className="w-full max-lg:h-56 lg:flex-1 flex flex-col justify-between">
          <div className="w-full flex flex-col gap-2">
            <div className={`font-semibold text-${titleSize} text-gray-800 dark:text-white`}>{title}</div>
            <div className="font-medium text-sm">{subtitle}</div>
          </div>
          <DangerButton label="Confirm" onClick={handleDelete} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ConfirmDelete;
