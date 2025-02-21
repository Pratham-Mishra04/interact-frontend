import React from 'react';
import Link from 'next/link';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';

interface Props {
  notification: Notification;
}

const Application = ({ notification }: Props) => {
  const getOrganizationOrProjectTitle = () => {
    switch (notification.notificationType) {
      case 20:
        return notification.opening.organization?.title;
      default:
        return notification.project?.title;
    }
  };

  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 20:
        return `/organisations?oid=${notification.opening.organizationID}&redirect_url=/openings`;
      default:
        return '/workspace/manage/applications/' + notification.opening.id;
    }
  };

  return (
    <NotificationWrapper notification={notification}>
      <Link className="font-bold" href={`/users/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>
      Applied for the opening of {notification.opening.title} at{' '}
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getOrganizationOrProjectTitle()}.
      </Link>
    </NotificationWrapper>
  );
};

export default Application;
