import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import { Notification } from '@/types';
import CircleDashed from '@phosphor-icons/react/dist/icons/CircleDashed';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const UserAppliedToOpening = ({ notification }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      <Image
        crossOrigin="anonymous"
        width={50}
        height={50}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${notification.sender.profilePic}`}
        className={'rounded-full w-12 h-12 border-[1px] border-black'}
      />
      <div className="gap-2">
        <Link className="font-bold z-50" href={`/explore/user/${notification.sender.username}`}>
          {notification.sender.name}
        </Link>{' '}
        applied for the opening of {notification.opening.title} at {notification.project.title}
        <Link className="font-bold" href={`/workspace/opening/${notification.opening.id}`}>
          {notification.opening.project?.title}
        </Link>
        .
      </div>
    </NotificationWrapper>
  );
};

export default UserAppliedToOpening;
