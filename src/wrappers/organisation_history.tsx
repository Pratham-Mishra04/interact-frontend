import { OrganizationHistory } from '@/types';
import getDisplayTime from '@/utils/funcs/get_display_time';
import React, { ReactNode } from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';

interface Props {
  children: ReactNode;
  history: OrganizationHistory;
}

const OrganisationHistoryWrapper = ({ children, history }: Props) => {
  return (
    <>
      <div className="w-full flex flex-col gap-1 p-3 dark:text-white hover:bg-primary_comp dark:hover:bg-[#ae8abd39] rounded-xl font-primary transition-ease-200">
        <div className="w-full flex justify-between items-center">
          <div className="w-fit flex-center gap-1">
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={`${USER_PROFILE_PIC_URL}/${history.user?.profilePic}`}
              className={'rounded-full w-4 h-4 cursor-default border-[1px] border-black'}
            />
            <div className="font-semibold">{history.user?.name}</div>
          </div>
          <div className="text-xxs">{getDisplayTime(history.createdAt, false)}</div>
        </div>
        <div className="text-sm flex">- {children}</div>
      </div>
    </>
  );
};

export default OrganisationHistoryWrapper;
