import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import Link from 'next/link';
import React from 'react';

interface Props {
  notification: Notification;
}

const Removal = ({ notification }: Props) => {
  const getType = () => {
    switch (notification.notificationType) {
      case 8:
        return 'project';
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 8:
        return '/projects/' + notification.project.slug;
      default:
        return '';
    }
  };
  return (
    <NotificationWrapper notification={notification}>
      <span>You were removed from the</span>{' '}
      <Link className="font-bold capitalize" href={getRedirectURL()}>
        {getType()}.
      </Link>{' '}
    </NotificationWrapper>
  );
};

export default Removal;
