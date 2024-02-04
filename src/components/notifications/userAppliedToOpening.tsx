import React from 'react';
import Image from 'next/image';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
  org?: boolean;
}

const UserAppliedToOpening = ({ notification, org = false }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      <Image
        crossOrigin="anonymous"
        width={50}
        height={50}
        alt={'User Pic'}
        src={`${USER_PROFILE_PIC_URL}/${notification.sender.profilePic}`}
        className="rounded-full w-12 h-12 border-[1px] border-black"
      />
      <div className="gap-2">
        <Link className="font-bold z-50" href={`/explore/user/${notification.sender.username}`}>
          {notification.sender.name}
        </Link>{' '}
        applied for the opening of {notification.opening.title} at
        <Link className="font-bold" href={`/workspace/opening/${notification.opening.id}`}>
          {org ? notification.opening.organization?.title : notification.opening.project?.title}
        </Link>
        .
      </div>
    </NotificationWrapper>
  );
};

export default UserAppliedToOpening;
