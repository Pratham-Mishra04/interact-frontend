import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import Link from 'next/link';
import React from 'react';

interface Props {
  notification: Notification;
}

const Invitation = ({ notification }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 10:
        return notification.project.title;
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 10:
        return '/projects/' + notification.project.slug;
      default:
        return '';
    }
  };
  return (
    <NotificationWrapper notification={notification}>
      <Link className="font-bold" href={`/users/${notification.sender.username}`}>
        {notification.sender.name}
      </Link>
      Accepted your Invitation to join{' '}
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}.
      </Link>
    </NotificationWrapper>
  );
};

export default Invitation;
