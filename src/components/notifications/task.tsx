import { PROJECT_PIC_URL, USER_PROFILE_PIC_URL } from '@/config/routes';
import { Notification } from '@/types';
import NotificationWrapper from '@/wrappers/notification';
import Link from 'next/link';
import React from 'react';

interface Props {
  notification: Notification;
}

const Task = ({ notification }: Props) => {
  const getType = (): string => {
    switch (notification.notificationType) {
      case 11:
        return 'project';
      default:
        return '';
    }
  };
  const getRedirectURL = () => {
    switch (notification.notificationType) {
      case 11:
        return '/explore?pid=' + notification.project.slug;
      default:
        return '';
    }
  };
  return (
    <NotificationWrapper notification={notification}>
      <span>
        <Link className="font-bold" href={`/explore/user/${notification.sender.username}`}>
          {notification.sender.name}
        </Link>{' '}
      </span>
      assigned you a task in a
      <span>
        {' '}
        <Link className="font-bold capitalize" href={getRedirectURL()}>
          {getType()}
        </Link>
      </span>
    </NotificationWrapper>
  );
};

export default Task;
