import Toaster from '@/utils/toaster';
import { ClipboardText } from '@phosphor-icons/react';
import React from 'react';

interface Props {
  url: string;
}

const CopyClipboardButton = ({ url }: Props) => {
  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${url}`);
        Toaster.success('Copied to Clipboard!');
      }}
      className="w-full text-center py-2 flex justify-center gap-2 rounded-lg border-[1px] border-primary_btn dark:border-[#ffe1fc10] 
hover:bg-primary_comp dark:hover:bg-[#ffe1fc10] cursor-pointer transition-ease-200"
    >
      <ClipboardText size={24} />
      <div> Copy Link</div>
    </div>
  );
};

export default CopyClipboardButton;
