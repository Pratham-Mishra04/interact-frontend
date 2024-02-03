import React from 'react';
import Image from 'next/image';
import { PROJECT_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import { Notification } from '@/types';
import CircleDashed from '@phosphor-icons/react/dist/icons/CircleDashed';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
  status: number;
}

const ApplicationUpdate = ({ notification, status }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      <Image
        crossOrigin="anonymous"
        width={100}
        height={100}
        alt={'User Pic'}
        src={`${PROJECT_PIC_URL}/${notification.opening.project?.coverPic}`}
        className={'rounded-xl w-12 h-16 cursor-default border-[1px] border-black'}
      />
      <div className="gap-2 cursor-default">
        Your Application for {notification.opening.title} at{' '}
        <Link href={`/explore/project/${notification.opening.project?.id}`} className="font-bold">
          {notification.opening.project?.title}
        </Link>{' '}
        was {status === 0 ? 'Rejected' : 'Accepted'}
      </div>
    </NotificationWrapper>
  );
};

export default ApplicationUpdate;
