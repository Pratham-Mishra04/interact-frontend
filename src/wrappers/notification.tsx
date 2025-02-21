import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { Notification } from '@/types';
import getDisplayTime from '@/utils/funcs/get_display_time';
import { CircleDashed } from '@phosphor-icons/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
  notification: Notification;
  image?: boolean;
  imageURL?: string;
  extended?: ReactNode;
}

const NotificationWrapper: React.FC<WrapperProps> = ({
  children,
  notification,
  image = true,
  imageURL = `${USER_PROFILE_PIC_URL}/${notification.sender.profilePic}`,
  extended = <></>,
}) => {
  return (
    <div className="w-full relative p-3 hover:bg-gray-100 dark:hover:bg-dark_primary_comp_hover rounded-xl font-primary transition-ease-200">
      {/* {!notification.isRead ? <CircleDashed size={16} className="absolute top-0 right-0" weight="duotone" /> : <></>} */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="w-[calc(100%-16px)] flex items-center gap-2">
          {image && (
            <Link href={`/users/${notification.sender.username}`} className="rounded-full">
              <Image
                crossOrigin="anonymous"
                width={50}
                height={50}
                alt={'User Pic'}
                src={imageURL}
                className="rounded-full w-10 h-10 border-[1px] border-black"
              />
            </Link>
          )}
          <div className="w-[calc(100%-40px)] flex flex-wrap items-center gap-2 gap-y-0">{children}</div>
        </div>
        <div className="w-4 text-xxs">{getDisplayTime(notification.createdAt, false)}</div>
      </div>
      <div className={`w-full ${image && 'pl-12'}`}> {extended}</div>
    </div>
  );
};

export default NotificationWrapper;
