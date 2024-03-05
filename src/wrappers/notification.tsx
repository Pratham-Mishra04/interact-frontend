import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Notification } from '@/types';
import getDisplayTime from '@/utils/funcs/get_display_time';
import { CircleDashed } from '@phosphor-icons/react';
import Image from 'next/image';
import React, { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
  notification: Notification;
  image?: boolean;
  imageURL?: string;
}

const NotificationWrapper: React.FC<WrapperProps> = ({
  children,
  notification,
  image = true,
  imageURL = `${USER_PROFILE_PIC_URL}/${notification.sender.profilePic}`,
}) => {
  return (
    <div className="w-full relative">
      {/* {!notification.isRead ? <CircleDashed size={16} className="absolute top-0 right-0" weight="duotone" /> : <></>} */}
      <div className="w-full flex items-center justify-between gap-4 p-3 dark:text-white hover:bg-primary_comp dark:hover:bg-[#ae8abd39] rounded-xl font-primary transition-ease-200">
        <div className="flex items-center gap-3">
          {image && (
            <Image
              crossOrigin="anonymous"
              width={50}
              height={50}
              alt={'User Pic'}
              src={imageURL}
              className="rounded-full w-10 h-10 border-[1px] border-black"
            />
          )}
          <div className="flex flex-wrap items-center gap-2 gap-y-0">{children}</div>
        </div>
        <div className="text-xxs">{getDisplayTime(notification.createdAt, false)}</div>
      </div>
    </div>
  );
};

export default NotificationWrapper;
