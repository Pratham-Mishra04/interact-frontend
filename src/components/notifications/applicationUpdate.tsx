import React from 'react';
import Image from 'next/image';
import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import moment from 'moment';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
  status: number;
  org?: boolean;
}

const ApplicationUpdate = ({ notification, status, org = false }: Props) => {
  return (
    <NotificationWrapper notification={notification}>
      {org ? (
        <Image
          crossOrigin="anonymous"
          width={50}
          height={50}
          alt={'User Pic'}
          src={`${USER_PROFILE_PIC_URL}/${notification.opening.organization?.user.profilePic}`}
          className={'rounded-xl w-12 h-16 cursor-default border-[1px] border-black'}
        />
      ) : (
        <Image
          crossOrigin="anonymous"
          width={50}
          height={50}
          alt={'User Pic'}
          src={`${PROJECT_PIC_URL}/${notification.opening.project?.coverPic}`}
          className={'rounded-xl w-12 h-16 cursor-default border-[1px] border-black'}
        />
      )}

      <div className="gap-2 cursor-default">
        Your Application for {notification.opening.title} at{' '}
        {org ? (
          <Link href={`/explore/organisations/${notification.opening.organizationID}`} className="font-bold">
            {notification.opening.organization?.title}
          </Link>
        ) : (
          <Link href={`/explore/project/${notification.opening.projectID}`} className="font-bold">
            {notification.opening.project?.title}
          </Link>
        )}{' '}
        was {status === 0 ? 'Rejected' : 'Accepted'}
      </div>
    </NotificationWrapper>
  );
};

export default ApplicationUpdate;
