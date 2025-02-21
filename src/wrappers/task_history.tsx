import { TaskHistory } from '@/types';
import getDisplayTime from '@/utils/funcs/get_display_time';
import React, { ReactNode } from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';

interface WrapperProps {
  children: ReactNode;
  history: TaskHistory;
}

const TaskHistoryWrapper: React.FC<WrapperProps> = ({ children, history }) => {
  return (
    <div className="w-full flex flex-col gap-1 rounded-xl font-primary">
      <div className="w-full flex justify-between items-center text-sm">
        <div className="w-fit flex-center gap-1">
          <Image
            crossOrigin="anonymous"
            width={50}
            height={50}
            alt={'User Pic'}
            src={`${USER_PROFILE_PIC_URL}/${history.user.profilePic}`}
            className={'rounded-full w-4 h-4 cursor-default border-[1px] border-black'}
          />
          <div className="font-semibold">{history.user.name}</div>
          <div className="text-gray-600 dark:text-white">{children}</div>
        </div>
        <div className="text-xxs">{getDisplayTime(history.createdAt, false)}</div>
      </div>
    </div>
  );
};

export default TaskHistoryWrapper;
