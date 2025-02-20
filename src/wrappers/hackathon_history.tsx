import { EventHistory, HackathonHistory } from '@/types';
import getDisplayTime from '@/utils/funcs/get_display_time';
import React, { ReactNode } from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  history: HackathonHistory;
}

const HackathonHistoryWrapper = ({ children, history }: Props) => {
  return (
    <div
      key={history.id}
      className="w-full flex flex-col gap-1 p-3 hover:bg-primary_comp dark:hover:bg-dark_primary_comp_hover rounded-xl font-primary transition-ease-200"
    >
      <div className="w-full flex justify-between items-center">
        <Link href={`/users/${history.sender.username}`} className="w-fit flex-center gap-1">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${history.sender?.profilePic}`}
            className="rounded-full w-4 h-4 border-[1px] border-black"
          />
          <div className="font-semibold">{history.sender.name}</div>
        </Link>
        <div className="text-xxs">{getDisplayTime(history.createdAt, false)}</div>
      </div>
      <div className="text-sm flex gap-1 text-primary_black">- {children}</div>
    </div>
  );
};

export default HackathonHistoryWrapper;
