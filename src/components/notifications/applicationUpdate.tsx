import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import { USER_PROFILE_PIC_URL } from '@/config/routes';
import { getProjectPicURL } from '@/utils/funcs/safe_extract';

interface Props {
  notification: Notification;
  status: number;
}

const ApplicationUpdate = ({ notification, status }: Props) => {
  const getImageURL = () => {
    switch (notification.notificationType) {
      case 20:
        return `${USER_PROFILE_PIC_URL}/${notification.opening.organization?.user.profilePic}`;
      default:
        return getProjectPicURL(notification.opening.project);
    }
  };

  const getLinkURL = () => {
    switch (notification.notificationType) {
      case 20:
        return `/organisations/${notification.opening.organizationID}`;
      default:
        return `/projects?id=${notification.opening.projectID}`;
    }
  };

  const getTitle = () => {
    switch (notification.notificationType) {
      case 20:
        return notification.opening.organization?.title;
      default:
        return notification.opening.project?.title;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 6:
        return 'You got selected for the opening';
      case 7:
        return 'You got rejected for the opening';
      default:
        return '';
    }
  };

  return (
    <NotificationWrapper notification={notification} imageURL={getImageURL()}>
      <div className="gap-2 cursor-default">
        {notification.notificationType === 20 ? <span>Your Application for</span> : <span>{getStatusText()}</span>}
        {notification.notificationType !== 20 && ' of '}

        <Link href={getLinkURL()} className="font-bold capitalize">
          {getTitle()}
        </Link>
        {getStatusText()}
      </div>
    </NotificationWrapper>
  );
};

export default ApplicationUpdate;
