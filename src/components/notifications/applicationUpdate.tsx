import React from 'react';
import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
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
    <NotificationWrapper
      notification={notification}
      imageURL={
        org
          ? `${USER_PROFILE_PIC_URL}/${notification.opening.organization?.user.profilePic}`
          : `${PROJECT_PIC_URL}/${notification.opening.project?.coverPic}`
      }
    >
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
