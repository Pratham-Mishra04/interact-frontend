import Toaster from '@/utils/toaster';
import { ClipboardText } from '@phosphor-icons/react';
import React from 'react';

interface Props {
  url: string;
  size?: number;
  iconOnly?: boolean;
  border?: boolean;
}

const CopyClipboardButton = ({ url, size = 24, iconOnly = false }: Props) => {
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${url}`);
        Toaster.success('Copied to Clipboard!');
      }}
      className={`${
        !iconOnly &&
        'w-full text-center flex justify-center gap-2 rounded-lg border-[1px] border-primary_btn dark:border-dark_primary_btn hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover py-2'
      } cursor-pointer transition-ease-200`}
    >
      <ClipboardText size={size} />
      {!iconOnly && <div> Copy Link</div>}
    </div>
  );
};

export default CopyClipboardButton;
